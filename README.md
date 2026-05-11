# ArenaHub - Backend (API REST)

Este é o core de serviços do ArenaHub. Uma API RESTful construída em Node.js projetada para lidar com alta concorrência de requisições de clientes (gestão de agenda) com foco primordial em segurança multi-tenant (múltiplas arenas na mesma base de dados, sem vazamento de dados).

## 🛠️ Tecnologias Utilizadas

- **Core**: Node.js, [NestJS](https://nestjs.com/) (Framework arquitetural robusto)
- **Engine HTTP**: [Fastify](https://www.fastify.io/) (Escolhido no lugar do Express pela superioridade massiva de performance)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (Hospedado no Neon)
- **ORM**: [Prisma](https://www.prisma.io/) (Type-safety ponta a ponta)
- **Autenticação**: JWT (`@nestjs/jwt`, `passport-jwt`) e bcrypt
- **Documentação da API**: Swagger/OpenAPI

## 📂 Arquitetura (Módulos de Domínio)

O projeto segue os princípios de Design Orientado a Domínio (DDD) incentivados pelo NestJS. O código não é dividido por *tipo* (ex: "todas as controllers juntas"), mas sim por *entidade de negócio*.

```text
src/
├── analytics/         # Relatórios complexos (Ocupação, Ticket Médio, Mix de Esportes)
├── auth/              # Sistema de Login e Registro com JWT
├── automation/        # Cron jobs e processos automáticos
├── common/            # Filtros globais (Exceptions), Decorators customizados e Interceptors
├── courts/            # Gestão de Quadras e bloqueios de manutenção
├── customers/         # CRM (Atletas), faturamento por cliente e **Níveis Técnicos**
├── dashboard/         # Queries consolidadas para a tela principal (alta velocidade)
├── prisma/            # Serviço global de injeção do banco de dados
├── reservations/      # 🌟 Domínio central. Lógica de choques de horário, **Partidas Abertas** e **Consumo (PDV)**
├── settings/          # Horários de funcionamento e regras da Arena
├── team/              # Controle de acesso de funcionários (Múltiplos usuários por arena)
├── app.module.ts      # Módulo raiz
└── main.ts            # Entrypoint (Configuração do Fastify, Swagger e ValidationPipes)
```

## 🏟️ Lógica Multi-Tenant

A segurança é garantida no nível do serviço. **Toda requisição autenticada** carrega o `arenaId` no payload do Token JWT.
Os serviços (`.service.ts`) não confiam em `arenaId` vindo do corpo da requisição; eles extraem essa informação diretamente do usuário logado (via decorator no Controller) e forçam o filtro `where: { arenaId }` em absolutamente todas as queries no Prisma.

## 📈 Adaptações de Nicho (Arena Esportiva)

Esta API possui lógicas exclusivas para resolver problemas de arenas de Padel e Beach Tennis:
1. **Nivelamento de Atletas**: O módulo de `customers` aceita e armazena o Nível Técnico (`PlayerLevel`), essencial para montar torneios e aulas.
2. **Partidas Abertas (Matchmaking)**: Reservas podem ser marcadas com `isOpen: true`, permitindo consultas filtradas para painéis onde jogadores buscam vagas.
3. **Controle de Consumo Integrado**: As reservas processam relações com o modelo de `ConsumptionItem`, somando ao valor final da quadra.

## 🚀 Como Executar Localmente

### 1. Dependências
```bash
npm install
```

### 2. Configurando o Banco de Dados
Crie um arquivo `.env` na raiz da pasta `backend`:
```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/arenahub?schema=public"
JWT_SECRET="sua_chave_super_secreta_aqui"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. Migrations e Prisma Client
Para sincronizar o banco de dados e tipar as queries:
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Iniciando a API
```bash
# Modo de desenvolvimento (assiste mudanças)
npm run start:dev

# Modo de produção
npm run build
npm run start:prod
```

## 📚 Documentação Swagger

A API é auto-documentada. Ao iniciar a aplicação localmente, acesse:
`http://localhost:3000/api/docs`

Lá você encontrará todas as rotas, payloads esperados, modelos de resposta e poderá testar as requisições autenticando-se via botão "Authorize" (Bearer Token).
