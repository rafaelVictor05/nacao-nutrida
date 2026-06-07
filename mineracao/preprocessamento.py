import pandas as pd
from mlxtend.preprocessing import TransactionEncoder

# =========================
# 1. CARREGAR OS DADOS
# =========================

def carregar_dados():
    print("Carregando dados...")

    doacoes = pd.read_csv('../base_dados/alimento_doacao.csv')
    alimentos = pd.read_csv('../base_dados/alimento.csv')

    return doacoes, alimentos


# =========================
# 2. LIMPEZA E TRATAMENTO
# =========================

def limpar_dados(doacoes, alimentos):
    print("Limpando dados...")

    doacoes = doacoes.dropna()
    alimentos = alimentos.dropna()

    doacoes = doacoes.drop_duplicates()
    alimentos = alimentos.drop_duplicates()

    return doacoes, alimentos


# =========================
# 3. JUNTAR DADOS
# =========================

def juntar_dados(doacoes, alimentos):
    print("Juntando dados...")

    df = doacoes.merge(
        alimentos,
        left_on='alimento_id',
        right_on='_id'
    )

    return df


# =========================
# 4. CRIAR TRANSAÇÕES
# =========================

def criar_transacoes(df):
    print("Criando transações por campanha...")

    transacoes = (
        df.groupby('campanha_id')['nm_alimento']
        .apply(list)
        .tolist()
    )

    return transacoes


# =========================
# 5. MATRIZ BINÁRIA
# =========================

def transformar_matriz(transacoes):
    print("Transformando em matriz binária...")

    te = TransactionEncoder()

    te_array = te.fit(transacoes).transform(transacoes)

    df_final = pd.DataFrame(
        te_array,
        columns=te.columns_
    ).astype(bool)

    return df_final


# =========================
# 6. SALVAR
# =========================

def salvar_dados(df_final):
    print("Salvando arquivo final...")

    df_final.to_csv(
        'transacoes_tratadas.csv',
        index=False
    )

    print("Arquivo salvo com sucesso")


# =========================
# CAMPANHA E META DE ALIMENTOS
# =========================

def carregar_itens_meta_campanha(campanha_id):
    print(f"Carregando itens da meta da campanha {campanha_id}...")

    alimentos = pd.read_csv('../base_dados/alimento.csv')
    alimentos_campanha = pd.read_csv('../base_dados/alimento_campanha.csv')

    meta = alimentos_campanha[
        alimentos_campanha['campanha_id'] == campanha_id
    ]

    if meta.empty:
        return []

    meta = meta.merge(
        alimentos,
        left_on='alimento_id',
        right_on='_id',
        how='left'
    )

    return (
        meta['nm_alimento']
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )


def carregar_itens_doacao_campanha(campanha_id):
    print(f"Carregando itens doados na campanha {campanha_id}...")

    doacoes, alimentos = carregar_dados()

    doacoes_campanha = doacoes[
        doacoes['campanha_id'] == campanha_id
    ]

    if doacoes_campanha.empty:
        return []

    doacoes_campanha = doacoes_campanha.merge(
        alimentos,
        left_on='alimento_id',
        right_on='_id',
        how='left'
    )

    return (
        doacoes_campanha['nm_alimento']
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )


# =========================
# 7. GERAR BASE
# =========================

def gerar_base_tratada():
    print("Gerando base tratada para Apriori...")

    doacoes, alimentos = carregar_dados()

    doacoes, alimentos = limpar_dados(
        doacoes,
        alimentos
    )

    df = juntar_dados(
        doacoes,
        alimentos
    )

    transacoes = criar_transacoes(df)

    df_final = transformar_matriz(
        transacoes
    )

    return df_final


# =========================
# MAIN
# =========================

def main():

    doacoes, alimentos = carregar_dados()

    doacoes, alimentos = limpar_dados(
        doacoes,
        alimentos
    )

    df = juntar_dados(
        doacoes,
        alimentos
    )

    transacoes = criar_transacoes(df)

    print("\nExemplo de transações:")
    print(transacoes[:5])

    df_final = transformar_matriz(
        transacoes
    )

    print("\nExemplo da matriz final:")
    print(df_final.head())

    salvar_dados(df_final)


if __name__ == "__main__":
    main()