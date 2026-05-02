/** Settings Page */
const SettingsPage = {
    async render(container) {
        const sid = App.storeId;
        const [kpis, revData, catData] = await Promise.all([
            API.get('/api/analytics/kpis', { store_id: sid }),
            API.get('/api/analytics/revenue-trend', { store_id: sid }),
            API.get('/api/analytics/category-performance', { store_id: sid }),
        ]);

        container.innerHTML = `<div class="fade-in">
            ${KpiCard.renderPageHeader('SYSTEM', 'Analytics & Settings')}
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="kpi-card accent-primary"><div class="kpi-label">Revenue Protected</div><div class="kpi-value">${kpis.revenue_protected}</div><div class="text-primary text-[0.72rem] mt-1 font-semibold">${kpis.revenue_delta} from last month</div></div>
                <div class="kpi-card accent-dim"><div class="kpi-label">Compliance Score</div><div class="kpi-value">${kpis.compliance_score}%</div><div class="text-on-surface-variant text-[0.72rem] mt-1">Store average</div></div>
                <div class="kpi-card accent-error"><div class="kpi-label">Stockout Events</div><div class="kpi-value">${kpis.stockout_events}</div><div class="text-error text-[0.72rem] mt-1 font-semibold">${kpis.stockout_delta} improvement</div></div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="panel"><div class="panel-header"><h2 class="text-on-surface text-[1.05rem] font-bold">Monthly Revenue Trend</h2></div><div class="px-4 pb-4" style="height:260px"><canvas id="rev-chart"></canvas></div></div>
                <div class="panel"><div class="panel-header"><h2 class="text-on-surface text-[1.05rem] font-bold">Category Performance</h2></div><div class="px-4 pb-4" style="height:260px"><canvas id="cat-chart"></canvas></div></div>
            </div>

            ${KpiCard.renderSectionHeader('User Settings')}
            <div class="grid grid-cols-2 gap-4">
                <div class="panel p-5">
                    <h3 class="text-on-surface font-bold text-[0.92rem] mb-4">Notification Preferences</h3>
                    <div class="space-y-3.5">
                        ${[['Email Alerts', true], ['Push Notifications', true], ['SMS for Critical Alerts', false], ['Daily Summary Report', true], ['Weekly Performance Digest', false]].map(([label, on]) => `<div class="flex justify-between items-center"><span class="text-on-surface-variant text-[0.82rem]">${label}</span><label class="relative inline-block w-10 h-5 cursor-pointer"><input type="checkbox" class="sr-only peer" ${on ? 'checked' : ''}><span class="absolute inset-0 bg-surface-highest rounded-full peer-checked:bg-primary/30 transition-colors"></span><span class="absolute top-0.5 left-0.5 w-4 h-4 bg-outline rounded-full peer-checked:translate-x-5 peer-checked:bg-primary transition-transform"></span></label></div>`).join('')}
                    </div>
                </div>
                <div class="panel p-5">
                    <h3 class="text-on-surface font-bold text-[0.92rem] mb-4">Profile</h3>
                    <div class="flex items-center gap-4 mb-5">
                        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-on-primary font-bold text-xl">AS</div>
                        <div><div class="text-on-surface font-bold text-lg">Arjun Sharma</div><div class="text-on-surface-variant text-sm">Store Lead — Mumbai Flagship</div></div>
                    </div>
                    <div class="space-y-3">${[['Role', 'Store Lead'], ['Store', 'Mumbai — Flagship'], ['Email', 'arjun.sharma@shelfiq.ai'], ['Phone', '+91 98XXX XXXXX']].map(([l, v]) => `<div class="flex justify-between"><span class="text-on-surface-variant text-[0.82rem]">${l}</span><span class="text-on-surface text-[0.82rem] font-medium">${v}</span></div>`).join('')}</div>
                </div>
            </div>

            <div class="mt-5 flex gap-3"><button id="save-settings-btn" class="btn-primary text-sm">💾 Save Settings</button><button class="btn-ghost text-sm">🔄 Reset to Defaults</button></div>
        </div>`;

        Charts.bar('rev-chart', revData.labels, revData.values);
        Charts.doughnut('cat-chart', catData.labels, catData.values, catData.colors);

        document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
            await API.post('/api/settings/save', { store_id: sid });
            alert('Settings saved!');
        });
    }
};
