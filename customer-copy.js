(() => {
  if (window.__fufiCustomerCopyLoaded) return;
  window.__fufiCustomerCopyLoaded = true;

  const panel = document.getElementById('trackingPanel');
  if (!panel) return;

  function syncCustomerCopy() {
    const status = document.getElementById('customerStatus')?.textContent?.trim();
    const title = document.getElementById('trackingTitle');
    const subtitle = document.getElementById('trackingSubtitle');

    if (status === 'Packing') {
      if (title) title.textContent = 'Our team is packing your order.';
      if (subtitle) {
        subtitle.textContent = '';
        subtitle.hidden = true;
      }
    } else if (subtitle) {
      subtitle.hidden = false;
      if (/Toronto fulfillment hub|Toronto fulfillment team|Toronto team/i.test(subtitle.textContent || '')) {
        subtitle.textContent = status === 'Shipped'
          ? 'The parcel has been handed to the carrier.'
          : (subtitle.textContent || '').replace(/our Toronto fulfillment team/gi, 'our fulfillment team').replace(/the Toronto team/gi, 'our team').replace(/our Toronto fulfillment hub/gi, 'our fulfillment hub');
      }
    }

    panel.querySelectorAll('.event').forEach((event) => {
      const text = event.textContent || '';
      if (/Fulfillment started in Toronto/i.test(text)) {
        [...event.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && /Fulfillment started in Toronto/i.test(node.nodeValue || '')) node.nodeValue = (node.nodeValue || '').replace(/Fulfillment started in Toronto\.?/i, 'Packing started.');
        });
        event.querySelectorAll('*').forEach((node) => {
          if (/Fulfillment started in Toronto/i.test(node.textContent || '') && node.children.length === 0) node.textContent = 'Packing started.';
        });
      }
    });

    const info = document.querySelector('#customer .side-card.info p');
    if (info && /Toronto/i.test(info.textContent || '')) info.textContent = 'Shipping is paid. Your fulfillment request is now being processed.';
  }

  new MutationObserver(syncCustomerCopy).observe(panel, { subtree: true, childList: true, characterData: true });
  const infoCard = document.querySelector('#customer .side-card.info');
  if (infoCard) new MutationObserver(syncCustomerCopy).observe(infoCard, { subtree: true, childList: true, characterData: true });
  syncCustomerCopy();
})();
