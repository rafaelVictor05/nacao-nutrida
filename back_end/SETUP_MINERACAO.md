# ⚠️ INSTRUÇÕES PARA INTEGRAÇÃO DA MINERAÇÃO

## Passo 1: Instalar Dependências

O serviço de mineração requer a biblioteca `csv-parser` para leitura de arquivos CSV.

Execute na pasta `back_end/server/`:

```bash
npm install csv-parser
```

Ou se usar yarn:
```bash
yarn add csv-parser
```

---

## Passo 2: Estrutura Criada

Os seguintes arquivos foram criados para integração:

### 📁 Backend
- `src/services/MineraoService.ts` — Serviço com lógica de mineração
- `src/controllers/MineraoController.ts` — Controller com endpoints
- `src/routes/mineracao.routes.ts` — Rotas da API
- `server.ts` — Atualizado com import e uso de mineracao.routes

### 📄 Documentação
- `MINERACAO_ENDPOINTS.md` — Guia completo de endpoints

---

## Passo 3: Verificar Arquivo CSV

Certifique-se de que o arquivo `regras_associacao.csv` existe em:
```
/mineracao/regras_associacao.csv
```

O serviço procura o arquivo nesse caminho relativo ao servidor.

---

## Passo 4: Rodar o Servidor

```bash
npm run dev
```

O console deve exibir:
```
Server started on port 5000
X regras carregadas com sucesso.
```

---

## Passo 5: Testar os Endpoints

Use **Postman**, **Insomnia** ou **cURL**:

### Teste 1: Obter todas as regras
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:5000/api/mineracao/regras
```

### Teste 2: Obter recomendações
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  "http://localhost:5000/api/mineracao/recomendacoes?alimento=Arroz"
```

### Teste 3: Recomendações múltiplas
```bash
curl -X POST -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alimentos":["Arroz","Feijão"]}' \
  http://localhost:5000/api/mineracao/recomendacoes
```

---

## 🔑 Notas Importantes

1. **Autenticação**: Todos os endpoints requerem um token JWT válido
2. **Caminho do CSV**: O `MineraoService` busca o arquivo em `../../mineracao/regras_associacao.csv`
3. **Carregamento em memória**: As regras são carregadas uma única vez ao iniciar o servidor
4. **Recarregar dados**: Use `POST /api/mineracao/recarregar` após gerar novas regras em Python

---

## 📊 Próximos Passos

- [ ] Instalar `csv-parser`
- [ ] Rodar o servidor
- [ ] Testar os endpoints
- [ ] Integrar recomendações no app móvel
- [ ] Integrar recomendações no app web
- [ ] Criar visualizações das regras

