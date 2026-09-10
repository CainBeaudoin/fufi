(() => {
  const existing = document.getElementById('sam');
  if (existing) return;

  const carrierData = [
    {
      name: 'Chit Chats', role: 'Default economy', cost: 'Lowest', efficiency: 'Excellent for value', api: 'Direct API',
      regions: 'Canada · United States · Selected international',
      detail: 'Best starting point for Toronto-origin ecommerce. Strongest value for Canada/U.S. parcels and useful international tracked options. U.S. shipments require DDP compliance.',
      speed: 'Canada ~2–10 days · U.S. ~3–8 days on core services · International ~5–22 days',
      implementation: 'Make this the first rate source. For U.S. parcels store 10-digit HTS, country of origin, and manufacturer data where required.',
      url: 'https://chitchats.com/pricing'
    },
    {
      name: 'Canada Post', role: 'Domestic fallback', cost: 'Low–Medium', efficiency: 'Excellent coverage', api: 'Direct API / aggregator',
      regions: 'Canada first · U.S. · International postal network',
      detail: 'Important for Canadian rural destinations, PO boxes and broad domestic coverage. Useful fallback when private couriers are expensive or cannot service an address.',
      speed: 'Service-dependent; domestic options range from economy to Xpresspost',
      implementation: 'Keep enabled for Canada even if Chit Chats is preferred. Service suspensions should be checked dynamically instead of hardcoded.',
      url: 'https://www.canadapost-postescanada.ca/cpc/en/business/shipping.page'
    },
    {
      name: 'Purolator', role: 'Canada specialist', cost: 'Medium', efficiency: 'Excellent in Canada', api: 'E-Ship Web Services',
      regions: 'Canada · United States · 210+ countries/territories',
      detail: 'Very strong Canadian operational option and useful for faster urban/domestic shipments. International coverage is available through its global network and partners.',
      speed: 'Strong time-definite domestic; international varies by lane',
      implementation: 'Rate-shop against Chit Chats and Canada Post for Canadian addresses. Prefer when transit time improvement is meaningful for a small price difference.',
      url: 'https://www.purolator.com/en/shipping/import-export/international-shipping-from-canada'
    },
    {
      name: 'UPS', role: 'U.S. + global courier', cost: 'Medium–High', efficiency: 'High', api: 'UPS APIs / aggregator',
      regions: 'Canada · United States · 220+ countries/territories',
      detail: 'Good option for U.S. ground, higher-value parcels and worldwide courier service. Strong operational alternative when Chit Chats is slower or the shipment needs a premium service.',
      speed: 'Worldwide Expedited commonly 2–5 business days; U.S. Standard commonly 2–8 days',
      implementation: 'Use live account rates. Treat demand, fuel, remote-area and brokerage fees as variable inputs, not constants.',
      url: 'https://www.ups.com/ca/en/shipping/international-shipping'
    },
    {
      name: 'FedEx', role: 'Express + international', cost: 'Medium–High', efficiency: 'High', api: 'FedEx APIs / aggregator',
      regions: 'Canada · United States · 220+ countries/territories',
      detail: 'Good premium alternative for international and North American parcels, especially when account-specific pricing or transit times beat UPS/DHL.',
      speed: 'Service-dependent; express products are designed for time-sensitive international delivery',
      implementation: 'Use account-specific rate and transit APIs. Current service alerts must be part of serviceability because international suspensions can change.',
      url: 'https://www.fedex.com/en-ca/shipping-services/international.html'
    },
    {
      name: 'DHL Express', role: 'Premium international', cost: 'Highest', efficiency: 'Best global speed', api: 'MyDHL API',
      regions: 'International / global express',
      detail: 'Best suited to urgent international shipments where speed and customs handling matter more than lowest cost. Usually not the economy default.',
      speed: 'Premium express; lane-specific transit',
      implementation: 'Use primarily for international express. Account for elevated-risk and restricted-destination surcharges and enhanced compliance screening.',
      url: 'https://www.dhl.com/ca-en/home/express/shipping-and-tracking/shipping.html'
    }
  ];

  const hardBlacklist = [
    { name: 'Russia', reason: 'FedEx and UPS international services remain suspended; high sanctions/compliance burden.' },
    { name: 'Belarus', reason: 'FedEx and UPS international services remain suspended; DHL Canada also shows shipment service unavailable.' },
    { name: 'North Korea', reason: 'No dependable ecommerce carrier path for this launch model; severe sanctions/compliance restrictions.' },
    { name: 'Iran', reason: 'FedEx service is suspended/not served and DHL treats the destination as restricted; poor launch-time serviceability.' },
    { name: 'Syria', reason: 'Major-carrier service restrictions/suspensions and elevated-risk controls make consumer fulfillment impractical.' },
    { name: 'Cuba', reason: 'FedEx lists no service and DHL applies restricted-destination controls; exclude for launch simplicity.' }
  ];

  const monitorList = ['Ukraine', 'Sudan', 'Yemen', 'Libya', 'Somalia', 'West Bank / Gaza', 'Venezuela', 'Afghanistan'];

  const nav = document.querySelector('.toggle');
  const samTab = document.createElement('button');
  samTab.className = 'tab sam-tab';
  samTab.type = 'button';
  samTab.dataset.tab = 'sam';
  samTab.textContent = 'For Sam';
  nav?.appendChild(samTab);

  const samView = document.createElement('section');
  samView.className = 'view sam-view';
  samView.id = 'sam';
  samView.innerHTML = `
    <div class="hero sam-hero">
      <div>
        <span class="eyebrow">Implementation brief · For Sam</span>
        <h1>Shipping stack & serviceability.</h1>
        <p>This page is the implementation reference for the Customer and Fulfillment Ops tabs: which carriers to connect, where each one wins, and how destination restrictions should flow into the platform.</p>
      </div>
      <div class="sam-updated"><span>Research checked</span><strong>Sep 10, 2026</strong></div>
    </div>

    <section class="sam-callout">
      <div><span class="eyebrow">Recommended V1 routing</span><h2>Chit Chats first. Rate-shop everything else.</h2></div>
      <p><strong>Canada:</strong> Chit Chats + Canada Post + Purolator. <strong>U.S.:</strong> Chit Chats/USPS first, UPS/FedEx when speed, value or parcel profile justifies it. <strong>International:</strong> Chit Chats/Canada Post for economy; DHL/FedEx/UPS for premium.</p>
    </section>

    <div class="sam-section-head"><div><span class="step">01</span><h2>Carrier comparison</h2></div><p>Cost labels are relative positioning for this Toronto operation. Production pricing must always come from live account rates.</p></div>
    <div class="carrier-grid">
      ${carrierData.map((carrier) => `
        <article class="carrier-card">
          <div class="carrier-card__head"><div><span>${carrier.role}</span><h3>${carrier.name}</h3></div><span class="cost-badge cost-${carrier.cost.toLowerCase().replace(/[^a-z]+/g, '-')}">${carrier.cost}</span></div>
          <div class="carrier-metrics">
            <div><span>Efficiency</span><strong>${carrier.efficiency}</strong></div>
            <div><span>Integration</span><strong>${carrier.api}</strong></div>
          </div>
          <div class="carrier-region"><span>Best regions</span><strong>${carrier.regions}</strong></div>
          <p>${carrier.detail}</p>
          <div class="carrier-detail"><span>Typical speed profile</span><strong>${carrier.speed}</strong></div>
          <div class="carrier-implementation"><span>Implementation note</span><p>${carrier.implementation}</p></div>
          <a href="${carrier.url}" target="_blank" rel="noreferrer">Official carrier reference ↗</a>
        </article>`).join('')}
    </div>

    <section class="sam-architecture">
      <div class="sam-section-head"><div><span class="step">02</span><h2>How Sam should implement it</h2></div></div>
      <div class="architecture-flow">
        <div><span>1</span><strong>Shipping settings</strong><p>Hard blacklist + dynamic service-area rules.</p></div><b>→</b>
        <div><span>2</span><strong>Eligibility engine</strong><p>Destination, item, value, address and customs checks.</p></div><b>→</b>
        <div><span>3</span><strong>Rate adapters</strong><p>Normalize Chit Chats, Purolator, UPS, FedEx, DHL and Canada Post.</p></div><b>→</b>
        <div><span>4</span><strong>Customer flat price</strong><p>Best eligible rate + configured cushion. Cash only.</p></div><b>→</b>
        <div><span>5</span><strong>Ops choice</strong><p>Re-rate after packing and select the actual carrier.</p></div>
      </div>
      <pre class="sam-code">shippable = !hardBlacklisted
  && carrierServiceAvailable
  && addressValid
  && itemCompliant
  && customsComplete</pre>
    </section>

    <section class="blacklist-panel">
      <div class="blacklist-head"><div><span class="eyebrow">Launch policy</span><h2>Platform destination blacklist</h2><p>These are recommended hard exclusions for launch because reliable consumer fulfillment is either suspended or disproportionately complex across the carrier stack.</p></div><span class="blacklist-count">${hardBlacklist.length} hard blocked</span></div>
      <div class="blacklist-grid">${hardBlacklist.map((country) => `<div class="blacklist-country"><strong>${country.name}</strong><p>${country.reason}</p></div>`).join('')}</div>
      <div class="monitor-row"><span>Dynamic suspension / manual review</span><p>${monitorList.join(' · ')}</p></div>
      <p class="blacklist-disclaimer">Do not treat the monitor list as a permanent platform blacklist. Carrier availability changes quickly. Check live serviceability before returning a rate.</p>
    </section>

    <section class="tetra-note">
      <div class="tetra-icon">T</div>
      <div><span class="eyebrow">Decision for Tetra</span><h2>Blacklisted-country users vs. reshippers</h2><p>Discuss whether users in a hard-blacklisted country should be prevented from participating entirely, or whether participation is allowed when they provide a valid shipping address in a supported country through a third-party reshipper. My recommendation: separate <strong>account eligibility</strong> from <strong>fulfillment eligibility</strong> so a user can participate, but the platform will only ship to a serviceable, non-blacklisted address.</p></div>
    </section>

    <section class="sam-sources">
      <span class="eyebrow">Research notes</span>
      <p>Key current findings: Chit Chats requires DDP for U.S.-bound parcels; Chit Chats publishes Canada/U.S./international tracked service times; Purolator advertises export coverage to 210+ countries; FedEx and UPS serve 220+ countries/territories; FedEx and UPS currently suspend Russia/Belarus; DHL flags restricted/elevated-risk destinations and shows Belarus unavailable from Canada. Temporary carrier disruptions should remain dynamic.</p>
      <div class="source-links">
        <a href="https://support.chitchats.com/en/support/solutions/articles/47000669986-what-is-the-estimated-delivery-time-for-my-shipment-" target="_blank" rel="noreferrer">Chit Chats service times</a>
        <a href="https://www.fedex.com/en-ca/service-alerts.html" target="_blank" rel="noreferrer">FedEx service alerts</a>
        <a href="https://www.ups.com/ca/en/service-alerts" target="_blank" rel="noreferrer">UPS service alerts</a>
        <a href="https://www.canadapost-postescanada.ca/cpc/en/our-company/news-and-media/service-alerts.page" target="_blank" rel="noreferrer">Canada Post alerts</a>
      </div>
    </section>`;

  document.querySelector('main')?.appendChild(samView);

  samTab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.view').forEach((view) => view.classList.remove('active'));
    samTab.classList.add('active');
    samView.classList.add('active');
  });

  const archiveStyle = document.createElement('link');
  archiveStyle.rel = 'stylesheet';
  archiveStyle.href = 'archive.css';
  document.head.appendChild(archiveStyle);

  const archiveScript = document.createElement('script');
  archiveScript.src = 'archive.js';
  archiveScript.defer = true;
  document.body.appendChild(archiveScript);
})();