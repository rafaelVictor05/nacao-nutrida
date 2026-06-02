# 🔄 Regenerar Mineração com Versionamento

Este guia explica como regenerar as regras de mineração e salvá-las automaticamente no banco de dados com versionamento.

---

## 📋 Pré-requisitos

1. ✅ Banco de dados MongoDB conectado
2. ✅ Python com `mlxtend` instalado na pasta `mineracao/`
3. ✅ Arquivo `regras_associacao.py` atualizado

---

## 🚀 Passo 1: Fazer a Migração do Prisma

Adicione o modelo `mineracao_regra` ao `schema.prisma`:

```prisma
model mineracao_regra {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  versao       Int      @default(1)
  antecedents  String
  consequents  String
  support      Float
  confidence   Float
  lift         Float
  dt_geracao   DateTime @default(now())
  ativo        Boolean  @default(true)

  @@index([versao])
  @@index([dt_geracao])
}
```

Depois execute a migração:

```bash
npm run prisma:migrate
```

---

## 🔧 Passo 2: Regenerar as Regras

Quando quiser gerar novas regras de mineração, execute:

```bash
npm run mineracao:regenerar
```

**O que esse comando faz:**
1. ✅ Executa o script Python `mineracao/regras_associacao.py`
2. ✅ Lê o `regras_associacao.csv` gerado
3. ✅ Incrementa a versão (v1 → v2 → v3...)
4. ✅ Desativa regras da versão anterior
5. ✅ Insere novas regras com timestamp
6. ✅ Exibe estatísticas

**Exemplo de output:**
```
🔄 Iniciando regeneração de mineração...

📊 Passo 1: Executando script Python de mineração...
✓ 25 alimentos encontrados
✓ 12 regras geradas

💾 Passo 2: Salvando regras no banco de dados...
✓ 12 regras da versão 2 inseridas no banco

📈 Passo 3: Estatísticas das regras:
   • Total de regras: 12
   • Versão atual: 2
   • Confiança média: 0.71
   • Lift médio: 1.58
   • Support médio: 0.28

📋 Passo 4: Histórico de versões:
   • Versão 1: 8 regras
   • Versão 2: 12 regras

✅ Regeneração concluída com sucesso!
```

---

## 📊 Novos Endpoints com Versionamento

### GET `/api/mineracao/regras` (atualizado)
Retorna as regras **ativas** da versão mais recente.

```json
{
  "total": 12,
  "regras": [
    {
      "id": "...",
      "versao": 2,
      "antecedents": "Arroz",
      "consequents": "Feijão",
      "support": 0.35,
      "confidence": 0.75,
      "lift": 1.85,
      "dt_geracao": "2024-06-02T10:30:00Z",
      "ativo": true
    }
  ]
}
```

### GET `/api/mineracao/historico` (novo)
Retorna histórico de todas as versões geradas.

```json
{
  "message": "Histórico de versões de mineração",
  "historico": [
    { "versao": 2, "_count": 12 },
    { "versao": 1, "_count": 8 }
  ]
}
```

### GET `/api/mineracao/estatisticas` (atualizado)
Agora inclui a versão atual.

```json
{
  "message": "Estatísticas das regras de mineração",
  "estatisticas": {
    "totalRegras": 12,
    "confiancaMedia": 0.71,
    "liftMedio": 1.58,
    "supportMedio": 0.28,
    "versaoAtual": 2
  }
}
```

---

## 🔄 Fluxo Completo

```
┌─────────────────────────┐
│ 1. Rodar npm run        │
│    mineracao:regenerar  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 2. Python executa      │
│    Apriori e gera      │
│    regras_associacao.csv│
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 3. Node lê CSV e       │
│    salva no MongoDB    │
│    com versão N+1      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 4. Versão N é          │
│    desativada (ativo:   │
│    false)              │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 5. Endpoints usam      │
│    sempre as regras    │
│    ativas (versão N+1) │
└─────────────────────────┘
```

---

## 💡 Benefícios

✅ **Versionamento**: Histórico completo de todas as minerações
✅ **Rastreabilidade**: Sabe quando cada versão foi gerada
✅ **Rollback**: Pode consultar dados de versões anteriores
✅ **Automação**: Um comando roda tudo (Python + BD + validação)
✅ **Performance**: Dados no banco em vez de arquivo CSV

---

## ⚠️ Troubleshooting

**Erro: "Python não encontrado"**
- Certifique-se que Python está no PATH
- Rode `python --version` para verificar

**Erro: "mlxtend não instalado"**
- Na pasta `mineracao/`, rode: `pip install mlxtend`

**Erro: "Banco não conectado"**
- Verifique `DATABASE_URL` no arquivo `.env`

---

## 📝 Próximos Passos

- [ ] Agendar regeneração automática (cron job)
- [ ] Criar alertas se qualidade das regras cair
- [ ] Comparar versões e mostrar mudanças
- [ ] Exportar relatório de mineração

