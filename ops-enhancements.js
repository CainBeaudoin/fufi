(() => {
  const fmt = (v) => `C$${Number(v).toFixed(2)}`;
  const fastest = (rate) => Number((String(rate.days).match(/\d+/) || [99])[0]);
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

  function estimateForItems(ids) {
    const chosen = ids.map((id) => odtoProducts[id]).filter(Boolean);
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
  }

  window.packageEstimate = function () {
    return estimateForItems(state.items);
  };

  const seededOrders = [
    {
      id: 'FU-10477', customer: 'Priya Shah', items: ['op13'], customerCharge: 59.40,
      address: { name: 'Priya Shah', address: 'Downtown Dubai', city: 'Dubai', region: 'Dubai', postal: '00000', country: 'AE', phone: '+971 50 555 0142' },
      verified: true, packed: false, labelBought: false, dispatched: false, trackingIndex: 0, tracking: null, opsRate: null
    },
    {
      id: 'FU-10475', customer: 'Jordan Lee', items: ['gamma'], customerCharge: 19.80,
      address: { name: 'Jordan Lee', address: 'Atlantic Avenue', city: 'Brooklyn', region: 'NY', postal: '11217', country: 'US', phone: '+1 718 555 0188' },
      verified: false, packed: false, labelBought: false, dispatched: false, trackingIndex: 0, tracking: null, opsRate: null
    },
    {
      id: 'FU-10471', customer: 'Maya Chen', items: ['nb550', 'op13'], customerCharge: 18.25,
      address: { name: 'Maya Chen', address: 'West Georgia Street', city: 'Vancouver', region: 'BC', postal: 'V6E 4A2', country: 'CA', phone: '+1 604 555 0131' },
      verified: true, packed: true, labelBought: false, dispatched: false, trackingIndex: 0, tracking: null, opsRate: null
    },
    {
      id: 'FU-10469', customer: 'Oliver Grant', items: ['foamposite'], customerCharge: 43.90,
      address: { name: 'Oliver Grant', address: 'Oxford Street', city: 'London', region: 'England', postal: 'W1D 1BS', country: 'GB', phone: '+44 20 7946 0182' },
      verified: true, packed: false, labelBought: false, dispatched: false, trackingIndex: 0, tracking: null, opsRate: null
    },
    {
      id: 'FU-10463', customer: 'Haruto Sato', items: ['winlike'], customerCharge: 47.65,
      address: { name: 'Haruto Sato', address: 'Shibuya', city: 'Tokyo', region: 'Tokyo', postal: '150-0002', country: 'JP', phone: '+81 3 5550 0148' },
      verified: false, packed: false, labelBought: false, dispatched: false, trackingIndex: 0, tracking: null, opsRate: null
    }
  ];

  seededOrders.forEach((order) => {
    order.package = estimateForItems(order.items);
  });

  const mockQueueProducts = [
    'ONE PIECE OP-13 · C$59.40 shipping',
    'AIR JORDAN 11 GS GAMMA · C$19.80 shipping',
    'NEW BALANCE 550 ALD GREEN + ONE PIECE OP-13 · C$18.25 shipping',
    'NIKE FOAMPOSITE PRO VOLT · C$43.90 shipping',
    'AIR JORDAN 11 WIN LIKE 96 · C$47.65 shipping'
  ];

  const mockCards = [...document.querySelectorAll('.mock-order')];
  mockCards.forEach((card, index) => {
    const order = seededOrders[index];
    if (!order) return;
    card.dataset.orderId = order.id;
    card.setAttribute('aria-label', `Open ${order.id} for ${order.customer}`);
    const details = card.querySelector(':scope > small');
    if (details && mockQueueProducts[index]) details.textContent = mockQueueProducts[index];
  });

  let activeMockOrder = null;
  const liveCache = { package: null };

  function queueStatus(order) {
    if (order.dispatched && order.trackingIndex >= 3) return 'Delivered';
    if (order.dispatched) return 'Shipped';
    if (order.labelBought) return 'Label';
    if (order.packed) return 'Ready';
    if (order.verified) return 'Packing';
    return 'New';
  }

  function statusClass(label) {
    if (['Ready', 'Label', 'Shipped', 'Delivered'].includes(label)) return 'success';
    if (label === 'Packing') return 'warning';
    return 'muted';
  }

  function setCardStatus(card, order) {
    const chip = card?.querySelector('.chip');
    if (!chip) return;
    const label = queueStatus(order);
    chip.textContent = label;
    chip.className = `chip ${statusClass(label)}`;
  }

  function setQueueCounts() {
    const liveOpen = state.requested && !state.dispatched ? 1 : 0;
    const open = seededOrders.filter((o) => !o.dispatched).length + liveOpen;
    const ready = seededOrders.filter((o) => o.packed && !o.labelBought).length + (state.packed && !state.labelBought ? 1 : 0);
    const shipped = BASE_SHIPPED + seededOrders.filter((o) => o.dispatched).length + (state.dispatched ? 1 : 0);
    $('openKpi').textContent = String(open);
    $('readyKpi').textContent = String(ready);
    $('shippedKpi').textContent = String(shipped);
    const count = document.querySelector('.queue-section-label strong');
    if (count) count.textContent = `${open} open`;
  }

  setQueueCounts();

  function selectQueueCard(card) {
    document.querySelectorAll('.queue-order').forEach((node) => node.classList.remove('is-selected'));
    card?.classList.add('is-selected');
  }

  function productRows(ids) {
    return ids.map((id) => {
      const product = odtoProducts[id];
      return `
        <div class="ops-item interactive-item-row">
          <img src="${product.image}" alt="" loading="lazy" />
          <div><strong>${product.name}</strong><span>${product.brand} · ${product.type}</span></div>
          <strong>${fmt(product.value)}</strong>
        </div>`;
    }).join('');
  }

  function setSectionEnabled(id, enabled) {
    const node = $(id);
    if (!node) return;
    node.classList.toggle('disabled', !enabled);
  }

  function clearRateAndLabelUi() {
    $('opsRates').innerHTML = '';
    $('rateDelta').textContent = '';
    setSectionEnabled('opsRatesSection', false);
    setSectionEnabled('labelSection', false);
    setSectionEnabled('dispatchSection', false);
    $('opsRatesChip').textContent = 'Pack first';
    $('opsRatesChip').className = 'chip muted';
    $('labelChip').textContent = 'Select a carrier';
    $('labelChip').className = 'chip muted';
    $('dispatchChip').textContent = 'Create label first';
    $('dispatchChip').className = 'chip muted';
    $('buyLabel').disabled = true;
    $('printLabel').disabled = true;
    $('dispatchBtn').disabled = true;
    $('advanceTracking').disabled = true;
    $('labelCarrier').textContent = 'Carrier';
    $('labelService').textContent = 'Service';
    $('labelPostage').textContent = '—';
    $('labelMargin').textContent = '—';
    $('labelTracking').textContent = 'TRACKING PENDING';
    $('opsTracking').textContent = '—';
    $('currentScan').textContent = 'Label created';
  }

  function loadMockOrder(order, card) {
    activeMockOrder = order;
    selectQueueCard(card);
    $('opsPlaceholder').classList.add('hidden');
    $('opsOrder').classList.remove('hidden');

    const eyebrow = document.querySelector('#opsOrder .ops-title .eyebrow');
    if (eyebrow) eyebrow.textContent = `Order ${order.id}`;
    $('opsName').textContent = order.customer;
    $('opsDestination').textContent = `${order.address.address}, ${order.address.city}, ${order.address.region} ${order.address.postal}, ${countryName(order.address.country)}`;
    $('opsRequestedPrice').textContent = fmt(order.customerCharge);
    $('opsItems').innerHTML = productRows(order.items);
    $('opsAddress').innerHTML = `<strong>${order.customer}</strong><br>${order.address.address}<br>${order.address.city}, ${order.address.region} ${order.address.postal}<br>${countryName(order.address.country)}<br>${order.address.phone}`;
    $('actualWeight').value = order.package.weight.toFixed(2);
    $('length').value = order.package.dims[0];
    $('width').value = order.package.dims[1];
    $('height').value = order.package.dims[2];
    $('declaredValue').value = order.package.value;
    $('labelDest').textContent = `${order.address.city}, ${order.address.region}`;
    $('labelCustomerCharge').textContent = fmt(order.customerCharge);

    clearRateAndLabelUi();
    const label = queueStatus(order);
    $('opsStatus').textContent = label === 'New' ? 'New request' : label;
    $('opsStatus').className = `chip ${statusClass(label)}`;
    $('verifyChip').textContent = order.verified ? 'Verified' : 'Needs verification';
    $('verifyChip').className = `chip ${order.verified ? 'success' : 'muted'}`;
    $('verifyBtn').textContent = order.verified ? 'Verified' : 'Verify order';
    $('verifyBtn').disabled = order.verified;

    setSectionEnabled('packingSection', order.verified);
    $('packingChip').textContent = order.packed ? 'Packed' : (order.verified ? 'Ready to pack' : 'Verify first');
    $('packingChip').className = `chip ${order.packed ? 'success' : order.verified ? 'success' : 'muted'}`;

    if (order.packed) {
      const rates = getRates(order.address, order.package);
      renderMockRates(order, rates);
      setSectionEnabled('opsRatesSection', true);
      $('opsRatesChip').textContent = `${rates.length} carrier options`;
      $('opsRatesChip').className = 'chip success';
    }

    if (order.opsRate) prepareMockLabel(order);
    if (order.labelBought) restoreMockLabel(order);
    if (order.dispatched) restoreMockDispatch(order);
    setCardStatus(card, order);
    setQueueCounts();
    toast(`Opened ${order.id} · ${order.address.city}`);
  }

  function recommendedRate(rates, paid = Number(state.customerCharge || 0)) {
    const within = rates.filter((r) => r.price <= paid);
    const pool = within.length ? within : rates;
    return [...pool].sort((a, b) => {
      const gap = a.price - b.price;
      return Math.abs(gap) <= 1.5 ? fastest(a) - fastest(b) : gap;
    })[0];
  }

  function rateMarkup(rates, paid, selectedId = null) {
    const best = recommendedRate(rates, paid);
    const bestDelta = paid - best.price;
    return `
      <div class="ops-rate-summary">
        <div><span>Customer paid</span><strong>${fmt(paid)}</strong></div>
        <div><span>Best fit</span><strong>${best.carrier} · ${best.service}</strong></div>
        <div><span>Difference</span><strong class="${bestDelta >= 0 ? 'positive' : ''}">${bestDelta >= 0 ? '+' : '-'}${fmt(Math.abs(bestDelta))}</strong></div>
      </div>
      ${rates.map((rate) => {
        const delta = paid - rate.price;
        const good = delta >= 0;
        const bestFit = rate.id === best.id;
        const selected = rate.id === selectedId;
        return `<button class="rate ops-rate ${good ? 'rate-profitable' : 'rate-over-budget'} ${bestFit ? 'rate-recommended' : ''} ${selected ? 'selected' : ''}" data-rate="${rate.id}" type="button">
          <div><strong>${rate.carrier}</strong>${bestFit ? '<span class="tag">Recommended</span>' : ''}<small>${rate.service}</small></div>
          <small>${rate.days}</small>
          <small>${good ? 'Within customer payment' : 'Costs more than customer paid'}</small>
          <div class="ops-price-stack"><b>${fmt(rate.price)}</b><span class="customer-paid-line">Customer paid ${fmt(paid)}</span><span class="margin-pill">${good ? `+${fmt(delta)} margin` : `${fmt(Math.abs(delta))} over`}</span></div>
        </button>`;
      }).join('')}
      <p class="ops-rate-note">Recommendation is guidance only. Fulfillment can still choose any carrier based on speed, serviceability, insurance, packaging, or operational needs.</p>`;
  }

  window.renderOpsRates = function (rates) {
    const paid = Number(state.customerCharge || 0);
    $('opsRates').innerHTML = rateMarkup(rates, paid, state.opsRate?.id || null);
    document.querySelectorAll('.ops-rate').forEach((btn) => btn.addEventListener('click', () => {
      document.querySelectorAll('.ops-rate').forEach((x) => x.classList.remove('selected'));
      btn.classList.add('selected');
      state.opsRate = rates.find((r) => r.id === btn.dataset.rate);
      prepareLabel();
      updateMarginColor(state.customerCharge, state.opsRate);
    }));
  };

  function renderMockRates(order, rates) {
    $('opsRates').innerHTML = rateMarkup(rates, order.customerCharge, order.opsRate?.id || null);
    $('rateDelta').textContent = `Customer paid ${fmt(order.customerCharge)}. Select the best operational service after checking the packed parcel.`;
    document.querySelectorAll('.ops-rate').forEach((btn) => btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      document.querySelectorAll('.ops-rate').forEach((x) => x.classList.remove('selected'));
      btn.classList.add('selected');
      order.opsRate = rates.find((r) => r.id === btn.dataset.rate);
      prepareMockLabel(order);
    }));
  }

  function updateMarginColor(paid, rate) {
    const node = $('labelMargin');
    if (!node || !rate) return;
    const delta = Number(paid || 0) - Number(rate.price || 0);
    node.classList.toggle('margin-positive', delta >= 0);
    node.classList.toggle('margin-negative', delta < 0);
  }

  function prepareMockLabel(order) {
    const rate = order.opsRate;
    if (!rate) return;
    setSectionEnabled('labelSection', true);
    $('labelChip').textContent = order.labelBought ? 'Purchased' : 'Ready to buy';
    $('labelChip').className = 'chip success';
    $('labelCarrier').textContent = rate.carrier;
    $('labelService').textContent = rate.service;
    $('labelPostage').textContent = fmt(rate.price);
    $('labelMargin').textContent = signedMoney(order.customerCharge - rate.price);
    $('buyLabel').disabled = order.labelBought;
    updateMarginColor(order.customerCharge, rate);
  }

  function restoreMockLabel(order) {
    prepareMockLabel(order);
    $('labelTracking').textContent = order.tracking || 'TRACKING PENDING';
    $('opsTracking').textContent = order.tracking || '—';
    $('printLabel').disabled = false;
    setSectionEnabled('dispatchSection', true);
    $('dispatchChip').textContent = order.dispatched ? 'Shipped' : 'Ready for handoff';
    $('dispatchChip').className = 'chip success';
    $('dispatchBtn').disabled = order.dispatched;
    $('advanceTracking').disabled = !order.dispatched || order.trackingIndex >= 3;
  }

  function restoreMockDispatch(order) {
    restoreMockLabel(order);
    const scans = ['Shipped', 'In transit', 'Out for delivery', 'Delivered'];
    $('currentScan').textContent = scans[Math.min(order.trackingIndex, scans.length - 1)];
    if (order.trackingIndex >= scans.length - 1) {
      $('dispatchChip').textContent = 'Delivered';
      $('advanceTracking').disabled = true;
    }
  }

  function handleMockVerify(order) {
    order.verified = true;
    $('verifyChip').textContent = 'Verified';
    $('verifyChip').className = 'chip success';
    $('verifyBtn').textContent = 'Verified';
    $('verifyBtn').disabled = true;
    setSectionEnabled('packingSection', true);
    $('packingChip').textContent = 'Ready to pack';
    $('packingChip').className = 'chip success';
    $('opsStatus').textContent = 'Packing';
    $('opsStatus').className = 'chip warning';
    const card = document.querySelector(`.mock-order[data-order-id="${order.id}"]`);
    setCardStatus(card, order);
    setQueueCounts();
    toast(`${order.id} verified`);
  }

  function handleMockPack(order) {
    order.package = {
      weight: Math.max(0.1, Number($('actualWeight').value) || order.package.weight),
      dims: [
        Math.max(1, Number($('length').value) || order.package.dims[0]),
        Math.max(1, Number($('width').value) || order.package.dims[1]),
        Math.max(1, Number($('height').value) || order.package.dims[2])
      ],
      value: Math.max(1, Number($('declaredValue').value) || order.package.value)
    };
    order.packed = true;
    order.opsRate = null;
    const rates = getRates(order.address, order.package);
    setSectionEnabled('opsRatesSection', true);
    $('opsRatesChip').textContent = `${rates.length} carrier options`;
    $('opsRatesChip').className = 'chip success';
    $('packingChip').textContent = 'Packed';
    $('packingChip').className = 'chip success';
    $('opsStatus').textContent = 'Ready';
    $('opsStatus').className = 'chip success';
    renderMockRates(order, rates);
    const card = document.querySelector(`.mock-order[data-order-id="${order.id}"]`);
    setCardStatus(card, order);
    setQueueCounts();
    toast(`${order.id} packed · rates refreshed`);
  }

  function handleMockBuyLabel(order) {
    if (!order.opsRate || order.labelBought) return;
    order.labelBought = true;
    order.tracking = trackingNumber(order.opsRate.carrier);
    prepareMockLabel(order);
    $('labelTracking').textContent = order.tracking;
    $('opsTracking').textContent = order.tracking;
    $('printLabel').disabled = false;
    setSectionEnabled('dispatchSection', true);
    $('dispatchChip').textContent = 'Ready for handoff';
    $('dispatchChip').className = 'chip success';
    $('dispatchBtn').disabled = false;
    $('opsStatus').textContent = 'Label created';
    $('opsStatus').className = 'chip success';
    const card = document.querySelector(`.mock-order[data-order-id="${order.id}"]`);
    setCardStatus(card, order);
    toast(`${order.id} label purchased`);
  }

  function handleMockDispatch(order) {
    if (!order.labelBought || order.dispatched) return;
    order.dispatched = true;
    order.trackingIndex = 0;
    $('dispatchBtn').disabled = true;
    $('advanceTracking').disabled = false;
    $('dispatchChip').textContent = 'Shipped';
    $('dispatchChip').className = 'chip success';
    $('opsStatus').textContent = 'Shipped';
    $('opsStatus').className = 'chip success';
    $('currentScan').textContent = 'Shipped';
    const card = document.querySelector(`.mock-order[data-order-id="${order.id}"]`);
    setCardStatus(card, order);
    setQueueCounts();
    toast(`${order.id} handed to carrier`);
  }

  function handleMockAdvance(order) {
    if (!order.dispatched) return;
    const scans = ['Shipped', 'In transit', 'Out for delivery', 'Delivered'];
    order.trackingIndex = Math.min(order.trackingIndex + 1, scans.length - 1);
    const scan = scans[order.trackingIndex];
    $('currentScan').textContent = scan;
    $('opsStatus').textContent = scan;
    $('opsStatus').className = 'chip success';
    if (order.trackingIndex >= scans.length - 1) {
      $('dispatchChip').textContent = 'Delivered';
      $('advanceTracking').disabled = true;
    }
    const card = document.querySelector(`.mock-order[data-order-id="${order.id}"]`);
    setCardStatus(card, order);
    setQueueCounts();
    toast(`${order.id} · ${scan}`);
  }

  mockCards.forEach((card) => {
    card.addEventListener('click', () => {
      const order = seededOrders.find((item) => item.id === card.dataset.orderId);
      if (order) loadMockOrder(order, card);
    });
  });

  function captureMockAction(id, handler) {
    const button = $(id);
    if (!button) return;
    button.addEventListener('click', (event) => {
      if (!activeMockOrder) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      handler(activeMockOrder);
    }, true);
  }

  captureMockAction('verifyBtn', handleMockVerify);
  captureMockAction('savePackage', handleMockPack);
  captureMockAction('buyLabel', handleMockBuyLabel);
  captureMockAction('printLabel', (order) => {
    if (order.labelBought) toast(`${order.id} · 4×6 label sent to demo printer`);
  });
  captureMockAction('dispatchBtn', handleMockDispatch);
  captureMockAction('advanceTracking', handleMockAdvance);

  const liveOrderCard = $('queueOrder');
  if (liveOrderCard) {
    liveOrderCard.addEventListener('click', () => {
      if (!state.requested) return;
      activeMockOrder = null;
      selectQueueCard(liveOrderCard);
      createOpsOrder();
      if (liveCache.package) {
        $('actualWeight').value = liveCache.package.weight;
        $('length').value = liveCache.package.dims[0];
        $('width').value = liveCache.package.dims[1];
        $('height').value = liveCache.package.dims[2];
        $('declaredValue').value = liveCache.package.value;
      }
      $('verifyBtn').disabled = state.verified;
      $('verifyBtn').textContent = state.verified ? 'Verified' : 'Verify order';
      setSectionEnabled('packingSection', state.verified);
      if (state.packed) {
        const pkg = liveCache.package || packageEstimate();
        const rates = getRates(state.address, pkg);
        setSectionEnabled('opsRatesSection', true);
        $('opsRatesChip').textContent = `${rates.length} carrier options`;
        $('opsRatesChip').className = 'chip success';
        renderOpsRates(rates);
      }
      if (state.opsRate) prepareLabel();
      if (state.labelBought) {
        $('labelTracking').textContent = state.tracking;
        $('opsTracking').textContent = state.tracking;
        $('printLabel').disabled = false;
        setSectionEnabled('dispatchSection', true);
        $('dispatchBtn').disabled = state.dispatched;
        $('advanceTracking').disabled = !state.dispatched;
      }
      toast('Opened live customer order FU-10482');
    });
  }

  const requestButton = $('requestShipment');
  if (requestButton) requestButton.addEventListener('click', () => {
    if (!state.requested) return;
    activeMockOrder = null;
    liveCache.package = packageEstimate();
    selectQueueCard(liveOrderCard);
    setQueueCounts();
  });

  const saveButton = $('savePackage');
  if (saveButton) saveButton.addEventListener('click', () => {
    if (activeMockOrder || !state.packed) return;
    liveCache.package = {
      weight: Number($('actualWeight').value),
      dims: [Number($('length').value), Number($('width').value), Number($('height').value)],
      value: Number($('declaredValue').value)
    };
    setQueueCounts();
  });

  ['verifyBtn', 'buyLabel', 'dispatchBtn'].forEach((id) => {
    const button = $(id);
    if (button) button.addEventListener('click', () => {
      if (!activeMockOrder) setQueueCounts();
    });
  });
})();