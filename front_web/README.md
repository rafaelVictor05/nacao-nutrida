# 🍽️ Nação Nutrida - Web

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

> **Aplicação web para doação de alimentos com recomendações inteligentes baseadas em mineração de dados**

Aplicação React (TypeScript) que conecta doadores de alimentos com campanhas sociais, integrando um sistema de recomendações que sugere campanhas e alimentos relevantes com base no histórico de doações do usuário.

## 📋 Índice

- Sobre o Projeto
- Telas
- Funcionalidades
- Tecnologias
- Instalação
- Uso
- Estrutura do Projeto

## 📱 Telas

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-telainicial.jpeg" alt="Página Inicial" width="550"><br/>
      <sub>Página Inicial</sub>
    </td>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-telalogin.jpeg" alt="Tela de Login" width="550"><br/>
      <sub>Tela de Login</sub>
    </td>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-telacadastropf.jpeg" alt="Tela de Cadastro" width="550"><br/>
      <sub>Tela de Cadastro Pessoa Física</sub>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-telacadastropj.jpeg" alt="Tela de Cadastro Pessoa Jurídica" width="550"><br/>
      <sub>Tela de Cadastro Pessoa Jurídica</sub>
    </td>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-teladescobrir.jpeg" alt="Tela Descobrir Campanha" width="550"><br/>
      <sub>Tela Descobrir Campanha</sub>
    </td>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-telacadastrarcampanha.jpeg" alt="Tela Criar Campanha" width="550"><br/>
      <sub>Tela Criar Campanha</sub>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-modelasobrenos.jpeg" alt="Modal Sobre Nós" width="550"><br/>
      <sub>Modal Sobre Nós</sub>
    </td>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-telacampanha.jpeg" alt="Tela de Campanha" width="550"><br/>
      <sub>Tela de Campanha</sub>
    </td>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-teladoacao.jpeg" alt="Descobrir Campanhas" width="550"><br/>
      <sub>Tela de Doação</sub>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-telapainel-minhascampanhas.jpeg" alt="Tela Painel Minhas Campanhas" width="550"><br/>
      <sub>Tela Painel Minhas Campanhas</sub>
    </td>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-telapainel-minhasdoacoes.jpeg" alt="Tela Painel Minhas Doações" width="550"><br/>
      <sub>Tela Painel Minhas Doações</sub>
    </td>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-telachat.jpeg" alt="Tela de Chat" width="550"><br/>
      <sub>Tela de Chat</sub>
    </td>
    <td align="center">
      <img src="https://github.com/yagomouro/DSM-PI6-2026-1/blob/master/img_telas/web/web-telameudados.jpeg" alt="Tela Meus Dados" width="550"><br/>
      <sub>Tela Meus Dados</sub>
    </td>

  </tr>
</table>

## 🎯 Sobre o Projeto

O **Nação Nutrida Web** é o front-end web da plataforma Nação Nutrida. Ele consome a API REST do back-end para exibir campanhas ativas, permitir doações de alimentos e oferecer recomendações personalizadas geradas pelo módulo de mineração de dados (regras de associação).

### Problemas Resolvidos
- Dificuldade para encontrar campanhas de doação
- Falta de transparência no processo de arrecadação
- Processo manual e desorganizado de doações
- Descoberta passiva de campanhas sem personalização

### Diferenciais
- Recomendações personalizadas via mineração de dados (regras de associação)
- Campanhas e alimentos sugeridos com base no histórico do doador
- Interface responsiva para desktop e mobile
- Autenticação JWT integrada com o back-end

## 🚀 Funcionalidades

### Para Usuários Doadores
- **Descoberta de Campanhas** - listagem com busca e filtros
- **Recomendações Inteligentes** - campanhas e alimentos sugeridos com base no histórico de doações
- **Detalhes da Campanha** - progresso de arrecadação por tipo de alimento
- **Processo de Doação** - seleção de alimentos e quantidades
- **Histórico de Doações** - visualização das contribuições realizadas
- **Chat** - comunicação entre doadores e organizações
- **Perfil** - gerenciamento de dados pessoais

### Para Organizações
- **Cadastro de Campanhas** - criação com metas por tipo de alimento
- **Monitoramento** - acompanhamento de doações recebidas em tempo real
- **Encerramento Automático** - campanha encerrada ao atingir 100% da meta
- **Painel** - visão geral das campanhas e doações

### Sistema de Recomendações
O módulo de recomendações consome o endpoint `/mineracao/recomendacoes` do back-end:
1. Busca o histórico de doações do usuário (`/doacoes/minhas`)
2. Extrai os alimentos únicos já doados
3. Envia para a API de mineração e recebe sugestões de alimentos complementares
4. Exibe campanhas e alimentos recomendados em destaque no painel

## 🛠️ Tecnologias

### Framework e Linguagem
- **[React 18](https://react.dev)** - framework principal
- **[TypeScript 4.9](https://www.typescriptlang.org)** - tipagem estática

### Dependências Principais
| Pacote | Versão | Uso |
|---|---|---|
| [react-router-dom](https://reactrouter.com) | ^6.18.0 | Roteamento de páginas |
| [axios](https://axios-http.com) | ^1.7.4 | Requisições à API REST |
| [styled-components](https://styled-components.com) | ^6.1.0 | Estilização com CSS-in-JS |
| [sass](https://sass-lang.com) | ^1.69.5 | Pré-processador CSS |
| [react-icons](https://react-icons.github.io/react-icons) | ^4.12.0 | Ícones |
| [sonner](https://sonner.emilkowal.ski) | ^2.0.7 | Notificações toast |

## 📦 Instalação

### Pré-requisitos
```bash
Node.js >= 18.x
npm >= 9.x
```

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Nacao-Nutrida/DSM-PI6-2026-1.git
   cd DSM-PI6-2026-1/front_web
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure a URL do back-end**

   Ajuste o proxy em `package.json` ou crie um arquivo `.env` na raiz do `front_web`:
   ```env
   REACT_APP_API_URL=http://localhost:3000
   ```

4. **Execute em modo de desenvolvimento**
   ```bash
   npm start
   ```

5. **Build para produção**
   ```bash
   npm run build
   ```

## 💻 Uso

```bash
# Iniciar servidor de desenvolvimento
npm start

# Gerar build de produção
npm run build

# Executar testes
npm test
```

## 📁 Estrutura do Projeto

```
src/
├── App.tsx                  # Componente raiz e rotas
├── index.tsx                # Entrada da aplicação
├── pages/                   # Páginas da aplicação
│   ├── Home/                # Página inicial
│   ├── Login/               # Autenticação
│   ├── Cadastro/            # Cadastro de usuário
│   ├── Descobrir/           # Listagem de campanhas
│   ├── Campanha/            # Detalhes da campanha
│   ├── CadastroCampanha/    # Criação de campanha
│   ├── Painel/              # Painel do usuário
│   ├── Perfil/              # Dados do usuário
│   ├── Chat/                # Chat entre usuários
│   └── NotFound/            # Página 404
├── components/              # Componentes reutilizáveis
├── contexts/                # Contextos React (auth, user)
├── services/                # Chamadas à API
├── types/                   # Tipos TypeScript
├── utils/                   # Funções utilitárias
├── data/                    # Dados estáticos
└── styles/                  # Estilos globais
```

**Desenvolvido por:**

Frederico Pessoa Barbosa · Jorge Luiz Patrocínio dos Santos · Yago Raphael Bughi Mouro · Rafael Victor Redoval de Sousa
