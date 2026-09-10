(() => {
  if (window.__fufiLabelUiLoaded) return;
  window.__fufiLabelUiLoaded = true;

  const section = document.getElementById('labelSection');
  if (!section) return;

  const preview = section.querySelector('.label-preview');
  const grid = section.querySelector('.label-grid');
  const costs = section.querySelector('.costs');
  const carrier = document.getElementById('labelCarrier');
  const service = document.getElementById('labelService');
  if (!grid || !costs) return;

  const style = document.createElement('style');
  style.textContent = `
    #labelSection .label-preview { display:none !important; }
    #labelSection .label-grid { grid-template-columns:1fr !important; gap:14px !important; }
    #labelSection .label-service-summary {
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:10px;
      margin-bottom:2px;
    }
    #labelSection .label-service-summary > div {
      min-width:0;
      background:#0c0e12;
      border:1px solid #252a32;
      border-radius:10px;
      padding:13px 14px;
      display:flex;
      flex-direction:column;
      gap:5px;
    }
    #labelSection .label-service-summary span {
      font-size:10px;
      color:#767e8a;
      text-transform:uppercase;
      letter-spacing:.08em;
      font-weight:700;
    }
    #labelSection .label-service-summary strong {
      min-width:0;
      font-size:13px;
      line-height:1.35;
      overflow-wrap:anywhere;
    }
    #labelSection .costs {
      display:grid !important;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:10px !important;
    }
    #labelSection .costs > div {
      min-width:0;
      background:#0c0e12;
      border:1px solid #252a32 !important;
      border-radius:10px;
      padding:13px 14px !important;
      display:flex !important;
      flex-direction:column !important;
      align-items:flex-start !important;
      gap:5px !important;
    }
    #labelSection .costs > div span {
      font-size:10px;
      text-transform:uppercase;
      letter-spacing:.07em;
    }
    #labelSection .costs > div strong {
      font-size:14px;
      text-align:left;
      overflow-wrap:anywhere;
    }
    #labelSection .costs .primary,
    #labelSection .costs .secondary {
      grid-column:1/-1;
      width:100%;
    }
    #labelSection .label-step-note {
      margin:0 0 12px;
      color:#737b87;
      font-size:11px;
      line-height:1.5;
    }
    @media (max-width:860px) {
      #labelSection .costs { grid-template-columns:1fr 1fr; }
    }
    @media (max-width:560px) {
      #labelSection .label-service-summary,
      #labelSection .costs { grid-template-columns:1fr; }
    }
  `;
  document.head.appendChild(style);

  if (preview) preview.setAttribute('aria-hidden', 'true');

  const heading = section.querySelector('.panel-head h2');
  if (heading) heading.textContent = 'Buy label';

  if (!section.querySelector('.label-step-note')) {
    const note = document.createElement('p');
    note.className = 'label-step-note';
    note.textContent = 'Confirm the selected service and postage, then purchase the label. Tracking appears in the next step after purchase.';
    section.querySelector('.panel-head')?.after(note);
  }

  const summary = document.createElement('div');
  summary.className = 'label-service-summary';
  summary.innerHTML = `
    <div><span>Carrier</span><strong class="label-carrier-summary">Select a carrier</strong></div>
    <div><span>Service</span><strong class="label-service-name-summary">—</strong></div>`;
  grid.insertBefore(summary, costs);

  const carrierSummary = summary.querySelector('.label-carrier-summary');
  const serviceSummary = summary.querySelector('.label-service-name-summary');

  function sync() {
    const carrierValue = carrier?.textContent?.trim() || '—';
    const serviceValue = service?.textContent?.trim() || '—';
    carrierSummary.textContent = /^(carrier|—)$/i.test(carrierValue) ? 'Select a carrier' : carrierValue;
    serviceSummary.textContent = /^(service|—)$/i.test(serviceValue) ? '—' : serviceValue;
  }

  [carrier, service].filter(Boolean).forEach((node) => {
    new MutationObserver(sync).observe(node, { childList:true, characterData:true, subtree:true });
  });
  sync();
})();