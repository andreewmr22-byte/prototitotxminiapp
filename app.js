(function () {
  const DEFAULT_CATALOG_ITEMS = [
    {
      id: 'CAT-001',
      title: 'Linha Essencial',
      category: 'Catálogo',
      tag: 'Mais acessado',
      status: 'Disponível',
      summary:
        'Opção principal para consulta rápida, com informações reduzidas e atendimento guiado.',
      details: ['Resumo em 2 linhas', 'Botão de atendimento', 'Ficha limpa sem excesso de texto'],
    },
    {
      id: 'CAT-002',
      title: 'Linha Premium',
      category: 'Catálogo',
      tag: 'Destaque',
      status: 'Sob consulta',
      summary: 'Card visual para itens especiais, com filtro por perfil e botão de solicitação.',
      details: ['Filtro por categoria', 'Status claro', 'Ação principal única'],
    },
    {
      id: 'SUP-001',
      title: 'Atendimento guiado',
      category: 'Suporte',
      tag: 'Rápido',
      status: 'Online',
      summary:
        'Fluxo simples para usuário leigo escolher o que precisa sem digitar mensagem grande.',
      details: ['Dúvida', 'Solicitação', 'Retorno humano'],
    },
    {
      id: 'AVS-001',
      title: 'Avisos da equipe',
      category: 'Avisos',
      tag: 'Atualizado',
      status: 'Novo',
      summary: 'Área de comunicados para reduzir mensagens repetidas no WhatsApp ou Telegram.',
      details: ['Comunicado fixo', 'Atualizações', 'Regras de atendimento'],
    },
    {
      id: 'CRM-001',
      title: 'Consulta de cliente',
      category: 'CRM',
      tag: 'Interno',
      status: 'Restrito',
      summary: 'Área administrativa para localizar cliente, histórico e observações.',
      details: ['Busca por nome ou telefone', 'Histórico resumido', 'Permissão de admin'],
    },
  ];

  const CATALOG_ENDPOINT = '/api/catalogo';
  const ICONS = {
    search:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>',
    home:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10.5V20h13v-9.5"></path><path d="M9.5 20v-5h5v5"></path></svg>',
    message:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9.2 9.2 0 0 1-3.8-.8L3 21l1.8-5.2a8.3 8.3 0 0 1-.8-3.6A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z"></path></svg>',
    bell:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg>',
    user:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>',
    sliders:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h10"></path><path d="M18 6h2"></path><path d="M16 4v4"></path><path d="M4 12h3"></path><path d="M11 12h9"></path><path d="M9 10v4"></path><path d="M4 18h12"></path><path d="M20 18h0"></path><path d="M18 16v4"></path></svg>',
    grid:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>',
    clock:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>',
    chevron:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>',
  };

  const state = {
    activeTab: 'inicio',
    category: 'Todos',
    query: '',
    catalogItems: DEFAULT_CATALOG_ITEMS,
    selectedItem: null,
    loading: true,
  };

  const refs = {};

  function init() {
    cacheRefs();
    injectIcons();
    bindEvents();
    setupTelegram();
    render();

    fetchCatalogItems().then((items) => {
      state.catalogItems = items.length ? items : DEFAULT_CATALOG_ITEMS;
      state.loading = false;
      ensureCategoryExists();
      runPrototypeTests(state.catalogItems);
      render();
    });
  }

  function cacheRefs() {
    refs.views = document.querySelectorAll('.view');
    refs.searchPanel = document.querySelector('[data-search-panel]');
    refs.searchInput = document.getElementById('search-input');
    refs.clearSearch = document.getElementById('clear-search');
    refs.homeCount = document.getElementById('home-count');
    refs.homeResults = document.getElementById('home-results');
    refs.categoryTabs = document.getElementById('category-tabs');
    refs.catalogResults = document.getElementById('catalog-results');
    refs.navButtons = document.querySelectorAll('[data-tab]');
    refs.quickActionButtons = document.querySelectorAll('[data-tab-target]');
    refs.modal = document.getElementById('detail-modal');
    refs.modalId = document.getElementById('modal-id');
    refs.modalTitle = document.getElementById('modal-title');
    refs.modalSummary = document.getElementById('modal-summary');
    refs.modalDetails = document.getElementById('modal-details');
    refs.modalClose = document.getElementById('modal-close');
    refs.requestService = document.getElementById('request-service');
    refs.whatsappButton = document.getElementById('whatsapp-btn');
    refs.telegramButton = document.getElementById('telegram-btn');
  }

  function bindEvents() {
    refs.navButtons.forEach((button) => {
      button.addEventListener('click', () => activateTab(button.dataset.tab));
    });

    refs.quickActionButtons.forEach((button) => {
      button.addEventListener('click', () => activateTab(button.dataset.tabTarget));
    });

    refs.searchInput.addEventListener('input', (event) => {
      state.query = event.target.value;
      renderSearchState();
      renderResults();
    });

    refs.clearSearch.addEventListener('click', () => {
      state.query = '';
      refs.searchInput.value = '';
      refs.searchInput.focus();
      renderSearchState();
      renderResults();
    });

    refs.modalClose.addEventListener('click', closeModal);
    refs.modal.addEventListener('click', (event) => {
      if (event.target === refs.modal) closeModal();
    });
    refs.requestService.addEventListener('click', requestServiceForSelectedItem);

    refs.whatsappButton.addEventListener('click', () => openExternalLink('https://wa.me/5500000000000'));
    refs.telegramButton.addEventListener('click', () => openTelegramLink('https://t.me/SeuGrupo'));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !refs.modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  async function fetchCatalogItems() {
    try {
      const response = await fetch(CATALOG_ENDPOINT, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) return DEFAULT_CATALOG_ITEMS;

      const data = await response.json();
      return Array.isArray(data) ? normalizeCatalogItems(data) : DEFAULT_CATALOG_ITEMS;
    } catch {
      return DEFAULT_CATALOG_ITEMS;
    }
  }

  function normalizeCatalogItems(items) {
    return items
      .filter((item) => item && item.id && item.title)
      .map((item) => ({
        id: String(item.id),
        title: String(item.title),
        category: item.category ? String(item.category) : 'Catálogo',
        tag: item.tag ? String(item.tag) : 'Item',
        status: item.status ? String(item.status) : 'Disponível',
        summary: item.summary ? String(item.summary) : 'Sem resumo cadastrado.',
        details: Array.isArray(item.details) ? item.details.map(String) : [],
      }));
  }

  function setupTelegram() {
    const webApp = window.Telegram && window.Telegram.WebApp;
    if (!webApp) return;

    webApp.ready();
    webApp.expand();
  }

  function injectIcons() {
    document.querySelectorAll('[data-icon]').forEach((slot) => {
      slot.innerHTML = ICONS[slot.dataset.icon] || ICONS.grid;
    });
  }

  function render() {
    renderViews();
    renderSearchState();
    renderCategories();
    renderResults();
    renderModal();
  }

  function activateTab(tab) {
    state.activeTab = tab;
    renderViews();
    renderSearchState();
    renderResults();

    if (tab === 'catalogo') {
      setTimeout(() => refs.searchInput.focus(), 80);
    }
  }

  function renderViews() {
    refs.views.forEach((view) => {
      view.classList.toggle('active', view.id === state.activeTab);
    });

    refs.navButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === state.activeTab);
    });
  }

  function renderSearchState() {
    const showSearch = state.activeTab === 'inicio' || state.activeTab === 'catalogo';
    refs.searchPanel.classList.toggle('hidden', !showSearch);
    refs.clearSearch.classList.toggle('hidden', !state.query.trim());
  }

  function renderCategories() {
    const categories = buildCategories(state.catalogItems);
    refs.categoryTabs.replaceChildren(
      ...categories.map((category) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = category;
        button.classList.toggle('active', category === state.category);
        button.addEventListener('click', () => {
          state.category = category;
          renderCategories();
          renderResults();
        });
        return button;
      })
    );
  }

  function renderResults() {
    if (state.loading) {
      refs.homeCount.textContent = 'Carregando catálogo...';
      refs.homeResults.innerHTML = loadingMarkup();
      refs.catalogResults.innerHTML = loadingMarkup();
      return;
    }

    const filteredItems = filterCatalogItems(state.catalogItems, state.query, state.category);
    refs.homeCount.textContent = `${filteredItems.length} opções encontradas`;
    renderItemList(refs.homeResults, filteredItems.slice(0, 4));
    renderItemList(refs.catalogResults, filteredItems);
  }

  function renderItemList(container, items) {
    container.replaceChildren();

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML =
        '<strong>Nada encontrado</strong><span>Tente outro termo ou limpe os filtros.</span>';
      container.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      container.appendChild(createItemCard(item));
    });
  }

  function createItemCard(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'item-card';
    button.innerHTML = `
      <div class="item-layout">
        <div>
          <div class="item-topline">
            <span class="tag"></span>
            <span class="status"></span>
          </div>
          <h3></h3>
          <p></p>
        </div>
        <span class="chevron">${ICONS.chevron}</span>
      </div>
    `;

    button.querySelector('.tag').textContent = item.tag;
    button.querySelector('.status').textContent = item.status;
    button.querySelector('h3').textContent = item.title;
    button.querySelector('p').textContent = item.summary;
    button.addEventListener('click', () => openModal(item));
    return button;
  }

  function loadingMarkup() {
    return '<div class="loading-bars" aria-label="Carregando"><span></span><span></span><span></span></div>';
  }

  function openModal(item) {
    state.selectedItem = item;
    renderModal();
  }

  function closeModal() {
    state.selectedItem = null;
    renderModal();
  }

  function renderModal() {
    const item = state.selectedItem;
    refs.modal.classList.toggle('hidden', !item);
    if (!item) return;

    refs.modalId.textContent = item.id;
    refs.modalTitle.textContent = item.title;
    refs.modalSummary.textContent = item.summary;
    refs.modalDetails.replaceChildren();

    if (!item.details.length) {
      const detail = document.createElement('div');
      detail.textContent = 'Nenhum detalhe cadastrado.';
      refs.modalDetails.appendChild(detail);
      return;
    }

    item.details.forEach((text) => {
      const detail = document.createElement('div');
      const label = document.createElement('span');
      const icon = document.createElement('span');
      label.textContent = text;
      icon.innerHTML = ICONS.chevron;
      detail.append(label, icon);
      refs.modalDetails.appendChild(detail);
    });
  }

  function requestServiceForSelectedItem() {
    if (!state.selectedItem) return;

    const payload = {
      action: 'solicitar_atendimento',
      itemId: state.selectedItem.id,
      itemTitulo: state.selectedItem.title,
    };

    const webApp = window.Telegram && window.Telegram.WebApp;
    if (webApp) {
      webApp.sendData(JSON.stringify(payload));
      return;
    }

    window.alert(`Solicitação enviada: ${JSON.stringify(payload)}`);
  }

  function openExternalLink(url) {
    const webApp = window.Telegram && window.Telegram.WebApp;
    if (webApp) {
      webApp.openLink(url);
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function openTelegramLink(url) {
    const webApp = window.Telegram && window.Telegram.WebApp;
    if (webApp) {
      webApp.openTelegramLink(url);
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function buildCategories(items) {
    return ['Todos', ...Array.from(new Set(items.map((item) => item.category))).filter(Boolean)];
  }

  function ensureCategoryExists() {
    if (!buildCategories(state.catalogItems).includes(state.category)) {
      state.category = 'Todos';
    }
  }

  function filterCatalogItems(items, query, category) {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = category === 'Todos' || item.category === category;
      const haystack = [
        item.id,
        item.title,
        item.category,
        item.tag,
        item.status,
        item.summary,
      ]
        .join(' ')
        .toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }

  function runPrototypeTests(items) {
    const tests = [
      {
        name: 'busca por título encontra atendimento',
        result: filterCatalogItems(items, 'atendimento', 'Todos').some(
          (item) => item.id === 'SUP-001'
        ),
      },
      {
        name: 'filtro por categoria CRM retorna somente CRM',
        result: filterCatalogItems(items, '', 'CRM').every((item) => item.category === 'CRM'),
      },
      {
        name: 'busca inexistente retorna lista vazia',
        result: filterCatalogItems(items, 'termo-inexistente-123', 'Todos').length === 0,
      },
      {
        name: 'categorias são geradas a partir dos dados',
        result: buildCategories(items).includes('CRM') && buildCategories(items).includes('Todos'),
      },
    ];

    tests.forEach((test) => {
      if (!test.result) {
        console.error(`[Teste falhou] ${test.name}`);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
