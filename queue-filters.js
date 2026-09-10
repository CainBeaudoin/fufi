(() => {
  if (window.__fufiQueueFiltersLoaded) return;
  window.__fufiQueueFiltersLoaded = true;

  const queuePane = document.querySelector('#ops .queue .queue-pane');
  const archivePane = document.querySelector('#ops .queue .archive-pane');
  const queueList = queuePane?.querySelector('.queue-list');
  const archiveList = archivePane?.querySelector('.archive-list');
  if (!queuePane || !archivePane || !queueList || !archiveList) return;

  let activeQueueFilter = 'all';
  let activeArchiveFilter = 'all';

  const queueFilters = [
    ['all', 'All'],
    ['pending', 'Pending'],
    ['packing', 'Packing'],
    ['ready', 'Ready'],
    ['label', 'Label'],
    ['shipped', 'Shipped']
  ];
  const archiveFilters = [
    ['all', 'All'],
    ['shipped', 'Shipped'],
    ['delivered', 'Delivered']
  ];

  const queueBar = document.createElement('div');
  queueBar.className = 'queue-status-filters';
  queueBar.setAttribute('aria-label', 'Filter fulfillment queue by status');
  queueBar.innerHTML = queueFilters.map(([key, label]) => `<button class="queue-filter-chip ${key === 'all' ? 'is-active' : ''}" type="button" data-filter="${key}">${label}<span data-count-for="${key}"></span></button>`).join('');

  const queueSectionLabel = queuePane.querySelector('.queue-section-label');
  queuePane.insertBefore(queueBar, queueSectionLabel || queueList);

  const queueEmpty = document.createElement('div');
  queueEmpty.className = 'queue-filter-empty';
  queueEmpty.textContent = 'No fulfillment orders match this status.';
  queueList.after(queueEmpty);

  const archiveBar = document.createElement('div');
  archiveBar.className = 'archive-status-filters';
  archiveBar.setAttribute('aria-label', 'Filter archived shipments by status');
  archiveBar.innerHTML = archiveFilters.map(([key, label]) => `<button class="queue-filter-chip ${key === 'all' ? 'is-active' : ''}" type="button" data-filter="${key}">${label}<span data-archive-count-for="${key}"></span></button>`).join('');
  archiveList.before(archiveBar);

  const archiveEmpty = document.createElement('div');
  archiveEmpty.className = 'queue-filter-empty';
  archiveEmpty.textContent = 'No archived shipments match this status.';
  archiveList.after(archiveEmpty);

  function liveOrderStatus() {
    if (typeof state === 'undefined' || !state.requested) return null;
    if (state.dispatched) return 'Shipped';
    if (state.labelBought) return 'Label';
    if (state.packed) return 'Ready';
    if (state.verified) return 'Packing';
    return 'New';
  }

  function syncLiveStatus() {
    const card = document.getElementById('queueOrder');
    const chip = document.getElementById('queueStatus');
    const status = liveOrderStatus();
    if (!card || !chip || !status || card.classList.contains('is-archived')) return;
    if (chip.textContent.trim() !== status) chip.textContent = status;
    const nextClass = status === 'Packing' ? 'chip warning' : ['Ready', 'Label', 'Shipped'].includes(status) ? 'chip success' : 'chip muted';
    if (chip.className !== nextClass) chip.className = nextClass;
  }

  function cardStatus(card) {
    return (card.querySelector('.chip')?.textContent || '').trim().toLowerCase();
  }

  function queueMatches(filter, status) {
    if (filter === 'all') return true;
    if (filter === 'pending') return status === 'new' || status === 'pending';
    if (filter === 'packing') return status === 'packing';
    if (filter === 'ready') return status === 'ready';
    if (filter === 'label') return status === 'label' || status === 'label created';
    return true;
  }

  function activeQueueCards() {
    return [...queueList.querySelectorAll('.queue-order')].filter((card) => !card.classList.contains('hidden') && !card.classList.contains('is-archived'));
  }

  function updateQueueCounts() {
    syncLiveStatus();
    const cards = activeQueueCards();
    const counts = {
      all: cards.length,
      pending: cards.filter((card) => queueMatches('pending', cardStatus(card))).length,
      packing: cards.filter((card) => queueMatches('packing', cardStatus(card))).length,
      ready: cards.filter((card) => queueMatches('ready', cardStatus(card))).length,
      label: cards.filter((card) => queueMatches('label', cardStatus(card))).length
    };
    queueBar.querySelectorAll('[data-count-for]').forEach((node) => {
      const key = node.dataset.countFor;
      node.textContent = key === 'shipped' ? '' : ` ${counts[key] || 0}`;
    });
  }

  function applyQueueFilter() {
    syncLiveStatus();
    let visible = 0;
    activeQueueCards().forEach((card) => {
      const show = activeQueueFilter === 'all' || queueMatches(activeQueueFilter, cardStatus(card));
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    queueEmpty.classList.toggle('is-visible', visible === 0 && activeQueueFilter !== 'all');
    updateQueueCounts();
  }

  function archiveMatches(filter, status) {
    if (filter === 'all') return true;
    return status === filter;
  }

  function applyArchiveFilter() {
    const cards = [...archiveList.querySelectorAll('.archive-card')];
    const counts = {
      all: cards.length,
      shipped: cards.filter((card) => (card.querySelector('.archive-status')?.textContent || '').trim().toLowerCase() === 'shipped').length,
      delivered: cards.filter((card) => (card.querySelector('.archive-status')?.textContent || '').trim().toLowerCase() === 'delivered').length
    };
    let visible = 0;
    cards.forEach((card) => {
      const status = (card.querySelector('.archive-status')?.textContent || '').trim().toLowerCase();
      const show = archiveMatches(activeArchiveFilter, status);
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    archiveBar.querySelectorAll('[data-archive-count-for]').forEach((node) => {
      const key = node.dataset.archiveCountFor;
      node.textContent = ` ${counts[key] || 0}`;
    });
    archiveEmpty.classList.toggle('is-visible', visible === 0);
  }

  function setArchiveFilter(filter) {
    activeArchiveFilter = filter;
    archiveBar.querySelectorAll('.queue-filter-chip').forEach((button) => button.classList.toggle('is-active', button.dataset.filter === filter));
    applyArchiveFilter();
  }

  queueBar.addEventListener('click', (event) => {
    const button = event.target.closest('.queue-filter-chip');
    if (!button) return;
    const filter = button.dataset.filter;
    if (filter === 'shipped') {
      document.querySelector('.ops-rail-tab[data-rail="archive"]')?.click();
      setArchiveFilter('shipped');
      return;
    }
    activeQueueFilter = filter;
    queueBar.querySelectorAll('.queue-filter-chip').forEach((item) => item.classList.toggle('is-active', item === button));
    applyQueueFilter();
  });

  archiveBar.addEventListener('click', (event) => {
    const button = event.target.closest('.queue-filter-chip');
    if (!button) return;
    setArchiveFilter(button.dataset.filter);
  });

  document.querySelector('.ops-rail-tab[data-rail="queue"]')?.addEventListener('click', () => requestAnimationFrame(applyQueueFilter));
  document.querySelector('.ops-rail-tab[data-rail="archive"]')?.addEventListener('click', () => requestAnimationFrame(applyArchiveFilter));

  const queueObserver = new MutationObserver(() => requestAnimationFrame(applyQueueFilter));
  queueObserver.observe(queueList, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] });

  const archiveObserver = new MutationObserver(() => requestAnimationFrame(applyArchiveFilter));
  archiveObserver.observe(archiveList, { subtree: true, childList: true, characterData: true });

  applyQueueFilter();
  applyArchiveFilter();
})();
