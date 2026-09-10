(() => {
  if (window.__fufiFixedShellLoaded) return;
  window.__fufiFixedShellLoaded = true;

  let previousPageScroll = 0;
  let opsActive = false;

  function isOpsActive() {
    return document.getElementById('ops')?.classList.contains('active');
  }

  function syncShell() {
    const nextOpsActive = !!isOpsActive();

    if (nextOpsActive && !opsActive) {
      previousPageScroll = window.scrollY || 0;
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    document.body.classList.toggle('ops-shell-active', nextOpsActive);
    document.documentElement.classList.toggle('ops-shell-active', nextOpsActive);

    if (!nextOpsActive && opsActive) {
      requestAnimationFrame(() => window.scrollTo({ top: previousPageScroll, left: 0, behavior: 'auto' }));
    }

    opsActive = nextOpsActive;
  }

  document.querySelectorAll('.view').forEach((view) => {
    new MutationObserver(syncShell).observe(view, { attributes: true, attributeFilter: ['class'] });
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('.tab')) requestAnimationFrame(syncShell);
  });

  window.addEventListener('pageshow', syncShell);
  syncShell();
})();
