(() => {
  if (window.__fufiUsdPolicyLoaded) return;
  window.__fufiUsdPolicyLoaded = true;

  const formatUSD = (value) => `$${Number(value || 0).toFixed(2)}`;
  window.money = formatUSD;
  window.signedMoney = (value) => `${Number(value) < 0 ? '-' : '+'}$${Math.abs(Number(value || 0)).toFixed(2)}`;
  window.FUFI_BASE_CURRENCY = 'USD';

  function replaceText(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const value = node.nodeValue;
      if (!value) return;
      const next = value
        .replace(/C\$/g, '$')
        .replace(/\bCAD\b/g, 'USD');
      if (next !== value) node.nodeValue = next;
    });
  }

  function refreshKnownAmounts() {
    const cash = document.getElementById('cashBalance');
    try {
      if (cash && typeof state !== 'undefined') cash.textContent = formatUSD(state.cashBalance);
    } catch (_) {}

    const charge = document.getElementById('uxShippingPrice');
    try {
      if (charge && typeof state !== 'undefined' && state.customerCharge) charge.textContent = formatUSD(state.customerCharge);
    } catch (_) {}

    const declared = document.getElementById('declaredValue')?.closest('label');
    if (declared) {
      const text = [...declared.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
      if (text && /CAD|Customs \/ insurance value/i.test(text.nodeValue || '')) {
        text.nodeValue = 'Customs / insurance value (USD)';
      }
    }
  }

  const sync = () => {
    replaceText(document.body);
    refreshKnownAmounts();
    document.documentElement.dataset.currency = 'USD';
  };

  sync();
  const observer = new MutationObserver(() => requestAnimationFrame(sync));
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
})();
