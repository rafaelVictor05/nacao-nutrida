# Back-End - Nação Nutrida

Esta pasta contém o código do back-end da aplicação "Nação Nutrida", desenvolvido em Node.js com TypeScript e Express. O back-end é responsável por fornecer a API RESTful que suporta as funcionalidades da plataforma de doação de alimentos.

## Estrutura da Pasta

- **server/**: Pasta principal contendo todo o código do back-end.
  - `src/`: Código fonte organizado em camadas.
    - `controllers/`: Controladores para cada entidade (UsuarioController, CampanhaController, etc.).
    - `services/`: Lógica de negócio e regras de aplicação.
    - `routes/`: Definição das rotas da API.
    - `schemas/`: Validações usando Zod.
    - `middlewares/`: Middlewares de autenticação (JWT) e validação.
    - `types/`: Definições de tipos TypeScript.
  - `prisma/`: Configuração do banco de dados com Prisma ORM.
    - `schema.prisma`: Schema do banco de dados MongoDB.
    - `seed.ts`: Script para popular o banco com dados iniciais.
  - `config/`: Configurações adicionais, como integração com API do IBGE.
  - `server.ts`: Ponto de entrada da aplicação.
  - `package.json`: Dependências e scripts do projeto.
  - `tsconfig.json`: Configuração do TypeScript.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Express**: Framework web para criação da API.
- **TypeScript**: Superset do JavaScript com tipagem estática.
- **Prisma**: ORM para interação com o banco de dados MongoDB.
- **MongoDB**: Banco de dados NoSQL.
- **JWT**: Autenticação baseada em tokens.
- **Bcrypt**: Hashing de senhas.
- **Zod**: Validação de dados.
- **CORS**: Suporte a requisições cross-origin.

## Funcionalidades Principais

- **Autenticação e Autorização**: Login, registro e validação de usuários.
- **Gerenciamento de Usuários**: CRUD de doadores e organizações.
- **Campanhas**: Criação, listagem e gerenciamento de campanhas de doação.
- **Doações**: Registro e histórico de doações de alimentos.
- **Chat**: Sistema de mensagens entre usuários.
- **Integração Externa**: API do IBGE para busca de localidades brasileiras.

## Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o banco de dados (certifique-se de ter o MongoDB rodando e configure a connection string no schema.prisma).

3. Execute as migrações do Prisma:
   ```bash
   npx prisma db push
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

O servidor estará rodando em `http://localhost:3001` (ou conforme configurado).

## Endpoints Principais

- `POST /usuarioCadastro`: Registro de usuário
- `POST /usuarioLogin`: Login de usuário
- `GET /campanhas`: Listar campanhas
- `POST /campanha`: Criar campanha
- `POST /doacao`: Registrar doação
- `POST /conversa`: Iniciar conversa no chat

Para documentação completa da API, consulte os arquivos de rotas em `server/src/routes/`.