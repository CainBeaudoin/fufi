const $ = (id) => document.getElementById(id);

const SHIPPING_CUSHION = 1.25;
const state = {
  items: [],
  address: null,
  eligibleRates: [],
  baselineRate: null,
  customerCharge: null,
  opsRate: null,
  cashBalance: 100,
  requested: false,
  verified: false,
  packed: false,
  labelBought: false,
  dispatched: false,
  trackingIndex: 0,
  tracking: null
};

const itemData = {
  sneaker: { name: 'Jordan 1 High', type: 'Sneakers', weight: 1.45, value: 320, dims: [36, 25, 15] },
  hoodie: { name: 'Heavyweight Hoodie', type: 'Apparel', weight: 0.85, value: 145, dims: [34, 28, 9] }
};

// Demo stand-in for Settings → Shipping → Service Areas.
const blockedCountries = ['DE'];

// Customer-facing milestones begin only after shipping has been paid.
const trackingStages = [
  {
    status: 'Packing',
    title: 'Our team is packing your order.',
    subtitle: 'Your order has been sent to our Toronto fulfillment team. They’re preparing it for shipment.',
    event: 'Fulfillment started in Toronto.'
  },
  {
    status: 'Label created',
    title: 'Your shipment is ready to go.',
    subtitle: 'We selected the carrier, purchased the label, and assigned your tracking number.',
    event: 'Shipping label created.'
  },
  {
    status: 'Shipped',
    title: 'Your order has shipped.',
    subtitle: 'The parcel has been handed to the carrier and is leaving our Toronto fulfillment hub.',
    event: 'Parcel handed to carrier.'
  },
  {
    status: 'In transit',
    title: 'Your order is on the way.',
    subtitle: 'The carrier is moving your shipment through its network toward the destination.',
    event: 'Shipment processed in the carrier network.'
  },
  {
    status: 'Out for delivery',
    title: 'Out for delivery.',
    subtitle: 'Your shipment is with the local delivery driver and should arrive soon.',
    event: 'Shipment is out for delivery.'
  },
  {
    status: 'Delivered',
    title: 'Delivered.',
    subtitle: 'Your order has reached its destination.',
    event: 'Shipment delivered.'
  }
];

$('cashBalance').textContent = money(state.cashBalance);

document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('.view').forEach((x) => x.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.tab).classList.add('active');
  });
});

document.querySelectorAll('.item').forEach((btn) => {
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

function updatePackage() {
  const count = state.items.length;
  $('selectionCount').textContent = `${count} selected`;
  $('snapItems').textContent = count ? state.items.map((x) => itemData[x].type).join(' + ') : 'None';

  if (!count) {
    $('packageName').textContent = 'Select items';
    $('packageWeight').textContent = '—';
    $('packageValue').textContent = '—';
    $('addressPanel').classList.add('disabled');
    $('addressChip').textContent = 'Waiting for items';
    $('addressChip').className = 'chip muted';
    return;
  }

  const pkg = packageEstimate();
  $('packageName').textContent = count === 2 ? 'Combined shipment' : `${itemData[state.items[0]].type} parcel`;
  $('packageWeight').textContent = `${pkg.weight.toFixed(2)} kg`;
  $('packageValue').textContent = money(pkg.value);
  $('addressPanel').classList.remove('disabled');
  $('addressChip').textContent = 'Ready';
  $('addressChip').className = 'chip success';
}

function packageEstimate() {
  const weight = state.items.reduce((sum, id) => sum + itemData[id].weight, 0) + (state.items.length > 1 ? 0.35 : 0.2);
  const value = state.items.reduce((sum, id) => sum + itemData[id].value, 0);
  const dims = state.items.length === 2 ? [42, 32, 24] : (itemData[state.items[0]]?.dims || [30, 20, 10]);
  return { weight, value, dims };
}

function resetQuote() {
  state.address = null;
  state.eligibleRates = [];
  state.baselineRate = null;
  state.customerCharge = null;
  state.opsRate = null;
  $('ratesPanel').classList.add('disabled');
  $('confirmPanel').classList.add('disabled');
  $('customerRates').innerHTML = '';
  $('rateEmpty').classList.remove('hidden');
  $('requestShipment').disabled = true;
  $('snapDestination').textContent = 'Not set';
  $('snapService').textContent = 'Not calculated';
}

$('addressForm').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!state.items.length || state.requested) return;

  state.address = Object.fromEntries(new FormData(event.currentTarget).entries());
  $('snapDestination').textContent = `${state.address.city}, ${state.address.region}`;

  if (blockedCountries.includes(state.address.country)) {
    renderBlockedDestination();
    return;
  }

  state.eligibleRates = getRates(state.address, packageEstimate());
  if (!state.eligibleRates.length) {
    renderUnavailableDestination();
    return;
  }

  state.baselineRate = [...state.eligibleRates].sort((a, b) => a.price - b.price)[0];
  state.customerCharge = +(state.baselineRate.price + SHIPPING_CUSHION).toFixed(2);
  renderCustomerFlatRate();
  preparePayment();
});

