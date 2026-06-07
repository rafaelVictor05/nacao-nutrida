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


# =========================
# CONVERTER TEXTO EM SET
# =========================

def parse_item_set(text):

    if isinstance(text, str):

        text = text.strip()

        if not text:
            return set()

        return {
            item.strip()
            for item in text.split(',')
            if item.strip()
        }

    if isinstance(text, (set, list, tuple)):
        return set(text)

    return set()


# =========================
# RECOMENDAÇÃO PRINCIPAL
# =========================

def recomendar_para_campanha(
    regras,
    allowed_items,
    current_items=None,
    itens_frequentes=None,
    top_n=10,
    min_confidence=0.2,
    min_lift=1.0
):

    allowed = set(allowed_items or [])
    current = set(current_items or [])

    recommendations = []

    # =========================
    # REGRAS DE ASSOCIAÇÃO
    # =========================

    for _, row in regras.iterrows():

        antecedent = parse_item_set(
            row['antecedents']
        )

        consequent = parse_item_set(
            row['consequents']
        )

        # consequente precisa estar permitido
        if not consequent.issubset(allowed):
            continue

        # remove itens já existentes
        suggested = consequent - current

        if not suggested:
            continue

        # antecedente precisa existir
        if antecedent and not antecedent.issubset(current):
            continue

        # filtros mínimos
        if row['confidence'] < min_confidence:
            continue

        if row['lift'] < min_lift:
            continue

        recommendations.append({

            'tipo': 'Regra de Associação',

            'antecedents':
                row['antecedents'],

            'consequents':
                ', '.join(sorted(suggested)),

            'confidence':
                float(row['confidence']),

            'lift':
                float(row['lift']),

            'support':
                float(row['support'])
        })

    # =========================
    # FALLBACK:
    # ITENS MAIS FREQUENTES
    # =========================

    recomendados_atuais = {

        rec['consequents']
        for rec in recommendations
    }

    if itens_frequentes is not None:

        for _, row in itens_frequentes.iterrows():

            item = row['item']

            # precisa estar permitido
            if item not in allowed:
                continue

            # não pode já existir
            if item in current:
                continue

            # não repetir
            if item in recomendados_atuais:
                continue

            recommendations.append({

                'tipo': 'Item Frequente',

                'antecedents':
                    'Popular na base',

                'consequents':
                    item,

                'confidence':
                    0.0,

                'lift':
                    0.0,

                'support':
                    float(row['support'])
            })

    # =========================
    # ORDENAR RESULTADOS
    # =========================

    recommendations.sort(

        key=lambda x: (
            x['lift'],
            x['confidence'],
            x['support']
        ),

        reverse=True
    )

    # =========================
    # REMOVER DUPLICADOS
    # =========================

    seen = set()

    unique_recommendations = []

    for rec in recommendations:

        key = rec['consequents']

        if key in seen:
            continue

        seen.add(key)

        unique_recommendations.append(rec)

    return unique_recommendations[:top_n]


# =========================
# EXECUTAR APRIORI
# =========================

def executar_apriori(campanha_id=None):

    # =========================
    # GERAR BASE
    # =========================

    df_final = gerar_base_tratada()

    print("\nQuantidade de campanhas:",
          len(df_final))

    print("Quantidade de alimentos:",
          len(df_final.columns))

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
    # ITENS FREQUENTES
    # =========================

    itens_frequentes = frequentes[
        frequentes['itemsets'].apply(
            lambda x: len(x) == 1
        )
    ].copy()

    itens_frequentes['item'] = itens_frequentes[
        'itemsets'
    ].apply(
        lambda x: next(iter(x))
    )

    itens_frequentes = itens_frequentes.sort_values(
        by='support',
        ascending=False
    )

    itens_frequentes[
        ['item', 'support']
    ].to_csv(
        'itens_frequentes.csv',
        index=False
    )

    print(
        "\nArquivo "
        "'itens_frequentes.csv' "
        "salvo com sucesso."
    )

    # =========================
    # GERAR REGRAS
    # =========================

    regras = association_rules(

        frequentes,

        metric="confidence",

        min_threshold=0.2
    )

    if regras.empty:

        print("Nenhuma regra encontrada.")

        regras = formatar_regras(regras)

    else:

        # manter apenas regras relevantes
        regras = regras[
            regras['lift'] > 1
        ]

        # ordenar por força
        regras = regras.sort_values(

            by='lift',

            ascending=False
        )

        # formatar
        regras = formatar_regras(
            regras
        )

        # =========================
        # MOSTRAR REGRAS
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

                f"Se tiver "
                f"[{row['antecedents']}] "
                f"→ sugerir "
                f"[{row['consequents']}] "
                f"(confiança: "
                f"{row['confidence']:.2f}, "
                f"lift: "
                f"{row['lift']:.2f})"
            )

            print(

                f"➡ Campanhas com "
                f"{row['antecedents']} "
                f"frequentemente também possuem "
                f"{row['consequents']}.\n"
            )

    # =========================
    # RECOMENDAÇÃO POR CAMPANHA
    # =========================

    if campanha_id is not None:

        allowed_items = carregar_itens_meta_campanha(
            campanha_id
        )

        current_items = carregar_itens_doacao_campanha(
            campanha_id
        )

        print(
            f"\nItens permitidos "
            f"da campanha {campanha_id}:"
        )

        print(allowed_items)

        print(
            f"\nItens já doados "
            f"na campanha {campanha_id}:"
        )

        print(current_items)

        recomendacoes = recomendar_para_campanha(

            regras=regras,

            allowed_items=allowed_items,

            current_items=current_items,

            itens_frequentes=itens_frequentes,

            top_n=10,

            min_confidence=0.2,

            min_lift=1.0
        )

        # =========================
        # MOSTRAR RECOMENDAÇÕES
        # =========================

        if recomendacoes:

            print(
                f"\nRecomendações "
                f"para campanha {campanha_id}:\n"
            )

            for rec in recomendacoes:

                print(
                    f"[{rec['tipo']}] "
                    f"→ "
                    f"{rec['consequents']}"
                )

                print(
                    f"Base: "
                    f"{rec['antecedents']}"
                )

                print(
                    f"Support: "
                    f"{rec['support']:.2f}"
                )

                print(
                    f"Confidence: "
                    f"{rec['confidence']:.2f}"
                )

                print(
                    f"Lift: "
                    f"{rec['lift']:.2f}\n"
                )

        else:

            print(
                f"Nenhuma recomendação "
                f"encontrada."
            )

    # =========================
    # SALVAR CSV
    # =========================

    if not regras.empty:

        regras.to_csv(
            'regras_associacao.csv',
            index=False
        )

        print(
            "\nArquivo "
            "'regras_associacao.csv' "
            "salvo com sucesso."
        )

    return regras


# =========================
# MAIN
# =========================

if __name__ == "__main__":

    # exemplo:
    # executar_apriori(campanha_id=1)

    executar_apriori(campanha_id=1)