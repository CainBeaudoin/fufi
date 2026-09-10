(() => {
  if (window.__fufiInteractionRecoveryLoaded) return;
  window.__fufiInteractionRecoveryLoaded = true;

  const byId = (id) => document.getElementById(id);

  function activateTopTab(tab) {
    const targetId = tab?.dataset?.tab;
    const target = targetId ? byId(targetId) : null;
    if (!target) return;

    document.querySelectorAll('.tab[data-tab]').forEach((node) => node.classList.toggle('active', node === tab));
    document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view === target));
  }

  function syncPayButton() {
    const button = byId('requestShipment');
    if (!button) return;
    try {
      const ready = typeof state !== 'undefined'
        && !state.requested
        && Number(state.customerCharge) > 0
        && Number(state.cashBalance) >= Number(state.customerCharge);
      button.disabled = !ready;
    } catch (_) {}
  }

  function performPayment() {
    const button = byId('requestShipment');
    if (!button) return false;

    try {
      if (typeof state === 'undefined') return false;
      if (!state.customerCharge || state.cashBalance < state.customerCharge || state.requested) return false;

      state.cashBalance = +(state.cashBalance - state.customerCharge).toFixed(2);
      state.requested = true;
      state.trackingIndex = 0;
      state.tracking = null;

      const cash = byId('cashBalance');
      if (cash) cash.textContent = typeof money === 'function' ? money(state.cashBalance) : `$${state.cashBalance.toFixed(2)}`;

      if (typeof enterCustomerFulfillmentMode === 'function') enterCustomerFulfillmentMode();
      if (typeof createOpsOrder === 'function') createOpsOrder();
      if (typeof renderTracking === 'function') renderTracking();
      if (typeof toast === 'function') toast(`${typeof money === 'function' ? money(state.customerCharge) : `$${Number(state.customerCharge).toFixed(2)}`} paid · sent to fulfillment`);

      button.disabled = true;
      return true;
    } catch (error) {
      console.error('FUFI payment recovery failed', error);
      return false;
    }
  }

  document.addEventListener('click', (event) => {
    const topTab = event.target.closest('.tab[data-tab]');
    if (topTab) {
      event.preventDefault();
      activateTopTab(topTab);
      return;
    }

    const payButton = event.target.closest('#requestShipment');
    if (payButton && !payButton.disabled) {
      performPayment();
      return;
    }

    const railTab = event.target.closest('.ops-rail-tab[data-rail]');
    if (railTab) {
      const mode = railTab.dataset.rail;
      const queuePane = document.querySelector('#ops .queue-pane');
      const archivePane = byId('archivePane');
      document.querySelectorAll('.ops-rail-tab[data-rail]').forEach((node) => node.classList.toggle('is-active', node === railTab));
      queuePane?.classList.toggle('hidden', mode !== 'queue');
      archivePane?.classList.toggle('hidden', mode !== 'archive');
    }
  }, true);

  byId('addressForm')?.addEventListener('submit', () => setTimeout(syncPayButton, 0));
  document.querySelector('#customer .items')?.addEventListener('click', () => setTimeout(syncPayButton, 0));

  const confirmPanel = byId('confirmPanel');
  if (confirmPanel) {
    new MutationObserver(syncPayButton).observe(confirmPanel, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'disabled']
    });
  }

  window.addEventListener('pageshow', syncPayButton);
  syncPayButton();
})();