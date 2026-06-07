from mlxtend.frequent_patterns import apriori, association_rules
from preprocessamento import (
    gerar_base_tratada,
    carregar_itens_meta_campanha,
    carregar_itens_doacao_campanha,
)

# =========================
# FORMATAR REGRAS
# =========================
def formatar_regras(regras):

    regras = regras.copy()

    regras['antecedents'] = regras['antecedents'].apply(
        lambda x: ', '.join(list(x))
    )

    regras['consequents'] = regras['consequents'].apply(
        lambda x: ', '.join(list(x))
    )

    return regras


def parse_item_set(text):
    if isinstance(text, str):
        text = text.strip()
        if not text:
            return set()
        return {item.strip() for item in text.split(',') if item.strip()}

    if isinstance(text, (set, list, tuple)):
        return set(text)

    return set()


def recomendar_para_campanha(
    regras,
    allowed_items,
    current_items=None,
    top_n=10,
    min_confidence=0.0,
    min_lift=1.0
):
    allowed = set(allowed_items or [])
    current = set(current_items or [])

    def rule_matches(row, require_antecedent=True):
        antecedent = parse_item_set(row['antecedents'])
        consequent = parse_item_set(row['consequents'])

        if not consequent or not consequent.issubset(allowed):
            return None

        suggested = consequent - current
        if not suggested:
            return None

        if require_antecedent and antecedent and not antecedent.issubset(current):
            return None

        if row.get('confidence', 0.0) < min_confidence:
            return None

        if row.get('lift', 0.0) < min_lift:
            return None

        return {
            'antecedents': row['antecedents'],
            'consequents': ', '.join(sorted(suggested)),
            'confidence': float(row.get('confidence', 0.0)),
            'lift': float(row.get('lift', 0.0)),
            'support': float(row.get('support', 0.0)),
        }

    recommendations = []

    for _, row in regras.iterrows():
        match = rule_matches(row, require_antecedent=True)
        if match:
            recommendations.append(match)

    if not recommendations:
        for _, row in regras.iterrows():
            match = rule_matches(row, require_antecedent=False)
            if match:
                recommendations.append(match)

    recommendations.sort(
        key=lambda x: (x['lift'], x['confidence'], x['support']),
        reverse=True
    )

    seen = set()
    unique_recommendations = []
    for rec in recommendations:
        key = (rec['antecedents'], rec['consequents'])
        if key in seen:
            continue
        seen.add(key)
        unique_recommendations.append(rec)

    return unique_recommendations[:top_n]


# =========================
# EXECUTAR APRIORI
# =========================
def executar_apriori(campanha_id=None):

    # Gerar base tratada
    df_final = gerar_base_tratada()

    print("\nQuantidade de campanhas:", len(df_final))
    print("Quantidade de alimentos:", len(df_final.columns))

    # =========================
    # APLICAR APRIORI
    # =========================

    frequentes = apriori(
        df_final,
        min_support=0.03,
        use_colnames=True
    )

    print("\nItens frequentes encontrados:")
    print(frequentes.head())

    if frequentes.empty:
        print("Nenhum item frequente encontrado.")
        return None

    # =========================
    # GERAR REGRAS
    # =========================

    regras = association_rules(
        frequentes,
        metric="confidence",
        min_threshold=0.3
    )

    if regras.empty:
        print("Nenhuma regra encontrada.")
        return None

    # =========================
    # FILTRAR REGRAS RELEVANTES
    # =========================

    regras = regras[regras['lift'] > 1]

    # Ordenar por lift
    regras = regras.sort_values(
        by='lift',
        ascending=False
    )

    # Formatar texto
    regras = formatar_regras(regras)

    # =========================
    # MOSTRAR RESULTADOS
    # =========================

    top_n = 10

    print("\nRegras encontradas:")
    print(
        regras[
            [
                'antecedents',
                'consequents',
                'support',
                'confidence',
                'lift'
            ]
        ].head(top_n)
    )

    print("\nRegras em formato de recomendação:\n")

    for _, row in regras.head(top_n).iterrows():

        print(
            f"Se tiver [{row['antecedents']}] "
            f"→ sugerir [{row['consequents']}] "
            f"(confiança: {row['confidence']:.2f}, "
            f"lift: {row['lift']:.2f})"
        )

        print(
            f"➡ Campanhas com "
            f"{row['antecedents']} "
            f"frequentemente também possuem "
            f"{row['consequents']}.\n"
        )

    if campanha_id is not None:
        allowed_items = carregar_itens_meta_campanha(campanha_id)
        current_items = carregar_itens_doacao_campanha(campanha_id)

        print(f"\nItens permitidos da campanha {campanha_id}: {allowed_items}")
        print(f"Itens já doados na campanha {campanha_id}: {current_items}")

        recomendacoes = recomendar_para_campanha(
            regras,
            allowed_items,
            current_items=current_items,
            top_n=top_n,
            min_confidence=0.0,
            min_lift=1.0
        )

        if recomendacoes:
            print(f"\nRecomendações para campanha {campanha_id}:")
            for rec in recomendacoes:
                print(
                    f"Se tiver [{rec['antecedents']}] "
                    f"→ sugerir [{rec['consequents']}] "
                    f"(confiança: {rec['confidence']:.2f}, "
                    f"lift: {rec['lift']:.2f})"
                )
        else:
            print(f"Nenhuma recomendação encontrada para a campanha {campanha_id}.")

    # =========================
    # SALVAR CSV
    # =========================

    regras.to_csv(
        'regras_associacao.csv',
        index=False
    )

    print("Arquivo 'regras_associacao.csv' salvo com sucesso.")

    return regras


# =========================
# MAIN
# =========================

if __name__ == "__main__":
    executar_apriori()
