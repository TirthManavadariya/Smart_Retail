/** Shelf Optimizer Page */
const ShelfOptimizerPage = {
    async render(container) {
        const sid = App.storeId;
        const [results, topPerf] = await Promise.all([
            API.get('/api/optimizer/results', { store_id: sid }),
            API.get('/api/optimizer/top-performers', { store_id: sid }),
        ]);
        if (!results.available) {
            container.innerHTML = `<div class="fade-in">${KpiCard.renderPageHeader('AI OPTIMIZATION', 'Shelf Arrangement Optimizer')}<div class="panel p-10 text-center"><div class="text-4xl mb-3">🛒</div><div class="text-on-surface text-[1.1rem] font-bold mb-1.5">No Optimized Planogram Found</div><div class="text-on-surface-variant text-[0.82rem] mb-5">Run the optimizer to generate results for this store.</div><button id="run-opt" class="btn-primary">Run Optimizer Now</button></div></div>`;
            document.getElementById('run-opt')?.addEventListener('click', async () => {
                document.getElementById('run-opt').textContent = 'Running...';
                try { await API.post('/api/optimizer/run?store_id=' + sid); location.reload(); } catch (e) { alert('Error: ' + e.message); }
            });
            return;
        }
        const k = results.kpis, t = results.tiers;
        const tierColors = { Premium: '#6ee6ee', Standard: '#cecb5b', Economy: '#69758a' };
        const topRows = topPerf.map(r => {
            const c = tierColors[r.tier]; const bg = c + '1e';
            return `<td class="px-2.5 py-2"><div class="text-on-surface text-[0.78rem] font-semibold">${r.product_name}</div><div class="text-outline text-[0.65rem]">${r.sku_id}</div></td><td class="px-2.5 py-2 text-center"><span style="color:${c};background:${bg}" class="text-[0.7rem] font-bold px-2 py-0.5 rounded">${r.tier}</span></td><td class="px-2.5 py-2 text-right text-on-surface text-[0.78rem] font-semibold">${r.score}</td><td class="px-2.5 py-2 text-right text-on-surface-variant text-[0.78rem]">$${r.revenue.toLocaleString()}</td>`;
        }).join('</tr><tr class="border-b border-outline-variant/[0.08]">');

        container.innerHTML = `<div class="fade-in">
            ${KpiCard.renderPageHeader('AI OPTIMIZATION', 'Shelf Arrangement Optimizer')}
            ${KpiCard.renderRow([
                { label: 'Revenue Lift', value: '+' + k.lift_pct + '%', chip_text: '$' + k.lift_value.toLocaleString() + '/wk', icon: '📈', accent: k.lift_pct > 0 ? 'primary' : 'error' },
                { label: 'SKUs Placed', value: k.filled + '/' + k.total_slots, chip_text: Math.round(k.filled/k.total_slots*100) + '% fill', icon: '📦', accent: 'primary' },
                { label: 'Eye-Level Premium', value: k.premium_eye + '/' + k.premium_count, chip_text: k.eye_pct + '% coverage', icon: '👁', accent: k.eye_pct >= 70 ? 'primary' : 'error' },
                { label: 'Weekly Revenue (Opt.)', value: '$' + k.optimized_rev.toLocaleString(), chip_text: 'vs $' + k.baseline_rev.toLocaleString(), icon: '💰', accent: 'secondary' },
            ])}
            <div class="h-6"></div>
            <div class="grid grid-cols-5 gap-4">
                <div class="col-span-2">
                    ${KpiCard.renderSectionHeader('SKU Tier Breakdown', t.total + ' products scored')}
                    <div class="panel p-4">${[['Premium', t.premium, '#6ee6ee', 'Top 20% — eye-level'], ['Standard', t.standard, '#cecb5b', 'Mid 30% — standard'], ['Economy', t.economy, '#69758a', 'Bottom 50% — bottom/top']].map(([n, c, col, desc]) => `<div class="mb-3.5"><div class="flex justify-between items-center mb-1"><div><span class="inline-block w-2 h-2 rounded-full mr-1.5" style="background:${col}"></span><span class="text-on-surface text-[0.82rem] font-semibold">${n}</span><span class="text-outline text-[0.7rem] ml-1.5">${desc}</span></div><span style="color:${col}" class="text-[0.85rem] font-bold">${c} SKUs</span></div><div class="compliance-bar-track"><div class="compliance-bar-fill" style="width:${c/t.total*100}%;background:${col}"></div></div></div>`).join('')}</div>
                    <div class="h-4"></div>
                    ${KpiCard.renderSectionHeader('Top 10 Performers', 'By composite score')}
                    <div class="panel overflow-x-auto"><table class="w-full border-collapse"><thead><tr class="border-b border-outline-variant/[0.15]"><th class="text-left px-2.5 py-2.5 text-on-surface-variant text-[0.65rem] uppercase tracking-wider">Product</th><th class="text-center px-2.5 py-2.5 text-on-surface-variant text-[0.65rem] uppercase tracking-wider">Tier</th><th class="text-right px-2.5 py-2.5 text-on-surface-variant text-[0.65rem] uppercase tracking-wider">Score</th><th class="text-right px-2.5 py-2.5 text-on-surface-variant text-[0.65rem] uppercase tracking-wider">Revenue</th></tr></thead><tbody><tr class="border-b border-outline-variant/[0.08]">${topRows}</tr></tbody></table></div>
                </div>
                <div class="col-span-3">
                    ${KpiCard.renderSectionHeader('Optimized Planogram Layout')}
                    <div class="panel p-4" id="planogram-grid"><div class="text-center text-outline py-8">Select an aisle to view layout</div></div>
                </div>
            </div>
            <div class="h-6"></div>
            <div class="flex gap-3">
                <a href="${API.downloadUrl('/api/optimizer/download-planogram', { store_id: sid })}" class="btn-ghost text-sm">📥 Download Planogram JSON</a>
            </div>
        </div>`;
    }
};
