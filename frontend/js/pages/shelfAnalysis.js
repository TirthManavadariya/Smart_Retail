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
                    <div class="blueprint-card-panel">
                        <!-- Blueprint Header Area -->
                        <div class="panel-header bg-surface-1/90 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner">
                                    <i data-lucide="layout-template" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <div class="panel-title text-sm font-extrabold text-slate-100 flex items-center gap-2">
                                        Target Planogram Blueprint
                                    </div>
                                    <div class="mt-1 flex items-center gap-2">
                                        <span class="blueprint-header-chip">
                                            <i data-lucide="file-check-2" class="w-3 h-3 text-blue-400"></i>
                                            Official Merchandising Spec (V3.1 • Bay 3)
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span class="badge badge-info text-[0.65rem] px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                                <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span> Reference Standard
                            </span>
                        </div>

                        <div class="panel-body p-4 space-y-5">
                            <!-- ═══════════════ SHELF LEVEL 1 ═══════════════ -->
                            <div class="blueprint-shelf-container">
                                <!-- Shelf 1 Header -->
                                <div class="blueprint-shelf-header">
                                    <div class="flex items-center gap-2">
                                        <span class="blueprint-shelf-tag">
                                            <i data-lucide="layers" class="w-3.5 h-3.5"></i>
                                            Shelf 1: Eye-Level High Velocity
                                        </span>
                                    </div>
                                    <span class="blueprint-alloc-badge">
                                        <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
                                        14/14 Facings Allocated
                                    </span>
                                </div>

                                <!-- Facing Distribution Track / Progress Track -->
                                <div class="blueprint-distribution-track">
                                    <div class="flex items-center justify-between text-[0.68rem] text-slate-400 font-semibold mb-1.5">
                                        <span class="flex items-center gap-1.5 text-slate-300">
                                            <i data-lucide="sliders-horizontal" class="w-3 h-3 text-sky-400"></i> Facing Distribution
                                        </span>
                                        <span class="font-mono text-slate-400">100% Shelf Capacity (14 Facings)</span>
                                    </div>
                                    <!-- Segmented Bar -->
                                    <div class="blueprint-segmented-bar" title="Shelf 1 Facings Distribution">
                                        <div class="blueprint-seg-item" style="width: 42.86%; background: linear-gradient(90deg, #0284c7, #38bdf8);" title="Coca-Cola (6 Facings • 42.9%)"></div>
                                        <div class="blueprint-seg-item" style="width: 28.57%; background: linear-gradient(90deg, #059669, #34d399);" title="Sprite Zero (4 Facings • 28.6%)"></div>
                                        <div class="blueprint-seg-item" style="width: 28.57%; background: linear-gradient(90deg, #d97706, #f59e0b);" title="Red Bull (4 Facings • 28.6%)"></div>
                                    </div>
                                    <!-- Legend Pills -->
                                    <div class="blueprint-track-legend">
                                        <div class="blueprint-legend-item">
                                            <span class="blueprint-legend-dot" style="background: #38bdf8;"></span>
                                            <span>Coca-Cola (6)</span>
                                        </div>
                                        <div class="blueprint-legend-item">
                                            <span class="blueprint-legend-dot" style="background: #34d399;"></span>
                                            <span>Sprite Zero (4)</span>
                                        </div>
                                        <div class="blueprint-legend-item">
                                            <span class="blueprint-legend-dot" style="background: #f59e0b;"></span>
                                            <span>Red Bull (4)</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Product Item Cards Grid -->
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <!-- SKU 1: Coca-Cola -->
                                    <div class="blueprint-product-card">
                                        <div>
                                            <div class="flex items-center justify-between mb-2.5">
                                                <div class="blueprint-icon-box bg-red-500/15 border border-red-500/30 text-red-400">
                                                    🥤
                                                </div>
                                                <span class="blueprint-sku-tag">SKU-14829</span>
                                            </div>
                                            <div class="blueprint-product-title">Coca-Cola 500ml</div>
                                            <div class="blueprint-price-tag mt-1">₹40.00 / unit</div>
                                        </div>
                                        <div class="pt-2.5 border-t border-slate-700/60">
                                            <div class="flex items-center justify-between text-[0.68rem] text-slate-400 mb-1">
                                                <span class="font-medium">Facing Allocation:</span>
                                                <span class="blueprint-facings-pill">6 Facings</span>
                                            </div>
                                            <div class="blueprint-mini-bar" title="6 Facings">
                                                <div class="blueprint-mini-segment" style="background: #38bdf8;"></div>
                                                <div class="blueprint-mini-segment" style="background: #38bdf8;"></div>
                                                <div class="blueprint-mini-segment" style="background: #38bdf8;"></div>
                                                <div class="blueprint-mini-segment" style="background: #38bdf8;"></div>
                                                <div class="blueprint-mini-segment" style="background: #38bdf8;"></div>
                                                <div class="blueprint-mini-segment" style="background: #38bdf8;"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SKU 2: Sprite Zero -->
                                    <div class="blueprint-product-card">
                                        <div>
                                            <div class="flex items-center justify-between mb-2.5">
                                                <div class="blueprint-icon-box bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                                    🍋
                                                </div>
                                                <span class="blueprint-sku-tag">SKU-09412</span>
                                            </div>
                                            <div class="blueprint-product-title">Sprite Zero 500ml</div>
                                            <div class="blueprint-price-tag mt-1">₹40.00 / unit</div>
                                        </div>
                                        <div class="pt-2.5 border-t border-slate-700/60">
                                            <div class="flex items-center justify-between text-[0.68rem] text-slate-400 mb-1">
                                                <span class="font-medium">Facing Allocation:</span>
                                                <span class="blueprint-facings-pill" style="color: #34d399; background: rgba(52, 211, 153, 0.12); border-color: rgba(52, 211, 153, 0.25);">4 Facings</span>
                                            </div>
                                            <div class="blueprint-mini-bar" title="4 Facings">
                                                <div class="blueprint-mini-segment" style="background: #34d399; box-shadow: 0 0 4px rgba(52, 211, 153, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #34d399; box-shadow: 0 0 4px rgba(52, 211, 153, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #34d399; box-shadow: 0 0 4px rgba(52, 211, 153, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #34d399; box-shadow: 0 0 4px rgba(52, 211, 153, 0.4);"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SKU 3: Red Bull -->
                                    <div class="blueprint-product-card">
                                        <div>
                                            <div class="flex items-center justify-between mb-2.5">
                                                <div class="blueprint-icon-box bg-amber-500/15 border border-amber-500/30 text-amber-400">
                                                    ⚡
                                                </div>
                                                <span class="blueprint-sku-tag">SKU-10824</span>
                                            </div>
                                            <div class="blueprint-product-title">Red Bull 250ml</div>
                                            <div class="blueprint-price-tag mt-1">₹125.00 / unit</div>
                                        </div>
                                        <div class="pt-2.5 border-t border-slate-700/60">
                                            <div class="flex items-center justify-between text-[0.68rem] text-slate-400 mb-1">
                                                <span class="font-medium">Facing Allocation:</span>
                                                <span class="blueprint-facings-pill" style="color: #f59e0b; background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.25);">4 Facings</span>
                                            </div>
                                            <div class="blueprint-mini-bar" title="4 Facings">
                                                <div class="blueprint-mini-segment" style="background: #f59e0b; box-shadow: 0 0 4px rgba(245, 158, 11, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #f59e0b; box-shadow: 0 0 4px rgba(245, 158, 11, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #f59e0b; box-shadow: 0 0 4px rgba(245, 158, 11, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #f59e0b; box-shadow: 0 0 4px rgba(245, 158, 11, 0.4);"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- ═══════════════ SHELF LEVEL 2 ═══════════════ -->
                            <div class="blueprint-shelf-container">
                                <!-- Shelf 2 Header -->
                                <div class="blueprint-shelf-header">
                                    <div class="flex items-center gap-2">
                                        <span class="blueprint-shelf-tag tier2">
                                            <i data-lucide="layers" class="w-3.5 h-3.5 text-slate-400"></i>
                                            Shelf 2: Standard Capacity Hydration
                                        </span>
                                    </div>
                                    <span class="blueprint-alloc-badge">
                                        <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
                                        13/13 Facings Allocated
                                    </span>
                                </div>

                                <!-- Facing Distribution Track / Progress Track -->
                                <div class="blueprint-distribution-track">
                                    <div class="flex items-center justify-between text-[0.68rem] text-slate-400 font-semibold mb-1.5">
                                        <span class="flex items-center gap-1.5 text-slate-300">
                                            <i data-lucide="sliders-horizontal" class="w-3 h-3 text-teal-400"></i> Facing Distribution
                                        </span>
                                        <span class="font-mono text-slate-400">100% Shelf Capacity (13 Facings)</span>
                                    </div>
                                    <!-- Segmented Bar -->
                                    <div class="blueprint-segmented-bar" title="Shelf 2 Facings Distribution">
                                        <div class="blueprint-seg-item" style="width: 38.46%; background: linear-gradient(90deg, #0d9488, #2dd4bf);" title="Perrier (5 Facings • 38.5%)"></div>
                                        <div class="blueprint-seg-item" style="width: 30.77%; background: linear-gradient(90deg, #9333ea, #c084fc);" title="Sparkling Berry (4 Facings • 30.8%)"></div>
                                        <div class="blueprint-seg-item" style="width: 30.77%; background: linear-gradient(90deg, #0284c7, #38bdf8);" title="SmartWater (4 Facings • 30.8%)"></div>
                                    </div>
                                    <!-- Legend Pills -->
                                    <div class="blueprint-track-legend">
                                        <div class="blueprint-legend-item">
                                            <span class="blueprint-legend-dot" style="background: #2dd4bf;"></span>
                                            <span>Perrier (5)</span>
                                        </div>
                                        <div class="blueprint-legend-item">
                                            <span class="blueprint-legend-dot" style="background: #c084fc;"></span>
                                            <span>Sparkling Berry (4)</span>
                                        </div>
                                        <div class="blueprint-legend-item">
                                            <span class="blueprint-legend-dot" style="background: #38bdf8;"></span>
                                            <span>SmartWater (4)</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Product Item Cards Grid -->
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <!-- SKU 4: Perrier -->
                                    <div class="blueprint-product-card">
                                        <div>
                                            <div class="flex items-center justify-between mb-2.5">
                                                <div class="blueprint-icon-box bg-teal-500/15 border border-teal-500/30 text-teal-400">
                                                    🍾
                                                </div>
                                                <span class="blueprint-sku-tag">SKU-55219</span>
                                            </div>
                                            <div class="blueprint-product-title">Perrier 750ml</div>
                                            <div class="blueprint-price-tag mt-1">₹99.00 / unit</div>
                                        </div>
                                        <div class="pt-2.5 border-t border-slate-700/60">
                                            <div class="flex items-center justify-between text-[0.68rem] text-slate-400 mb-1">
                                                <span class="font-medium">Facing Allocation:</span>
                                                <span class="blueprint-facings-pill" style="color: #2dd4bf; background: rgba(45, 212, 191, 0.12); border-color: rgba(45, 212, 191, 0.25);">5 Facings</span>
                                            </div>
                                            <div class="blueprint-mini-bar" title="5 Facings">
                                                <div class="blueprint-mini-segment" style="background: #2dd4bf; box-shadow: 0 0 4px rgba(45, 212, 191, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #2dd4bf; box-shadow: 0 0 4px rgba(45, 212, 191, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #2dd4bf; box-shadow: 0 0 4px rgba(45, 212, 191, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #2dd4bf; box-shadow: 0 0 4px rgba(45, 212, 191, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #2dd4bf; box-shadow: 0 0 4px rgba(45, 212, 191, 0.4);"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SKU 5: Sparkling Berry -->
                                    <div class="blueprint-product-card">
                                        <div>
                                            <div class="flex items-center justify-between mb-2.5">
                                                <div class="blueprint-icon-box bg-purple-500/15 border border-purple-500/30 text-purple-400">
                                                    🫐
                                                </div>
                                                <span class="blueprint-sku-tag">SKU-61033</span>
                                            </div>
                                            <div class="blueprint-product-title">Sparkling Berry</div>
                                            <div class="blueprint-price-tag mt-1">₹85.00 / unit</div>
                                        </div>
                                        <div class="pt-2.5 border-t border-slate-700/60">
                                            <div class="flex items-center justify-between text-[0.68rem] text-slate-400 mb-1">
                                                <span class="font-medium">Facing Allocation:</span>
                                                <span class="blueprint-facings-pill" style="color: #c084fc; background: rgba(192, 132, 252, 0.12); border-color: rgba(192, 132, 252, 0.25);">4 Facings</span>
                                            </div>
                                            <div class="blueprint-mini-bar" title="4 Facings">
                                                <div class="blueprint-mini-segment" style="background: #c084fc; box-shadow: 0 0 4px rgba(192, 132, 252, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #c084fc; box-shadow: 0 0 4px rgba(192, 132, 252, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #c084fc; box-shadow: 0 0 4px rgba(192, 132, 252, 0.4);"></div>
                                                <div class="blueprint-mini-segment" style="background: #c084fc; box-shadow: 0 0 4px rgba(192, 132, 252, 0.4);"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SKU 6: SmartWater -->
                                    <div class="blueprint-product-card">
                                        <div>
                                            <div class="flex items-center justify-between mb-2.5">
                                                <div class="blueprint-icon-box bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                                                    💧
                                                </div>
                                                <span class="blueprint-sku-tag">SKU-77210</span>
                                            </div>
                                            <div class="blueprint-product-title">SmartWater 1L</div>
                                            <div class="blueprint-price-tag mt-1">₹60.00 / unit</div>
                                        </div>
                                        <div class="pt-2.5 border-t border-slate-700/60">
                                            <div class="flex items-center justify-between text-[0.68rem] text-slate-400 mb-1">
                                                <span class="font-medium">Facing Allocation:</span>
                                                <span class="blueprint-facings-pill">4 Facings</span>
                                            </div>
                                            <div class="blueprint-mini-bar" title="4 Facings">
                                                <div class="blueprint-mini-segment" style="background: #38bdf8;"></div>
                                                <div class="blueprint-mini-segment" style="background: #38bdf8;"></div>
                                                <div class="blueprint-mini-segment" style="background: #38bdf8;"></div>
                                                <div class="blueprint-mini-segment" style="background: #38bdf8;"></div>
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
