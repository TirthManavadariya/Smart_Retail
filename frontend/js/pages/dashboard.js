/** Dashboard Page — Store Health Dashboard */
const DashboardPage = {
    async render(container) {
        const sid = App.storeId;
        const [kpi, floorData, alerts, oos, compliance] = await Promise.all([
            API.get('/api/overview/kpis', { store_id: sid }),
            API.get('/api/overview/floor-plan', { store_id: sid }),
            API.get('/api/overview/alerts', { store_id: sid }),
            API.get('/api/overview/oos-trends'),
            API.get('/api/overview/compliance'),
        ]);

        container.innerHTML = `
        <div class="fade-in">
            <div class="flex justify-between items-end mb-7">
                <div><div class="section-label">Operations Intelligence</div><h1 class="section-title">Store Health Dashboard</h1></div>
                <a href="${API.downloadUrl('/api/reports/pdf', { store_id: sid })}" class="btn-primary text-sm">📄 Download Report</a>
            </div>

            ${KpiCard.renderRow([
                { label: 'Shelf Health Score', value: kpi.shelf_health + '%', icon: '🛡️', chip_text: '+' + kpi.shelf_delta + '% vs LW', accent: 'primary' },
                { label: 'Real-time Out-of-Stock', value: kpi.oos_units + ' <span class="text-base font-medium text-on-surface-variant">units</span>', icon: '📦', chip_text: 'High Alert', accent: 'error' },
                { label: 'Revenue Recovered', value: '₹' + kpi.revenue_recovered, icon: '💰', chip_text: 'Estimated', accent: 'secondary' },
                { label: 'Forecast Accuracy', value: kpi.forecast_accuracy + '%', icon: '⚙️', chip_text: 'Model V4.2', accent: 'dim' },
            ])}

            <div class="h-6"></div>

            <div class="grid grid-cols-3 gap-4">
                <div class="col-span-2">
                    <div class="panel">
                        <div class="panel-header">
                            <div><h2 class="text-on-surface text-[1.1rem] font-bold">Store Floor Plan — Detection Overlay</h2>
                            <p class="text-on-surface-variant text-[0.72rem] mt-0.5">Real-time shelf status from CV pipeline</p></div>
                            <div class="flex gap-3.5 items-center text-[0.7rem] text-on-surface-variant">
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> Healthy</span>
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Low Stock</span>
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> Stockout</span>
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Violation</span>
                            </div>
                        </div>
                        <div class="px-5 pb-2">${_renderFloorGrid(floorData)}</div>
                        <div class="bg-surface-low px-5 py-2.5 flex justify-around text-[0.72rem] text-on-surface-variant rounded-b-xl">
                            <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Healthy: ${floorData.summary.full}</span>
                            <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Low Stock: ${floorData.summary.low}</span>
                            <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Stockout: ${floorData.summary.empty}</span>
                            <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Violations: ${floorData.summary.violation}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="panel h-full flex flex-col">
                        <div class="panel-header border-b border-outline-variant/10">
                            <div><h2 class="text-on-surface text-[1.05rem] font-bold">Critical Alerts</h2>
                            <p class="text-error text-[0.72rem] font-medium mt-0.5">Top Impact Priority</p></div>
                        </div>
                        <div class="p-3.5 flex-1">${alerts.map(a => AlertCard.render(a)).join('')}</div>
                    </div>
                </div>
            </div>

            <div class="h-6"></div>

            <div class="grid grid-cols-2 gap-4">
                <div class="panel">
                    <div class="panel-header"><div><h2 class="text-on-surface text-[1.05rem] font-bold">Out-of-Stock Trends</h2>
                    <p class="text-on-surface-variant text-[0.72rem] mt-0.5">Unit peaks over last 24h</p></div>
                    <div class="bg-surface-high px-3 py-1.5 rounded-lg text-[0.72rem] text-on-surface-variant">Last 24 Hours</div></div>
                    <div class="px-4 pb-4" style="height:240px"><canvas id="oos-chart"></canvas></div>
                </div>
                <div class="panel">
                    <div class="panel-header"><div><h2 class="text-on-surface text-[1.05rem] font-bold">Real Time Error in Placement</h2>
                    <p class="text-on-surface-variant text-[0.72rem] mt-0.5">Percentage accuracy by aisle</p></div>
                    <div class="kpi-chip primary">Avg: ${compliance.average}%</div></div>
                    <div class="px-5 py-4">${Tables.complianceBars(compliance.aisles)}</div>
                </div>
            </div>
        </div>`;

        // Render OOS chart
        Charts.line('oos-chart', oos.labels, [{
            data: oos.values, borderColor: '#6ee6ee', borderWidth: 2.5,
            fill: true, backgroundColor: 'rgba(110,230,238,0.08)',
            tension: 0.4, pointRadius: 0
        }]);
    }
};

function _renderFloorGrid(data) {
    const STATUS_COLORS = { FULL: '#22c55e', LOW: '#eab308', EMPTY: '#ef4444', VIOLATION: '#8b5cf6' };
    const aisles = {};
    data.sections.forEach(s => { if (!aisles[s.aisle_idx]) aisles[s.aisle_idx] = []; aisles[s.aisle_idx].push(s); });
    let html = '<div class="space-y-2">';
    Object.keys(aisles).sort().forEach(ai => {
        html += `<div class="flex items-center gap-3"><span class="text-on-surface-variant text-[0.72rem] w-16">Aisle ${Number(ai)+1}</span><div class="flex gap-2 flex-1">`;
        aisles[ai].forEach(s => {
            const c = STATUS_COLORS[s.status];
            html += `<div class="flex-1 h-10 rounded-md flex items-center justify-center text-[0.6rem] font-semibold cursor-default transition-all hover:scale-105" style="background:${c}22;border:1px solid ${c}44;color:${c}" title="${s.name} (${s.sku})\nStatus: ${s.status}\nFill: ${s.fill}">${s.label}</div>`;
        });
        html += '</div></div>';
    });
    return html + '</div>';
}
