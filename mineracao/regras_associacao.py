from mlxtend.frequent_patterns import apriori, association_rules
from preprocessamento import gerar_base_tratada

# =========================
# FORMATAR REGRAS
# =========================
def formatar_regras(regras):
    regras = regras.copy()
    regras['antecedents'] = regras['antecedents'].apply(lambda x: ', '.join(list(x)))
    regras['consequents'] = regras['consequents'].apply(lambda x: ', '.join(list(x)))
    return regras


# =========================
# EXECUTAR APRIORI
# =========================
def executar_apriori():
    df_final = gerar_base_tratada()

    # Aplicar Apriori
    frequentes = apriori(df_final, min_support=0.05, use_colnames=True)

    if frequentes.empty:
        print("Nenhum item frequente encontrado. Ajuste o min_support.")
        return None

    # Gerar regras
    regras = association_rules(frequentes, metric="confidence", min_threshold=0.6)

    if regras.empty:
        print("Nenhuma regra encontrada. Ajuste os parâmetros.")
        return None

    # Filtrar regras relevantes
    regras = regras[regras['lift'] > 1]

    # Ordenar por força da regra
    regras = regras.sort_values(by='lift', ascending=False)

    # Formatar para leitura
    regras = formatar_regras(regras)

    # Quantidade de regras exibidas
    top_n = 5

    print("\nRegras encontradas:")
    print(regras[['antecedents', 'consequents', 'support', 'confidence', 'lift']].head(top_n))

    print("\nRegras em formato de recomendação:\n")

    # Exibir regras interpretadas
    for _, row in regras.head(top_n).iterrows():
        print(f"Se tiver [{row['antecedents']}] → sugerir [{row['consequents']}] "
              f"(confiança: {row['confidence']:.2f}, lift: {row['lift']:.2f})")

        print(f"➡ Isso indica que campanhas com {row['antecedents']} têm alta probabilidade de incluir {row['consequents']}.\n")

    # Salvar regras em CSV
    regras.to_csv('regras_associacao.csv', index=False)
    print("Arquivo 'regras_associacao.csv' salvo com sucesso.")

    return regras


# =========================
# RODAR SCRIPT
# =========================
if __name__ == "__main__":
    executar_apriori()