/** Demand Forecast Page */
const ForecastPage = {
    async render(container) {
        const sid = App.storeId;
        const [accuracy, chartData, items] = await Promise.all([
            API.get('/api/forecast/accuracy', { store_id: sid }),
            API.get('/api/forecast/chart', { store_id: sid }),
            API.get('/api/forecast/replenishment'),
        ]);
        const wColor = accuracy.wmape <= 25 ? '#6ee6ee' : accuracy.wmape <= 40 ? '#cecb5b' : '#ffb4ab';
        const wLabel = accuracy.wmape <= 25 ? 'Excellent' : accuracy.wmape <= 40 ? 'Fair' : 'Needs Improvement';

        const repRows = items.map(it => {
            const orderHtml = it.order > 0 ? `<span class="text-primary text-base font-black">${it.order.toLocaleString()}</span>` : '<span class="text-outline">0</span>';
            const actionHtml = it.has_action ? '<span class="bg-primary/10 text-primary text-[0.68rem] px-3.5 py-1.5 rounded font-semibold cursor-pointer hover:bg-primary/20 transition-colors">Confirm Order</span>' : '<span class="text-outline text-[0.75rem] italic">No Action</span>';
            return `<td class="px-3.5 py-3.5"><div class="text-on-surface font-bold text-[0.85rem]">${it.sku}</div><div class="text-outline text-[0.72rem]">${it.name}</div></td><td class="px-3.5 py-3.5 text-center"><div class="text-primary font-bold">${it.stock.toLocaleString()}</div><div style="color:${it.stock_color}" class="text-[0.65rem]">${it.stock_status}</div></td><td class="px-3.5 py-3.5 text-center text-on-surface-variant">${it.demand.toLocaleString()}</td><td class="px-3.5 py-3.5 text-center text-on-surface-variant">${it.min_max}</td><td class="px-3.5 py-3.5 text-center">${orderHtml}</td><td class="px-3.5 py-3.5 text-center">${actionHtml}</td>`;
        }).join('</tr><tr class="border-b border-outline-variant/[0.08]">');

        container.innerHTML = `<div class="fade-in">
            <div class="mb-7"><h1 class="section-title">Demand Forecast</h1></div>
            <div class="text-on-surface-variant text-[0.85rem] -mt-2.5 mb-5">Analyzing SKU: <span class="text-primary font-semibold">DRK-CL-500ML</span> (Sparkling Water 500ml)</div>
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="kpi-card accent-primary text-center"><div class="kpi-label">Forecast Accuracy (WMAPE)</div><div class="kpi-value" style="color:${wColor}">${accuracy.wmape}%</div><div style="color:${wColor}" class="text-[0.72rem] mt-1 font-semibold">${wLabel}</div></div>
                <div class="kpi-card accent-dim text-center"><div class="kpi-label">Mean Absolute Error (MAE)</div><div class="kpi-value">${accuracy.mae}</div><div class="text-on-surface-variant text-[0.72rem] mt-1">Units per day</div></div>
                <div class="kpi-card accent-dim text-center"><div class="kpi-label">Root Mean Sq. Error (RMSE)</div><div class="kpi-value">${accuracy.rmse}</div><div class="text-on-surface-variant text-[0.72rem] mt-1">Units per day</div></div>
            </div>
            <div class="panel mb-6">
                <div class="panel-header"><div><h2 class="text-on-surface text-[1.05rem] font-bold">Demand Projection</h2><p class="text-on-surface-variant text-[0.72rem] mt-0.5">${chartData.horizon_days}-day look-forward • ${chartData.freq} view</p></div>
                <div class="flex gap-3.5 text-[0.72rem] text-on-surface-variant"><span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-primary"></span> Forecast</span><span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-on-surface-variant"></span> Historical</span></div></div>
                <div class="px-4 pb-4" style="height:320px"><canvas id="forecast-chart"></canvas></div>
            </div>
            <div class="flex justify-between items-center mb-3.5"><h2 class="text-on-surface text-[1.1rem] font-bold">Replenishment Recommendations</h2>
            <a href="${API.downloadUrl('/api/forecast/export-csv')}" class="btn-ghost text-sm">⬇ Export CSV</a></div>
            <div class="panel overflow-x-auto"><table class="w-full border-collapse"><thead><tr class="border-b border-outline-variant/[0.15]"><th class="text-left px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider font-medium">SKU & Product</th><th class="text-center px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider font-medium">Current Stock</th><th class="text-center px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider font-medium">7D Demand</th><th class="text-center px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider font-medium">Min/Max</th><th class="text-center px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider font-medium">Suggested Order</th><th class="text-center px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider font-medium">Action</th></tr></thead><tbody><tr class="border-b border-outline-variant/[0.08]">${repRows}</tr></tbody></table></div>
        </div>`;

        // Render forecast chart
        const allDates = [...chartData.hist_dates, ...chartData.fore_dates];
        const histData = [...chartData.hist_values, ...new Array(chartData.fore_dates.length).fill(null)];
        const foreData = [...new Array(chartData.hist_dates.length).fill(null), ...chartData.fore_base];
        const upperData = [...new Array(chartData.hist_dates.length).fill(null), ...chartData.fore_upper];
        const lowerData = [...new Array(chartData.hist_dates.length).fill(null), ...chartData.fore_lower];

        Charts.line('forecast-chart', allDates, [
            { label: 'Historical', data: histData, borderColor: '#bcc9ca', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
            { label: 'Upper', data: upperData, borderColor: 'transparent', backgroundColor: 'rgba(110,230,238,0.06)', fill: '+1', pointRadius: 0 },
            { label: 'Lower', data: lowerData, borderColor: 'transparent', pointRadius: 0 },
            { label: 'Forecast', data: foreData, borderColor: '#6ee6ee', borderWidth: 2.5, pointRadius: 0, tension: 0.3 },
        ], { scales: { x: { ticks: { maxTicksLimit: 10 } } } });
    }
};
