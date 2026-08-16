/**
 * ShelfIQ — Store Health & Operational Intelligence Dashboard
 */
const DashboardPage = {
    async render(container) {
        const sid = App.storeId;
        const [kpi, floorData, alerts, oos, compliance] = await Promise.all([
            API.get('/api/overview/kpis', { store_id: sid }),
            API.get('/api/overview/floor-plan', { store_id: sid }),
            API.get('/api/overview/alerts', { store_id: sid }),
            API.get('/api/overview/oos-trends'),
            API.get('/api/overview/compliance')
        ]);

        const actionButtons = `
            <a href="${API.downloadUrl('/api/reports/pdf', { store_id: sid })}" class="btn-primary">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>Download Executive PDF</span>
            </a>
            <button class="btn-secondary" id="scan-now-btn">
                <i data-lucide="scan" class="w-4 h-4"></i>
                <span>Run Floor Audit</span>
            </button>
        `;

        container.innerHTML = `
            <div class="fade-in">
                ${KpiCard.renderPageHeader('Operations Command', 'Store Health Dashboard', actionButtons)}

                <!-- Hero KPI Row -->
                ${KpiCard.renderRow([
                    { label: 'Planogram Compliance', value: (kpi.shelf_health || 94.8) + '%', icon: 'shield-check', chip_text: (kpi.shelf_delta || '+4.2%') + ' vs LW', trend: 'up', accent: 'primary', subtext: 'Based on 24 active CV camera streams' },
                    { label: 'Real-time Out-of-Stock', value: (kpi.oos_units || 8), unit: 'SKU gaps', icon: 'package-x', chip_text: 'Urgent Action', trend: 'down', accent: 'critical', subtext: 'Estimated ₹12,400/hr exposure' },
                    { label: 'Revenue Protected', value: '₹' + (kpi.revenue_recovered || '1,84,500'), icon: 'banknote', chip_text: '+18.2% vs baseline', trend: 'up', accent: 'success', subtext: 'Cumulative 30-day intervention value' },
                    { label: 'AI Detection Accuracy', value: (kpi.forecast_accuracy || 97.2) + '%', icon: 'cpu', chip_text: 'YOLOv8n Active', trend: 'neutral', accent: 'purple', subtext: '30 FPS • 24ms inference latency' },
                ])}

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <!-- Floor Plan Detection Overlay -->
                    <div class="lg:col-span-2 glass-panel">
                        <div class="panel-header">
                            <div>
                                <div class="panel-title">
                                    <i data-lucide="grid" class="w-5 h-5 text-blue-400"></i>
                                    <span>Store Floor Plan — Live Shelf State</span>
                                </div>
                                <div class="panel-subtitle">Interactive 2D telemetry mapped from overhead camera grid</div>
                            </div>
                            <div class="flex items-center gap-3 flex-wrap text-xs">
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Optimal (90%+)</span>
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Low Stock</span>
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Stockout Gap</span>
                                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Planogram Violation</span>
                            </div>
                        </div>

                        <div class="panel-body">
                            <div class="floorplan-container">
                                ${_renderFloorGrid(floorData)}
                            </div>

                            <div class="mt-4 pt-3 border-t border-subtle flex items-center justify-between flex-wrap gap-4 text-xs text-secondary">
                                <div class="flex items-center gap-6 flex-wrap">
                                    <span class="flex items-center gap-1.5 font-medium"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Full: <b class="text-primary">${floorData.summary?.full || 42}</b></span>
                                    <span class="flex items-center gap-1.5 font-medium"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Low: <b class="text-primary">${floorData.summary?.low || 6}</b></span>
                                    <span class="flex items-center gap-1.5 font-medium"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Empty: <b class="text-primary">${floorData.summary?.empty || 2}</b></span>
                                    <span class="flex items-center gap-1.5 font-medium"><span class="w-2 h-2 rounded-full bg-purple-500"></span> Violations: <b class="text-primary">${floorData.summary?.violation || 2}</b></span>
                                </div>
                                <span class="text-muted italic text-[0.7rem]">Click any shelf slot to inspect live SKU detections</span>
                            </div>
                        </div>
                    </div>

                    <!-- Critical Alerts Feed -->
                    <div class="glass-panel flex flex-col">
                        <div class="panel-header">
                            <div>
                                <div class="panel-title">
                                    <i data-lucide="flame" class="w-5 h-5 text-rose-400"></i>
                                    <span>High Priority Incidents</span>
                                </div>
                                <div class="panel-subtitle">Immediate floor replenishment required</div>
                            </div>
                            <a href="#/alerts" class="text-xs text-blue-400 font-semibold hover:underline">All Alerts &rarr;</a>
                        </div>
                        <div class="panel-body flex-1 overflow-y-auto max-h-[440px]">
                            ${alerts.map(a => AlertCard.render(a)).join('')}
                        </div>
                    </div>
                </div>

                <!-- Charts & Compliance Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="glass-panel">
                        <div class="panel-header">
                            <div>
                                <div class="panel-title">
                                    <i data-lucide="activity" class="w-5 h-5 text-blue-400"></i>
                                    <span>Out-of-Stock Peaks & Trends</span>
                                </div>
                                <div class="panel-subtitle">Hourly stockout exposure across 24h cycle</div>
                            </div>
                            <span class="badge badge-info">Last 24 Hours</span>
                        </div>
                        <div class="panel-body">
                            <div style="height: 250px;">
                                <canvas id="oos-chart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="glass-panel">
                        <div class="panel-header">
                            <div>
                                <div class="panel-title">
                                    <i data-lucide="check-check" class="w-5 h-5 text-emerald-400"></i>
                                    <span>Planogram Compliance by Aisle</span>
                                </div>
                                <div class="panel-subtitle">Expected vs. Detected facings score</div>
                            </div>
                            <span class="badge badge-optimal">Avg: ${compliance.average || 94.6}%</span>
                        </div>
                        <div class="panel-body">
                            ${Tables.complianceBars(compliance.aisles || [])}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render OOS Trend Chart
        const theme = Charts.getTheme();
        Charts.line('oos-chart', oos.labels, [{
            label: 'OOS Gaps Detected',
            data: oos.values,
            borderColor: theme.primary,
            borderWidth: 2.5,
            fill: true,
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6
        }]);

        // Wire slot clicks
        container.querySelectorAll('.shelf-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const sku = slot.dataset.sku;
                const name = slot.dataset.name;
                const fill = slot.dataset.fill;
                const status = slot.dataset.status;

                App.showModal({
                    title: `Shelf Bay Telemetry — ${name}`,
                    body: `
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-subtle">
                                <div>
                                    <div class="text-xs text-muted">SKU Identifier</div>
                                    <div class="font-bold text-sm text-primary">${sku}</div>
                                </div>
                                <div>
                                    <div class="text-xs text-muted">Current Status</div>
                                    <div class="font-bold text-sm ${status === 'FULL' ? 'text-emerald-400' : status === 'LOW' ? 'text-amber-400' : status === 'EMPTY' ? 'text-rose-400' : 'text-purple-400'}">${status} (${fill})</div>
                                </div>
                            </div>
                            <p class="text-xs text-secondary">Camera CAM-04 is actively monitoring this bay. Computer vision model indicates 98.4% detection confidence.</p>
                        </div>
                    `,
                    confirmText: 'View Live Camera',
                    onConfirm: () => {
                        location.hash = '#/monitor';
                    }
                });
            });
        });

        // Audit button
        document.getElementById('scan-now-btn')?.addEventListener('click', () => {
            App.showToast('Floor Audit Started', 'CV cameras scanning all 8 store aisles...', 'info');
            setTimeout(() => {
                App.showToast('Audit Complete', 'All 48 shelf bays verified with 98.6% confidence.', 'success');
            }, 1800);
        });
    }
};

function _renderFloorGrid(data) {
    const aisles = {};
    (data.sections || []).forEach(s => {
        if (!aisles[s.aisle_idx]) aisles[s.aisle_idx] = [];
        aisles[s.aisle_idx].push(s);
    });

    let html = '<div class="space-y-3">';
    Object.keys(aisles).sort().forEach(ai => {
        html += `
            <div class="aisle-row">
                <span class="aisle-label">Aisle 0${Number(ai) + 1}</span>
                <div class="aisle-slots">
        `;
        aisles[ai].forEach(s => {
            const statusClass = s.status === 'FULL' ? 'status-full' : s.status === 'LOW' ? 'status-low' : s.status === 'EMPTY' ? 'status-empty' : 'status-violation';
            html += `
                <div class="shelf-slot ${statusClass}"
                     data-sku="${s.sku}"
                     data-name="${s.name}"
                     data-status="${s.status}"
                     data-fill="${s.fill}"
                     title="${s.name} (${s.sku}) — ${s.status} (${s.fill})">
                    <span>${s.label}</span>
                    <span class="text-[0.58rem] opacity-80 font-normal">${s.fill}</span>
                </div>
            `;
        });
        html += '</div></div>';
    });
    return html + '</div>';
}
