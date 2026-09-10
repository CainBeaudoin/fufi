(() => {
  const fmt = (v) => `C$${Number(v).toFixed(2)}`;
  const fastest = (rate) => Number((String(rate.days).match(/\d+/) || [99])[0]);
  const BASE_OPEN = 5;
  const BASE_READY = 2;
  const BASE_SHIPPED = 18;

  // Names, brands, list prices and image URLs below are sourced from ODTO's live storefront.
  // Weight/dimension values are demo shipping estimates only; ODTO does not expose parcel data publicly.
  const odtoProducts = {
    nb550: {
      name: 'NEW BALANCE 550 ALD GREEN',
      brand: 'NEW BALANCE',
      type: 'Footwear',
      value: 550,
      weight: 1.45,
      dims: [36, 25, 15],
      image: 'https://odto.com/cdn/shop/files/1768072229-NEWBALANCE550ALDGREEN-8842985341097.jpg?v=1768072231&width=3000'
    },
    op13: {
      name: 'ONE PIECE OP-13 CARRYING ON HIS WILL BOOSTER BOX',
      brand: 'ONE PIECE',
      type: 'Trading Cards',
      value: 850,
      weight: 0.9,
      dims: [22, 15, 13],
      image: 'https://odto.com/cdn/shop/files/1767824040-10.png?v=1767824043&width=3000'
    },
    gamma: {
      name: 'AIR JORDAN 11 GS GAMMA (2025)',
      brand: 'JORDAN',
      type: 'Footwear',
      value: 320,
      weight: 1.35,
      dims: [35, 24, 14],
      image: 'https://odto.com/cdn/shop/files/GAMMAGS1.jpg?v=1766092532&width=3000'
    },
    winlike: {
      name: 'AIR JORDAN 11 WIN LIKE 96',
      brand: 'JORDAN',
      type: 'Footwear',
      value: 320,
      weight: 1.4,
      dims: [35, 24, 14],
      image: 'https://odto.com/cdn/shop/files/red11s2.jpg?v=1767483601&width=3000'
    },
    foamposite: {
      name: 'NIKE FOAMPOSITE PRO VOLT (2021)',
      brand: 'NIKE',
      type: 'Footwear',
      value: 250,
      weight: 1.6,
      dims: [37, 25, 15],
      image: 'https://odto.com/cdn/shop/files/volt1_6397bdad-f388-4289-a35c-154b86ad8b26.jpg?v=1767483355&width=3000'
    }
  };

  // Replace placeholder demo inventory with real ODTO storefront products.
  Object.keys(itemData).forEach((key) => delete itemData[key]);
  Object.assign(itemData, odtoProducts);

  const itemContainer = document.querySelector('#customer .items');
  if (itemContainer) {
    itemContainer.innerHTML = Object.entries(odtoProducts).map(([id, product]) => `
      <button class="item odto-product-card" data-item="${id}" type="button">
        <div class="product-icon odto-product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
        </div>
        <div class="odto-product-copy">
          <small>${product.brand} · ${product.type}</small>
          <strong>${product.name}</strong>
          <span>ODTO inventory · Vaulted</span>
        </div>
        <b>${fmt(product.value)}</b>
        <em>✓</em>
      </button>`).join('');

    itemContainer.querySelectorAll('.item').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (state.requested) return;
        const id = btn.dataset.item;
        btn.classList.toggle('selected');
        state.items = btn.classList.contains('selected')
          ? [...new Set([...state.items, id])]
          : state.items.filter((x) => x !== id);
        updatePackage();
        resetQuote();
      });
    });
  }

  // Make combined parcels behave sensibly for 1-N selected ODTO products.
  window.packageEstimate = function () {
    const chosen = state.items.map((id) => itemData[id]).filter(Boolean);
    const weight = chosen.reduce((sum, product) => sum + product.weight, 0) + (chosen.length > 1 ? 0.35 + ((chosen.length - 2) * 0.15) : 0.2);
    const value = chosen.reduce((sum, product) => sum + product.value, 0);

    if (!chosen.length) return { weight: 0, value: 0, dims: [30, 20, 10] };
    if (chosen.length === 1) return { weight, value, dims: [...chosen[0].dims] };

    const maxLength = Math.max(...chosen.map((p) => p.dims[0]));
    const maxWidth = Math.max(...chosen.map((p) => p.dims[1]));
    const stackedHeight = chosen.reduce((sum, p) => sum + Math.max(7, p.dims[2] * 0.72), 0);
    return {
      weight,
      value,
      dims: [Math.ceil(maxLength + 6), Math.ceil(maxWidth + 6), Math.ceil(Math.min(48, stackedHeight + 5))]
    };
  };

  // Give the static ops queue the same ODTO inventory vocabulary.
  const mockQueueProducts = [
    'ONE PIECE OP-13 · C$59.40 shipping',
    'AIR JORDAN 11 GS GAMMA · C$19.80 shipping',
    'NEW BALANCE 550 ALD GREEN · C$18.25 shipping',
    'NIKE FOAMPOSITE PRO VOLT · C$43.90 shipping',
    'AIR JORDAN 11 WIN LIKE 96 · C$47.65 shipping'
  ];
  document.querySelectorAll('.mock-order').forEach((card, index) => {
    const details = card.querySelector(':scope > small');
    if (details && mockQueueProducts[index]) details.textContent = mockQueueProducts[index];
  });

  function setQueueCounts(open = BASE_OPEN, ready = BASE_READY, shipped = BASE_SHIPPED) {
    $('openKpi').textContent = String(open);
    $('readyKpi').textContent = String(ready);
    $('shippedKpi').textContent = String(shipped);
    const count = document.querySelector('.queue-section-label strong');
    if (count) count.textContent = `${open} open`;
  }

  setQueueCounts();

  const requestButton = $('requestShipment');
  if (requestButton) requestButton.addEventListener('click', () => {
    if (state.requested) setQueueCounts(BASE_OPEN + 1, BASE_READY, BASE_SHIPPED);
  });

  const verifyButton = $('verifyBtn');
  if (verifyButton) verifyButton.addEventListener('click', () => {
    if (state.requested) setQueueCounts(BASE_OPEN + 1, BASE_READY + 1, BASE_SHIPPED);
  });

  const dispatchButton = $('dispatchBtn');
  if (dispatchButton) dispatchButton.addEventListener('click', () => {
    if (state.dispatched) setQueueCounts(BASE_OPEN, BASE_READY, BASE_SHIPPED + 1);
  });

  function recommendedRate(rates) {
    const paid = Number(state.customerCharge || 0);
    const within = rates.filter((r) => r.price <= paid);
    const pool = within.length ? within : rates;
    return [...pool].sort((a, b) => {
      const gap = a.price - b.price;
      return Math.abs(gap) <= 1.5 ? fastest(a) - fastest(b) : gap;
    })[0];
  }

  window.renderOpsRates = function (rates) {
    const paid = Number(state.customerCharge || 0);
    const best = recommendedRate(rates);
    const bestDelta = paid - best.price;

    $('opsRates').innerHTML = `
      <div class="ops-rate-summary">
        <div><span>Customer paid</span><strong>${fmt(paid)}</strong></div>
        <div><span>Best fit</span><strong>${best.carrier} · ${best.service}</strong></div>
        <div><span>Difference</span><strong class="${bestDelta >= 0 ? 'positive' : ''}">${bestDelta >= 0 ? '+' : '-'}${fmt(Math.abs(bestDelta))}</strong></div>
      </div>
      ${rates.map((rate) => {
        const delta = paid - rate.price;
        const good = delta >= 0;
        const bestFit = rate.id === best.id;
        return `<button class="rate ops-rate ${good ? 'rate-profitable' : 'rate-over-budget'} ${bestFit ? 'rate-recommended' : ''}" data-rate="${rate.id}">
          <div><strong>${rate.carrier}</strong>${bestFit ? '<span class="tag">Recommended</span>' : ''}<small>${rate.service}</small></div>
          <small>${rate.days}</small>
          <small>${good ? 'Within customer payment' : 'Costs more than customer paid'}</small>
          <div class="ops-price-stack"><b>${fmt(rate.price)}</b><span class="customer-paid-line">Customer paid ${fmt(paid)}</span><span class="margin-pill">${good ? `+${fmt(delta)} margin` : `${fmt(Math.abs(delta))} over`}</span></div>
        </button>`;
      }).join('')}
      <p class="ops-rate-note">Recommendation is guidance only. Fulfillment can still choose any carrier based on speed, serviceability, insurance, packaging, or operational needs.</p>`;

    document.querySelectorAll('.ops-rate').forEach((btn) => btn.addEventListener('click', () => {
      document.querySelectorAll('.ops-rate').forEach((x) => x.classList.remove('selected'));
      btn.classList.add('selected');
      state.opsRate = rates.find((r) => r.id === btn.dataset.rate);
      prepareLabel();
      updateMarginColor();
    }));
  };

  function updateMarginColor() {
    const node = $('labelMargin');
    if (!node || !state.opsRate) return;
    const delta = Number(state.customerCharge || 0) - Number(state.opsRate.price || 0);
    node.classList.toggle('margin-positive', delta >= 0);
    node.classList.toggle('margin-negative', delta < 0);
  }
})();