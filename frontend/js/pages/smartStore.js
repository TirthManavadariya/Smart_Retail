/** Smart Store Page */
const SmartStorePage = {
    async render(container) {
        container.innerHTML = `<div class="fade-in">
            ${KpiCard.renderPageHeader('SMART RETAIL', 'Smart Store Overview')}
            <div class="grid grid-cols-4 gap-4 mb-6">${[
                { icon: '📷', label: 'Active Cameras', value: '24', chip: 'Online', accent: 'primary' },
                { icon: '🌡️', label: 'Avg. Store Temp', value: '22°C', chip: 'Normal', accent: 'primary' },
                { icon: '👥', label: 'Current Footfall', value: '142', chip: 'Peak Hour', accent: 'secondary' },
                { icon: '⚡', label: 'Energy Usage', value: '4.2kW', chip: '-8% vs LW', accent: 'dim' },
            ].map(m => `<div class="kpi-card accent-${m.accent}"><div class="flex justify-between items-start mb-3.5"><div class="kpi-icon-box ${m.accent}">${m.icon}</div><span class="kpi-chip ${m.accent}">${m.chip}</span></div><div class="kpi-label">${m.label}</div><div class="kpi-value">${m.value}</div></div>`).join('')}</div>

            ${KpiCard.renderSectionHeader('Camera Grid', 'Live feeds from 24 overhead cameras')}
            <div class="grid grid-cols-4 gap-3 mb-6">${[1,2,3,4,5,6,7,8].map(i => `<div class="panel relative overflow-hidden" style="padding:0"><div class="bg-surface-lowest flex items-center justify-center" style="height:140px"><span class="text-outline text-[2rem]">📷</span></div><div class="absolute top-2 left-2 bg-surface/80 px-2 py-0.5 rounded text-[0.6rem] text-on-surface-variant font-medium">CAM-${String(i).padStart(2,'0')}</div><div class="absolute top-2 right-2 w-2 h-2 rounded-full ${i<=6?'bg-green-500 pulse-glow':'bg-red-500'}"></div></div>`).join('')}</div>

            ${KpiCard.renderSectionHeader('Customer Journey Analytics')}
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="panel p-5"><div class="text-on-surface font-bold text-[0.92rem] mb-3">🛒 Customer Flow</div>
                <div class="space-y-3">${['Entrance → Produce', 'Produce → Dairy', 'Dairy → Checkout', 'Aisle 3 → Aisle 5'].map((f, i) => `<div class="flex items-center gap-3"><span class="text-on-surface-variant text-[0.78rem] w-40">${f}</span><div class="flex-1 compliance-bar-track"><div class="compliance-bar-fill healthy" style="width:${90-i*15}%"></div></div><span class="text-on-surface text-[0.72rem] font-bold w-10 text-right">${90-i*15}%</span></div>`).join('')}</div></div>
                <div class="panel p-5"><div class="text-on-surface font-bold text-[0.92rem] mb-3">⏱ Dwell Time</div>
                <div class="space-y-3">${[['Produce', '3.2m', 72], ['Beverages', '4.8m', 95], ['Snacks', '2.1m', 45], ['Dairy', '1.8m', 38]].map(([z, t, p]) => `<div class="flex items-center gap-3"><span class="text-on-surface-variant text-[0.78rem] w-24">${z}</span><div class="flex-1 compliance-bar-track"><div class="compliance-bar-fill" style="width:${p}%;background:${p>60?'#cecb5b':'#6ee6ee'}"></div></div><span class="text-on-surface text-[0.72rem] font-bold w-12 text-right">${t}</span></div>`).join('')}</div></div>
                <div class="panel p-5"><div class="text-on-surface font-bold text-[0.92rem] mb-3">📊 Conversion Zones</div>
                <div class="space-y-3">${[['End Caps', '34%', 68], ['Eye Level', '28%', 56], ['Promo Display', '42%', 84], ['Checkout', '18%', 36]].map(([z, r, p]) => `<div class="flex items-center gap-3"><span class="text-on-surface-variant text-[0.78rem] w-28">${z}</span><div class="flex-1 compliance-bar-track"><div class="compliance-bar-fill healthy" style="width:${p}%"></div></div><span class="text-primary text-[0.72rem] font-bold w-10 text-right">${r}</span></div>`).join('')}</div></div>
            </div>

            ${KpiCard.renderSectionHeader('IoT Sensor Network')}
            <div class="grid grid-cols-6 gap-3 mb-6">${[
                { label: 'Zone A: Produce', temp: '4°C', humidity: '85%', icon: '🥬' },
                { label: 'Zone B: Dairy', temp: '3°C', humidity: '78%', icon: '🧀' },
                { label: 'Zone C: Frozen', temp: '-18°C', humidity: '45%', icon: '🧊' },
                { label: 'Zone D: Bakery', temp: '22°C', humidity: '40%', icon: '🍞' },
                { label: 'Zone E: Meat', temp: '2°C', humidity: '82%', icon: '🥩' },
                { label: 'Zone F: General', temp: '21°C', humidity: '50%', icon: '📦' },
            ].map(s => `<div class="panel p-3.5 text-center"><div class="text-[1.5rem] mb-1">${s.icon}</div><div class="text-on-surface text-[0.78rem] font-semibold mb-2">${s.label}</div><div class="flex justify-around"><div><div class="text-outline text-[0.6rem] uppercase">Temp</div><div class="text-primary font-bold">${s.temp}</div></div><div><div class="text-outline text-[0.6rem] uppercase">Humid</div><div class="text-on-surface-variant font-bold">${s.humidity}</div></div></div></div>`).join('')}</div>

            ${KpiCard.renderSectionHeader('Smart Store ROI')}
            <div class="grid grid-cols-3 gap-4">
                <div class="kpi-card accent-primary"><div class="kpi-label">Annual Savings</div><div class="kpi-value">₹24.5L</div><div class="text-primary text-[0.72rem] mt-1">From stockout prevention</div></div>
                <div class="kpi-card accent-secondary"><div class="kpi-label">Labor Optimization</div><div class="kpi-value">32%</div><div class="text-secondary text-[0.72rem] mt-1">Reduction in manual audits</div></div>
                <div class="kpi-card accent-dim"><div class="kpi-label">Payback Period</div><div class="kpi-value">4.2 mo</div><div class="text-primary-dim text-[0.72rem] mt-1">Investment recovery</div></div>
            </div>
        </div>`;
    }
};
