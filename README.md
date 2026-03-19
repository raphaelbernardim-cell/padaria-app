# Padaria App

Sistema web para registro de vendas diárias de uma padaria, com painel operacional, cadastro de produtos, acompanhamento de estoque e resumo do dia.

## Funcionalidades

- Dashboard com faturamento, ticket médio, itens vendidos e valor em estoque.
- Cadastro rápido de produtos.
- Registro de vendas com baixa automática de estoque.
- Relatório resumido com alertas de estoque baixo.
- Histórico das últimas vendas.

## Como executar

```bash
npm install
npm start
```

Depois, abra `http://localhost:3000` no navegador.

## Endpoints principais

- `GET /api/health`
- `GET /api/products`
- `POST /api/products`
- `GET /api/sales`
- `POST /api/sales`
- `GET /api/dashboard`
- `GET /api/reports/daily`
