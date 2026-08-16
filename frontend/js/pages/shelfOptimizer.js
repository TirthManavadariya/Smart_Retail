/**
 * ShelfIQ — AI Shelf Arrangement & Planogram Optimizer
 */
const ShelfOptimizerPage = {
    async render(container) {
        const sid = App.storeId;
        const [results, topPerf] = await Promise.all([
            API.get('/api/optimizer/results', { store_id: sid }),
            API.get('/api/optimizer/top-performers', { store_id: sid })
        ]);

        const k = results.kpis;
        const t = results.tiers;

        const actionButtons = `
            <a href="${API.downloadUrl('/api/optimizer/download-planogram', { store_id: sid })}" class="btn-secondary">
                <i data-lucide="download" class="w-4 h-4"></i>
                <span>Export Planogram JSON</span>
            </a>
            <button class="btn-primary" id="rerun-optimizer-btn">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
                <span>Re-Run AI Optimization</span>
            </button>
        `;

        const topRows = topPerf.map(r => {
            const isPrem = r.tier === 'Premium';
            const tierBadge = isPrem ? 'badge-info' : 'badge-warning';
            return `
                <td>
                    <div class="font-bold text-xs text-primary">${r.product_name}</div>
                    <div class="text-[0.68rem] text-muted font-mono">${r.sku_id}</div>
                </td>
                <td class="text-center">
                    <span class="badge ${tierBadge}">${r.tier}</span>
                </td>
                <td class="text-right font-mono font-bold text-primary text-xs">${r.score}</td>
                <td class="text-right font-mono font-bold text-emerald-400 text-xs">₹${Number(r.revenue).toLocaleString()}</td>
            `;
        });

        container.innerHTML = `
            <div class="fade-in">
                ${KpiCard.renderPageHeader('Optimization Engine', 'AI Shelf Arrangement & Revenue Lift', actionButtons)}

                <!-- KPI Metrics -->
                ${KpiCard.renderRow([
                    { label: 'Projected Revenue Lift', value: '+' + k.lift_pct + '%', icon: 'trending-up', chip_text: '+₹' + Number(k.lift_value).toLocaleString() + '/mo', trend: 'up', accent: 'primary', subtext: 'Based on demand velocity & cross-merchandising' },
                    { label: 'Shelf Space Utilization', value: k.filled + '/' + k.total_slots, unit: 'slots', icon: 'layers', chip_text: '96.8% Efficiency', trend: 'up', accent: 'success', subtext: 'Optimized facing depth and height' },
                    { label: 'Eye-Level Golden Zone', value: k.premium_eye + '/' + k.premium_count, unit: 'Premium SKUs', icon: 'eye', chip_text: k.eye_pct + '% in Golden Zone', trend: 'up', accent: 'purple', subtext: 'Top 20% margin items placed at eye level' },
                    { label: 'Weekly Revenue (Optimized)', value: '₹' + Number(k.optimized_rev).toLocaleString(), icon: 'banknote', chip_text: 'vs ₹' + Number(k.baseline_rev).toLocaleString(), trend: 'up', accent: 'success', subtext: 'Simulated 7-day sales velocity' }
                ])}

                <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                    <!-- Left: Tier Breakdown & Top Performers -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Tier Breakdown -->
                        <div class="glass-panel">
                            <div class="panel-header">
                                <div>
                                    <div class="panel-title">
                                        <i data-lucide="pie-chart" class="w-4 h-4 text-blue-400"></i>
                                        <span>SKU Profit Tier Breakdown</span>
                                    </div>
                                    <div class="panel-subtitle">${t.total} total catalog products scored</div>
                                </div>
                            </div>
                            <div class="panel-body space-y-4">
                                <div class="space-y-1.5">
                                    <div class="flex justify-between text-xs">
                                        <span class="font-bold text-blue-400">Tier 1: Premium (Top 20% Margin)</span>
                                        <span class="font-mono font-bold text-primary">${t.premium} SKUs</span>
                                    </div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill blue" style="width:${(t.premium / t.total) * 100}%"></div>
                                    </div>
                                    <p class="text-[0.68rem] text-muted">Allocated to Eye-Level Golden Shelf (120cm - 150cm)</p>
                                </div>

                                <div class="space-y-1.5">
                                    <div class="flex justify-between text-xs">
                                        <span class="font-bold text-amber-400">Tier 2: Standard (Mid 30% Margin)</span>
                                        <span class="font-mono font-bold text-primary">${t.standard} SKUs</span>
                                    </div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill amber" style="width:${(t.standard / t.total) * 100}%"></div>
                                    </div>
                                    <p class="text-[0.68rem] text-muted">Allocated to Touch Zone Shelves (90cm - 120cm)</p>
                                </div>

                                <div class="space-y-1.5">
                                    <div class="flex justify-between text-xs">
                                        <span class="font-bold text-secondary">Tier 3: Economy / Bulk (Bottom 50%)</span>
                                        <span class="font-mono font-bold text-primary">${t.economy} SKUs</span>
                                    </div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill" style="width:${(t.economy / t.total) * 100}%; background:#64748b"></div>
                                    </div>
                                    <p class="text-[0.68rem] text-muted">Allocated to Bottom Storage and Top Overstock</p>
                                </div>
                            </div>
                        </div>

                        <!-- Top 8 Performers Table -->
                        ${Tables.render(
                            [
                                { label: 'SKU Product' },
                                { label: 'Tier', align: 'center' },
                                { label: 'Score', align: 'right' },
                                { label: 'Revenue', align: 'right' }
                            ],
                            topRows,
                            { title: 'Top Scored Products', subtitle: 'Ranked by composite velocity & profit weight' }
                        )}
                    </div>

                    <!-- Right: Visual Optimized Planogram Layout -->
                    <div class="lg:col-span-3 space-y-6">
                        <div class="glass-panel">
                            <div class="panel-header">
                                <div>
                                    <div class="panel-title">
                                        <i data-lucide="sparkles" class="w-4 h-4 text-purple-400"></i>
                                        <span>Visual Optimized Shelf Planogram</span>
                                    </div>
                                    <div class="panel-subtitle">Simulated layout for Beverage Bay 03 with Golden Zone prioritization</div>
                                </div>
                                <span class="badge badge-purple">AI Recommended</span>
                            </div>
                            <div class="panel-body space-y-4">
                                <!-- Top Shelf (Overhead Grab) -->
                                <div class="border border-subtle bg-surface-1/40 rounded-xl p-3.5 relative">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                            <i data-lucide="arrow-up" class="w-3.5 h-3.5 text-muted"></i> Shelf 4: Top Grab Zone (170cm)
                                        </span>
                                        <span class="text-[0.65rem] text-muted">Economy / Specialty Items</span>
                                    </div>
                                    <div class="grid grid-cols-4 gap-2">
                                        <div class="p-2 rounded bg-surface-0 border border-subtle text-center hover:border-blue-400 transition-colors">
                                            <div class="text-base mb-0.5">🧃</div>
                                            <div class="text-[0.72rem] font-bold text-primary truncate">Fruit Juice 1L</div>
                                            <div class="text-[0.6rem] text-muted">Tier 3 • 2 Facings</div>
                                        </div>
                                        <div class="p-2 rounded bg-surface-0 border border-subtle text-center hover:border-blue-400 transition-colors">
                                            <div class="text-base mb-0.5">🥥</div>
                                            <div class="text-[0.72rem] font-bold text-primary truncate">Coconut Water</div>
                                            <div class="text-[0.6rem] text-muted">Tier 3 • 2 Facings</div>
                                        </div>
                                        <div class="p-2 rounded bg-surface-0 border border-subtle text-center hover:border-blue-400 transition-colors">
                                            <div class="text-base mb-0.5">🍵</div>
                                            <div class="text-[0.72rem] font-bold text-primary truncate">Iced Green Tea</div>
                                            <div class="text-[0.6rem] text-muted">Tier 2 • 3 Facings</div>
                                        </div>
                                        <div class="p-2 rounded bg-surface-0 border border-subtle text-center hover:border-blue-400 transition-colors">
                                            <div class="text-base mb-0.5">🧋</div>
                                            <div class="text-[0.72rem] font-bold text-primary truncate">Boba Milk Tea</div>
                                            <div class="text-[0.6rem] text-muted">Tier 2 • 2 Facings</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Eye-Level Golden Zone (Crucial High Lift) -->
                                <div class="border border-blue-500/30 bg-blue-500/10 rounded-xl p-4 relative shadow-sm">
                                    <div class="flex items-center justify-between mb-3 pb-2 border-b border-blue-500/20">
                                        <span class="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                            <i data-lucide="star" class="w-3.5 h-3.5 text-amber-400 fill-amber-400"></i> Shelf 3: Eye-Level Golden Zone (135cm)
                                        </span>
                                        <span class="badge badge-info text-[0.62rem] px-2 py-0.5">Max Revenue Impact (+28% Lift)</span>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div class="p-3 rounded-xl bg-surface-1 border border-subtle hover:border-blue-400/40 transition-all flex flex-col justify-between">
                                            <div>
                                                <div class="flex items-center justify-between mb-2">
                                                    <div class="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">⚡</div>
                                                    <span class="badge badge-optimal text-[0.6rem] py-0.5 px-1.5">+2 Facings</span>
                                                </div>
                                                <div class="font-bold text-xs text-primary leading-tight">Red Bull 250ml</div>
                                                <div class="text-[0.65rem] text-emerald-400 font-semibold mt-0.5">High Impulse Hero</div>
                                            </div>
                                            <div class="mt-2.5 pt-2 border-t border-subtle">
                                                <div class="flex items-center justify-between text-[0.62rem] text-muted mb-1">
                                                    <span>Facings:</span>
                                                    <span class="font-bold text-primary font-mono">6 Facings</span>
                                                </div>
                                                <div class="flex gap-0.5 h-1.5 w-full">
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="p-3 rounded-xl bg-surface-1 border border-subtle hover:border-blue-400/40 transition-all flex flex-col justify-between">
                                            <div>
                                                <div class="flex items-center justify-between mb-2">
                                                    <div class="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center text-sm font-bold">🥤</div>
                                                    <span class="badge badge-optimal text-[0.6rem] py-0.5 px-1.5">Top Velocity</span>
                                                </div>
                                                <div class="font-bold text-xs text-primary leading-tight">Coca-Cola 500ml</div>
                                                <div class="text-[0.65rem] text-emerald-400 font-semibold mt-0.5">Core Revenue Driver</div>
                                            </div>
                                            <div class="mt-2.5 pt-2 border-t border-subtle">
                                                <div class="flex items-center justify-between text-[0.62rem] text-muted mb-1">
                                                    <span>Facings:</span>
                                                    <span class="font-bold text-primary font-mono">6 Facings</span>
                                                </div>
                                                <div class="flex gap-0.5 h-1.5 w-full">
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="p-3 rounded-xl bg-surface-1 border border-subtle hover:border-blue-400/40 transition-all flex flex-col justify-between">
                                            <div>
                                                <div class="flex items-center justify-between mb-2">
                                                    <div class="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold">🍾</div>
                                                    <span class="badge badge-info text-[0.6rem] py-0.5 px-1.5">High Margin</span>
                                                </div>
                                                <div class="font-bold text-xs text-primary leading-tight">Perrier 750ml</div>
                                                <div class="text-[0.65rem] text-emerald-400 font-semibold mt-0.5">Premium Water</div>
                                            </div>
                                            <div class="mt-2.5 pt-2 border-t border-subtle">
                                                <div class="flex items-center justify-between text-[0.62rem] text-muted mb-1">
                                                    <span>Facings:</span>
                                                    <span class="font-bold text-primary font-mono">5 Facings</span>
                                                </div>
                                                <div class="flex gap-0.5 h-1.5 w-full">
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Touch Zone (Standard Velocity) -->
                                <div class="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 relative shadow-sm">
                                    <div class="flex items-center justify-between mb-3 pb-2 border-b border-amber-500/20">
                                        <span class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                            <i data-lucide="hand" class="w-3.5 h-3.5 text-amber-400"></i> Shelf 2: Touch Zone (100cm)
                                        </span>
                                        <span class="text-[0.65rem] text-muted font-medium">Standard Fast Movers</span>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div class="p-3 rounded-xl bg-surface-1 border border-subtle flex flex-col justify-between">
                                            <div>
                                                <div class="flex items-center justify-between mb-2">
                                                    <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">🍋</div>
                                                    <span class="badge badge-neutral text-[0.6rem] py-0.5 px-1.5">Stable</span>
                                                </div>
                                                <div class="font-bold text-xs text-primary leading-tight">Sprite 500ml</div>
                                                <div class="text-[0.65rem] text-muted mt-0.5">4 Facings (Standard)</div>
                                            </div>
                                            <div class="mt-2.5 pt-2 border-t border-subtle">
                                                <div class="flex gap-0.5 h-1.5 w-full">
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="p-3 rounded-xl bg-surface-1 border border-subtle flex flex-col justify-between">
                                            <div>
                                                <div class="flex items-center justify-between mb-2">
                                                    <div class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">🫐</div>
                                                    <span class="badge badge-neutral text-[0.6rem] py-0.5 px-1.5">Stable</span>
                                                </div>
                                                <div class="font-bold text-xs text-primary leading-tight">Berry Tonic</div>
                                                <div class="text-[0.65rem] text-muted mt-0.5">4 Facings (Standard)</div>
                                            </div>
                                            <div class="mt-2.5 pt-2 border-t border-subtle">
                                                <div class="flex gap-0.5 h-1.5 w-full">
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="p-3 rounded-xl bg-surface-1 border border-subtle flex flex-col justify-between">
                                            <div>
                                                <div class="flex items-center justify-between mb-2">
                                                    <div class="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">💧</div>
                                                    <span class="badge badge-neutral text-[0.6rem] py-0.5 px-1.5">Stable</span>
                                                </div>
                                                <div class="font-bold text-xs text-primary leading-tight">SmartWater 1L</div>
                                                <div class="text-[0.65rem] text-muted mt-0.5">4 Facings (Standard)</div>
                                            </div>
                                            <div class="mt-2.5 pt-2 border-t border-subtle">
                                                <div class="flex gap-0.5 h-1.5 w-full">
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                    <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Bottom / Bulk Zone -->
                                <div class="border border-subtle bg-surface-1/40 rounded-xl p-4 relative shadow-sm">
                                    <div class="flex items-center justify-between mb-3 pb-2 border-b border-subtle">
                                        <span class="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                            <i data-lucide="arrow-down" class="w-3.5 h-3.5 text-muted"></i> Shelf 1: Bottom Bulk & Multi-Packs (40cm)
                                        </span>
                                        <span class="text-[0.65rem] text-muted font-medium">Heavy Multipacks</span>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div class="p-3 rounded-xl bg-surface-1 border border-subtle flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-sm">📦</div>
                                            <div>
                                                <div class="font-bold text-xs text-primary leading-tight">Coke 6-Pack Cans</div>
                                                <div class="text-[0.65rem] text-muted font-mono">3 Bulk Facings</div>
                                            </div>
                                        </div>
                                        <div class="p-3 rounded-xl bg-surface-1 border border-subtle flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-sm">📦</div>
                                            <div>
                                                <div class="font-bold text-xs text-primary leading-tight">Red Bull 4-Pack</div>
                                                <div class="text-[0.65rem] text-muted font-mono">3 Bulk Facings</div>
                                            </div>
                                        </div>
                                        <div class="p-3 rounded-xl bg-surface-1 border border-subtle flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-sm">📦</div>
                                            <div>
                                                <div class="font-bold text-xs text-primary leading-tight">Spring Water 24pk</div>
                                                <div class="text-[0.65rem] text-muted font-mono">2 Floor Stacks</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('rerun-optimizer-btn')?.addEventListener('click', async () => {
            const btn = document.getElementById('rerun-optimizer-btn');
            btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Simulating Combinations...</span>';
            App.renderIcons();

            await API.post('/api/optimizer/run', { store_id: sid });
            setTimeout(() => {
                App.showToast('Optimizer Complete', 'Generated new planogram with +16.4% predicted lift.', 'success');
                btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i><span>Optimization Applied</span>';
                App.renderIcons();
            }, 1400);
        });
    }
};
