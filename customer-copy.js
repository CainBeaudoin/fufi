(() => {
  if (window.__fufiCustomerCopyLoaded) return;
  window.__fufiCustomerCopyLoaded = true;

  const panel = document.getElementById('trackingPanel');
  if (!panel) return;

  const setText = (node, value) => {
    if (node && node.textContent !== value) node.textContent = value;
  };
  const setHidden = (node, hidden) => {
    if (node && node.hidden !== hidden) node.hidden = hidden;
  };

  function syncCustomerCopy() {
    const status = document.getElementById('customerStatus')?.textContent?.trim();
    const title = document.getElementById('trackingTitle');
    const subtitle = document.getElementById('trackingSubtitle');

    if (status === 'Packing') {
      setText(title, 'Our team is packing your order.');
      setText(subtitle, '');
      setHidden(subtitle, true);
    } else if (subtitle) {
      setHidden(subtitle, false);
      const current = subtitle.textContent || '';
      if (/Toronto fulfillment hub|Toronto fulfillment team|Toronto team/i.test(current)) {
        const next = status === 'Shipped'
          ? 'The parcel has been handed to the carrier.'
          : current
              .replace(/our Toronto fulfillment team/gi, 'our fulfillment team')
              .replace(/the Toronto team/gi, 'our team')
              .replace(/our Toronto fulfillment hub/gi, 'our fulfillment hub');
        setText(subtitle, next);
      }
    }

    panel.querySelectorAll('.event').forEach((event) => {
      event.querySelectorAll('*').forEach((node) => {
        if (node.children.length === 0 && /Fulfillment started in Toronto/i.test(node.textContent || '')) {
          setText(node, 'Packing started.');
        }
      });
    });

    const info = document.querySelector('#customer .side-card.info p');
    if (info && /Toronto/i.test(info.textContent || '')) {
      setText(info, 'Shipping is paid. Your fulfillment request is now being processed.');
    }
  }

  let scheduled = false;
  const scheduleSync = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncCustomerCopy();
    });
  };

  new MutationObserver(scheduleSync).observe(panel, { subtree: true, childList: true, characterData: true });
  const infoCard = document.querySelector('#customer .side-card.info');
  if (infoCard) new MutationObserver(scheduleSync).observe(infoCard, { subtree: true, childList: true, characterData: true });
  syncCustomerCopy();
})();
