# Delivery Tracker API

> **Programação Web II — IFAL/Maceió** · Projeto do semestre · Matrícula `2023007365`

API para rastrear o ciclo de vida de encomendas, construída com **Node.js + Express** em
**arquitetura em camadas** (rotas → controllers → services → repositories), com persistência
real em **SQLite via Prisma ORM** — os dados sobrevivem ao reinício do servidor.

## Como executar

Requer Node.js 18.18+.

```bash
npm install                  # instala e gera o Prisma Client (postinstall: prisma generate)
cp .env.example .env         # DATABASE_URL="file:./dev.db"
npx prisma migrate dev       # cria o banco (prisma/dev.db) e aplica as migrations
npm start                    # sobe em http://localhost:3000 (ou na porta de process.env.PORT)
```

Outros comandos do banco:

```bash
npx prisma migrate deploy    # aplica migrations pendentes sem criar novas (= npm run db:migrate)
npx prisma studio            # interface web para inspecionar os dados (= npm run db:studio)
npx prisma migrate dev --name <nome>   # após alterar prisma/schema.prisma, gera uma nova migration
```

O arquivo do banco (`prisma/dev.db`) e o `.env` ficam fora do git; o schema e as migrations
(`prisma/migrations/`) são versionados.

Autograder (com o servidor no ar, em outro terminal):

```bash
npm run check      # = BASE_URL=http://localhost:3000 node autograder/check.mjs
```

## Arquitetura

```
server.js                  # só configura o app, monta /api e o tratamento de erros
prisma/
├── schema.prisma          # modelos Entrega, Motorista e Evento (histórico) — SQLite
└── migrations/            # migrations versionadas
src/
├── config/                # singleton do Prisma Client (database.js)
├── controllers/           # traduz HTTP ↔ service (sem regra de negócio)
├── services/              # TODA a regra de negócio (validações, duplicidade, transições)
├── repositories/          # só acesso a dados: contratos + implementações Prisma (*.prisma.js) e em memória
├── database/              # banco simulado em memória (usado pelos repositories em memória)
├── routes/                # composition root (injeção de dependências) + rotas
└── utils/                 # AppError e error handler ({ "erro": "..." })
```

## Contratos de repository e composição das dependências

Cada repository tem um **contrato documentado em JSDoc**
([IEntregasRepository.js](src/repositories/IEntregasRepository.js) e
[IMotoristasRepository.js](src/repositories/IMotoristasRepository.js)). Os services usam **somente**
os métodos do contrato, então a implementação pode ser trocada (memória, Mock, Prisma) sem alterar
nenhum service. Os contratos são **assíncronos**: todo método retorna uma `Promise`.

```
IEntregasRepository                      IMotoristasRepository
  listarTodos(filtros?) → Promise<Entrega[]>        listarTodos()     → Promise<Motorista[]>
  buscarPorId(id)       → Promise<Entrega | null>   buscarPorId(id)   → Promise<Motorista | null>
  criar(dados)          → Promise<Entrega>          buscarPorCpf(cpf) → Promise<Motorista | null>
  atualizar(id, dados)  → Promise<Entrega>          criar(dados)      → Promise<Motorista>
```

A composição acontece em um único ponto, [src/routes/index.js](src/routes/index.js) — não há `new`
de repository dentro de service ou controller:

```js
const entregasRepo = new EntregasPrismaRepository();
const motoristasRepo = new MotoristasPrismaRepository();
const entregasService = new EntregasService(entregasRepo, motoristasRepo);
const motoristasService = new MotoristasService(motoristasRepo, entregasRepo);
const entregasController = new EntregasController(entregasService);
const motoristasController = new MotoristasController(motoristasService);
```

Diagrama da composição (`──▶` = "depende de"):

```
src/routes/index.js  (composition root: cria e injeta tudo)
│
├─ EntregasController ───▶ EntregasService ───┬──▶ IEntregasRepository
│                                             └──▶ IMotoristasRepository
│
├─ MotoristasController ─▶ MotoristasService ─┬──▶ IMotoristasRepository
│                                             └──▶ IEntregasRepository
│
├─ EntregasPrismaRepository    (implementa IEntregasRepository)   ──▶ prisma (src/config/database.js)
└─ MotoristasPrismaRepository  (implementa IMotoristasRepository) ──▶ prisma ──▶ SQLite (prisma/dev.db)
```

### Da memória para o Prisma (prova do Repository Pattern)

A migração para o banco trocou **apenas a camada de persistência**: no composition root, cada
`new XRepository(database)` virou `new XPrismaRepository()` — uma linha por repository. Services e
controllers não mudaram. Os repositories em memória
([EntregasRepository.js](src/repositories/EntregasRepository.js),
[MotoristasRepository.js](src/repositories/MotoristasRepository.js)) continuam no projeto e
respeitam o mesmo contrato, então dá para voltar a eles trocando as mesmas duas linhas.

No banco, o histórico de cada entrega fica na tabela `eventos` (modelo `Evento`, relacionado a
`Entrega`); o repository Prisma o devolve como o array `historico` de sempre. O CPF do motorista é
`@unique` no schema.

## Entrega