function renderCustomerFlatRate() {
  const rate = state.baselineRate;
  $('ratesPanel').classList.remove('disabled');
  $('rateEmpty').classList.add('hidden');
  $('ratesChip').textContent = 'Price calculated';
  $('ratesChip').className = 'chip success';
  $('customerRates').innerHTML = `
    <div class="flat-rate-card">
      <div>
        <span class="eyebrow">Standard shipping</span>
        <h3>${destinationLabel(state.address)}</h3>
        <p>This is your final shipping price. We’ll choose the actual carrier after your parcel is packed and measured.</p>
        <div class="flat-rate-meta">
          <span>Estimated ${rate.days}</span>
          <span>Tracked delivery</span>
          <span>Carrier selected by fulfillment</span>
        </div>
      </div>
      <div class="flat-rate-price">
        <span>Shipping total</span>
        <strong>${money(state.customerCharge)}</strong>
        <span>Cash only</span>
      </div>
    </div>`;
  $('snapService').textContent = money(state.customerCharge);
}

function preparePayment() {
  const a = state.address;
  $('confirmPanel').classList.remove('disabled');
  $('confirmChip').textContent = 'Cash only';
  $('confirmChip').className = 'chip success';
  $('confirmAddress').textContent = `${a.address}, ${a.city}, ${a.region} ${a.postal}`;
  $('confirmService').textContent = 'Standard shipping';
  $('confirmItems').textContent = state.items.map((x) => itemData[x].type).join(' + ');
  $('confirmPrice').textContent = money(state.customerCharge);
  $('requestShipment').textContent = `Pay ${money(state.customerCharge)} cash & fulfill`;

  const canPay = state.cashBalance >= state.customerCharge;
  $('requestShipment').disabled = !canPay;
  $('confirmChip').textContent = canPay ? 'Cash only' : 'Insufficient cash';
  $('confirmChip').className = `chip ${canPay ? 'success' : 'warning'}`;
}

function renderBlockedDestination() {
  $('ratesPanel').classList.remove('disabled');
  $('customerRates').innerHTML = '<div class="empty"><strong>Shipping unavailable</strong><p>This destination is blacklisted in Admin → Shipping → Service Areas.</p></div>';
  $('rateEmpty').classList.add('hidden');
  $('ratesChip').textContent = 'Blocked';
  $('ratesChip').className = 'chip warning';
  $('confirmPanel').classList.add('disabled');
  $('destinationMessage').textContent = 'This destination is currently restricted by your shipping settings.';
}

function renderUnavailableDestination() {
  $('ratesPanel').classList.remove('disabled');
  $('customerRates').innerHTML = '<div class="empty"><strong>No service available</strong><p>The country is allowed, but no connected carrier can currently service this shipment.</p></div>';
  $('rateEmpty').classList.add('hidden');
  $('ratesChip').textContent = 'No service';
  $('ratesChip').className = 'chip warning';
  $('confirmPanel').classList.add('disabled');
}

