(() => {
  if (window.__fufiCustomerOrderUiLoaded) return;
  window.__fufiCustomerOrderUiLoaded = true;

  const badge = document.getElementById('customerOrderBadge');
  const requestButton = document.getElementById('requestShipment');
  const trackingPanel = document.getElementById('trackingPanel');
  if (!badge) return;

  function syncOrderBadge() {
    let paid = false;
    try {
      paid = typeof state !== 'undefined' && !!state.requested;
    } catch (_) {}

    if (!paid && trackingPanel) {
      paid = !trackingPanel.classList.contains('hidden');
    }

    badge.classList.toggle('hidden', !paid);
  }

  requestButton?.addEventListener('click', () => {
    requestAnimationFrame(() => requestAnimationFrame(syncOrderBadge));
  });

  if (trackingPanel) {
    new MutationObserver(syncOrderBadge).observe(trackingPanel, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  syncOrderBadge();
})();
