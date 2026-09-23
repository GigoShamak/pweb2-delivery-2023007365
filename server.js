// Delivery Tracker — Exercício do Cap. 4.
// Este é o ponto de entrada. Ele deve APENAS configurar o app e montar as rotas.
// A regra de negócio fica no Service; o acesso a dados no Repository; a
// composição das dependências (injeção) fica no seu arquivo de rotas.
//
// Comece implementando as camadas em src/ (veja o README) e vá rodando o
// autograder: `npm run check` (com o servidor no ar) ou pela aba Actions no push.
import express from 'express';
import { criarRotas } from './src/routes/index.js';
import { naoEncontrado, errorHandler } from './src/utils/ErrorHandler.js';

const app = express();
app.use(express.json());

// Health check exigido pelo contrato de execução (não remova).
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Roteador da API (composition root em src/routes).
app.use('/api', criarRotas());

// 404 para rotas não mapeadas (mantenha por último, antes do listen).
app.use(naoEncontrado);

// Tratamento centralizado de erros -> { "erro": "mensagem" }.
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Delivery Tracker rodando em http://localhost:${PORT}`));