function getRates(address, pkg) {
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
      { carrier: 'Chit Chats', service: 'International Tracked', days: '8–16 business days', price: 44.50, tag: 'Cheapest' },
      { carrier: 'UPS', service: 'Worldwide Saver', days: '3–6 business days', price: 62.40, tag: '' },
      { carrier: 'DHL', service: 'Express Worldwide', days: '2–4 business days', price: 68.90, tag: 'Fastest' }
    ];
  } else {
    rates = [
      { carrier: 'Chit Chats', service: 'International Tracked', days: '7–15 business days', price: 34.50, tag: 'Cheapest' },
      { carrier: 'UPS', service: 'Worldwide Saver', days: '3–6 business days', price: 55.10, tag: '' },
      { carrier: 'DHL', service: 'Express Worldwide', days: '2–4 business days', price: 58.20, tag: 'Fastest' }
    ];
  }

  const dimensionalWeight = (pkg.dims[0] * pkg.dims[1] * pkg.dims[2]) / 5000;
  const billableWeight = Math.max(pkg.weight, dimensionalWeight);
  const sizeAdjustment = Math.max(0, billableWeight - 3) * 1.35;

  return rates.map((rate, index) => ({
    ...rate,
    id: `rate-${index}`,
    price: +(rate.price + sizeAdjustment).toFixed(2)
  }));
}

$('requestShipment').addEventListener('click', () => {
  if (!state.customerCharge || state.cashBalance < state.customerCharge || state.requested) return;

  state.cashBalance = +(state.cashBalance - state.customerCharge).toFixed(2);
  state.requested = true;
  state.trackingIndex = 0;
  state.tracking = null;
  $('cashBalance').textContent = money(state.cashBalance);

  enterCustomerFulfillmentMode();
  createOpsOrder();
  renderTracking();
  toast(`${money(state.customerCharge)} paid · sent to fulfillment`);
});

function enterCustomerFulfillmentMode() {
  const customerPanels = document.querySelectorAll('#customer .customer-layout .stack > .panel');
  customerPanels.forEach((panel) => panel.classList.add('hidden'));
  $('trackingPanel').classList.remove('hidden');

  const heroTitle = document.querySelector('#customer .hero h1');
  const heroCopy = document.querySelector('#customer .hero p');
  if (heroTitle) heroTitle.textContent = 'Your order is being fulfilled.';
  if (heroCopy) heroCopy.textContent = 'Shipping is paid. From here, you only need to follow your fulfillment and delivery updates.';

  $('snapStatus').textContent = 'Packing';

  const infoCard = document.querySelector('#customer .side-card.info');
  if (infoCard) {
    infoCard.innerHTML = `<strong>Shipping paid</strong><p>${money(state.customerCharge)} was paid from your cash balance. Your fulfillment request is now with our Toronto team.</p>`;
  }
}

function createOpsOrder() {
  const a = state.address;
  const pkg = packageEstimate();

  $('opsPlaceholder').classList.add('hidden');
  $('opsOrder').classList.remove('hidden');
  $('queueEmpty').classList.add('hidden');
  $('queueOrder').classList.remove('hidden');
  $('openKpi').textContent = '1';
  $('queueCustomer').textContent = a.name;
  $('queueSummary').textContent = state.items.map((x) => itemData[x].type).join(' + ');
  $('queueDestination').textContent = `${a.city}, ${a.region}`;
  $('opsName').textContent = a.name;
  $('opsDestination').textContent = `${a.address}, ${a.city}, ${a.region} ${a.postal}, ${countryName(a.country)}`;
  $('opsRequestedPrice').textContent = money(state.customerCharge);
  $('opsItems').innerHTML = state.items.map((id) => `
    <div class="ops-item">
      <div><strong>${itemData[id].name}</strong><span>${itemData[id].type}</span></div>
      <strong>${money(itemData[id].value)}</strong>
    </div>`).join('');
  $('opsAddress').innerHTML = `<strong>${a.name}</strong><br>${a.address}<br>${a.city}, ${a.region} ${a.postal}<br>${countryName(a.country)}<br>${a.phone}`;
  $('actualWeight').value = pkg.weight.toFixed(2);
  $('length').value = pkg.dims[0];
  $('width').value = pkg.dims[1];
  $('height').value = pkg.dims[2];
  $('declaredValue').value = pkg.value;
  $('labelDest').textContent = `${a.city}, ${a.region}`;
  $('labelCustomerCharge').textContent = money(state.customerCharge);
}

