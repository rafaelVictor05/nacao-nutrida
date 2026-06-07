# 🍽️ Nação Nutrida — Mobile

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.8+-0175C2?logo=dart)](https://dart.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

> **Aplicativo mobile para doação de alimentos com recomendações inteligentes baseadas em mineração de dados**

Aplicação Flutter (Android) que conecta doadores de alimentos com campanhas sociais, integrando um sistema de recomendações que sugere campanhas relevantes com base no histórico de doações do usuário.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)

## 🎯 Sobre o Projeto

O **Nação Nutrida Mobile** é o front-end Android da plataforma Nação Nutrida. Ele consome a API REST do back-end para exibir campanhas ativas, permitir doações de alimentos e oferecer recomendações personalizadas baseadas no histórico de doações de cada usuário, geradas pelo módulo de mineração de dados (regras de associação).

### Problemas Resolvidos
- Dificuldade para encontrar campanhas de doação próximas
- Falta de transparência no processo de arrecadação
- Processo manual e desorganizado de doações
- Descoberta passiva de campanhas sem personalização

### Diferenciais
- Recomendações personalizadas via mineração de dados (regras de associação)
- Campanhas recomendadas destacadas visualmente na listagem
- Interface responsiva e acessível para dispositivos Android
- Autenticação integrada com o back-end

## 🚀 Funcionalidades

### Para Usuários Doadores
- **Descoberta de Campanhas** — listagem com filtro por estado e cidade
- **Recomendações Inteligentes** — campanhas destacadas com base no histórico de doações
- **Detalhes da Campanha** — progresso de arrecadação por tipo de alimento
- **Processo de Doação** — seleção de alimentos e quantidades
- **Histórico de Doações** — visualização das contribuições realizadas
- **Painel do Usuário** — resumo de atividades e recomendações de alimentos

### Para Organizações
- **Cadastro de Campanhas** — criação com metas por tipo de alimento
- **Monitoramento** — acompanhamento de doações recebidas em tempo real
- **Encerramento Automático** — campanha encerrada ao atingir 100% da meta

### Sistema de Recomendações
O módulo de recomendações consome o endpoint `/mineracao/recomendacoes` do back-end:
1. Busca o histórico de doações do usuário (`/doacoes/minhas`)
2. Extrai os alimentos únicos já doados
3. Envia para a API de mineração e recebe sugestões de alimentos complementares
4. Destaca campanhas que necessitam dos alimentos sugeridos com badge "Recomendado para você"

## 🛠️ Tecnologias

### Framework
- **[Flutter](https://flutter.dev)** — framework principal (Android)
- **[Dart 3.8+](https://dart.dev)** — linguagem de programação

### Dependências Principais
| Pacote | Versão | Uso |
|---|---|---|
| [provider](https://pub.dev/packages/provider) | ^6.1.5 | Gerenciamento de estado (AuthManager) |
| [http](https://pub.dev/packages/http) | ^1.1.0 | Requisições à API REST |
| [shared_preferences](https://pub.dev/packages/shared_preferences) | ^2.3.2 | Persistência local do token |
| [file_picker](https://pub.dev/packages/file_picker) | ^10.3.3 | Seleção de imagens para campanhas |
| [font_awesome_flutter](https://pub.dev/packages/font_awesome_flutter) | ^10.6.0 | Ícones |
| [mask_text_input_formatter](https://pub.dev/packages/mask_text_input_formatter) | ^2.4.0 | Máscaras de input (CPF, telefone) |

## 📱 Instalação

### Pré-requisitos
```bash
# Flutter SDK (3.x ou superior)
flutter --version

# Android SDK (via Android Studio ou sdkmanager)
# Dispositivo físico Android ou emulador configurado
```

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Nacao-Nutrida/DSM-PI6-2026-1.git
   cd DSM-PI6-2026-1/front_mobile
   ```

2. **Instale as dependências**
   ```bash
   flutter pub get
   ```

3. **Configure a URL do back-end**

   Edite [lib/config/api.dart](lib/config/api.dart) e ajuste `baseUrl` para o endereço do servidor:
   ```dart
   static const String baseUrl = 'http://SEU_IP:3000';
   ```

4. **Execute em modo de desenvolvimento**
   ```bash
   # Com dispositivo/emulador conectado
   flutter run
   ```

5. **Build para produção (APK)**
   ```bash
   flutter build apk --release
   ```

## 💻 Uso

```bash
# Executar em modo debug
flutter run --debug

# Análise estática de código
flutter analyze

# Executar testes
flutter test

# Listar dispositivos disponíveis
flutter devices
```

## 📁 Estrutura do Projeto

```
lib/
├── main.dart                        # Entrada e roteamento da aplicação
├── config/
│   └── api.dart                     # URL base da API
├── models/
│   ├── auth_manager.dart            # Estado de autenticação (Provider)
│   ├── campaign.dart                # Modelo de campanha
│   └── user.dart                    # Modelo de usuário
├── screens/
│   ├── pagina_inicial.dart          # Página inicial
│   ├── login.dart                   # Tela de login
│   ├── cadastro_usuario.dart        # Cadastro de usuário
│   ├── descobrir.dart               # Busca de campanhas por localização
│   ├── descobrir_campanha.dart      # Listagem de campanhas (com recomendações)
│   ├── detalhes_campanha.dart       # Detalhes e progresso de campanha
│   ├── doar_alimentos.dart          # Fluxo de doação
│   ├── cadastrar_campanha.dart      # Criação de campanha
│   ├── cadastrar_pedido.dart        # Criação de pedido
│   ├── painel_screen.dart           # Painel do usuário logado
│   └── chat.dart                    # Chat
├── components/                      # Widgets reutilizáveis
│   ├── header.dart
│   ├── header_auth.dart
│   ├── header_login.dart
│   ├── header_cadastro_usuario.dart
│   ├── footer.dart
│   ├── login_form.dart
│   ├── cadastro_usuario_form.dart
│   ├── cadastro_campanha.dart
│   └── pagina_inicial.dart
└── services/
    └── api_service.dart             # Cliente HTTP com autenticação por token
```

### Padrões
- Siga as convenções Dart/Flutter
- Execute `flutter analyze` antes de abrir PR
- Use commits semânticos (`feat:`, `fix:`, `chore:`, `refactor:`)

**Desenvolvido por:**

Frederico Pessoa Barbosa · Jorge Luiz Patrocínio dos Santos · Yago Raphael Bughi Mouro · Rafael Victor Redoval de Sousa
