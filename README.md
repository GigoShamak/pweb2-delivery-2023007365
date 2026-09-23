# Delivery Tracker API

> **Programação Web II — IFAL/Maceió** · Projeto do semestre · Matrícula `2023007365`

API para rastrear o ciclo de vida de encomendas, construída com **Node.js + Express** em
**arquitetura em camadas** (rotas → controllers → services → repositories), com persistência
simulada em memória.

## Como executar

Requer Node.js 18+.

```bash
npm install
npm start          # sobe em http://localhost:3000 (ou na porta de process.env.PORT)
```

Autograder (com o servidor no ar, em outro terminal):

```bash
npm run check      # = BASE_URL=http://localhost:3000 node autograder/check.mjs
```

## Arquitetura

```
server.js                  # só configura o app, monta /api e o tratamento de erros
src/
├── controllers/           # traduz HTTP ↔ service (sem regra de negócio)
├── services/              # TODA a regra de negócio (validações, duplicidade, transições)
├── repositories/          # só acesso a dados
├── database/              # persistência SIMULADA em memória
├── routes/                # composition root (injeção de dependências) + rotas
└── utils/                 # AppError e error handler ({ "erro": "..." })
```

A composição das dependências acontece em um único ponto, [src/routes/index.js](src/routes/index.js):

```js
const database = new Database();
const repository = new EntregasRepository(database);
const service = new EntregasService(repository);
const controller = new EntregasController(service);
```

## Entrega

| Campo         | Tipo            | Observação                                        |
| ------------- | --------------- | ------------------------------------------------- |
| `id`          | number          | gerado                                            |
| `descricao`   | string          | obrigatório                                       |
| `origem`      | string          | obrigatório; diferente de `destino`               |
| `destino`     | string          | obrigatório                                       |
| `status`      | enum            | `CRIADA → EM_TRANSITO → ENTREGUE` ou `CANCELADA`  |
| `motoristaId` | number \| null  | `null` ao criar                                   |
| `historico`   | Evento[]        | `{ data: ISO string, descricao: string }`         |

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

Erros sempre no formato `{ "erro": "mensagem" }`.

### Regras de negócio

- **Criação:** `origem` ≠ `destino` (senão `400`); status inicial `CRIADA`; registra evento no histórico.
- **Duplicidade:** não pode existir entrega ativa (não `ENTREGUE`/`CANCELADA`) com mesma
  `descricao` + `origem` + `destino` → `409`.
- **Transições:** apenas `CRIADA → EM_TRANSITO → ENTREGUE`; qualquer outro avanço → `422`.
- **Cancelamento:** só se o status não for `ENTREGUE` nem `CANCELADA` (senão `422`).

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
