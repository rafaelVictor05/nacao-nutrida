# 📊 Endpoints de Mineração de Dados

## Resumo
Este documento descreve os endpoints disponíveis para acessar as regras de associação e recomendações geradas pelo algoritmo Apriori.

---

## ⚙️ Requisitos
- Autenticação via JWT (middleware `authMiddleware`)
- Arquivo `regras_associacao.csv` disponível em `mineracao/regras_associacao.csv`

---

## 📌 Endpoints Disponíveis

### 1️⃣ Obter todas as regras de associação

```http
GET /api/mineracao/regras
```

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
{
  "total": 5,
  "regras": [
    {
      "antecedents": "Arroz",
      "consequents": "Feijão",
      "support": 0.35,
      "confidence": 0.75,
      "lift": 1.85
    }
  ]
}
```

---

### 2️⃣ Obter recomendações para um alimento

```http
GET /api/mineracao/recomendacoes?alimento=Arroz
```

**Autenticação:** ✅ Requerida

**Parâmetros:**
- `alimento` (string): Nome do alimento

**Resposta (200):**
```json
{
  "alimento": "Arroz",
  "total": 2,
  "recomendacoes": [
    {
      "alimentoOrigem": "Arroz",
      "alimentoSugerido": "Feijão",
      "confianca": 0.75,
      "lift": 1.85,
      "forca": "Forte"
    }
  ]
}
```

**Classificação de força:**
- 🔴 Fraca: confidence < 0.4 ou lift < 1.2
- 🟡 Moderada: confidence ≥ 0.4 e lift ≥ 1.2
- 🟢 Forte: confidence ≥ 0.6 e lift ≥ 1.5
- ⭐ Muito Forte: confidence ≥ 0.8 e lift ≥ 2

---

### 3️⃣ Obter recomendações para múltiplos alimentos

```http
POST /api/mineracao/recomendacoes
Content-Type: application/json

{
  "alimentos": ["Arroz", "Feijão", "Milho"]
}
```

**Autenticação:** ✅ Requerida

**Body:**
```json
{
  "alimentos": ["Arroz", "Feijão"]
}
```

**Resposta (200):**
```json
{
  "alimentosConsultados": ["Arroz", "Feijão"],
  "total": 3,
  "recomendacoes": [
    {
      "alimentoOrigem": "Arroz",
      "alimentoSugerido": "Feijão",
      "confianca": 0.75,
      "lift": 1.85,
      "forca": "Forte"
    }
  ]
}
```

---

### 4️⃣ Obter estatísticas das regras

```http
GET /api/mineracao/estatisticas
```

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
{
  "message": "Estatísticas das regras de mineração",
  "estatisticas": {
    "totalRegras": 15,
    "confiancaMedia": 0.67,
    "liftMedio": 1.52,
    "supportMedio": 0.23
  }
}
```

---

### 5️⃣ Recarregar regras (atualizar do arquivo CSV)

```http
POST /api/mineracao/recarregar
```

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
{
  "message": "Regras recarregadas com sucesso"
}
```

> **Uso:** Execute este endpoint após rodar novamente o script de mineração Python.

---

## 🔧 Como Usar no Frontend

### JavaScript/TypeScript (Fetch API)

```typescript
// 1. Obter recomendações por alimento
async function obterRecomendacoes(alimento: string, token: string) {
  const response = await fetch(
    `/api/mineracao/recomendacoes?alimento=${alimento}`,
    {
      headers: { "Authorization": `Bearer ${token}` }
    }
  );
  return response.json();
}

// 2. Obter recomendações múltiplas
async function obterRecomendacoesMultiplas(alimentos: string[], token: string) {
  const response = await fetch(
    `/api/mineracao/recomendacoes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ alimentos })
    }
  );
  return response.json();
}
```

### Flutter (Dart)

```dart
// Obter recomendações
final response = await http.get(
  Uri.parse('http://localhost:5000/api/mineracao/recomendacoes?alimento=Arroz'),
  headers: {'Authorization': 'Bearer $token'},
);

final data = jsonDecode(response.body);
```

---

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | ✅ Sucesso |
| 400 | ❌ Parâmetro inválido ou faltando |
| 401 | 🔒 Não autenticado |
| 500 | ⚠️ Erro no servidor |

---

## 🚀 Próximos Passos

1. Instalar dependência: `npm install csv-parser`
2. Testar os endpoints com Postman ou Insomnia
3. Integrar recomendações no app mobile/web
4. Usar os dados para sugerir alimentos em campanhas

---

## 📄 Notas Importantes

- Os dados de regras são carregados **na memória** ao iniciar o servidor
- Para usar novos dados de mineração, execute `POST /mineracao/recarregar`
- As recomendações são ordenadas por confiança e lift (maior primeiro)
- Duplicatas são removidas automaticamente em recomendações múltiplas

