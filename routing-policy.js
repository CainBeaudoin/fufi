(() => {
  if (window.__fufiRoutingPolicyLoaded) return;
  window.__fufiRoutingPolicyLoaded = true;

  // Demo prices use USD as the platform base currency.
  // Canada -> Chit Chats / Canada Post / Purolator / UPS
  // U.S. -> Chit Chats first, then UPS / FedEx / DHL
  // Overseas -> DHL / FedEx / UPS / Purolator only
  // Chit Chats and Canada Post are intentionally excluded from overseas rate shopping.
  window.getRates = function getRates(address, pkg) {
    const country = address.country;
    const isToronto = country === 'CA' && String(address.city || '').trim().toLowerCase().includes('toronto');
    let rates;

    if (isToronto) {
      rates = [
        { carrier: 'Chit Chats', service: 'Canada Tracked', days: '1–3 business days', price: 7.90, tag: 'Cheapest' },
        { carrier: 'Canada Post', service: 'Expedited Parcel', days: '1–3 business days', price: 12.60, tag: '' },
        { carrier: 'Purolator', service: 'Ground', days: '1–2 business days', price: 13.80, tag: 'Fast' },
        { carrier: 'UPS', service: 'Standard', days: '1–2 business days', price: 15.20, tag: '' }
      ];
    } else if (country === 'CA') {
      rates = [
        { carrier: 'Chit Chats', service: 'Canada Tracked', days: '2–6 business days', price: 10.95, tag: 'Cheapest' },
        { carrier: 'Canada Post', service: 'Expedited Parcel', days: '2–5 business days', price: 14.80, tag: '' },
        { carrier: 'Purolator', service: 'Ground', days: '1–4 business days', price: 17.40, tag: 'Fast' },
        { carrier: 'UPS', service: 'Standard', days: '1–4 business days', price: 18.60, tag: '' }
      ];
    } else if (country === 'US') {
      rates = [
        { carrier: 'Chit Chats', service: 'U.S. Tracked / USPS', days: '3–7 business days', price: 13.70, tag: 'Cheapest' },
        { carrier: 'UPS', service: 'Standard', days: '3–5 business days', price: 22.70, tag: '' },
        { carrier: 'FedEx', service: 'International Ground', days: '3–6 business days', price: 24.90, tag: '' },
        { carrier: 'DHL', service: 'Express', days: '1–2 business days', price: 43.20, tag: 'Fastest' }
      ];
    } else if (country === 'AE') {
      rates = [
        { carrier: 'FedEx', service: 'International Economy', days: '4–7 business days', price: 59.80, tag: 'Lowest courier' },
        { carrier: 'UPS', service: 'Worldwide Saver', days: '3–6 business days', price: 62.40, tag: '' },
        { carrier: 'DHL', service: 'Express Worldwide', days: '2–4 business days', price: 68.90, tag: 'Fastest' },
        { carrier: 'Purolator', service: 'International', days: '4–8 business days', price: 71.50, tag: '' }
      ];
    } else {
      rates = [
        { carrier: 'FedEx', service: 'International Economy', days: '4–8 business days', price: 52.90, tag: 'Lowest courier' },
        { carrier: 'UPS', service: 'Worldwide Saver', days: '3–6 business days', price: 55.10, tag: '' },
        { carrier: 'DHL', service: 'Express Worldwide', days: '2–4 business days', price: 58.20, tag: 'Fastest' },
        { carrier: 'Purolator', service: 'International', days: '4–8 business days', price: 60.50, tag: '' }
      ];
    }

    const dims = pkg?.dims || [30, 20, 10];
    const dimensionalWeight = (Number(dims[0]) * Number(dims[1]) * Number(dims[2])) / 5000;
    const billableWeight = Math.max(Number(pkg?.weight || 0), dimensionalWeight);
    const sizeAdjustment = Math.max(0, billableWeight - 3) * 1.35;

    return rates.map((rate, index) => ({
      ...rate,
      id: `rate-${index}`,
      price: +(rate.price + sizeAdjustment).toFixed(2)
    }));
  };

  function patchSamPage() {
    const sam = document.getElementById('sam');
    if (!sam) return false;

    const callout = sam.querySelector('.sam-callout');
    if (callout) {
      const heading = callout.querySelector('h2');
      const copy = callout.querySelector('p');
      if (heading) heading.textContent = 'Chit Chats for Canada/U.S. Couriers for overseas.';
      if (copy) copy.innerHTML = '<strong>Canada:</strong> Chit Chats + Canada Post + Purolator, with UPS/FedEx available when useful. <strong>U.S.:</strong> Chit Chats/USPS first, UPS/FedEx when speed, value or parcel profile justifies it. <strong>Overseas international:</strong> DHL/FedEx/UPS first, with Purolator only when its lane is competitive. <strong>Do not offer Chit Chats or Canada Post for overseas fulfillment.</strong>';
    }

    sam.querySelectorAll('.carrier-card').forEach((card) => {
      const name = card.querySelector('h3')?.textContent?.trim();
      const region = card.querySelector('.carrier-region strong');
      const detail = card.querySelector(':scope > p');
      const implementation = card.querySelector('.carrier-implementation p');
      const speed = card.querySelector('.carrier-detail strong');
      const role = card.querySelector('.carrier-card__head > div > span');

      if (name === 'Chit Chats') {
        if (role) role.textContent = 'Canada + U.S. economy';
        if (region) region.textContent = 'Canada · United States';
        if (detail) detail.textContent = 'Primary value carrier for Toronto-origin Canada and U.S. fulfillment. Do not use it for overseas international orders in this operation because delivery consistency is not strong enough for deadline-sensitive fulfillment.';
        if (speed) speed.textContent = 'Canada ~2–10 days · U.S. ~3–8 days on core services';
        if (implementation) implementation.textContent = 'Request Chit Chats rates only for Canada and U.S. destinations. Exclude it from the overseas carrier pool entirely.';
      }

      if (name === 'Canada Post') {
        if (role) role.textContent = 'Domestic fallback';
        if (region) region.textContent = 'Canada';
        if (detail) detail.textContent = 'Use for Canadian coverage, rural addresses and PO boxes when it is operationally useful. Do not use Canada Post for overseas fulfillment in this operation.';
        if (implementation) implementation.textContent = 'Keep it in the Canadian rate pool only. Overseas orders should go directly to DHL, FedEx, UPS or a competitive Purolator lane.';
      }
    });

    const research = sam.querySelector('.sam-sources > p');
    if (research) research.innerHTML = '<strong>Operational policy:</strong> Chit Chats is for Canada/U.S.; Canada Post is a Canadian fallback. Based on warehouse experience, neither should be used for overseas international orders where delay risk can cause missed deadlines. Overseas routing should prioritize DHL, FedEx and UPS, with Purolator considered only when the lane is competitive.<br><br><strong>Tracking updates:</strong> If we need a carrier-agnostic tracking layer, ParcelsApp can be used as an optional integration to consolidate shipment updates across supported carriers and linked tracking numbers.';

    const sourceLinks = sam.querySelector('.sam-sources .source-links');
    if (sourceLinks && !sourceLinks.querySelector('a[data-parcelsapp-tracking]')) {
      const link = document.createElement('a');
      link.href = 'https://parcelsapp.com/developers/docs';
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.dataset.parcelsappTracking = '1';
      link.textContent = 'ParcelsApp tracking API';
      sourceLinks.appendChild(link);
    }
    return true;
  }

  if (!patchSamPage()) {
    const observer = new MutationObserver(() => {
      if (patchSamPage()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = resolve;
      document.body.appendChild(script);
    });
  }

  function loadStyle(href) {
    if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
    });
  }

  loadScript('ux-simplify.js')
    .then(() => loadScript('currency-policy.js'))
    .then(() => loadScript('carrier-selection.js'))
    .then(() => loadScript('tracking-ui.js'))
    .then(() => loadScript('label-ui.js'))
    .then(() => loadStyle('visual-polish.css'))
    .then(() => loadStyle('fixed-shell.css'))
    .then(() => loadScript('fixed-shell.js'))
    .then(() => loadScript('customer-copy.js'));
})();