| Campo         | Tipo            | Observação                                        |
| ------------- | --------------- | ------------------------------------------------- |
| `id`          | number          | gerado                                            |
| `descricao`   | string          | obrigatório                                       |
| `origem`      | string          | obrigatório; diferente de `destino`               |
| `destino`     | string          | obrigatório                                       |
| `status`      | enum            | `CRIADA → EM_TRANSITO → ENTREGUE` ou `CANCELADA`  |
| `motoristaId` | number \| null  | `null` ao criar; preenchido na atribuição         |
| `historico`   | Evento[]        | `{ data: ISO string, descricao: string }`         |

## Motorista

| Campo          | Tipo            | Observação                    |
| -------------- | --------------- | ----------------------------- |
| `id`           | number          | gerado                        |
| `nome`         | string          | obrigatório                   |
| `cpf`          | string          | obrigatório; único            |
| `placaVeiculo` | string \| null  | opcional                      |
| `status`       | enum            | `ATIVO` (padrão) ou `INATIVO` |

## Rotas

| Método | Rota                             | Sucesso | Erros                         |
| ------ | -------------------------------- | ------- | ----------------------------- |
| GET    | `/api/health`                    | 200     | —                             |
| POST   | `/api/entregas`                  | 201     | 400 inválido · 409 duplicata  |
| GET    | `/api/entregas`                  | 200     | —                             |
| GET    | `/api/entregas?status=CRIADA`    | 200     | —                             |
| GET    | `/api/entregas/:id`              | 200     | 404                           |
| PATCH  | `/api/entregas/:id/avancar`      | 200     | 404 · 422 transição inválida  |
| PATCH  | `/api/entregas/:id/cancelar`     | 200     | 404 · 422 já finalizada       |
| GET    | `/api/entregas/:id/historico`    | 200     | 404                           |
| PATCH  | `/api/entregas/:id/atribuir`     | 200     | 400 · 404 · 422 entrega não CRIADA ou motorista INATIVO |
| POST   | `/api/motoristas`                | 201     | 400 inválido · 409 CPF duplicado |
| GET    | `/api/motoristas`                | 200     | —                             |
| GET    | `/api/motoristas/:id`            | 200     | 404                           |
| GET    | `/api/motoristas/:id/entregas`   | 200     | 404                           |
| GET    | `/api/motoristas/:id/entregas?status=CRIADA` | 200 | 404                    |

Erros sempre no formato `{ "erro": "mensagem" }`.

### Regras de negócio

- **Criação:** `origem` ≠ `destino` (senão `400`); status inicial `CRIADA`; registra evento no histórico.
- **Duplicidade:** não pode existir entrega ativa (não `ENTREGUE`/`CANCELADA`) com mesma
  `descricao` + `origem` + `destino` → `409`.
- **Transições:** apenas `CRIADA → EM_TRANSITO → ENTREGUE`; qualquer outro avanço → `422`.
- **Cancelamento:** só se o status não for `ENTREGUE` nem `CANCELADA` (senão `422`).
- **Motorista:** `nome` e `cpf` obrigatórios (senão `400`); CPF já cadastrado → `409`; status
  inicial `ATIVO`.
- **Atribuição:** só para entrega `CRIADA` e motorista `ATIVO` (senão `422`); registra evento no
  histórico. A regra fica no `EntregasService`.
- **Entregas do motorista:** retorna apenas as entregas atribuídas a ele; `?status=` combina com
  esse filtro.

## Exemplos (curl)

```bash
# health check
curl http://localhost:3000/api/health

# criar entrega
curl -X POST http://localhost:3000/api/entregas \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Caixa de livros","origem":"Maceió","destino":"Arapiraca"}'

# listar todas / filtrar por status
curl http://localhost:3000/api/entregas
curl "http://localhost:3000/api/entregas?status=EM_TRANSITO"

# buscar por id
curl http://localhost:3000/api/entregas/1

# avançar status (CRIADA → EM_TRANSITO → ENTREGUE)
curl -X PATCH http://localhost:3000/api/entregas/1/avancar

# cancelar
curl -X PATCH http://localhost:3000/api/entregas/1/cancelar

# histórico
curl http://localhost:3000/api/entregas/1/historico

# cadastrar motorista (placaVeiculo é opcional)
curl -X POST http://localhost:3000/api/motoristas \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","cpf":"123.456.789-00","placaVeiculo":"ABC1D23"}'

# listar motoristas / buscar por id
curl http://localhost:3000/api/motoristas
curl http://localhost:3000/api/motoristas/1

# atribuir motorista a uma entrega CRIADA
curl -X PATCH http://localhost:3000/api/entregas/1/atribuir \
  -H "Content-Type: application/json" \
  -d '{"motoristaId":1}'

# entregas de um motorista / combinando com status
curl http://localhost:3000/api/motoristas/1/entregas
curl "http://localhost:3000/api/motoristas/1/entregas?status=CRIADA"
```

Exemplo de resposta ao criar (`201`):

```json
{
  "id": 1,
  "descricao": "Caixa de livros",
  "origem": "Maceió",
  "destino": "Arapiraca",
  "status": "CRIADA",
  "motoristaId": null,
  "historico": [{ "data": "2026-09-23T12:00:00.000Z", "descricao": "Entrega criada" }]
}
```
