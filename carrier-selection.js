(() => {
  if (window.__fufiCarrierSelectionLoaded) return;
  window.__fufiCarrierSelectionLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    #opsRates .ops-rate {
      position: relative;
      padding-left: 52px !important;
      cursor: pointer;
      border: 1px solid #2f3035 !important;
      transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease !important;
    }
    #opsRates .ops-rate:hover {
      transform: translateY(-2px);
      border-color: #5a5c65 !important;
      background: #191a1e !important;
      box-shadow: 0 8px 22px rgba(0,0,0,.22);
    }
    #opsRates .ops-rate:focus-visible {
      outline: 2px solid #7cf7a3;
      outline-offset: 2px;
    }
    #opsRates .ops-rate.selected {
      border-color: #54e887 !important;
      background: rgba(67, 214, 118, .09) !important;
      box-shadow: 0 0 0 1px rgba(84,232,135,.22), 0 8px 24px rgba(0,0,0,.22);
    }
    #opsRates .ops-rate > div:first-child {
      min-width: 0;
      align-content: flex-start;
    }
    #opsRates .ops-rate > div:first-child > strong,
    #opsRates .ops-rate > div:first-child > small {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    #opsRates .ops-rate .tag {
      flex: 0 0 auto;
      white-space: nowrap;
    }
    .carrier-choice-indicator {
      position: absolute;
      left: 18px;
      top: 50%;
      width: 20px;
      height: 20px;
      transform: translateY(-50%);
      border-radius: 50%;
      border: 2px solid #5a5c63;
      background: #101114;
      display: grid;
      place-items: center;
      pointer-events: none;
      transition: border-color .16s ease, background .16s ease, box-shadow .16s ease;
    }
    .carrier-choice-indicator::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: transparent;
      transform: scale(.4);
      transition: background .16s ease, transform .16s ease;
    }
    #opsRates .ops-rate:hover .carrier-choice-indicator {
      border-color: #8a8d97;
    }
    #opsRates .ops-rate.selected .carrier-choice-indicator {
      border-color: #54e887;
      background: rgba(84,232,135,.12);
      box-shadow: 0 0 0 3px rgba(84,232,135,.08);
    }
    #opsRates .ops-rate.selected .carrier-choice-indicator::after {
      background: #54e887;
      transform: scale(1);
    }
    .carrier-selected-label {
      display: none;
      flex-basis: 100%;
      width: max-content;
      margin-top: 3px;
      padding: 3px 6px;
      border-radius: 999px;
      background: rgba(84,232,135,.10);
      border: 1px solid rgba(84,232,135,.28);
      color: #79ef9f;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: .06em;
      line-height: 1.2;
      text-transform: uppercase;
      white-space: nowrap;
    }
    #opsRates .ops-rate.selected .carrier-selected-label {
      display: inline-flex;
    }
    #opsRatesSection .ux-auto-note {
      margin-bottom: 12px;
      color: #9b9da5;
    }
    @media (max-width: 900px) {
      #opsRates .ops-rate {
        grid-template-columns: minmax(0,1.4fr) minmax(100px,.8fr) minmax(140px,1fr) auto;
        gap: 12px;
      }
    }
    @media (max-width: 720px) {
      #opsRates .ops-rate {
        padding-left: 46px !important;
        grid-template-columns: 1fr;
        gap: 9px;
      }
      .carrier-choice-indicator { left: 14px; }
      #opsRates .ops-price-stack {
        align-items: flex-start;
      }
    }
  `;
  document.head.appendChild(style);

  const rates = document.getElementById('opsRates');
  const section = document.getElementById('opsRatesSection');
  if (!rates) return;

  const note = section?.querySelector('.ux-auto-note');
  if (note) note.textContent = 'Click a carrier to select it. Best Fit is preselected; change it only when there’s a reason.';

  function decorate() {
    rates.querySelectorAll('.ops-rate').forEach((button) => {
      if (!button.querySelector('.carrier-choice-indicator')) {
        const indicator = document.createElement('span');
        indicator.className = 'carrier-choice-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        button.appendChild(indicator);
      }

      const carrierInfo = button.querySelector(':scope > div:first-child');
      if (carrierInfo && !carrierInfo.querySelector('.carrier-selected-label')) {
        const selectedLabel = document.createElement('span');
        selectedLabel.className = 'carrier-selected-label';
        selectedLabel.textContent = 'Selected';
        selectedLabel.setAttribute('aria-hidden', 'true');
        carrierInfo.appendChild(selectedLabel);
      }

      button.setAttribute('aria-pressed', button.classList.contains('selected') ? 'true' : 'false');
    });
  }

  function syncSelection() {
    rates.querySelectorAll('.ops-rate').forEach((button) => {
      button.setAttribute('aria-pressed', button.classList.contains('selected') ? 'true' : 'false');
    });
  }

  rates.addEventListener('click', (event) => {
    if (!event.target.closest('.ops-rate')) return;
    requestAnimationFrame(syncSelection);
  });

  const observer = new MutationObserver(() => requestAnimationFrame(() => {
    decorate();
    syncSelection();
  }));
  observer.observe(rates, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  decorate();
  syncSelection();
})();
