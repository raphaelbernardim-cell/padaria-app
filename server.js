const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const products = [
  {
    id: 1,
    name: 'Pão Francês',
    category: 'Pães',
    price: 0.9,
    stock: 220,
    description: 'Tradicional pão francês crocante para o café da manhã.',
  },
  {
    id: 2,
    name: 'Croissant',
    category: 'Folhados',
    price: 7.5,
    stock: 40,
    description: 'Croissant amanteigado com massa leve e folhada.',
  },
  {
    id: 3,
    name: 'Bolo de Cenoura',
    category: 'Bolos',
    price: 32,
    stock: 8,
    description: 'Bolo de cenoura com cobertura de chocolate.',
  },
  {
    id: 4,
    name: 'Café Coado 300ml',
    category: 'Bebidas',
    price: 5,
    stock: 65,
    description: 'Café coado na hora para acompanhar os salgados.',
  },
];

const sales = [
  {
    id: 1,
    productId: 1,
    quantity: 30,
    paymentMethod: 'Dinheiro',
    seller: 'Caixa manhã',
    customerName: 'Balcão',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    productId: 2,
    quantity: 5,
    paymentMethod: 'Cartão',
    seller: 'Caixa manhã',
    customerName: 'Mariana',
    createdAt: new Date().toISOString(),
  },
];

let nextProductId = products.length + 1;
let nextSaleId = sales.length + 1;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function toMoney(value) {
  return Number(value.toFixed(2));
}

function enrichSale(sale) {
  const product = products.find((item) => item.id === sale.productId);
  const unitPrice = product?.price ?? 0;
  const total = toMoney(unitPrice * sale.quantity);

  return {
    ...sale,
    productName: product?.name ?? 'Produto removido',
    unitPrice,
    total,
    totalFormatted: currencyFormatter.format(total),
  };
}

function getSummary() {
  const enrichedSales = sales.map(enrichSale);
  const totalRevenue = enrichedSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = enrichedSales.length;
  const totalItemsSold = enrichedSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const inventoryItems = products.reduce((sum, product) => sum + product.stock, 0);
  const inventoryValue = products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const lowStockProducts = products.filter((product) => product.stock <= 15);
  const averageTicket = totalOrders ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue: toMoney(totalRevenue),
    totalRevenueFormatted: currencyFormatter.format(totalRevenue),
    totalOrders,
    totalItemsSold,
    inventoryItems,
    inventoryValue: toMoney(inventoryValue),
    inventoryValueFormatted: currencyFormatter.format(inventoryValue),
    averageTicket: toMoney(averageTicket),
    averageTicketFormatted: currencyFormatter.format(averageTicket),
    lowStockProducts,
  };
}

app.get('/api/health', (req, res) => {
  res.status(200).send({ status: 'OK' });
});

app.get('/api/products', (req, res) => {
  res.status(200).json(products);
});

app.post('/api/products', (req, res) => {
  const { name, category, price, stock, description } = req.body;

  if (!name || !category || Number(price) <= 0 || Number(stock) < 0) {
    return res.status(400).json({
      message: 'Informe nome, categoria, preço maior que zero e estoque válido.',
    });
  }

  const product = {
    id: nextProductId++,
    name: String(name).trim(),
    category: String(category).trim(),
    price: toMoney(Number(price)),
    stock: Number(stock),
    description: description ? String(description).trim() : '',
  };

  products.unshift(product);
  return res.status(201).json(product);
});

app.get('/api/sales', (req, res) => {
  const sortedSales = sales
    .map(enrichSale)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json(sortedSales);
});

app.post('/api/sales', (req, res) => {
  const { productId, quantity, paymentMethod, seller, customerName } = req.body;
  const parsedProductId = Number(productId);
  const parsedQuantity = Number(quantity);
  const product = products.find((item) => item.id === parsedProductId);

  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  if (!parsedQuantity || parsedQuantity <= 0) {
    return res.status(400).json({ message: 'Quantidade deve ser maior que zero.' });
  }

  if (product.stock < parsedQuantity) {
    return res.status(400).json({ message: 'Estoque insuficiente para registrar a venda.' });
  }

  const sale = {
    id: nextSaleId++,
    productId: parsedProductId,
    quantity: parsedQuantity,
    paymentMethod: paymentMethod ? String(paymentMethod).trim() : 'Não informado',
    seller: seller ? String(seller).trim() : 'Equipe',
    customerName: customerName ? String(customerName).trim() : 'Balcão',
    createdAt: new Date().toISOString(),
  };

  product.stock -= parsedQuantity;
  sales.unshift(sale);

  return res.status(201).json(enrichSale(sale));
});

app.get('/api/dashboard', (req, res) => {
  const summary = getSummary();
  const bestSellers = products
    .map((product) => {
      const sold = sales
        .filter((sale) => sale.productId === product.id)
        .reduce((sum, sale) => sum + sale.quantity, 0);

      return {
        id: product.id,
        name: product.name,
        sold,
        revenue: toMoney(sold * product.price),
        revenueFormatted: currencyFormatter.format(sold * product.price),
      };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const recentSales = sales
    .map(enrichSale)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  res.status(200).json({
    summary,
    bestSellers,
    recentSales,
  });
});

app.get('/api/reports/daily', (req, res) => {
  const summary = getSummary();

  res.status(200).json({
    generatedAt: new Date().toISOString(),
    ...summary,
    products,
    sales: sales.map(enrichSale),
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
