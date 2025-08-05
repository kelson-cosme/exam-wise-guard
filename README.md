# 🛡️ Exam Wise Guard - Sistema de Gestão de Exames

Exam Wise Guard é uma aplicação web completa para a gestão de exames, certificados e procedimentos de saúde e segurança ocupacional para colaboradores de múltiplas empresas. A plataforma oferece uma visão clara e organizada dos vencimentos, históricos e custos, com um sistema de notificação automática para garantir a conformidade.

## ✨ Funcionalidades Principais

- **Dashboard Principal:** Visião geral com métricas chave, como colaboradores ativos, total de exames, exames vencidos, próximos ao vencimento e custo total.
- **Dashboards Detalhados:**
  - **Dashboard de Exames:** Matriz visual (colaborador vs. tipo de exame) com o status de validade indicado por cores, mostrando sempre o certificado mais recente.
  - **Dashboard de Procedimentos:** Matriz similar focada nos procedimentos, ideal para controlo de treinos específicos (NRs).
- **Gestão de Colaboradores:** Funcionalidade completa de CRUD (Criar, Ler, Atualizar, Excluir) para os colaboradores da empresa.
- **Gestão de Exames e Certificados:**
  - Registo de exames com informações detalhadas: natureza (admissional, periódico, etc.), data de realização, validade em dias, valor e observações.
  - Vinculação de múltiplos procedimentos a um único exame através de um campo de busca inteligente.
  - Funcionalidade de **Renovação** que cria um novo registo e move o antigo para o histórico, mantendo a integridade dos dados.
- **Tabelas de Apoio Globais:** Administradores podem gerir listas mestras de **Tipos de Exame** e **Procedimentos**, que são partilhadas entre todas as empresas.
- **Multi-empresa (Multi-tenancy):**
  - Sistema de **Login e Cadastro** seguro.
  - **Isolamento total dos dados:** cada empresa só tem acesso às suas próprias informações, garantido por Row Level Security (RLS) do Supabase.
- **Notificações Automáticas por E-mail:** Uma função de servidor (Supabase Function) roda diariamente para enviar um e-mail de alerta com a lista de exames vencidos ou próximos do vencimento.
- **Interface Moderna e Responsiva:**
  - Construída com as tecnologias mais recentes.
  - Menu lateral recolhível para maximizar o espaço de visualização.

## 🚀 Tecnologias Utilizadas

- **Frontend:**
  - **Framework:** React com Vite
  - **Linguagem:** TypeScript
  - **Estilização:** Tailwind CSS
  - **Componentes:** shadcn/ui
  - **Gestão de Estado:** TanStack Query (React Query)
  - **Roteamento:** React Router DOM
- **Backend & Banco de Dados:**
  - **Plataforma:** Supabase
  - **Banco de Dados:** PostgreSQL
  - **Autenticação:** Supabase Auth
  - **Segurança:** Row Level Security (RLS)
  - **Funções de Servidor:** Supabase Edge Functions (Deno)
- **Envio de E-mail:**
  - Nodemailer (utilizado na Supabase Function)

## ⚙️ Configuração e Instalação

Siga os passos abaixo para configurar e rodar o projeto localmente.

### 1. Pré-requisitos

- Node.js (v18 ou superior)
- npm ou bun
- Supabase CLI

### 2. Configuração do Supabase

1.  **Crie um Projeto:** Vá para [supabase.com](https://supabase.com) e crie um novo projeto.
2.  **Variáveis de Ambiente:**
    - No painel do seu projeto, vá para **Project Settings > API**.
    - Copie o **Project URL** e a chave **`anon` `public`**.
3.  **Execute as Migrações:**
    - Vá para o **SQL Editor** no painel do Supabase.
    - Copie e execute o conteúdo dos ficheiros de migração localizados na pasta `supabase/migrations/` do projeto.
    - Execute todos os scripts de correção e configuração de segurança (RLS) que desenvolvemos.

### 3. Configuração do Frontend

1.  **Clone o Repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/exam-wise-guard.git](https://github.com/seu-usuario/exam-wise-guard.git)
    cd exam-wise-guard
    ```
2.  **Instale as Dependências:**
    ```bash
    npm install
    # ou
    bun install
    ```
3.  **Configure as Variáveis de Ambiente:**
    - Crie um ficheiro chamado `.env` na raiz do projeto.
    - Adicione as chaves que copiou do Supabase:
      ```env
      VITE_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
      VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLIC
      ```

### 4. Executando a Aplicação

Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
bun run dev
```

A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).

### 5. Configuração da Função de E-mail

Para que o envio de e-mails funcione:

1.  **Configure o "Secret":** Use a Supabase CLI para salvar a senha do seu e-mail de forma segura.
    ```bash
    npx supabase@latest secrets set SMTP_PASSWORD=SUA_SENHA_DE_EMAIL
    ```
2.  **Faça o Deploy da Função:**
    ```bash
    npx supabase@latest functions deploy send-expiry-emails
    ```
3.  **Agende o Cron Job:** Vá para o **SQL Editor** no Supabase e execute o script para agendar a execução diária da função, conforme desenvolvemos.
