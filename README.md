# ArenaHub API Backend

Este é o repositório backend do **ArenaHub**, uma plataforma SaaS B2B2C Multi-Tenant para gestão de quadras esportivas e arenas.
O backend é construído com Node.js utilizando o framework **NestJS**, TypeScript e **Prisma ORM** conectando a um banco PostgreSQL.

## Tecnologias

- **Framework:** NestJS
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL (via Neon ou local)
- **Autenticação:** JWT (Passport)
- **Documentação da API:** Swagger (OpenAPI)
- **Segurança:** Helmet, Class-Validator, Bcrypt
- **Agendamentos:** NestJS Schedule (Cron Jobs)

## Configuração do Ambiente

1. Certifique-se de ter o Node.js v20+ e o npm instalados.
2. Renomeie o arquivo `.env.example` para `.env` e configure suas variáveis de ambiente:
   ```env
   DATABASE_URL="sua_string_de_conexao_postgresql"
   JWT_SECRET="sua_chave_secreta_jwt"
   PORT=3000
   ```
3. Instale as dependências do projeto:
   ```bash
   npm install
   ```

## Banco de Dados e Prisma

O Prisma gerencia o esquema e as migrações do banco de dados.

- **Gerar o Prisma Client:** `npm run prisma:generate`
- **Rodar migrações:** `npm run prisma:migrate`
- **Popular o banco de dados (Seed):** `npm run prisma:seed`
- **Abrir o Prisma Studio (Visualizador Web):** `npm run prisma:studio`

> **Nota:** O seed criará uma arena padrão, um usuário administrador (admin@arenahub.com / arenahub), quadras, clientes e reservas de exemplo.

## Executando a Aplicação

- **Desenvolvimento (Watch):** `npm run start:dev`
- **Produção:** `npm run start:prod`
- **Debug:** `npm run start:debug`

A aplicação rodará por padrão na porta `3000`.

## Documentação da API (Swagger)

A API é auto-documentada. Com o servidor rodando, acesse:
**http://localhost:3000/api/docs**

Você pode testar os endpoints interativamente. Lembre-se de fazer login (rota `/auth/login`) para pegar o Token JWT e inseri-lo no botão "Authorize" (Bearer Token) para acessar as rotas protegidas.

## Automação e Regras de Negócio
- **Validação de Horários:** O sistema bloqueia a criação/edição de reservas que estejam fora do horário de funcionamento estabelecido para cada dia da semana pela administração da arena.
- **Detecção de Conflitos:** Quadras não podem ser reservadas mais de uma vez no mesmo horário.
- **Tarefas Agendadas (Cron):** A cada meia-noite, um processo limpa (cancela) reservas 'Pendentes' passadas que não foram efetivadas e sincroniza as métricas financeiras (total gasto e contagem de reservas) dos clientes.

## Estrutura do Projeto

```text
src/
├── analytics/     # Indicadores e gráficos gerenciais
├── auth/          # Autenticação e Guards de segurança (JWT e Tenant)
├── automation/    # Serviços de automação em background (Crons)
├── common/        # Decorators, Guards e Filtros globais de exceção
├── courts/        # Gestão de quadras e espaços
├── customers/     # Base de clientes da arena
├── dashboard/     # Métricas agregadas para a tela principal
├── prisma/        # Serviço integrador do Prisma ORM
├── reservations/  # Lógica de agendamento e validação de tempo
├── settings/      # Configurações de horários e da arena
└── team/          # Membros da equipe e controle de acessos
```
