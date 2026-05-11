# ArenaHub - Backend (API REST)

O **ArenaHub** é uma plataforma B2B (SaaS) premium projetada para revolucionar a gestão de arenas esportivas (Padel, Beach Tennis, Futebol). Este repositório contém o **Core de Serviços Backend**.

Trata-se de uma API RESTful de altíssima performance construída em Node.js. Ela foi arquitetada especificamente para lidar com alta concorrência (múltiplas reservas simultâneas) garantindo uma segurança robusta baseada no modelo **Multi-Tenant** (múltiplas arenas operando no mesmo banco de dados com total isolamento).

Diferente de agendas genéricas, este backend atende demandas profundas do nicho:
- **Matchmaking (Partidas Abertas)**: Consultas para encontrar jogos com vagas, otimizando horários ociosos da arena.
- **Nivelamento de Atletas**: Estrutura no banco de dados para atrelar Níveis Técnicos a jogadores.
- **Integração de Consumo (PDV)**: Tabelas que relacionam vendas de bar e aluguéis diretamente ao ticket da reserva.

## 🛠️ Tecnologias Utilizadas

- **Engine e Framework**: Node.js, [NestJS](https://nestjs.com/) (Arquitetura limpa e opinativa)
- **Adaptador HTTP**: [Fastify](https://www.fastify.io/) (Escolhido para máximo throughput)
- **Banco de Dados e ORM**: PostgreSQL + [Prisma](https://www.prisma.io/) (Type-safety ponta a ponta)
- **Segurança**: JWT (`@nestjs/jwt`, `passport-jwt`) e Bcrypt
- **Documentação**: Swagger/OpenAPI (Geração automática)

## 🔐 Lógica Multi-Tenant

A segurança de dados isolados é o pilar desta API.
**Toda requisição que interage com dados** exige autenticação. O `arenaId` é extraído diretamente do token JWT decodificado no servidor, e não do payload enviado pelo usuário. Essa credencial é injetada via `where: { arenaId }` em absolutamente todas as operações no Prisma, impossibilitando vazamento horizontal de dados entre clientes.

## 🐳 Como Executar (Ambiente Dockerizado)

O backend do ArenaHub está completamente configurado para rodar em containers, garantindo paridade total entre a máquina de desenvolvimento e a produção.

### 1. Pré-requisitos
- Docker e Docker Compose instalados.

### 2. Iniciando a API e o Banco de Dados
Na raiz deste repositório, rode:
```bash
docker-compose up -d
```
Isso fará o build do NestJS e subirá os containers (API e PostgreSQL local). A API ficará acessível em `http://localhost:3000`.

### 3. Migrations e Seed (Primeira Execução)
Como os containers são novos, o banco de dados estará vazio. Sincronize o esquema do Prisma e injete os dados básicos rodando comandos *dentro* do container da API:

```bash
# Aplica as migrations criando as tabelas
docker exec -it arenahub-api npx prisma migrate dev --name init

# Opcional: Roda o script de Seed para criar usuário de testes
docker exec -it arenahub-api npx prisma db seed
```

## 💻 Como Executar (Modo Nativo/Node.js)

Se preferir não usar Docker e testar via Node local (com o PostgreSQL rodando fora):

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure as variáveis em um arquivo `.env` (use `.env.example` como guia):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/arenahub?schema=public"
   JWT_SECRET="sua_chave_segura"
   ```
3. Sincronize o Prisma e rode:
   ```bash
   npx prisma migrate dev
   npm run start:dev
   ```

## 📚 Documentação Swagger

A API é 100% auto-documentada. Com o servidor rodando, acesse a rota do Swagger:
👉 `http://localhost:3000/api/docs`

Você poderá ver todos os endpoints disponíveis, DTOs e realizar testes de requisição simulando o ambiente com um Token Bearer.

## 🚀 Estratégia de Deploy

Recomendamos ambientes como **Railway** ou **Render** para o backend:
1. Conecte o repositório à plataforma.
2. Defina os scripts de build: `npm run build`
3. Comando de inicialização: `npm run start:prod`
4. Não se esqueça de adicionar a variável `DATABASE_URL` apontando para seu Postgres em produção (ex: Neon).
