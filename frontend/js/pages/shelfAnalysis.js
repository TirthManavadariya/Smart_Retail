/**
 * ShelfIQ — Shelf Intelligence & SKU Discrepancy Analysis
 */
const ShelfAnalysisPage = {
    async render(container) {
        container.innerHTML = `
            <div class="fade-in">
                <!-- Breadcrumbs & Header -->
                <div class="flex items-center gap-2 text-xs text-muted mb-2">
                    <a href="#/dashboard" class="hover:text-primary transition-colors">Store #01</a>
                    <span>›</span>
                    <span>Aisle 01 (Beverages)</span>
                    <span>›</span>
                    <span class="text-primary font-semibold">Bay 3: Energy & Cold Tonics</span>
                </div>

                ${KpiCard.renderPageHeader('Discrepancy Intelligence', 'Shelf Analysis: Bay 3 Detail', `
                    <button class="btn-primary" id="trigger-rescan-btn">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                        <span>Re-Verify Bay</span>
                    </button>
                `)}

                <!-- Side-by-Side Comparison Container -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Expected Planogram Blueprint -->
                    <div class="glass-panel border-blue-500/30 shadow-lg">
                        <div class="panel-header bg-surface-1/90">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                                    <i data-lucide="layout-template" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <div class="panel-title text-sm">Target Planogram Blueprint</div>
                                    <div class="panel-subtitle text-xs">Official Merchandising Spec (V3.1 • Bay 3)</div>
                                </div>
                            </div>
                            <span class="badge badge-info text-[0.65rem] px-2.5 py-0.5">Reference Standard</span>
                        </div>
                        <div class="panel-body p-4 space-y-4">
                            <!-- Shelf Tier 1 Blueprint -->
                            <div class="bg-surface-0/90 border border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
                                <div class="flex items-center justify-between mb-3 pb-2 border-b border-subtle">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono text-[0.68rem] font-bold uppercase">
                                            Shelf 1: Eye-Level High Velocity
                                        </span>
                                    </div>
                                    <span class="text-[0.68rem] text-muted font-medium">14 / 14 Facings Allocated</span>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <!-- SKU 1: Coca-Cola -->
                                    <div class="p-3 rounded-xl bg-surface-1 border border-subtle hover:border-blue-400/40 transition-all flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center text-base shadow-sm">
                                                    🥤
                                                </div>
                                                <span class="font-mono text-[0.65rem] bg-surface-2 px-1.5 py-0.5 rounded text-muted font-semibold">SKU-14829</span>
                                            </div>
                                            <div class="font-bold text-xs text-primary leading-tight">Coca-Cola 500ml</div>
                                            <div class="text-[0.68rem] text-emerald-400 font-semibold mt-0.5">₹40.00 / unit</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-subtle">
                                            <div class="flex items-center justify-between text-[0.65rem] text-muted mb-1">
                                                <span>Facing Allocation:</span>
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

                                    <!-- SKU 2: Sprite Zero -->
                                    <div class="p-3 rounded-xl bg-surface-1 border border-subtle hover:border-blue-400/40 transition-all flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-base shadow-sm">
                                                    🍋
                                                </div>
                                                <span class="font-mono text-[0.65rem] bg-surface-2 px-1.5 py-0.5 rounded text-muted font-semibold">SKU-09412</span>
                                            </div>
                                            <div class="font-bold text-xs text-primary leading-tight">Sprite Zero 500ml</div>
                                            <div class="text-[0.68rem] text-emerald-400 font-semibold mt-0.5">₹40.00 / unit</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-subtle">
                                            <div class="flex items-center justify-between text-[0.65rem] text-muted mb-1">
                                                <span>Facing Allocation:</span>
                                                <span class="font-bold text-primary font-mono">4 Facings</span>
                                            </div>
                                            <div class="flex gap-0.5 h-1.5 w-full">
                                                <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SKU 3: Red Bull -->
                                    <div class="p-3 rounded-xl bg-surface-1 border border-subtle hover:border-blue-400/40 transition-all flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-base shadow-sm">
                                                    ⚡
                                                </div>
                                                <span class="font-mono text-[0.65rem] bg-surface-2 px-1.5 py-0.5 rounded text-muted font-semibold">SKU-10824</span>
                                            </div>
                                            <div class="font-bold text-xs text-primary leading-tight">Red Bull 250ml</div>
                                            <div class="text-[0.68rem] text-emerald-400 font-semibold mt-0.5">₹125.00 / unit</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-subtle">
                                            <div class="flex items-center justify-between text-[0.65rem] text-muted mb-1">
                                                <span>Facing Allocation:</span>
                                                <span class="font-bold text-primary font-mono">4 Facings</span>
                                            </div>
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

                            <!-- Shelf Tier 2 Blueprint -->
                            <div class="bg-surface-0/90 border border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
                                <div class="flex items-center justify-between mb-3 pb-2 border-b border-subtle">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 rounded bg-slate-700/40 border border-slate-600/40 text-slate-300 font-mono text-[0.68rem] font-bold uppercase">
                                            Shelf 2: Standard Capacity Hydration
                                        </span>
                                    </div>
                                    <span class="text-[0.68rem] text-muted font-medium">13 / 13 Facings Allocated</span>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <!-- SKU 4: Perrier -->
                                    <div class="p-3 rounded-xl bg-surface-1 border border-subtle hover:border-blue-400/40 transition-all flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center text-base shadow-sm">
                                                    🍾
                                                </div>
                                                <span class="font-mono text-[0.65rem] bg-surface-2 px-1.5 py-0.5 rounded text-muted font-semibold">SKU-55219</span>
                                            </div>
                                            <div class="font-bold text-xs text-primary leading-tight">Perrier 750ml</div>
                                            <div class="text-[0.68rem] text-emerald-400 font-semibold mt-0.5">₹99.00 / unit</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-subtle">
                                            <div class="flex items-center justify-between text-[0.65rem] text-muted mb-1">
                                                <span>Facing Allocation:</span>
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

                                    <!-- SKU 5: Sparkling Berry -->
                                    <div class="p-3 rounded-xl bg-surface-1 border border-subtle hover:border-blue-400/40 transition-all flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-base shadow-sm">
                                                    🫐
                                                </div>
                                                <span class="font-mono text-[0.65rem] bg-surface-2 px-1.5 py-0.5 rounded text-muted font-semibold">SKU-61033</span>
                                            </div>
                                            <div class="font-bold text-xs text-primary leading-tight">Sparkling Berry</div>
                                            <div class="text-[0.68rem] text-emerald-400 font-semibold mt-0.5">₹85.00 / unit</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-subtle">
                                            <div class="flex items-center justify-between text-[0.65rem] text-muted mb-1">
                                                <span>Facing Allocation:</span>
                                                <span class="font-bold text-primary font-mono">4 Facings</span>
                                            </div>
                                            <div class="flex gap-0.5 h-1.5 w-full">
                                                <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                                <div class="flex-1 bg-blue-400 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SKU 6: SmartWater -->
                                    <div class="p-3 rounded-xl bg-surface-1 border border-subtle hover:border-blue-400/40 transition-all flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-base shadow-sm">
                                                    💧
                                                </div>
                                                <span class="font-mono text-[0.65rem] bg-surface-2 px-1.5 py-0.5 rounded text-muted font-semibold">SKU-77210</span>
                                            </div>
                                            <div class="font-bold text-xs text-primary leading-tight">SmartWater 1L</div>
                                            <div class="text-[0.68rem] text-emerald-400 font-semibold mt-0.5">₹60.00 / unit</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-subtle">
                                            <div class="flex items-center justify-between text-[0.65rem] text-muted mb-1">
                                                <span>Facing Allocation:</span>
                                                <span class="font-bold text-primary font-mono">4 Facings</span>
                                            </div>
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
                        </div>
                    </div>

                    <!-- Detected Live Shelf State with Discrepancy Overlays -->
                    <div class="glass-panel border-emerald-500/30 shadow-lg">
                        <div class="panel-header bg-surface-1/90">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <i data-lucide="scan-line" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <div class="panel-title text-sm">Detected Shelf State (CAM-03)</div>
                                    <div class="panel-subtitle text-xs">Live Optical Inspection & Discrepancy Diagnostics</div>
                                </div>
                            </div>
                            <span class="badge badge-warning text-[0.65rem] px-2.5 py-0.5 flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> 2 Discrepancies
                            </span>
                        </div>
                        <div class="panel-body p-4 space-y-4">
                            <!-- Shelf Tier 1 Live Detections -->
                            <div class="bg-surface-0/90 border border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
                                <div class="flex items-center justify-between mb-3 pb-2 border-b border-subtle">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[0.68rem] font-bold uppercase">
                                            Shelf 1 Live Inspection
                                        </span>
                                    </div>
                                    <span class="text-[0.68rem] text-rose-400 font-bold">10 / 14 Facings Present</span>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <!-- Detected SKU 1: Coca-Cola (Match) -->
                                    <div class="p-3 rounded-xl bg-emerald-500/5 border-2 border-emerald-500/40 flex flex-col justify-between shadow-sm">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base">
                                                    🥤
                                                </div>
                                                <span class="badge badge-optimal text-[0.6rem] py-0.5 px-1.5">100% Match</span>
                                            </div>
                                            <div class="font-bold text-xs text-primary leading-tight">Coca-Cola 500ml</div>
                                            <div class="text-[0.65rem] text-muted font-mono mt-0.5">98.4% AI Conf</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-emerald-500/20">
                                            <div class="flex items-center justify-between text-[0.65rem] mb-1">
                                                <span class="text-secondary font-medium">Detection:</span>
                                                <span class="font-bold text-emerald-400 font-mono">6/6 Facings</span>
                                            </div>
                                            <div class="flex gap-0.5 h-1.5 w-full">
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Detected SKU 2: Sprite Zero (Match) -->
                                    <div class="p-3 rounded-xl bg-emerald-500/5 border-2 border-emerald-500/40 flex flex-col justify-between shadow-sm">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base">
                                                    🍋
                                                </div>
                                                <span class="badge badge-optimal text-[0.6rem] py-0.5 px-1.5">100% Match</span>
                                            </div>
                                            <div class="font-bold text-xs text-primary leading-tight">Sprite Zero 500ml</div>
                                            <div class="text-[0.65rem] text-muted font-mono mt-0.5">96.8% AI Conf</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-emerald-500/20">
                                            <div class="flex items-center justify-between text-[0.65rem] mb-1">
                                                <span class="text-secondary font-medium">Detection:</span>
                                                <span class="font-bold text-emerald-400 font-mono">4/4 Facings</span>
                                            </div>
                                            <div class="flex gap-0.5 h-1.5 w-full">
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Detected SKU 3: Red Bull (STOCKOUT GAP) -->
                                    <div class="p-3 rounded-xl bg-rose-500/10 border-2 border-dashed border-rose-500/80 flex flex-col justify-between shadow-sm relative animate-pulse">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-rose-500/25 text-rose-400 flex items-center justify-center text-base">
                                                    ⚠️
                                                </div>
                                                <span class="badge badge-critical text-[0.6rem] py-0.5 px-1.5">Stockout Gap</span>
                                            </div>
                                            <div class="font-bold text-xs text-rose-400 leading-tight">Red Bull 250ml</div>
                                            <div class="text-[0.68rem] text-rose-300 font-bold mt-0.5">Lost: ₹1,840/hr</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-rose-500/30">
                                            <div class="flex items-center justify-between text-[0.65rem] mb-1">
                                                <span class="text-rose-300 font-medium">Missing:</span>
                                                <span class="font-bold text-rose-400 font-mono">0/4 Facings</span>
                                            </div>
                                            <div class="flex gap-0.5 h-1.5 w-full">
                                                <div class="flex-1 bg-rose-500/30 rounded-sm border border-rose-500/60"></div>
                                                <div class="flex-1 bg-rose-500/30 rounded-sm border border-rose-500/60"></div>
                                                <div class="flex-1 bg-rose-500/30 rounded-sm border border-rose-500/60"></div>
                                                <div class="flex-1 bg-rose-500/30 rounded-sm border border-rose-500/60"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Shelf Tier 2 Live Detections -->
                            <div class="bg-surface-0/90 border border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
                                <div class="flex items-center justify-between mb-3 pb-2 border-b border-subtle">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[0.68rem] font-bold uppercase">
                                            Shelf 2 Live Inspection
                                        </span>
                                    </div>
                                    <span class="text-[0.68rem] text-amber-400 font-bold">13 / 13 (1 Misplaced)</span>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <!-- Detected SKU 4: Perrier (Price Mismatch Note) -->
                                    <div class="p-3 rounded-xl bg-purple-500/5 border-2 border-purple-500/40 flex flex-col justify-between shadow-sm">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-base">
                                                    🍾
                                                </div>
                                                <span class="badge badge-warning text-[0.6rem] py-0.5 px-1.5 text-purple-300 bg-purple-500/20 border-purple-500/40">Price Alert</span>
                                            </div>
                                            <div class="font-bold text-xs text-primary leading-tight">Perrier 750ml</div>
                                            <div class="text-[0.65rem] text-purple-300 font-bold mt-0.5">Tag: ₹99 vs POS: ₹129</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-purple-500/20">
                                            <div class="flex items-center justify-between text-[0.65rem] mb-1">
                                                <span class="text-secondary font-medium">Detection:</span>
                                                <span class="font-bold text-emerald-400 font-mono">5/5 Facings</span>
                                            </div>
                                            <div class="flex gap-0.5 h-1.5 w-full">
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Detected SKU 5: Sparkling Berry (Misplaced) -->
                                    <div class="p-3 rounded-xl bg-amber-500/10 border-2 border-amber-400/80 flex flex-col justify-between shadow-sm">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-amber-500/25 text-amber-400 flex items-center justify-center text-base">
                                                    🔄
                                                </div>
                                                <span class="badge badge-warning text-[0.6rem] py-0.5 px-1.5">Misplaced</span>
                                            </div>
                                            <div class="font-bold text-xs text-amber-400 leading-tight">Sparkling Berry</div>
                                            <div class="text-[0.65rem] text-amber-300 font-medium mt-0.5">Planogram Offset (Bay 2)</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-amber-500/30">
                                            <div class="flex items-center justify-between text-[0.65rem] mb-1">
                                                <span class="text-secondary font-medium">Status:</span>
                                                <span class="font-bold text-amber-400 font-mono">Realign Required</span>
                                            </div>
                                            <div class="flex gap-0.5 h-1.5 w-full">
                                                <div class="flex-1 bg-amber-400 rounded-sm"></div>
                                                <div class="flex-1 bg-amber-400 rounded-sm"></div>
                                                <div class="flex-1 bg-amber-400 rounded-sm"></div>
                                                <div class="flex-1 bg-amber-400 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Detected SKU 6: SmartWater (Match) -->
                                    <div class="p-3 rounded-xl bg-emerald-500/5 border-2 border-emerald-500/40 flex flex-col justify-between shadow-sm">
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base">
                                                    💧
                                                </div>
                                                <span class="badge badge-optimal text-[0.6rem] py-0.5 px-1.5">100% Match</span>
                                            </div>
                                            <div class="font-bold text-xs text-primary leading-tight">SmartWater 1L</div>
                                            <div class="text-[0.65rem] text-muted font-mono mt-0.5">97.5% AI Conf</div>
                                        </div>
                                        <div class="mt-3 pt-2 border-t border-emerald-500/20">
                                            <div class="flex items-center justify-between text-[0.65rem] mb-1">
                                                <span class="text-secondary font-medium">Detection:</span>
                                                <span class="font-bold text-emerald-400 font-mono">4/4 Facings</span>
                                            </div>
                                            <div class="flex gap-0.5 h-1.5 w-full">
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                                <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Computer Vision Hardware & Performance Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="glass-panel p-4 flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
                            <i data-lucide="zap" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <div class="text-xs text-muted">Inference Latency</div>
                            <div class="text-lg font-black text-primary">22 ms</div>
                            <div class="text-[0.7rem] text-emerald-400">Edge TensorRT Engine</div>
                        </div>
                    </div>

                    <div class="glass-panel p-4 flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
                            <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <div class="text-xs text-muted">Model Confidence</div>
                            <div class="text-lg font-black text-emerald-400">98.6%</div>
                            <div class="text-[0.7rem] text-muted">Trained on SKU-110K</div>
                        </div>
                    </div>

                    <div class="glass-panel p-4 flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl">
                            <i data-lucide="maximize" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <div class="text-xs text-muted">Monitored Bay Area</div>
                            <div class="text-lg font-black text-primary">16.4 sq.m</div>
                            <div class="text-[0.7rem] text-muted">Overhead 4K Aperture</div>
                        </div>
                    </div>
                </div>

                <!-- SKU Detail Table with Live Replenish Action -->
                <div class="mb-4">
                    ${KpiCard.renderSectionHeader('SKU-Level Facings & Price Integrity Log', 'Real-time OCR price tag and stock monitoring')}
                    <div id="sku-table-container"></div>
                </div>
            </div>
        `;

        _renderSkuTable(document.getElementById('sku-table-container'));
        if (window.lucide) lucide.createIcons();

        document.getElementById('trigger-rescan-btn')?.addEventListener('click', () => {
            App.showToast('Verifying Bay 3', 'Running optical inspection algorithm on CAM-03...', 'info');
            setTimeout(() => {
                App.showToast('Verification Done', 'Bay 3 scanned. 1 Stockout gap remains unresolved.', 'warning');
            }, 1200);
        });
    }
};

