# Kanban de Gestão de Equipamentos

Sistema web para gestão de equipamentos parados (empilhadeiras, caminhões, tratores) em operações com múltiplas unidades. SOferece um quadro Kanban visual onde cada problema percorre etapas até a resolução — com registro de responsáveis, prazos e histórico completo de cada movimentação.Onde cada problema percorre etapas até a resolução — com registro de responsáveis, prazos e histórico completo de cada movimentação.

O sistema evoluiu para suportar **múltiplos quadros personalizados**: além do quadro de equipamentos, administradores podem criar quadros de tarefas genéricos com colunas e campos próprios.



## Funcionalidades

- **Autenticação JWT** com dois perfis: administrador (gerencia tudo) e usuário (visualiza)
- **Quadro Kanban** com drag and drop dos cards entre colunas
- **Múltiplos quadros**: quadro de equipamentos (frota, modelo, unidade) e quadros genéricos com campos personalizáveis
- **Auditoria completa**: histórico de cada criação, movimentação, edição e arquivamento
- **Filtros** por texto, unidade, responsável e etapa
- **Arquivamento** de cards resolvidos, com página de histórico
- **Gestão** de unidades, equipamentos e usuários

## Stack

**Backend**
- Java 17 + Spring Boot
- Spring Security (JWT)
- Spring Data JPA
- PostgreSQL

**Frontend**
- React + TypeScript
- Vite
- @dnd-kit (drag and drop)

**Infraestrutura**
- Backend: Render
- Banco de dados: Neon (PostgreSQL)
- Frontend: Vercel

## Como rodar localmente

### Pré-requisitos
- Java 17+
- Node.js 18+
- Uma instância PostgreSQL (local ou Neon)

### Backend

```bash
cd backend
```

Crie o arquivo `src/main/resources/application-local.properties` com suas credenciais:

```properties
spring.datasource.url=jdbc:postgresql://SEU_HOST/SEU_BANCO?sslmode=require
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
jwt.secret=UM_SEGREDO_QUALQUER_LONGO
```

> Esse arquivo não é versionado (está no `.gitignore`) porque contém credenciais. Cada ambiente tem o seu.

Rode:

```bash
./mvnw spring-boot:run "-Dspring-boot.run.profiles=local"
```

O backend sobe em `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.

## Arquitetura e decisões

- **DTOs** em vez de expor entidades diretamente, protegendo dados sensíveis (ex: hash de senha) e evitando vazar objetos aninhados
- **Cards buscados por quadro** (`/api/cards/board/{id}`) para isolar os dados de cada Kanban, evitando que cards de quadros diferentes se misturem
- **Componentes reutilizáveis** no frontend (timeline de histórico, drag and drop) compartilhados entre os tipos de quadro
- **Variáveis de ambiente** para credenciais, mantendo segredos fora do código versionado

## Autor

Vinícius Galdino
