(() => {
  if (window.__fufiTrackingUiLoaded) return;
  window.__fufiTrackingUiLoaded = true;

  const panel = document.getElementById('trackingPanel');
  const trackingNumber = document.getElementById('trackingNumber');
  if (!panel || !trackingNumber) return;

  const style = document.createElement('style');
  style.textContent = `
    #trackingPanel .panel-head {
      align-items: center;
      gap: 40px;
      margin-bottom: 26px;
    }
    #trackingPanel .panel-head > div {
      min-width: 0;
    }
    #trackingPanel #customerStatus {
      flex: 0 0 auto;
      margin-left: auto;
      padding: 7px 11px;
    }
    #trackingPanel .tracking-hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(250px, auto);
      gap: 42px;
      align-items: center;
      padding: 24px;
    }
    #trackingPanel .tracking-hero > div:first-child {
      min-width: 0;
      padding-right: 8px;
    }
    #trackingPanel .tracking-number-card {
      min-width: 250px;
      padding: 16px 18px;
      border: 1px solid #2b3039;
      background: #101217;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    #trackingPanel .tracking-number-card > span {
      display: block;
      margin: 0;
    }
    #trackingPanel .tracking-number-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      min-width: 0;
    }
    #trackingPanel .tracking-number-row strong {
      min-width: 0;
      overflow-wrap: anywhere;
      font-size: 15px;
      letter-spacing: .025em;
    }
    #trackingPanel .tracking-copy {
      flex: 0 0 auto;
      border: 1px solid #373d48;
      background: #191c22;
      color: #f2f4f6;
      border-radius: 8px;
      padding: 8px 11px;
      font: inherit;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: background .15s ease, border-color .15s ease, transform .15s ease;
    }
    #trackingPanel .tracking-copy:hover {
      background: #23272f;
      border-color: #59616e;
      transform: translateY(-1px);
    }
    #trackingPanel .tracking-copy:focus-visible {
      outline: 2px solid #7cf7a3;
      outline-offset: 2px;
    }
    #trackingPanel .tracking-copy.is-copied {
      color: #72e896;
      border-color: #3c8c58;
      background: rgba(67, 214, 118, .08);
    }
    #trackingPanel .tracking-copy[hidden] {
      display: none;
    }
    @media (max-width: 720px) {
      #trackingPanel .panel-head {
        gap: 18px;
      }
      #trackingPanel .tracking-hero {
        grid-template-columns: 1fr;
        gap: 22px;
      }
      #trackingPanel .tracking-number-card {
        min-width: 0;
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  const hero = panel.querySelector('.tracking-hero');
  const numberCard = trackingNumber.parentElement;
  if (!hero || !numberCard) return;

  numberCard.classList.add('tracking-number-card');

  const row = document.createElement('div');
  row.className = 'tracking-number-row';
  trackingNumber.parentNode.insertBefore(row, trackingNumber);
  row.appendChild(trackingNumber);

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'tracking-copy';
  copyButton.textContent = 'Copy';
  copyButton.hidden = true;
  row.appendChild(copyButton);

  const hasRealTracking = () => {
    const value = trackingNumber.textContent.trim();
    return value && !/^(pending|—|tracking pending)$/i.test(value);
  };

  const sync = () => {
    copyButton.hidden = !hasRealTracking();
    copyButton.setAttribute('aria-label', hasRealTracking() ? `Copy tracking number ${trackingNumber.textContent.trim()}` : 'Tracking number not available yet');
  };

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  copyButton.addEventListener('click', async () => {
    if (!hasRealTracking()) return;
    try {
      await copyText(trackingNumber.textContent.trim());
      copyButton.textContent = 'Copied';
      copyButton.classList.add('is-copied');
      setTimeout(() => {
        copyButton.textContent = 'Copy';
        copyButton.classList.remove('is-copied');
      }, 1200);
    } catch (_) {
      copyButton.textContent = 'Copy failed';
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 1200);
    }
  });

  new MutationObserver(sync).observe(trackingNumber, { childList: true, characterData: true, subtree: true });
  sync();
})();
