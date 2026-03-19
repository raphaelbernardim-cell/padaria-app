const metricsGrid = document.getElementById('metricsGrid');
const productsTableBody = document.getElementById('productsTableBody');
const salesTableBody = document.getElementById('salesTableBody');
const bestSellersList = document.getElementById('bestSellersList');
const reportCard = document.getElementById('reportCard');
const toast = document.getElementById('toast');
const productForm = document.getElementById('productForm');
const saleForm = document.getElementById('saleForm');
const saleProductSelect = document.getElementById('saleProductSelect');
const refreshDashboardButton = document.getElementById('refreshDashboardButton');

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value) {
  return moneyFormatter.format(Number(value || 0));
}

function formatDate(value) {
  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? 'rgba(122, 24, 24, 0.92)' : 'rgba(41, 34, 29, 0.92)';
  toast.classList.add('visible');

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove('visible');
  }, 2500);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Não foi possível processar a solicitação.');
  }

  return data;
}

function renderMetrics(summary) {
  const items = [
    {
      title: 'Faturamento do dia',
      value: summary.totalRevenueFormatted,
      footnote: `${summary.totalOrders} venda(s) registrada(s)`,
    },
    {
      title: 'Ticket médio',
      value: summary.averageTicketFormatted,
      footnote: 'Média por venda registrada',
    },
    {
      title: 'Itens vendidos',
      value: String(summary.totalItemsSold),
      footnote: `${summary.inventoryItems} itens ainda em estoque`,
    },
    {
      title: 'Valor em estoque',
      value: summary.inventoryValueFormatted,
      footnote: `${summary.lowStockProducts.length} item(ns) com estoque baixo`,
    },
  ];

  metricsGrid.innerHTML = items
    .map(
      (item) => `
        <article class="metric-card">
          <span class="eyebrow">${item.title}</span>
          <strong>${item.value}</strong>
          <small>${item.footnote}</small>
        </article>
      `,
    )
    .join('');
}

function renderProducts(products) {
  productsTableBody.innerHTML = products
    .map((product) => {
      const stockStatusClass = product.stock <= 15 ? 'warning' : 'success';
      const stockStatusLabel = product.stock <= 15 ? 'Reposição' : 'OK';

      return `
        <tr>
          <td>
            <strong>${product.name}</strong>
            <div>${product.description || 'Sem descrição.'}</div>
          </td>
          <td>${product.category}</td>
          <td>${formatCurrency(product.price)}</td>
          <td>
            ${product.stock}
            <span class="status-pill ${stockStatusClass}">${stockStatusLabel}</span>
          </td>
        </tr>
      `;
    })
    .join('');

  saleProductSelect.innerHTML = products
    .map(
      (product) =>
        `<option value="${product.id}">${product.name} · ${formatCurrency(product.price)} · estoque ${product.stock}</option>`,
    )
    .join('');
}

function renderSales(sales) {
  salesTableBody.innerHTML = sales
    .map(
      (sale) => `
        <tr>
          <td>${formatDate(sale.createdAt)}</td>
          <td>${sale.productName}</td>
          <td>${sale.quantity}</td>
          <td>${sale.paymentMethod}</td>
          <td>${sale.totalFormatted || formatCurrency(sale.total)}</td>
        </tr>
      `,
    )
    .join('');
}

function renderReport(summary, bestSellers) {
  const lowStockLabel = summary.lowStockProducts.length
    ? summary.lowStockProducts.map((product) => product.name).join(', ')
    : 'Nenhum item crítico no momento';

  reportCard.innerHTML = `
    <p class="eyebrow">Fechamento parcial</p>
    <strong>${summary.totalRevenueFormatted}</strong>
    <p>${summary.totalOrders} venda(s), ticket médio de ${summary.averageTicketFormatted} e estoque avaliado em ${summary.inventoryValueFormatted}.</p>
    <p><strong>Atenção:</strong> ${lowStockLabel}</p>
  `;

  bestSellersList.innerHTML = bestSellers
    .map(
      (item, index) => `
        <li>
          <div>
            <strong>#${index + 1} ${item.name}</strong>
            <span>${item.sold} unidade(s) vendida(s)</span>
          </div>
          <strong>${item.revenueFormatted}</strong>
        </li>
      `,
    )
    .join('');
}

async function loadDashboard() {
  const [dashboard, products, sales] = await Promise.all([
    request('/api/dashboard'),
    request('/api/products'),
    request('/api/sales'),
  ]);

  renderMetrics(dashboard.summary);
  renderProducts(products);
  renderSales(sales);
  renderReport(dashboard.summary, dashboard.bestSellers);
}

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(productForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await request('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        price: Number(payload.price),
        stock: Number(payload.stock),
      }),
    });

    productForm.reset();
    await loadDashboard();
    showToast('Produto cadastrado com sucesso.');
  } catch (error) {
    showToast(error.message, true);
  }
});

saleForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(saleForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await request('/api/sales', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        productId: Number(payload.productId),
        quantity: Number(payload.quantity),
      }),
    });

    saleForm.reset();
    await loadDashboard();
    showToast('Venda registrada com sucesso.');
  } catch (error) {
    showToast(error.message, true);
  }
});

refreshDashboardButton.addEventListener('click', async () => {
  try {
    await loadDashboard();
    showToast('Painel atualizado.');
  } catch (error) {
    showToast(error.message, true);
  }
});

loadDashboard().catch((error) => {
  showToast(error.message, true);
});
