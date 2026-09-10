(() => {
  const queue = document.querySelector('#ops .queue');
  const queueList = queue?.querySelector('.queue-list');
  if (!queue || !queueList || document.getElementById('archivePane')) return;

  const money = (value) => `C$${Number(value || 0).toFixed(2)}`;
  const parseMoney = (value) => Number(String(value || '').replace(/[^0-9.-]/g, '')) || 0;
  const STORAGE_KEY = 'fufi-fulfillment-archive-v1';

  const seeded = [
    {id:'FU-10458',customer:'Zoe Martin',destination:'Montreal, QC, Canada',address:'1250 René-Lévesque Blvd W, Montreal, QC H3B 4W8, Canada',items:[{name:'AIR JORDAN 11 GS GAMMA (2025)',brand:'JORDAN',value:320,image:'https://odto.com/cdn/shop/files/GAMMAGS1.jpg?v=1766092532&width=3000'}],customerCharge:18.40,postage:16.95,carrier:'Chit Chats',service:'Canada Tracked',tracking:'CH840198255311',package:'1.55 kg · 35 × 24 × 14 cm',shippedAt:'Sep 8, 2026 · 3:22 PM',deliveredAt:'Sep 10, 2026 · 11:18 AM',status:'Delivered'},
    {id:'FU-10444',customer:'Noah Wilson',destination:'Chicago, IL, USA',address:'625 N Michigan Ave, Chicago, IL 60611, United States',items:[{name:'NEW BALANCE 550 ALD GREEN',brand:'NEW BALANCE',value:550,image:'https://odto.com/cdn/shop/files/1768072229-NEWBALANCE550ALDGREEN-8842985341097.jpg?v=1768072231&width=3000'}],customerCharge:21.65,postage:18.85,carrier:'Chit Chats',service:'U.S. Tracked / USPS',tracking:'CH739104825661',package:'1.65 kg · 36 × 25 × 15 cm',shippedAt:'Sep 6, 2026 · 10:04 AM',deliveredAt:'Sep 9, 2026 · 2:41 PM',status:'Delivered'},
    {id:'FU-10421',customer:'Aisha Rahman',destination:'Dubai, UAE',address:'Dubai Marina, Dubai, United Arab Emirates',items:[{name:'ONE PIECE OP-13 CARRYING ON HIS WILL BOOSTER BOX',brand:'ONE PIECE',value:850,image:'https://odto.com/cdn/shop/files/1767824040-10.png?v=1767824043&width=3000'}],customerCharge:60.25,postage:56.70,carrier:'DHL Express',service:'Express Worldwide',tracking:'DHL6023910448',package:'1.10 kg · 22 × 15 × 13 cm',shippedAt:'Aug 29, 2026 · 1:16 PM',deliveredAt:'Sep 2, 2026 · 5:08 PM',status:'Delivered'},
    {id:'FU-10396',customer:'Leo Thompson',destination:'London, United Kingdom',address:'Marylebone High Street, London W1U, United Kingdom',items:[{name:'NIKE FOAMPOSITE PRO VOLT (2021)',brand:'NIKE',value:250,image:'https://odto.com/cdn/shop/files/volt1_6397bdad-f388-4289-a35c-154b86ad8b26.jpg?v=1767483355&width=3000'}],customerCharge:45.10,postage:41.90,carrier:'UPS',service:'Worldwide Saver',tracking:'1Z846032918551',package:'1.80 kg · 37 × 25 × 15 cm',shippedAt:'Aug 17, 2026 · 4:42 PM',deliveredAt:'Aug 21, 2026 · 12:29 PM',status:'Delivered'},
    {id:'FU-10351',customer:'Kenji Mori',destination:'Tokyo, Japan',address:'Shinjuku, Tokyo 160-0022, Japan',items:[{name:'AIR JORDAN 11 WIN LIKE 96',brand:'JORDAN',value:320,image:'https://odto.com/cdn/shop/files/red11s2.jpg?v=1767483601&width=3000'}],customerCharge:49.20,postage:46.85,carrier:'FedEx',service:'International Economy',tracking:'FDX8842031951',package:'1.60 kg · 35 × 24 × 14 cm',shippedAt:'Jul 30, 2026 · 9:25 AM',deliveredAt:'Aug 5, 2026 · 3:10 PM',status:'Delivered'}
  ];

  let stored = [];
  try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (_) {}
  const byId = new Map([...seeded, ...stored].map((r) => [r.id, r]));
  let records = [...byId.values()];

  const header = queue.querySelector('.panel-head');
  const tabs = document.createElement('div');
  tabs.className = 'ops-rail-tabs';
  tabs.innerHTML = '<button class="ops-rail-tab is-active" type="button" data-rail="queue">Queue</button><button class="ops-rail-tab" type="button" data-rail="archive">Archive <span id="archiveCount">0</span></button>';
  header?.after(tabs);

  const queuePane = document.createElement('div');
  queuePane.className = 'queue-pane';
  [...queue.children].filter((n) => n !== header && n !== tabs).forEach((n) => queuePane.appendChild(n));
  queue.appendChild(queuePane);

  const archivePane = document.createElement('div');
  archivePane.id = 'archivePane';
  archivePane.className = 'archive-pane hidden';
  archivePane.innerHTML = '<div class="archive-toolbar"><input id="archiveSearch" class="archive-search" type="search" placeholder="Search order, customer, tracking…"><div class="archive-retention">Fulfillment history retained for up to 3 years in production.</div></div><div id="archiveList" class="archive-list"></div>';
  queue.appendChild(archivePane);

  const workspace = document.querySelector('#ops .ops-layout > .stack, #ops .ops-layout .stack');
  const detail = document.createElement('section');
  detail.id = 'archiveDetail';
  detail.className = 'archive-detail hidden';
  workspace?.appendChild(detail);

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records.filter((r) => !seeded.some((s) => s.id === r.id)))); } catch (_) {}
  }

  function renderList(filter = '') {
    const q = filter.trim().toLowerCase();
    const filtered = records.filter((r) => [r.id,r.customer,r.destination,r.tracking,r.carrier,r.service].join(' ').toLowerCase().includes(q));
    document.getElementById('archiveCount').textContent = String(records.length);
    document.getElementById('archiveList').innerHTML = filtered.length ? filtered.map((r) => `<button class="archive-card" type="button" data-archive-id="${r.id}"><div class="archive-card__top"><strong>${r.id}</strong><span class="archive-status">${r.status || 'Shipped'}</span></div><span>${r.customer}</span><small>${r.carrier} · ${r.service}</small><div class="archive-card__bottom"><small>${r.destination}</small><small>${r.shippedAt}</small></div></button>`).join('') : '<div class="archive-empty">No archived shipments match this search.</div>';
    document.querySelectorAll('.archive-card').forEach((card) => card.addEventListener('click', () => openRecord(card.dataset.archiveId, card)));
  }

  function openRecord(id, card) {
    const r = records.find((x) => x.id === id); if (!r) return;
    document.querySelectorAll('.archive-card').forEach((x) => x.classList.remove('is-selected')); card?.classList.add('is-selected');
    document.getElementById('opsOrder')?.classList.add('hidden');
    document.getElementById('opsPlaceholder')?.classList.add('hidden');
    detail.classList.remove('hidden');
    const margin = r.customerCharge - r.postage;
    detail.innerHTML = `<section class="panel"><div class="archive-detail__head"><div><span class="eyebrow">Archived fulfillment · ${r.id}</span><h2>${r.customer}</h2><p>${r.destination}</p></div><span class="archive-readonly">Read only</span></div><div class="archive-audit-grid"><div><span>Customer paid</span><strong>${money(r.customerCharge)}</strong></div><div><span>Actual postage</span><strong>${money(r.postage)}</strong></div><div><span>Shipping margin</span><strong class="${margin>=0?'archive-margin-positive':'archive-margin-negative'}">${margin>=0?'+':'-'}${money(Math.abs(margin))}</strong></div><div><span>Status</span><strong>${r.status}</strong></div></div></section><section class="panel archive-detail-section"><h3>Items shipped</h3><div class="archive-products">${r.items.map((p)=>`<div class="archive-product"><img src="${p.image||''}" alt=""><div><strong>${p.name}</strong><span>${p.brand||'ODTO inventory'}</span></div><b>${money(p.value)}</b></div>`).join('')}</div></section><section class="panel archive-detail-section"><h3>Shipment record</h3><div class="archive-shipment-grid"><div><span>Carrier</span><strong>${r.carrier}</strong></div><div><span>Service</span><strong>${r.service}</strong></div><div><span>Tracking</span><strong>${r.tracking}</strong></div><div><span>Package</span><strong>${r.package}</strong></div><div><span>Shipped</span><strong>${r.shippedAt}</strong></div><div><span>Delivered</span><strong>${r.deliveredAt||'Pending'}</strong></div></div><div class="archive-address">${r.address}</div></section><section class="panel archive-detail-section"><h3>Audit timeline</h3><div class="archive-timeline"><div class="archive-event"><span>Fulfillment</span><div><strong>Order verified and packed</strong><p>Package measurements and declared value saved before label purchase.</p></div></div><div class="archive-event"><span>Carrier</span><div><strong>${r.carrier} · ${r.service}</strong><p>Label purchased for ${money(r.postage)}. Tracking ${r.tracking} assigned.</p></div></div><div class="archive-event"><span>Dispatch</span><div><strong>Shipment handed to carrier</strong><p>${r.shippedAt}</p></div></div><div class="archive-event"><span>Final status</span><div><strong>${r.status}</strong><p>${r.deliveredAt||'Carrier tracking still active.'}</p></div></div></div><div class="archive-storage-note">Production recommendation: store immutable shipment snapshots server-side for 3 years, including item IDs, destination snapshot, package dimensions, carrier quote selected, label/tracking identifiers, timestamps, and the operator who performed each action.</div></section>`;
  }

  function switchRail(mode) {
    tabs.querySelectorAll('.ops-rail-tab').forEach((b) => b.classList.toggle('is-active', b.dataset.rail === mode));
    queuePane.classList.toggle('hidden', mode !== 'queue');
    archivePane.classList.toggle('hidden', mode !== 'archive');
    if (mode === 'queue') {
      detail.classList.add('hidden');
      const hasSelected = document.querySelector('.queue-order.is-selected:not(.is-archived)');
      if (hasSelected) document.getElementById('opsOrder')?.classList.remove('hidden');
      else document.getElementById('opsPlaceholder')?.classList.remove('hidden');
    } else {
      document.getElementById('opsOrder')?.classList.add('hidden');
      document.getElementById('opsPlaceholder')?.classList.add('hidden');
      if (!detail.innerHTML) detail.innerHTML = '<section class="panel empty"><strong>Select an archived shipment</strong><p>Open any previous shipment to review exactly what was sent, how it was shipped, and what it cost.</p></section>';
      detail.classList.remove('hidden');
    }
  }

  tabs.querySelectorAll('.ops-rail-tab').forEach((b) => b.addEventListener('click', () => switchRail(b.dataset.rail)));
  document.getElementById('archiveSearch').addEventListener('input', (e) => renderList(e.target.value));

  function captureSelectedShipment(card) {
    if (!card || card.dataset.archived === '1') return;
    const id = card.querySelector('strong')?.textContent?.trim();
    if (!id || records.some((r) => r.id === id)) { card.dataset.archived='1'; card.classList.add('is-archived'); return; }
    const customer = card.querySelector(':scope > span')?.textContent?.trim() || document.getElementById('opsName')?.textContent || 'Customer';
    const destination = card.querySelector('.queue-order__bottom small')?.textContent?.trim() || document.getElementById('opsDestination')?.textContent || 'Destination';
    const items = [...document.querySelectorAll('#opsItems .ops-item')].map((row) => ({name:row.querySelector('strong')?.textContent?.trim()||'ODTO item',brand:row.querySelector('span')?.textContent?.trim()||'ODTO',value:parseMoney(row.querySelector(':scope > strong:last-child')?.textContent),image:row.querySelector('img')?.src||''}));
    const postage = parseMoney(document.getElementById('labelPostage')?.textContent);
    const charge = parseMoney(document.getElementById('opsRequestedPrice')?.textContent);
    const tracking = document.getElementById('opsTracking')?.textContent?.trim() || 'Pending';
    const carrier = document.getElementById('labelCarrier')?.textContent?.trim() || 'Carrier';
    const service = document.getElementById('labelService')?.textContent?.trim() || 'Service';
    const pkg = `${document.getElementById('actualWeight')?.value || '—'} kg · ${document.getElementById('length')?.value || '—'} × ${document.getElementById('width')?.value || '—'} × ${document.getElementById('height')?.value || '—'} cm`;
    const now = new Date().toLocaleString('en-CA',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
    records.unshift({id,customer,destination,address:document.getElementById('opsDestination')?.textContent||destination,items,customerCharge:charge,postage,carrier,service,tracking,package:pkg,shippedAt:now,deliveredAt:null,status:'Shipped'});
    card.dataset.archived='1'; card.classList.add('is-archived'); persist(); renderList(document.getElementById('archiveSearch').value);
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll('.queue-order').forEach((card) => {
      const status = card.querySelector('.chip')?.textContent?.trim();
      if (status === 'Shipped' || status === 'Delivered') captureSelectedShipment(card);
    });
    const currentStatus = document.getElementById('opsStatus')?.textContent?.trim();
    const selectedArchived = document.querySelector('.queue-order.is-selected.is-archived');
    if (selectedArchived && currentStatus === 'Delivered') {
      const id = selectedArchived.querySelector('strong')?.textContent?.trim();
      const r = records.find((x) => x.id === id);
      if (r && r.status !== 'Delivered') { r.status='Delivered'; r.deliveredAt=new Date().toLocaleString('en-CA',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}); persist(); renderList(document.getElementById('archiveSearch').value); }
    }
  });
  observer.observe(document.getElementById('ops') || document.body,{subtree:true,childList:true,characterData:true});

  renderList();

  ['routing-policy.js', 'queue-filters.js', 'compliance.js'].forEach((src) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  });
})();