$('verifyBtn').addEventListener('click', () => {
  state.verified = true;
  $('verifyChip').textContent = 'Verified';
  $('verifyChip').className = 'chip success';
  $('packingSection').classList.remove('disabled');
  $('packingChip').textContent = 'Ready to pack';
  $('packingChip').className = 'chip success';
  $('opsStatus').textContent = 'Packing';
  $('opsStatus').className = 'chip warning';
  $('queueStatus').textContent = 'Packing';
  $('queueStatus').className = 'chip warning';
  $('readyKpi').textContent = '1';
  renderTracking();
  toast('Order verified · customer remains in Packing');
});

$('savePackage').addEventListener('click', () => {
  state.packed = true;
  state.opsRate = null;

  const pkg = {
    weight: +$('actualWeight').value,
    dims: [+$('length').value, +$('width').value, +$('height').value],
    value: +$('declaredValue').value
  };

  const rates = getRates(state.address, pkg);
  renderOpsRates(rates);
  $('opsRatesSection').classList.remove('disabled');
  $('opsRatesChip').textContent = `${rates.length} carrier options`;
  $('opsRatesChip').className = 'chip success';
  $('packingChip').textContent = 'Packed';
  $('packingChip').className = 'chip success';

  const cheapest = [...rates].sort((a, b) => a.price - b.price)[0];
  $('rateDelta').textContent = `Customer paid ${money(state.customerCharge)}. Current cheapest postage after packing is ${money(cheapest.price)}. Choose the service that best balances cost and delivery.`;
  toast('Package saved · carrier options refreshed');
});

function renderOpsRates(rates) {
  $('opsRates').innerHTML = rates.map((rate) => `
    <button class="rate ops-rate" data-rate="${rate.id}">
      <div><strong>${rate.carrier}</strong>${rate.tag ? `<span class="tag">${rate.tag}</span>` : ''}<small>${rate.service}</small></div>
      <small>${rate.days}</small>
      <small>Tracked</small>
      <b>${money(rate.price)}</b>
    </button>`).join('');

  document.querySelectorAll('.ops-rate').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ops-rate').forEach((x) => x.classList.remove('selected'));
      btn.classList.add('selected');
      state.opsRate = rates.find((rate) => rate.id === btn.dataset.rate);
      prepareLabel();
    });
  });
}

function prepareLabel() {
  const rate = state.opsRate;
  $('labelSection').classList.remove('disabled');
  $('labelChip').textContent = 'Ready to buy';
  $('labelChip').className = 'chip success';
  $('labelCarrier').textContent = rate.carrier;
  $('labelService').textContent = rate.service;
  $('labelPostage').textContent = money(rate.price);
  $('labelMargin').textContent = signedMoney(state.customerCharge - rate.price);
  $('buyLabel').disabled = false;
}

$('buyLabel').addEventListener('click', () => {
  if (!state.opsRate || state.labelBought) return;

  state.labelBought = true;
  state.tracking = trackingNumber(state.opsRate.carrier);
  $('labelTracking').textContent = state.tracking;
  $('opsTracking').textContent = state.tracking;
  $('trackingNumber').textContent = state.tracking;
  $('labelChip').textContent = 'Purchased';
  $('labelChip').className = 'chip success';
  $('printLabel').disabled = false;
  $('dispatchSection').classList.remove('disabled');
  $('dispatchChip').textContent = 'Ready for handoff';
  $('dispatchChip').className = 'chip success';
  $('dispatchBtn').disabled = false;
  $('opsStatus').textContent = 'Label created';
  $('opsStatus').className = 'chip success';

  advanceCustomerTo(1);
  toast('Label purchased · tracking sent to customer');
});

$('printLabel').addEventListener('click', () => {
  if (!state.labelBought) return;
  toast('4×6 label sent to demo printer');
});

