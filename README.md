# Nação Nutrida: DSM PI 6º Semestre

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Projeto Integrador do 6º semestre do curso de **Desenvolvimento de Software Multiplataforma (DSM)**: FATEC.

## Estrutura do Repositório

Este repositório contém o projeto **Nação Nutrida**, uma plataforma digital multiplataforma de doação de alimentos que conecta doadores com campanhas sociais de arrecadação.

- **front_mobile/**: Aplicação Android desenvolvida em Flutter. Contém o código-fonte da app mobile, configurações de build, assets e testes.
  - `lib/`: Código-fonte principal da aplicação Flutter.
  - `android/`: Configurações específicas para Android.
  - `assets/`: Recursos estáticos como imagens e fontes.
  - `pubspec.yaml`: Dependências do projeto Flutter.
  - `analysis_options.yaml`: Configurações de análise de código.

- **front_web/**: Aplicação web desenvolvida em React com TypeScript. Inclui frontend e configurações do cliente.
  - `src/`: Código fonte do frontend React.
  - `public/`: Arquivos estáticos para o frontend.
  - `package.json`: Dependências e scripts do projeto Node.js para o front-end.

- **back_end/**: Backend da aplicação desenvolvido em Node.js com TypeScript. Inclui API, configurações do servidor e banco de dados.
  - `server/`: Código do backend em Node.js/TypeScript, incluindo API e configurações do Prisma para banco de dados.

- **documentacao/**: Pasta contendo toda a documentação do projeto.
  - `docs/`: Documentação técnica detalhada.
    - `Gestao_Agil_De_Projetos/`: Documentação sobre a metodologia de gestão ágil utilizadas no projeto.
    - `Modelagem_Banco/`: Modelagem e diagramas do banco de dados (conceitual e lógico).
    - `NoAM.drawio`: Diagrama da arquitetura em formato DrawIO.
    - `NoAM.png` e `NoAM.svg`: Visualizações do diagrama de arquitetura.
    - `RUP.docx`: Documentação sobre o processo RUP (Rational Unified Process) aplicado ao projeto.
  - `P.I. 6 DSM - Nação Nutrida.docx`: Documento principal do projeto integrador com requisitos, especificações e planejamento.

## Escopo do Projeto

**Nação Nutrida** é uma plataforma digital multiplataforma de doação de alimentos que conecta doadores com campanhas sociais de arrecadação. O projeto resolve os seguintes problemas:

- Dificuldade para encontrar campanhas de doação
- Falta de transparência no processo de arrecadação
- Ausência de métricas sobre uso da plataforma
- Processo manual e desorganizado de doações

**Versão Atual**: 1.0.0 (DSM 6º semestre 2026)

### Principais Funcionalidades

#### Para Usuários Doadores:
- **Descoberta de Campanhas**: listagem com filtro por estado e cidade
- **Recomendações Inteligentes**: campanhas sugeridas com base no histórico de doações (mineração de dados)
- **Visualização de Progresso**: acompanhamento de metas em tempo real
- **Processo de Doação**: interface simplificada para seleção de alimentos e quantidades
- **Histórico de Doações**: visualização de contribuições realizadas
- **Chat**: comunicação entre doadores e organizações
- **Painel do Usuário**: resumo de atividades e recomendações personalizadas

#### Para Organizações (Admin):
- **Cadastro de Campanhas**: criação com metas por tipo de alimento
- **Gestão de Estoque**: controle de tipos e quantidades de alimentos
- **Monitoramento**: acompanhamento de doações recebidas em tempo real
- **Encerramento Automático**: campanha encerrada ao atingir 100% da meta
- **Gerenciamento de Admins**: controle de acesso e permissões

#### Sistema de Recomendações por Mineração de Dados (Diferencial):
- **Regras de Associação**: algoritmo Apriori identifica padrões de doação
- **Recomendação de Alimentos**: sugere alimentos com base no histórico do doador
- **Recomendação de Campanhas**: destaca campanhas que necessitam dos alimentos sugeridos
- **Integração Multiplataforma**: disponível tanto na web quanto no mobile

## Principais Pontos da Modelagem do Projeto

### Abordagem de Modelagem:
- **Conceptual**: Baseada em entidades (Usuário, Campanha, Alimento, Doação) com relacionamentos 1:N e N:N
- **Lógica**: Normalizada para MongoDB com coleções e referências de IDs
- **Banco de Dados**: MongoDB com Prisma ORM (schema-driven)

### Arquitetura em Camadas:
- **Front-End**: React (Web) e Flutter (Mobile) com state management (Context API / Provider)
- **Back-End**: Node.js + Express + TypeScript com arquitetura MVC
- **Banco de Dados**: MongoDB com Prisma ORM

## Estrutura Inicial do Back-End e Front-End

### Back-End (Node.js + Express + TypeScript)

Localização: `back_end/server/`

#### Arquitetura em Camadas:
```
server/
├── src/
│   ├── controllers/     # Controladores (Usuario, Campanha, Doacao, etc.)
│   ├── services/        # Lógica de negócio
│   ├── routes/          # Definição de rotas
│   ├── schemas/         # Validação com Zod
│   ├── middlewares/     # Autenticação JWT e validação
│   └── types/           # Tipos TypeScript
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── seed.ts          # Dados iniciais
├── config/              # Configurações (IBGE API)
└── server.ts            # Ponto de entrada
```

#### Funcionalidades por Módulo:
- **Usuário**: Registro, login (JWT), atualização, busca de admins
- **Campanha**: CRUD completo, busca por localização, filtros, encerramento automático ao atingir meta
- **Doação**: Registro de doações, histórico do usuário
- **Alimento**: Listagem de alimentos cadastrados
- **Chat**: Conversas e mensagens entre usuários
- **Localidade**: Integração com IBGE API para busca de cidades
- **Mineração**: Geração de regras de associação (Apriori) e recomendações de alimentos/campanhas

### Front-End

#### A. Aplicação Web React (TypeScript)
Localização: `front_web/src/`

**Páginas Principais**:
- Home, Login, Cadastro, Descobrir, Campanha, CadastroCampanha, Perfil, Painel, Chat

**Componentes**: Navbar, Footer

**State Management**: Context API (authContext, userContext)

#### B. Aplicação Mobile Flutter (Dart)
Localização: `front_mobile/lib/`

**Telas Principais**:
- Página Inicial, Login, Cadastro de Usuário, Descobrir, Descobrir Campanhas (com recomendações), Detalhes da Campanha, Cadastrar Campanha, Doar Alimentos, Painel do Usuário, Chat

**Modelos**: User, Campaign, Donation, etc.

**State Management**: Provider

## Banco de Dados Conceitual e Lógico

### Modelagem Conceitual

<img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/documentacao/docs/Modelagem_Banco/modelagemConceitual.png" alt="Modelagem conceitual do banco de dados" width="65%">

O diagrama conceitual inclui as seguintes entidades principais:
- **USUÁRIO** (cria campanhas, faz doações)
- **CAMPANHA** (recebe alimentos)
- **ALIMENTO** (tipos e quantidades)
- **DOAÇÃO** (ligação N:N entre usuário-alimento-campanha)

Relacionamentos:
- Usuário → Campanha (1:N)
- Campanha → Alimento (N:N via Alimento_Campanha)
- Usuário → Doação (1:N)
- Campanha → Doação (1:N)
- Alimento → Doação (1:N)

### Modelagem Lógica (MongoDB com Prisma)

<img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/documentacao/docs/Modelagem_Banco/modelagemLogica1.jpeg" alt="Modelagem lógica do banco de dados" width="65%">

**Coleções Principais:**

- **usuario**: Dados de usuários (doadores e organizações)
- **campanha**: Informações das campanhas
- **alimento**: Tipos de alimentos disponíveis
- **alimento_campanha**: Metas de alimentos por campanha
- **alimento_doacao**: Registros de doações realizadas
- **conversation** e **message**: Sistema de chat

**Exemplo de Schema (Prisma):**
```prisma
model Usuario {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  nm_usuario           String
  tipo_usuario         String
  // ... outros campos
  campanhas            Campanha[]
  doacoes              AlimentoDoacao[]
}

model Campanha {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  usuario_id           String   @db.ObjectId
  usuario              Usuario  @relation(fields: [usuario_id], references: [id])
  // ... outros campos
  alimentos            AlimentoCampanha[]
  doacoes              AlimentoDoacao[]
}
```

Para mais detalhes, consulte o arquivo `back_end/server/prisma/schema.prisma`.

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

**Desenvolvido por:**

Frederico Pessoa Barbosa · Jorge Luiz Patrocínio dos Santos · Yago Raphael Bughi Mouro · Rafael Victor Redoval de Sousa
