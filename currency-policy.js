(() => {
  if (window.__fufiUsdPolicyLoaded) return;
  window.__fufiUsdPolicyLoaded = true;

  const formatUSD = (value) => `$${Number(value || 0).toFixed(2)}`;
  window.money = formatUSD;
  window.signedMoney = (value) => `${Number(value) < 0 ? '-' : '+'}$${Math.abs(Number(value || 0)).toFixed(2)}`;
  window.FUFI_BASE_CURRENCY = 'USD';

  function convertTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const value = node.nodeValue;
    if (!value || (!value.includes('C$') && !/\bCAD\b/.test(value))) return;
    const next = value.replace(/C\$/g, '$').replace(/\bCAD\b/g, 'USD');
    if (next !== value) node.nodeValue = next;
  }

  function convertTree(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      convertTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root !== document.body) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) convertTextNode(walker.currentNode);
  }

  function setTextIfChanged(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function refreshKnownAmounts() {
    try {
      const cash = document.getElementById('cashBalance');
      if (cash && typeof state !== 'undefined') setTextIfChanged(cash, formatUSD(state.cashBalance));

      const charge = document.getElementById('uxShippingPrice');
      if (charge && typeof state !== 'undefined' && state.customerCharge != null) {
        setTextIfChanged(charge, formatUSD(state.customerCharge));
      }
    } catch (_) {}

    const declared = document.getElementById('declaredValue')?.closest('label');
    if (declared) {
      const text = [...declared.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
      if (text && text.nodeValue !== 'Customs / insurance value (USD)') {
        text.nodeValue = 'Customs / insurance value (USD)';
      }
    }
  }

  convertTree(document.body);
  refreshKnownAmounts();
  document.documentElement.dataset.currency = 'USD';

  let scheduled = false;
  const observer = new MutationObserver((mutations) => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      observer.disconnect();
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') convertTextNode(mutation.target);
        mutation.addedNodes?.forEach(convertTree);
      });
      refreshKnownAmounts();
      observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    });
  });

  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
})();