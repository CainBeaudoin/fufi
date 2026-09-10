(() => {
  if (window.__fufiUxSimplified) return;
  window.__fufiUxSimplified = true;

  const byId = (id) => document.getElementById(id);
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'ux-simplify.css';
  document.head.appendChild(style);

  function setText(selector, text) {
    const node = document.querySelector(selector);
    if (node) node.textContent = text;
  }

  function simplifyCustomer() {
    const customer = byId('customer');
    if (!customer) return;

    customer.querySelector('.customer-layout')?.classList.add('ux-single-column');
    customer.querySelector('.customer-sidebar')?.classList.add('ux-customer-sidebar-hidden');
    customer.querySelector('.hero')?.classList.add('ux-compact-hero');
    setText('#customer .hero h1', 'Ship from your vault.');
    setText('#customer .hero p', 'Choose what to ship, enter the destination, then pay one shipping price. After payment, this page becomes tracking.');

    const itemPanel = customer.querySelector('.customer-layout .stack > .panel:first-child');
    if (itemPanel) {
      const step = itemPanel.querySelector('.step');
      const heading = itemPanel.querySelector('h2');
      if (step) step.textContent = '01';
      if (heading) heading.textContent = 'Choose items';
    }

    const addressPanel = byId('addressPanel');
    if (addressPanel) {
      const heading = addressPanel.querySelector('h2');
      const step = addressPanel.querySelector('.step');
      if (heading) heading.textContent = 'Where should we send it?';
      if (step) step.textContent = '02';
      const footCopy = byId('destinationMessage');
      if (footCopy) footCopy.textContent = 'We’ll check serviceability and calculate one shipping price.';
      const submit = addressPanel.querySelector('button.primary');
      if (submit) submit.textContent = 'Get shipping price';
    }

    const confirmPanel = byId('confirmPanel');
    if (confirmPanel) {
      const heading = confirmPanel.querySelector('h2');
      const step = confirmPanel.querySelector('.step');
      if (heading) heading.textContent = 'Review & pay';
      if (step) step.textContent = '03';

      const confirmGrid = confirmPanel.querySelector('.confirm-grid');
      confirmGrid?.classList.add('ux-compact-confirm');
      const fields = confirmGrid ? [...confirmGrid.children] : [];
      if (fields[1]) fields[1].classList.add('ux-hide-confirm-field');
      if (fields[2]) fields[2].classList.add('ux-hide-confirm-field');

      const payment = confirmPanel.querySelector('.payment-box');
      payment?.classList.add('ux-simple-payment');
      const paymentHeading = payment?.querySelector('h3');
      if (paymentHeading) paymentHeading.textContent = 'Cash';
      if (payment && !payment.querySelector('.ux-cash-note')) {
        const note = document.createElement('div');
        note.className = 'ux-cash-note';
        note.textContent = 'Shipping is cash-only. Credits cannot be used.';
        payment.appendChild(note);
      }

      if (!confirmPanel.querySelector('.ux-shipping-summary')) {
        const summary = document.createElement('div');
        summary.className = 'ux-shipping-summary hidden';
        summary.innerHTML = '<div><span>Shipping</span><strong id="uxShippingDestination">—</strong><small id="uxShippingEta">Tracked delivery</small></div><b id="uxShippingPrice">—</b>';
        confirmGrid?.before(summary);
      }
    }

    const ratesPanel = byId('ratesPanel');
    const customerRates = byId('customerRates');

    function syncCustomerQuote() {
      let charge = null;
      let rate = null;
      try {
        if (typeof state !== 'undefined') {
          charge = state.customerCharge;
          rate = state.baselineRate;
        }
      } catch (_) {}

      const summary = customer.querySelector('.ux-shipping-summary');
      if (charge && rate) {
        ratesPanel?.classList.add('ux-quote-hidden');
        summary?.classList.remove('hidden');
        const destination = byId('uxShippingDestination');
        const eta = byId('uxShippingEta');
        const price = byId('uxShippingPrice');
        if (destination) destination.textContent = byId('snapDestination')?.textContent || 'Destination';
        if (eta) eta.textContent = `Estimated ${rate.days} · tracked`;
        if (price) price.textContent = `C$${Number(charge).toFixed(2)}`;
      } else {
        ratesPanel?.classList.remove('ux-quote-hidden');
        summary?.classList.add('hidden');
      }
    }

    customerRates && new MutationObserver(syncCustomerQuote).observe(customerRates, { childList: true, subtree: true, characterData: true });
    byId('addressForm')?.addEventListener('submit', () => requestAnimationFrame(syncCustomerQuote));
    syncCustomerQuote();
  }

  function simplifyOps() {
    const ops = byId('ops');
    if (!ops) return;

    ops.querySelector('.hero')?.classList.add('ux-compact-hero');
    setText('#ops .hero h1', 'Fulfillment.');
    setText('#ops .hero p', 'Open an order, complete the next required action, and move on.');

    const verifySection = byId('verifyBtn')?.closest('.panel');
    if (verifySection) {
      setText('#verifyBtn', 'Confirm & start packing');
      const h2 = verifySection.querySelector('h2');
      const step = verifySection.querySelector('.step');
      if (h2) h2.textContent = 'Review';
      if (step) step.textContent = '01';
    }

    const packingSection = byId('packingSection');
    if (packingSection) {
      const h2 = packingSection.querySelector('h2');
      const step = packingSection.querySelector('.step');
      if (h2) h2.textContent = 'Pack & rate';
      if (step) step.textContent = '02';
      setText('#savePackage', 'Get carrier rates');

      const packaging = byId('packaging')?.closest('label');
      const fragile = byId('fragile')?.closest('label');
      if ((packaging || fragile) && !packingSection.querySelector('.ux-more-options')) {
        const details = document.createElement('details');
        details.className = 'ux-more-options';
        details.innerHTML = '<summary>More packing options</summary><div class="ux-more-options__body"></div>';
        const body = details.querySelector('.ux-more-options__body');
        if (packaging) body.appendChild(packaging);
        if (fragile) body.appendChild(fragile);
        byId('savePackage')?.before(details);
      }
    }

    const ratesSection = byId('opsRatesSection');
    if (ratesSection) {
      const h2 = ratesSection.querySelector('h2');
      const step = ratesSection.querySelector('.step');
      if (h2) h2.textContent = 'Choose carrier';
      if (step) step.textContent = '03';
      if (!ratesSection.querySelector('.ux-auto-note')) {
        const note = document.createElement('p');
        note.className = 'ux-auto-note';
        note.textContent = 'Best Fit is preselected. Change it only when there’s a reason.';
        ratesSection.querySelector('.panel-head')?.after(note);
      }
    }

    const labelSection = byId('labelSection');
    if (labelSection) {
      const h2 = labelSection.querySelector('h2');
      const step = labelSection.querySelector('.step');
      if (h2) h2.textContent = 'Label';
      if (step) step.textContent = '04';
      setText('#buyLabel', 'Buy & print label');
      byId('printLabel')?.classList.add('ux-hidden-secondary');
    }

    const dispatchSection = byId('dispatchSection');
    if (dispatchSection) {
      const h2 = dispatchSection.querySelector('h2');
      const step = dispatchSection.querySelector('.step');
      if (h2) h2.textContent = 'Ship & track';
      if (step) step.textContent = '05';
      setText('#dispatchBtn', 'Hand to carrier');
      setText('#advanceTracking', 'Next tracking scan');
    }

    function wrapCompliance() {
      const compliance = byId('compliancePanel');
      if (!compliance || compliance.closest('.ux-compliance-details')) return !!compliance;
      const details = document.createElement('details');
      details.className = 'ux-compliance-details';
      const badge = byId('complianceBadge')?.textContent || 'Check';
      details.innerHTML = `<summary>Customs & insurance <span>${badge}</span></summary>`;
      compliance.parentNode.insertBefore(details, compliance);
      details.appendChild(compliance);
      const badgeNode = byId('complianceBadge');
      if (badgeNode) new MutationObserver(() => {
        const summarySpan = details.querySelector('summary span');
        if (summarySpan) summarySpan.textContent = badgeNode.textContent;
      }).observe(badgeNode, { childList: true, characterData: true, subtree: true });
      return true;
    }

    if (!wrapCompliance()) {
      const complianceObserver = new MutationObserver(() => {
        if (wrapCompliance()) complianceObserver.disconnect();
      });
      complianceObserver.observe(packingSection || ops, { childList: true, subtree: true });
    }

    const opsRates = byId('opsRates');
    if (opsRates) {
      const autoSelectRecommended = () => {
        const recommended = opsRates.querySelector('.rate-recommended');
        const selected = opsRates.querySelector('.ops-rate.selected');
        if (!recommended || selected) return;
        if (recommended.dataset.uxAutoSelected === '1') return;
        recommended.dataset.uxAutoSelected = '1';
        recommended.click();
      };
      new MutationObserver(() => requestAnimationFrame(autoSelectRecommended)).observe(opsRates, { childList: true, subtree: true });
      autoSelectRecommended();
    }

    const buyLabel = byId('buyLabel');
    const printLabel = byId('printLabel');
    buyLabel?.addEventListener('click', () => {
      setTimeout(() => {
        if (printLabel && !printLabel.disabled) printLabel.click();
      }, 40);
    });

    const scrollTargets = {
      verifyBtn: 'packingSection',
      savePackage: 'opsRatesSection',
      buyLabel: 'dispatchSection'
    };
    Object.entries(scrollTargets).forEach(([buttonId, targetId]) => {
      byId(buttonId)?.addEventListener('click', () => {
        setTimeout(() => {
          const target = byId(targetId);
          if (target && !target.classList.contains('disabled')) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      });
    });

    ops.addEventListener('click', (event) => {
      if (event.target.closest('.ops-rate')) {
        setTimeout(() => {
          if (!byId('labelSection')?.classList.contains('disabled')) byId('labelSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
    });
  }

  simplifyCustomer();
  simplifyOps();
})();