$('dispatchBtn').addEventListener('click', () => {
  if (!state.labelBought || state.dispatched) return;

  state.dispatched = true;
  $('dispatchBtn').disabled = true;
  $('advanceTracking').disabled = false;
  $('dispatchChip').textContent = 'Shipped';
  $('dispatchChip').className = 'chip success';
  $('queueStatus').textContent = 'Shipped';
  $('queueStatus').className = 'chip success';
  $('opsStatus').textContent = 'Shipped';
  $('opsStatus').className = 'chip success';
  $('openKpi').textContent = '0';
  $('readyKpi').textContent = '0';
  $('shippedKpi').textContent = '1';

  advanceCustomerTo(2);
  toast('Shipment handed to carrier');
});

$('advanceTracking').addEventListener('click', () => {
  if (!state.dispatched) return;
  if (state.trackingIndex >= trackingStages.length - 1) return;

  advanceCustomerTo(state.trackingIndex + 1);

  if (state.trackingIndex === trackingStages.length - 1) {
    $('advanceTracking').disabled = true;
    $('dispatchChip').textContent = 'Delivered';
    $('currentScan').textContent = 'Delivered';
    $('opsStatus').textContent = 'Delivered';
    $('queueStatus').textContent = 'Delivered';
    toast('Shipment delivered');
  } else {
    toast(`Tracking updated · ${trackingStages[state.trackingIndex].status}`);
  }
});

function advanceCustomerTo(index) {
  state.trackingIndex = Math.min(index, trackingStages.length - 1);
  $('currentScan').textContent = trackingStages[state.trackingIndex].status;
  renderTracking();
}

function renderTracking() {
  if (!state.requested) return;

  const current = trackingStages[state.trackingIndex];
  $('customerStatus').textContent = current.status;
  $('customerStatus').className = `chip ${current.status === 'Packing' ? 'warning' : 'success'}`;
  $('trackingTitle').textContent = current.title;
  $('trackingSubtitle').textContent = current.subtitle;
  $('trackingCarrier').textContent = state.opsRate && state.labelBought
    ? `${state.opsRate.carrier} · ${state.opsRate.service}`
    : 'Carrier being selected by fulfillment';
  $('trackingNumber').textContent = state.tracking || 'Pending';
  $('snapStatus').textContent = current.status;

  $('trackingProgress').innerHTML = trackingStages.map((stage, index) => `
    <div class="progress-step ${index <= state.trackingIndex ? 'done' : ''}" title="${stage.status}"></div>`).join('');

  $('trackingEvents').innerHTML = trackingStages
    .slice(0, state.trackingIndex + 1)
    .reverse()
    .map((stage, reverseIndex) => `
      <div class="event">
        <small>${reverseIndex === 0 ? 'Latest update' : 'Earlier'}</small>
        <div>
          <strong>${stage.event}</strong>
          <small>${stage.status === 'Delivered' ? destinationLabel(state.address) : 'Toronto / carrier network'}</small>
        </div>
      </div>`).join('');
}

function trackingNumber(carrier) {
  const prefix = {
    'Chit Chats': 'CH',
    'Canada Post': 'CP',
    'Purolator': 'PUR',
    'UPS': '1Z',
    'FedEx': 'FDX',
    'DHL': 'DHL'
  }[carrier] || 'TRK';
  return prefix + Math.random().toString().slice(2, 14);
}

function destinationLabel(address) {
  if (!address) return 'Destination';
  return `${address.city}, ${address.region} · ${countryName(address.country)}`;
}

function countryName(code) {
  return {
    CA: 'Canada',
    US: 'United States',
    AE: 'United Arab Emirates',
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    AU: 'Australia',
    JP: 'Japan'
  }[code] || code;
}

function money(value) {
  return `C$${Number(value).toFixed(2)}`;
}

function signedMoney(value) {
  const number = Number(value);
  return `${number < 0 ? '-' : '+'}C$${Math.abs(number).toFixed(2)}`;
}

function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $('toast').classList.remove('show'), 1800);
}
