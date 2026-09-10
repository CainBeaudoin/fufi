(() => {
  const fmt = (v) => `C$${Number(v).toFixed(2)}`;
  const fastest = (rate) => Number((String(rate.days).match(/\d+/) || [99])[0]);

  function recommendedRate(rates) {
    const paid = Number(state.customerCharge || 0);
    const within = rates.filter((r) => r.price <= paid);
    const pool = within.length ? within : rates;
    return [...pool].sort((a, b) => {
      const gap = a.price - b.price;
      return Math.abs(gap) <= 1.5 ? fastest(a) - fastest(b) : gap;
    })[0];
  }

  window.renderOpsRates = function (rates) {
    const paid = Number(state.customerCharge || 0);
    const best = recommendedRate(rates);
    const bestDelta = paid - best.price;

    $('opsRates').innerHTML = `
      <div class="ops-rate-summary">
        <div><span>Customer paid</span><strong>${fmt(paid)}</strong></div>
        <div><span>Best fit</span><strong>${best.carrier} · ${best.service}</strong></div>
        <div><span>Difference</span><strong class="${bestDelta >= 0 ? 'positive' : ''}">${bestDelta >= 0 ? '+' : '-'}${fmt(Math.abs(bestDelta))}</strong></div>
      </div>
      ${rates.map((rate) => {
        const delta = paid - rate.price;
        const good = delta >= 0;
        const bestFit = rate.id === best.id;
        return `<button class="rate ops-rate ${good ? 'rate-profitable' : 'rate-over-budget'} ${bestFit ? 'rate-recommended' : ''}" data-rate="${rate.id}">
          <div><strong>${rate.carrier}</strong>${bestFit ? '<span class="tag">Recommended</span>' : ''}<small>${rate.service}</small></div>
          <small>${rate.days}</small>
          <small>${good ? 'Within customer payment' : 'Costs more than customer paid'}</small>
          <div class="ops-price-stack"><b>${fmt(rate.price)}</b><span class="customer-paid-line">Customer paid ${fmt(paid)}</span><span class="margin-pill">${good ? `+${fmt(delta)} margin` : `${fmt(Math.abs(delta))} over`}</span></div>
        </button>`;
      }).join('')}
      <p class="ops-rate-note">Recommendation is guidance only. Fulfillment can still choose any carrier.</p>`;

    document.querySelectorAll('.ops-rate').forEach((btn) => btn.addEventListener('click', () => {
      document.querySelectorAll('.ops-rate').forEach((x) => x.classList.remove('selected'));
      btn.classList.add('selected');
      state.opsRate = rates.find((r) => r.id === btn.dataset.rate);
      prepareLabel();
      updateMarginColor();
    }));
  };

  function updateMarginColor() {
    const node = $('labelMargin');
    if (!node || !state.opsRate) return;
    const delta = Number(state.customerCharge || 0) - Number(state.opsRate.price || 0);
    node.classList.toggle('margin-positive', delta >= 0);
    node.classList.toggle('margin-negative', delta < 0);
  }
})();