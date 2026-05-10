# ArenaHub - Docker Setup

Este projeto está configurado para rodar completamente via Docker.

## Pré-requisitos
- Docker
- Docker Compose

## Como rodar

1. **Subir os containers:**
   ```bash
   docker-compose up -d
   ```

2. **Rodar Migrations e Seed (apenas na primeira vez):**
   Como o backend depende do banco estar pronto, execute os comandos do Prisma dentro do container da API:
   ```bash
   # Rodar migrations
   docker exec -it arenahub-api npx prisma migrate dev --name init

   # Rodar seed (dados iniciais)
   docker exec -it arenahub-api npx prisma db seed
   ```

3. **Acessar a API:**
   - API: [http://localhost:3000/api](http://localhost:3000/api)
   - Swagger Docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Serviços
- **postgres**: Banco de dados PostgreSQL (porta 5432)
- **api**: Backend NestJS (porta 3000)
