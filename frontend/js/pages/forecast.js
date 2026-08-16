/**
 * ShelfIQ — AI Demand Forecasting & Replenishment Engine
 */
const ForecastPage = {
    async render(container) {
        const sid = App.storeId;
        const [accuracy, chartData, items] = await Promise.all([
            API.get('/api/forecast/accuracy', { store_id: sid }),
            API.get('/api/forecast/chart', { store_id: sid }),
            API.get('/api/forecast/replenishment')
        ]);

        const isAccurate = accuracy.wmape <= 15;
        const wColor = isAccurate ? 'text-emerald-400' : 'text-amber-400';
        const wBadge = isAccurate ? 'badge-optimal' : 'badge-warning';

        const actionButtons = `
            <a href="${API.downloadUrl('/api/forecast/export-csv')}" class="btn-secondary">
                <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                <span>Export PO Orders (CSV)</span>
            </a>
            <button class="btn-primary" id="batch-reorder-btn">
                <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                <span>Auto-Reorder All Deficits</span>
            </button>
        `;

        const repRows = items.map(it => {
            const isCrit = it.stock <= 4;
            const isWarn = it.stock > 4 && it.stock <= 28;
            const stockBadge = isCrit ? 'badge-critical' : isWarn ? 'badge-warning' : 'badge-optimal';

            const actionBtn = it.has_action ? `
                <button class="btn-primary py-1 px-3 text-xs confirm-order-btn" data-sku="${it.sku}" data-name="${it.name}" data-qty="${it.order}">
                    <i data-lucide="check" class="w-3 h-3"></i> PO Restock (${it.order})
                </button>
            ` : '<span class="text-xs text-muted italic font-mono">Adequate Stock</span>';

            return `
                <td>
                    <div class="font-bold text-xs text-primary">${it.name}</div>
                    <div class="text-[0.68rem] text-muted font-mono">${it.sku}</div>
                </td>
                <td class="text-center">
                    <div class="font-bold text-sm text-primary font-mono">${it.stock}</div>
                    <span class="badge ${stockBadge} text-[0.6rem] py-0.2">${it.stock_status}</span>
                </td>
                <td class="text-center font-mono text-xs font-bold text-primary">${it.demand} units</td>
                <td class="text-center font-mono text-xs text-secondary">${it.min_max}</td>
                <td class="text-center font-mono font-black text-sm ${it.order > 0 ? 'text-blue-400' : 'text-muted'}">
                    ${it.order > 0 ? '+' + it.order : '0'}
                </td>
                <td class="text-center">
                    ${actionBtn}
                </td>
            `;
        });

        container.innerHTML = `
            <div class="fade-in">
                ${KpiCard.renderPageHeader('Predictive Analytics', 'Demand Forecasting & Replenishment', actionButtons)}

                <!-- KPI Forecast Accuracy Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="glass-panel p-5 text-center">
                        <div class="text-xs text-muted font-medium mb-1">Forecast Error Metric (WMAPE)</div>
                        <div class="text-3xl font-black ${wColor} font-heading mb-1">${accuracy.wmape}%</div>
                        <div class="flex items-center justify-center gap-2">
                            <span class="badge ${wBadge}">Industry Grade A+</span>
                            <span class="text-[0.7rem] text-muted">vs 22.4% baseline</span>
                        </div>
                    </div>

                    <div class="glass-panel p-5 text-center">
                        <div class="text-xs text-muted font-medium mb-1">Mean Absolute Error (MAE)</div>
                        <div class="text-3xl font-black text-primary font-heading mb-1">${accuracy.mae}</div>
                        <div class="text-[0.7rem] text-muted">Units variance per SKU / day</div>
                    </div>

                    <div class="glass-panel p-5 text-center">
                        <div class="text-xs text-muted font-medium mb-1">Root Mean Sq. Error (RMSE)</div>
                        <div class="text-3xl font-black text-primary font-heading mb-1">${accuracy.rmse}</div>
                        <div class="text-[0.7rem] text-emerald-400 font-semibold">Extreme Outliers Suppressed</div>
                    </div>
                </div>

                <!-- Main Time-Series Forecast Chart -->
                <div class="glass-panel mb-6">
                    <div class="panel-header">
                        <div>
                            <div class="panel-title">
                                <i data-lucide="trending-up" class="w-4 h-4 text-blue-400"></i>
                                <span>14-Day Demand Curve with 95% Confidence Interval</span>
                            </div>
                            <div class="panel-subtitle">SKU: DRK-RB-250ML (Red Bull Energy Drink 250ml)</div>
                        </div>
                        <div class="flex items-center gap-3 text-xs">
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Historical Actuals</span>
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Predicted Demand</span>
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-400/20 border border-blue-400/40"></span> 95% Confidence Band</span>
                        </div>
                    </div>
                    <div class="panel-body">
                        <div style="height: 320px;">
                            <canvas id="forecast-chart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Replenishment Recommendations Table -->
                <div class="mb-4">
                    ${Tables.render(
                        [
                            { label: 'SKU & Product Name' },
                            { label: 'Shelf Stock', align: 'center' },
                            { label: '7D Demand', align: 'center' },
                            { label: 'Min / Max Par', align: 'center' },
                            { label: 'Suggested Order', align: 'center' },
                            { label: 'Purchase Order Action', align: 'center' }
                        ],
                        repRows,
                        { title: 'Automated Replenishment Dispatch Queue', subtitle: 'Calculated using safety stock formula & lead time buffer' }
                    )}
                </div>
            </div>
        `;

        // Render Forecast Chart with Upper/Lower confidence intervals
        const allDates = [...chartData.hist_dates, ...chartData.fore_dates];
        const histData = [...chartData.hist_values, ...new Array(chartData.fore_dates.length).fill(null)];
        const foreData = [...new Array(chartData.hist_dates.length).fill(null), ...chartData.fore_base];
        const upperData = [...new Array(chartData.hist_dates.length).fill(null), ...chartData.fore_upper];
        const lowerData = [...new Array(chartData.hist_dates.length).fill(null), ...chartData.fore_lower];

        Charts.line('forecast-chart', allDates, [
            {
                label: 'Historical Demand',
                data: histData,
                borderColor: '#94a3b8',
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.3
            },
            {
                label: '95% Upper Bound',
                data: upperData,
                borderColor: 'transparent',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                fill: '+1',
                pointRadius: 0
            },
            {
                label: '95% Lower Bound',
                data: lowerData,
                borderColor: 'transparent',
                pointRadius: 0
            },
            {
                label: 'AI Forecast',
                data: foreData,
                borderColor: '#38bdf8',
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 7,
                tension: 0.3
            }
        ]);

        // Wire replenishment buttons
        container.querySelectorAll('.confirm-order-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                const qty = btn.dataset.qty;
                App.showModal({
                    title: `Confirm Purchase Order — ${name}`,
                    body: `Generate EDI supplier purchase order for <b>${qty} units</b> from Central Distribution Warehouse? Delivery expected within 6 hours.`,
                    confirmText: 'Dispatch Order',
                    onConfirm: () => {
                        App.showToast('PO Dispatched', `Generated PO for ${qty} units of ${name}`, 'success');
                        btn.outerHTML = '<span class="badge badge-optimal">✓ PO Sent</span>';
                    }
                });
            });
        });

        document.getElementById('batch-reorder-btn')?.addEventListener('click', () => {
            App.showModal({
                title: 'Batch Auto-Replenishment',
                body: 'Generate purchase orders for all 4 deficit SKUs totaling 360 units across suppliers?',
                confirmText: 'Confirm All POs',
                onConfirm: () => {
                    App.showToast('Batch Orders Dispatched', '4 Purchase Orders submitted to ERP warehouse.', 'success');
                    container.querySelectorAll('.confirm-order-btn').forEach(b => {
                        b.outerHTML = '<span class="badge badge-optimal">✓ PO Sent</span>';
                    });
                }
            });
        });
    }
};