function _renderSkuTable(container) {
    const products = [
        { name: 'Coca-Cola 500ml Bottle', sku: 'SKU-14829', exp: 6, det: 6, status: 'IN STOCK', statusClass: 'badge-optimal', price: 'Match (₹40)', priceClass: 'text-emerald-400', action: 'none' },
        { name: 'Sprite Zero Sugar 500ml', sku: 'SKU-09412', exp: 4, det: 4, status: 'IN STOCK', statusClass: 'badge-optimal', price: 'Match (₹40)', priceClass: 'text-emerald-400', action: 'none' },
        { name: 'Red Bull Energy 250ml', sku: 'SKU-10824', exp: 4, det: 0, status: 'OUT OF STOCK', statusClass: 'badge-critical', price: 'N/A', priceClass: 'text-muted', action: 'replenish' },
        { name: 'Perrier Sparkling Water 750ml', sku: 'SKU-55219', exp: 5, det: 5, status: 'IN STOCK', statusClass: 'badge-optimal', price: 'Mismatch (Tag: ₹99 / POS: ₹129)', priceClass: 'text-rose-400 font-bold', action: 'fix_price' },
        { name: 'Sparkling Berry Tonic 350ml', sku: 'SKU-61033', exp: 4, det: 4, status: 'MISPLACED', statusClass: 'badge-warning', price: 'Match (₹85)', priceClass: 'text-emerald-400', action: 'realign' },
        { name: 'SmartWater Electrolyte 1L', sku: 'SKU-77210', exp: 4, det: 4, status: 'IN STOCK', statusClass: 'badge-optimal', price: 'Match (₹60)', priceClass: 'text-emerald-400', action: 'none' }
    ];

    const rows = products.map(p => {
        let actionBtn = '<span class="text-xs text-muted">—</span>';
        if (p.action === 'replenish') {
            actionBtn = `<button class="btn-primary py-1 px-2.5 text-xs replenish-btn" data-sku="${p.sku}" data-name="${p.name}"><i data-lucide="package-plus" class="w-3 h-3"></i> Restock 4 Units</button>`;
        } else if (p.action === 'fix_price') {
            actionBtn = `<button class="btn-secondary py-1 px-2.5 text-xs price-btn" data-sku="${p.sku}" data-name="${p.name}"><i data-lucide="tag" class="w-3 h-3"></i> Update ESL</button>`;
        } else if (p.action === 'realign') {
            actionBtn = `<button class="btn-ghost py-1 px-2.5 text-xs align-btn" data-sku="${p.sku}" data-name="${p.name}"><i data-lucide="move" class="w-3 h-3"></i> Realign Slot</button>`;
        }

        return `
            <td>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-sm">📦</div>
                    <div>
                        <div class="font-bold text-xs text-primary">${p.name}</div>
                        <div class="text-[0.68rem] text-muted font-mono">${p.sku}</div>
                    </div>
                </div>
            </td>
            <td class="text-center font-mono text-xs">
                <span>${p.exp}</span> / <span class="font-bold ${p.det === 0 ? 'text-rose-400' : 'text-emerald-400'}">${p.det}</span>
            </td>
            <td class="text-center">
                <span class="badge ${p.statusClass}">${p.status}</span>
            </td>
            <td class="text-center text-xs ${p.priceClass}">
                ${p.price}
            </td>
            <td class="text-center">
                ${actionBtn}
            </td>
        `;
    });

    container.innerHTML = Tables.render(
        [
            { label: 'Product Name / SKU' },
            { label: 'Expected vs Detected', align: 'center' },
            { label: 'Shelf Stock Status', align: 'center' },
            { label: 'OCR Price Integrity', align: 'center' },
            { label: 'Action Trigger', align: 'center' }
        ],
        rows
    );

    // Wire actions
    container.querySelectorAll('.replenish-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            App.showToast('Restock Dispatched', `Task generated for associate to restock ${name}`, 'success');
            btn.outerHTML = '<span class="text-xs text-emerald-400 font-semibold">✓ Dispatched</span>';
        });
    });

    container.querySelectorAll('.price-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            App.showToast('Price Tag Synchronized', `ESL digital label for ${name} updated to ₹129`, 'success');
            btn.outerHTML = '<span class="text-xs text-emerald-400 font-semibold">✓ Tag Synced</span>';
        });
    });

    container.querySelectorAll('.align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            App.showToast('Alignment Notified', 'Floor associate notified to adjust product facing.', 'info');
            btn.outerHTML = '<span class="text-xs text-emerald-400 font-semibold">✓ Task Assigned</span>';
        });
    });
}
