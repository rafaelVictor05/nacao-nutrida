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

    # Remover valores nulos
    doacoes = doacoes.dropna()
    alimentos = alimentos.dropna()

    # Remover duplicados
    doacoes = doacoes.drop_duplicates()
    alimentos = alimentos.drop_duplicates()

    return doacoes, alimentos


# =========================
# 3. ENRIQUECER DADOS
# =========================

def juntar_dados(doacoes, alimentos):
    print("Juntando dados...")

    df = doacoes.merge(alimentos, on='cd_alimento')

    return df


# =========================
# 4. CRIAR TRANSAÇÕES
# =========================

def criar_transacoes(df):
    print("Criando transações por campanha...")

    # Agrupar alimentos por campanha
    transacoes = df.groupby('cd_campanha')['nm_alimento'].apply(list).tolist()

    return transacoes


# =========================
# 5. TRANSFORMAR EM MATRIZ BINÁRIA
# =========================

def transformar_matriz(transacoes):
    print("Transformando em matriz binária...")

    te = TransactionEncoder()
    te_array = te.fit(transacoes).transform(transacoes)

    df_final = pd.DataFrame(te_array, columns=te.columns_).astype(bool)

    return df_final


# =========================
# 6. SALVAR RESULTADO
# =========================

def salvar_dados(df_final):
    print("Salvando arquivo final...")

    df_final.to_csv('transacoes_tratadas.csv', index=False)

    print("Arquivo salvo com sucesso")


# =========================
# 7. EXECUÇÃO PRINCIPAL
# =========================

def main():
    # 1. Carregar
    doacoes, alimentos = carregar_dados()

    # 2. Limpar
    doacoes, alimentos = limpar_dados(doacoes, alimentos)

    # 3. Juntar
    df = juntar_dados(doacoes, alimentos)

    # 4. Criar transações
    transacoes = criar_transacoes(df)

    print("\nExemplo de transações:")
    print(transacoes.head())

    # 5. Transformar em matriz
    df_final = transformar_matriz(transacoes)

    print("\nExemplo da matriz final:")
    print(df_final.head())

    # 6. Salvar
    salvar_dados(df_final)

def gerar_base_tratada():
    print("Gerando base tratada para Apriori...")
    
    doacoes, alimentos = carregar_dados()
    doacoes, alimentos = limpar_dados(doacoes, alimentos)
    df = juntar_dados(doacoes, alimentos)
    transacoes = criar_transacoes(df)
    df_final = transformar_matriz(transacoes)
    
    return df_final

# =========================
# RODAR SCRIPT
# =========================

if __name__ == "__main__":
    main()
