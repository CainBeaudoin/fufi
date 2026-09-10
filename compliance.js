(() => {
  if (window.__fufiComplianceLoaded) return;
  window.__fufiComplianceLoaded = true;

  const $ = (id) => document.getElementById(id);
  const money = (value) => `C$${Number(value || 0).toFixed(2)}`;
  const parseMoney = (value) => Number(String(value || '').replace(/[^0-9.-]/g, '')) || 0;

  // Keep customer selection focused on fulfillment, not merchandise pricing.
  const hideCustomerValues = () => {
    document.querySelectorAll('#customer .odto-product-card > b').forEach((node) => node.style.display = 'none');
    const packageValue = $('packageValue')?.parentElement;
    if (packageValue) packageValue.style.display = 'none';
  };
  hideCustomerValues();

  const packingSection = $('packingSection');
  const packingForm = packingSection?.querySelector('.form-grid');
  if (!packingSection || !packingForm || document.getElementById('compliancePanel')) return;

  // Make the existing value field explicit about what it is used for.
  const declaredInput = $('declaredValue');
  const declaredLabel = declaredInput?.closest('label');
  if (declaredLabel) {
    const text = [...declaredLabel.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    if (text) text.nodeValue = 'Customs / insurance value (CAD)';
  }

  const panel = document.createElement('section');
  panel.id = 'compliancePanel';
  panel.className = 'compliance-panel';
  panel.innerHTML = `
    <div class="compliance-panel__head">
      <div>
        <span class="eyebrow">Customs & insurance</span>
        <h3>Declare accurately, then optimize legally.</h3>
        <p>Values are operational/compliance data. The customer does not need to see them in the vault-selection flow.</p>
      </div>
      <span id="complianceBadge" class="compliance-badge">Checking</span>
    </div>
    <div class="compliance-grid">
      <div class="compliance-metric"><span>Shipment type</span><strong id="complianceShipmentType">—</strong></div>
      <div class="compliance-metric"><span>Customs value</span><strong id="complianceDeclaredValue">—</strong></div>
      <div class="compliance-metric"><span>Insurance basis</span><strong id="complianceInsuranceBasis">—</strong></div>
      <div class="compliance-metric"><span>Coverage guidance</span><strong id="complianceCoverage">—</strong></div>
    </div>
    <div id="complianceItems" class="compliance-items"></div>
    <div class="compliance-insurance-table">
      <div><span>Canada / U.S. via Chit Chats</span><strong>Up to US$800 on eligible tracked services</strong></div>
      <div><span>International via Chit Chats</span><strong>Up to US$300 on eligible tracked services</strong></div>
      <div><span>Canada Post</span><strong>Typically C$100 included; extra coverage up to C$1,000 on eligible services</strong></div>
    </div>
    <p id="complianceCustomsNote" class="compliance-note compliance-note--legal"></p>
    <p id="complianceInsuranceNote" class="compliance-note"></p>
  `;
  packingForm.after(panel);

  function destinationInfo() {
    const text = ($('opsDestination')?.textContent || '').toLowerCase();
    if (text.includes('united states') || text.includes(', usa') || text.includes('brooklyn') || text.includes('chicago')) return { code: 'US', label: 'United States' };
    if (text.includes('united arab emirates') || text.includes('dubai')) return { code: 'AE', label: 'United Arab Emirates' };
    if (text.includes('united kingdom') || text.includes('london')) return { code: 'GB', label: 'United Kingdom' };
    if (text.includes('japan') || text.includes('tokyo')) return { code: 'JP', label: 'Japan' };
    if (text.includes('canada') || text.includes('toronto') || text.includes('vancouver') || text.includes('montreal')) return { code: 'CA', label: 'Canada' };
    return { code: 'INTL', label: 'International' };
  }

  function itemRows() {
    return [...document.querySelectorAll('#opsItems .ops-item')].map((row) => {
      const name = row.querySelector('strong')?.textContent?.trim() || 'Shipment item';
      const valueText = row.querySelector(':scope > strong:last-child')?.textContent || '';
      return { name, value: parseMoney(valueText) };
    });
  }

  function selectedCarrier() {
    return {
      carrier: $('labelCarrier')?.textContent?.trim() || 'Not selected',
      service: $('labelService')?.textContent?.trim() || 'Not selected',
      postage: parseMoney($('labelPostage')?.textContent)
    };
  }

  function render() {
    hideCustomerValues();
    const destination = destinationInfo();
    const declared = Math.max(0, Number(declaredInput?.value) || 0);
    const carrier = selectedCarrier();
    const postage = carrier.postage;
    const insuranceBasis = declared + postage;
    const exportShipment = destination.code !== 'CA';
    const usShipment = destination.code === 'US';
    const chitChats = /chit chats/i.test(carrier.carrier);
    const canadaPost = /canada post/i.test(carrier.carrier);

    $('complianceShipmentType').textContent = exportShipment ? `Export · ${destination.label}` : 'Domestic Canada';
    $('complianceDeclaredValue').textContent = declared ? money(declared) : 'Enter value';
    $('complianceInsuranceBasis').textContent = declared ? `${money(insuranceBasis)}${postage ? ' incl. selected postage' : ' + final postage'}` : 'Waiting for value';

    let coverage = 'Select a carrier to confirm coverage';
    if (chitChats) coverage = exportShipment && !usShipment ? 'Chit Chats cap: US$300' : 'Chit Chats cap: US$800';
    if (canadaPost) coverage = 'Canada Post: C$100 included; up to C$1,000 extra on eligible services';
    if (!chitChats && !canadaPost && carrier.carrier !== 'Not selected') coverage = `${carrier.carrier}: use live carrier coverage response`;
    $('complianceCoverage').textContent = coverage;

    const items = itemRows();
    $('complianceItems').innerHTML = items.length ? items.map((item) => `
      <div class="compliance-item">
        <strong>${item.name}</strong>
        <span>${exportShipment ? (usShipment ? 'HTS code required' : 'HS code required') : 'No customs code needed'}</span>
        <span>${exportShipment ? 'Country of origin required' : `Value basis ${money(item.value)}`}</span>
      </div>`).join('') : '<div class="compliance-item"><span>No order selected.</span></div>';

    if (!exportShipment) {
      $('complianceCustomsNote').innerHTML = '<strong>No customs declaration for domestic Canada.</strong> Keep the documented item value for insurance and claims support.';
      $('complianceBadge').textContent = 'Domestic';
    } else {
      $('complianceCustomsNote').innerHTML = `<strong>Customs declaration required.</strong> Use the documented sold/transaction value, excluding shipping and sales tax, plus an accurate ${usShipment ? 'HTS' : 'HS'} classification and country of origin. Legitimate duty savings come from the correct tariff code, documented discounts, and origin-based tariff treatment where applicable — not from lowering the declared value.`;
      $('complianceBadge').textContent = usShipment ? 'DDP / customs' : 'Customs required';
    }

    if (chitChats) {
      $('complianceInsuranceNote').innerHTML = `<strong>Chit Chats insurance:</strong> insurable value is declared retail value plus postage/associated fees. The actual premium is determined in USD bands at postage purchase, so production should use the carrier response/live FX rather than a hardcoded conversion. ${exportShipment && !usShipment ? 'International tracked coverage is capped at US$300, so higher-value shipments may need another insured service.' : 'Eligible tracked Canada/U.S. coverage can extend up to US$800.'}`;
    } else if (canadaPost) {
      $('complianceInsuranceNote').innerHTML = '<strong>Canada Post coverage:</strong> up to C$100 is included on eligible parcel services, with additional liability coverage up to C$1,000 on certain services. Coverage must be purchased and declared when the label is created.';
    } else {
      $('complianceInsuranceNote').innerHTML = '<strong>Insurance should be mandatory for vaulted inventory.</strong> Once a carrier is selected, request that carrier’s included coverage, extra-coverage limit, premium, exclusions and signature options before label purchase. If full replacement value is not insurable on that service, flag the shipment for a different carrier or supplemental insurance.';
    }
  }

  declaredInput?.addEventListener('input', render);
  ['labelCarrier', 'labelService', 'labelPostage', 'opsDestination', 'opsItems'].forEach((id) => {
    const node = $(id);
    if (!node) return;
    new MutationObserver(render).observe(node, { subtree: true, childList: true, characterData: true });
  });

  // Customer cards can be rerendered by the ODTO inventory enhancement.
  const customerItems = document.querySelector('#customer .items');
  if (customerItems) new MutationObserver(hideCustomerValues).observe(customerItems, { subtree: true, childList: true });

  render();
})();
