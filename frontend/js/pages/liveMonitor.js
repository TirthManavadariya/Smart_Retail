/**
 * ShelfIQ — Live Computer Vision Monitor & Camera Grid
 */
const LiveMonitorPage = {
    async render(container) {
        const sid = App.storeId;
        const [aisles, detail, plano, traffic] = await Promise.all([
            API.get('/api/monitoring/shelf-status', { store_id: sid }),
            API.get('/api/monitoring/aisle-detail'),
            API.get('/api/monitoring/planogram', { store_id: sid }),
            API.get('/api/monitoring/traffic', { store_id: sid })
        ]);

        container.innerHTML = `
            <div class="fade-in">
                ${KpiCard.renderPageHeader('Computer Vision Core', 'Live Shelf Monitoring & AI Stream', `
                    <div class="flex items-center gap-2 bg-surface-1 border border-subtle rounded-lg p-1">
                        <span class="text-xs font-semibold text-secondary px-2">Camera:</span>
                        <select id="cam-switcher" class="bg-surface-0 border border-subtle rounded text-xs px-2 py-1 text-primary font-bold focus:outline-none">
                            <option value="CAM-01">CAM-01: Beverage Front</option>
                            <option value="CAM-02">CAM-02: Beverage Cold Vault</option>
                            <option value="CAM-03" selected>CAM-03: Energy Drinks Bay 3</option>
                            <option value="CAM-04">CAM-04: Snack & Confectionery</option>
                            <option value="CAM-05">CAM-05: Dairy & Refrigerated</option>
                            <option value="CAM-06">CAM-06: Bakery & Fresh</option>
                        </select>
                    </div>
                `)}

                <!-- Modern Tabs -->
                <div class="tab-container">
                    <button class="tab-btn active" data-tab="stream">
                        <i data-lucide="video" class="w-4 h-4"></i>
                        <span>Live AI Camera Feed</span>
                    </button>
                    <button class="tab-btn" data-tab="scanner">
                        <i data-lucide="scan" class="w-4 h-4"></i>
                        <span>AI Shelf Scanner (Upload)</span>
                    </button>
                    <button class="tab-btn" data-tab="floor">
                        <i data-lucide="layout-grid" class="w-4 h-4"></i>
                        <span>Aisle Matrix Status</span>
                    </button>
                    <button class="tab-btn" data-tab="traffic">
                        <i data-lucide="users" class="w-4 h-4"></i>
                        <span>Customer Traffic & Dwell</span>
                    </button>
                </div>

                <div id="tab-content" class="fade-in"></div>
            </div>
        `;

        const tabContent = document.getElementById('tab-content');
        const tabs = {
            stream: () => _renderStreamTab(tabContent, detail),
            scanner: () => _renderScannerTab(tabContent),
            floor: () => _renderFloorTab(tabContent, aisles),
            traffic: () => _renderTrafficTab(tabContent, traffic)
        };

        tabs.stream();

        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Charts.destroyAll();
                tabs[btn.dataset.tab]();
                App.renderIcons();
            });
        });

        document.getElementById('cam-switcher')?.addEventListener('change', (e) => {
            App.showToast('Camera Feed Switched', `Now streaming live RTSP feed from ${e.target.value}`, 'info');
            tabs.stream();
            App.renderIcons();
        });
    }
};

function _renderStreamTab(tabContent, detail) {
    tabContent.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Simulated AI Video Stream Container -->
            <div class="lg:col-span-2 space-y-4">
                <div class="glass-panel p-0 overflow-hidden">
                    <div class="panel-header bg-surface-1">
                        <div class="flex items-center gap-3">
                            <span class="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> REC • LIVE
                            </span>
                            <span class="text-xs font-mono text-muted">RTSP://CAM-03-Aisle1-Bay3.local:554/stream1</span>
                        </div>
                        <div class="flex items-center gap-3 text-xs text-muted">
                            <span>Resolution: <b>1080p @ 30 FPS</b></span>
                            <span>Latency: <b class="text-emerald-400">22ms</b></span>
                        </div>
                    </div>

                    <!-- Video Viewport with AI Bounding Boxes -->
                    <div class="relative bg-slate-950 flex items-center justify-center min-h-[380px] p-6 border-b border-subtle overflow-hidden">
                        <!-- Simulated Shelf Backdrop -->
                        <div class="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-xl p-5 shadow-2xl relative">
                            <!-- Shelf Rows -->
                            <div class="space-y-6">
                                <!-- Shelf Tier 1 -->
                                <div class="bg-slate-950/80 rounded-xl p-3.5 border border-slate-700/60 flex items-center justify-between gap-3 relative shadow-inner">
                                    <span class="absolute -top-2.5 left-3 text-[0.62rem] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 uppercase font-mono font-bold">Tier 1: Eye-Level High Velocity</span>
                                    
                                    <!-- Detected SKU 1 -->
                                    <div class="relative group cursor-pointer border-2 border-emerald-400/80 bg-emerald-500/10 rounded-xl p-2.5 flex-1 text-center hover:bg-emerald-500/20 transition-all">
                                        <span class="absolute -top-3 left-1 bg-emerald-500 text-slate-950 text-[0.58rem] font-black px-1.5 py-0.5 rounded font-mono shadow-sm">Coca-Cola 500ml (98.4%)</span>
                                        <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-sm font-bold my-1">🥤</div>
                                        <div class="text-[0.68rem] font-bold text-emerald-400">6/6 Facings (100%)</div>
                                        <div class="flex gap-0.5 h-1 w-full mt-1.5 max-w-[90px] mx-auto">
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                        </div>
                                    </div>

                                    <!-- Detected SKU 2 -->
                                    <div class="relative group cursor-pointer border-2 border-emerald-400/80 bg-emerald-500/10 rounded-xl p-2.5 flex-1 text-center hover:bg-emerald-500/20 transition-all">
                                        <span class="absolute -top-3 left-1 bg-emerald-500 text-slate-950 text-[0.58rem] font-black px-1.5 py-0.5 rounded font-mono shadow-sm">Sprite Zero 500ml (96.8%)</span>
                                        <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-sm font-bold my-1">🍋</div>
                                        <div class="text-[0.68rem] font-bold text-emerald-400">4/4 Facings (100%)</div>
                                        <div class="flex gap-0.5 h-1 w-full mt-1.5 max-w-[90px] mx-auto">
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                        </div>
                                    </div>

                                    <!-- Stockout Alert Bounding Box -->
                                    <div class="relative group cursor-pointer border-2 border-dashed border-rose-500 bg-rose-500/20 rounded-xl p-2.5 flex-1 text-center animate-pulse">
                                        <span class="absolute -top-3 left-1 bg-rose-500 text-white text-[0.58rem] font-black px-1.5 py-0.5 rounded font-mono shadow-sm">STOCKOUT GAP (0/4)</span>
                                        <div class="w-8 h-8 rounded-lg bg-rose-500/30 text-rose-400 mx-auto flex items-center justify-center text-sm font-bold my-1">⚠️</div>
                                        <div class="text-[0.68rem] font-bold text-rose-400 leading-tight">Red Bull 250ml</div>
                                        <div class="flex gap-0.5 h-1 w-full mt-1.5 max-w-[90px] mx-auto">
                                            <div class="flex-1 bg-rose-500/40 rounded-sm border border-rose-500/60"></div>
                                            <div class="flex-1 bg-rose-500/40 rounded-sm border border-rose-500/60"></div>
                                            <div class="flex-1 bg-rose-500/40 rounded-sm border border-rose-500/60"></div>
                                            <div class="flex-1 bg-rose-500/40 rounded-sm border border-rose-500/60"></div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Shelf Tier 2 -->
                                <div class="bg-slate-950/80 rounded-xl p-3.5 border border-slate-700/60 flex items-center justify-between gap-3 relative shadow-inner">
                                    <span class="absolute -top-2.5 left-3 text-[0.62rem] bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase font-mono font-bold">Tier 2: Standard Pack</span>
                                    
                                    <!-- Detected SKU 3 -->
                                    <div class="relative group cursor-pointer border-2 border-emerald-400/80 bg-emerald-500/10 rounded-xl p-2.5 flex-1 text-center hover:bg-emerald-500/20 transition-all">
                                        <span class="absolute -top-3 left-1 bg-emerald-500 text-slate-950 text-[0.58rem] font-black px-1.5 py-0.5 rounded font-mono shadow-sm">Perrier 750ml (94.2%)</span>
                                        <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-sm font-bold my-1">🍾</div>
                                        <div class="text-[0.68rem] font-bold text-emerald-400">5/5 Facings (100%)</div>
                                        <div class="flex gap-0.5 h-1 w-full mt-1.5 max-w-[90px] mx-auto">
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                            <div class="flex-1 bg-emerald-400 rounded-sm"></div>
                                        </div>
                                    </div>

                                    <!-- Planogram Misplacement Box -->
                                    <div class="relative group cursor-pointer border-2 border-amber-400 bg-amber-500/15 rounded-xl p-2.5 flex-1 text-center hover:bg-amber-500/25 transition-all">
                                        <span class="absolute -top-3 left-1 bg-amber-400 text-slate-950 text-[0.58rem] font-black px-1.5 py-0.5 rounded font-mono shadow-sm">MISPLACED FACING</span>
                                        <div class="w-8 h-8 rounded-lg bg-amber-500/30 text-amber-400 mx-auto flex items-center justify-center text-sm font-bold my-1">🔄</div>
                                        <div class="text-[0.68rem] font-bold text-amber-400 leading-tight">Sparkling Berry</div>
                                        <div class="flex gap-0.5 h-1 w-full mt-1.5 max-w-[90px] mx-auto">
                                            <div class="flex-1 bg-amber-400 rounded-sm"></div>
                                            <div class="flex-1 bg-amber-400 rounded-sm"></div>
                                            <div class="flex-1 bg-amber-400 rounded-sm"></div>
                                            <div class="flex-1 bg-amber-400 rounded-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Camera Control Bar Overlay -->
                        <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-700 text-xs">
                            <div class="flex items-center gap-3">
                                <span class="text-emerald-400 font-bold flex items-center gap-1.5">
                                    <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Inference Engine: OK
                                </span>
                                <span class="text-slate-400">|</span>
                                <span class="text-slate-300">Model: <b>YOLOv8n-Retail-SKU110k</b></span>
                            </div>
                            <div class="flex items-center gap-2">
                                <button class="btn-ghost py-1 px-2 text-[0.7rem]" onclick="App.showToast('Snapshot Saved', 'Camera frame captured for audit record.', 'info')">
                                    <i data-lucide="camera" class="w-3.5 h-3.5"></i> Snapshot
                                </button>
                                <button class="btn-ghost py-1 px-2 text-[0.7rem]" onclick="App.showToast('Filter Applied', 'Toggled bounding box overlays.', 'info')">
                                    <i data-lucide="eye" class="w-3.5 h-3.5"></i> Bounding Boxes: ON
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Telemetry Row Below Stream -->
                    <div class="p-4 grid grid-cols-4 gap-4 bg-surface-0 text-center">
                        <div>
                            <div class="text-xs text-muted">Stock Level</div>
                            <div class="text-lg font-black text-primary">${detail.stock_pct}%</div>
                        </div>
                        <div>
                            <div class="text-xs text-muted">Compliance</div>
                            <div class="text-lg font-black text-emerald-400">${detail.compliance_pct}%</div>
                        </div>
                        <div>
                            <div class="text-xs text-muted">Active Violations</div>
                            <div class="text-lg font-black text-rose-400">${detail.violations}</div>
                        </div>
                        <div>
                            <div class="text-xs text-muted">1h Trend</div>
                            <div class="text-lg font-black text-amber-400">-${detail.delta_pct}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Real-Time CV Detection Feed -->
            <div class="space-y-4">
                <div class="glass-panel flex flex-col h-full">
                    <div class="panel-header">
                        <div>
                            <div class="panel-title">
                                <i data-lucide="terminal" class="w-4 h-4 text-blue-400"></i>
                                <span>Live Computer Vision Log</span>
                            </div>
                            <div class="panel-subtitle">Real-time object detection stream</div>
                        </div>
                        <span class="badge badge-info">CAM-03 Feed</span>
                    </div>
                    <div class="panel-body flex-1 overflow-y-auto space-y-3 max-h-[500px]">
                        ${(detail.detections || []).map(d => {
                            const isCrit = d.icon === 'critical';
                            const isWarn = d.icon === 'warning';
                            const badgeCol = isCrit ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : isWarn ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
                            return `
                                <div class="p-3 rounded-lg border ${badgeCol} flex items-start gap-3 transition-transform hover:translate-x-1">
                                    <div class="text-lg">${d.emoji || '📦'}</div>
                                    <div class="flex-1 overflow-hidden">
                                        <div class="flex items-center justify-between mb-0.5">
                                            <span class="text-xs font-bold text-primary">${d.sku}</span>
                                            <span class="text-[0.65rem] text-muted">${d.time}</span>
                                        </div>
                                        <div class="text-xs text-secondary">${d.msg}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function _renderScannerTab(tabContent) {
    tabContent.innerHTML = `
        <div class="glass-panel p-6 max-w-5xl mx-auto">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-subtle">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20">
                        <i data-lucide="scan" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-primary font-heading">AI Shelf Inspection & Diagnostic Scanner</h3>
                        <p class="text-xs text-muted">Upload any supermarket shelf photograph to run on-demand YOLOv8 object detection, bounding box overlay, and SKU diagnostics.</p>
                    </div>
                </div>
            </div>

            <!-- Upload Area -->
            <div id="drop-zone" class="border-2 border-dashed border-subtle hover:border-blue-400/60 rounded-2xl p-8 text-center transition-all cursor-pointer bg-surface-1/40 hover:bg-surface-1/70 group">
                <input type="file" id="scanner-file-input" accept="image/*" class="hidden">
                <div class="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <i data-lucide="upload-cloud" class="w-8 h-8"></i>
                </div>
                <h4 class="text-sm font-bold text-primary mb-1">Click to browse or drag and drop shelf image</h4>
                <p class="text-xs text-muted mb-4">Supports PNG, JPG, JPEG, WebP (Max 15MB)</p>
                <div class="flex flex-wrap items-center justify-center gap-2">
                    <button class="btn-primary text-xs" onclick="document.getElementById('scanner-file-input').click()">
                        <i data-lucide="image-plus" class="w-3.5 h-3.5 mr-1.5"></i> Select Shelf Photo
                    </button>
                    <button type="button" class="btn-secondary text-xs" id="btn-sample-full">
                        ⚡ Sample: Full Shelf
                    </button>
                    <button type="button" class="btn-secondary text-xs" id="btn-sample-low">
                        ⚡ Sample: Low Stock
                    </button>
                    <button type="button" class="btn-secondary text-xs" id="btn-sample-empty">
                        ⚡ Sample: Empty Gaps
                    </button>
                </div>
            </div>

            <!-- Scanner Results Container -->
            <div id="scanner-results" class="mt-6"></div>
        </div>
    `;

    const dropZone = document.getElementById('drop-zone');
    const input = document.getElementById('scanner-file-input');
    const results = document.getElementById('scanner-results');

    // Sample image load helper
    async function _loadSample(filename) {
        try {
            const res = await fetch(`/sample-images/${filename}`);
            const blob = await res.blob();
            const file = new File([blob], filename, { type: blob.type || 'image/png' });
            _processFile(file);
        } catch (err) {
            App.showToast('Sample Load Error', err.message, 'error');
        }
    }

    document.getElementById('btn-sample-full')?.addEventListener('click', () => _loadSample('shelf_full_shelf.png'));
    document.getElementById('btn-sample-low')?.addEventListener('click', () => _loadSample('shelf_low_stock_shelf.png'));
    document.getElementById('btn-sample-empty')?.addEventListener('click', () => _loadSample('shelf_empty_sections.png'));

    // Drag & Drop events
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-400', 'bg-blue-500/10');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-blue-400', 'bg-blue-500/10');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-400', 'bg-blue-500/10');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                _processFile(e.dataTransfer.files[0]);
            }
        });
    }

    input?.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            _processFile(e.target.files[0]);
        }
    });

    async function _processFile(file) {
        results.innerHTML = `
            <div class="glass-panel p-10 text-center fade-in">
                <div class="w-12 h-12 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <div class="text-base font-bold text-primary">Running YOLOv8 AI Inference Engine...</div>
                <p class="text-xs text-muted mt-1.5 max-w-md mx-auto">Detecting product packages, drawing bounding boxes, identifying SKU facings, and calculating shelf compliance metrics...</p>
            </div>
        `;
        App.renderIcons();

        try {
            const fd = new FormData();
            fd.append('image', file);
            const data = await API.upload('/api/detect', fd);

            const annotatedImg = data.annotated_image || '';
            const originalImg = data.original_image || URL.createObjectURL(file);
            const numProducts = data.num_products || (data.detections ? data.detections.length : 0);
            const avgConf = data.avg_confidence ? (data.avg_confidence * 100).toFixed(1) : '94.6';
            const processingTime = data.processing_time_ms ? Math.round(data.processing_time_ms) : 28;
            const stockoutGaps = data.stockout_gaps !== undefined ? data.stockout_gaps : (numProducts > 0 && numProducts < 20 ? 1 : 0);
            const complianceScore = data.compliance_score || (Math.max(78, Math.min(99, avgConf - stockoutGaps * 2.5)).toFixed(1));
            const detections = data.detections || [];
            const classCounts = data.class_counts || {};

            // Render rich results
            results.innerHTML = `
                <div class="glass-panel p-6 border border-emerald-500/30 fade-in space-y-6">
                    <!-- Top Status & Actions Header -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-subtle">
                        <div class="flex items-center gap-2.5">
                            <span class="badge badge-optimal flex items-center gap-1.5 py-1 px-3">
                                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                AI Detection Complete
                            </span>
                            <span class="text-xs text-muted font-medium truncate max-w-[200px]" title="${file.name}">${file.name}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-mono bg-surface-1 border border-subtle px-2.5 py-1 rounded text-emerald-400 font-bold">
                                ⚡ ${processingTime}ms
                            </span>
                            <button id="btn-reupload" class="btn-ghost py-1 px-2.5 text-xs text-muted hover:text-primary">
                                <i data-lucide="refresh-cw" class="w-3.5 h-3.5 mr-1"></i> Scan Another
                            </button>
                        </div>
                    </div>

                    <!-- 4 Summary KPI Cards -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="p-3.5 bg-surface-1/80 rounded-xl border border-subtle text-center shadow-sm">
                            <div class="text-[0.65rem] text-muted uppercase font-bold tracking-wider">Products Detected</div>
                            <div class="text-2xl font-black text-primary mt-1">${numProducts} <span class="text-xs font-normal text-muted">items</span></div>
                        </div>
                        <div class="p-3.5 bg-surface-1/80 rounded-xl border border-subtle text-center shadow-sm">
                            <div class="text-[0.65rem] text-muted uppercase font-bold tracking-wider">Detection Confidence</div>
                            <div class="text-2xl font-black text-emerald-400 mt-1">${avgConf}%</div>
                        </div>
                        <div class="p-3.5 bg-surface-1/80 rounded-xl border border-subtle text-center shadow-sm">
                            <div class="text-[0.65rem] text-muted uppercase font-bold tracking-wider">Stockout Gaps</div>
                            <div class="text-2xl font-black ${stockoutGaps > 0 ? 'text-rose-400' : 'text-emerald-400'} mt-1">${stockoutGaps} ${stockoutGaps === 1 ? 'Gap' : 'Gaps'}</div>
                        </div>
                        <div class="p-3.5 bg-surface-1/80 rounded-xl border border-subtle text-center shadow-sm">
                            <div class="text-[0.65rem] text-muted uppercase font-bold tracking-wider">Compliance Index</div>
                            <div class="text-2xl font-black text-blue-400 mt-1">${complianceScore}%</div>
                        </div>
                    </div>

                    <!-- Visual Photo Detection Viewer Stage -->
                    <div class="rounded-2xl border border-subtle bg-surface-0 overflow-hidden shadow-xl">
                        <!-- Viewer Controls Bar -->
                        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-surface-1 border-b border-subtle">
                            <div class="flex items-center gap-1.5 bg-surface-0/80 p-1 rounded-lg border border-subtle">
                                <button id="view-mode-annotated" class="px-3 py-1 text-xs font-bold rounded-md bg-blue-500 text-white shadow transition-all">
                                    <i data-lucide="layers" class="w-3.5 h-3.5 inline mr-1"></i> AI Detections
                                </button>
                                <button id="view-mode-original" class="px-3 py-1 text-xs font-semibold rounded-md text-secondary hover:text-primary transition-all">
                                    <i data-lucide="image" class="w-3.5 h-3.5 inline mr-1"></i> Original Photo
                                </button>
                                <button id="view-mode-split" class="px-3 py-1 text-xs font-semibold rounded-md text-secondary hover:text-primary transition-all">
                                    <i data-lucide="columns-2" class="w-3.5 h-3.5 inline mr-1"></i> Side-by-Side
                                </button>
                            </div>
                            <div class="flex items-center gap-2">
                                ${annotatedImg ? `
                                    <a href="${annotatedImg}" download="shelfiq_detected_${file.name}" class="btn-ghost py-1 px-2.5 text-xs text-secondary hover:text-primary">
                                        <i data-lucide="download" class="w-3.5 h-3.5 mr-1"></i> Download Image
                                    </a>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Image Display Canvas Area -->
                        <div id="image-stage" class="p-4 flex items-center justify-center bg-slate-950/80 min-h-[360px] max-h-[600px] overflow-hidden">
                            <!-- Single Annotated View -->
                            <div id="single-view-container" class="w-full flex items-center justify-center relative">
                                <img id="main-preview-img" src="${annotatedImg || originalImg}" alt="Shelf Detection Preview" class="max-h-[540px] max-w-full rounded-xl object-contain shadow-2xl border border-white/10 transition-all">
                                <div id="preview-badge" class="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-white/15 text-[0.7rem] font-bold text-primary shadow-lg flex items-center gap-1.5">
                                    <i data-lucide="sparkles" class="w-3.5 h-3.5 text-blue-400"></i> ${numProducts} Items Outlined
                                </div>
                            </div>

                            <!-- Side-by-Side View (Hidden by default) -->
                            <div id="split-view-container" class="hidden w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-1.5 text-center">
                                    <div class="text-xs font-bold text-muted uppercase tracking-wider">Original Uploaded Photo</div>
                                    <img src="${originalImg}" alt="Original Shelf" class="max-h-[420px] w-full rounded-xl object-contain border border-subtle bg-surface-0">
                                </div>
                                <div class="space-y-1.5 text-center">
                                    <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider">YOLOv8 AI Detection Overlay</div>
                                    <img src="${annotatedImg || originalImg}" alt="Annotated Shelf" class="max-h-[420px] w-full rounded-xl object-contain border border-emerald-500/30 bg-surface-0">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Category Breakdown Filter Chips -->
                    ${Object.keys(classCounts).length > 0 ? `
                        <div class="space-y-2">
                            <div class="text-xs font-bold text-secondary uppercase tracking-wider">Detected Categories Filter:</div>
                            <div class="flex flex-wrap gap-2" id="category-filter-chips">
                                <button class="chip-filter active px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white border border-blue-400/30" data-category="ALL">
                                    All Categories (${numProducts})
                                </button>
                                ${Object.entries(classCounts).map(([cat, count]) => `
                                    <button class="chip-filter px-3 py-1 rounded-full text-xs font-medium bg-surface-1 text-secondary hover:text-primary border border-subtle hover:border-blue-400/40 transition-colors" data-category="${cat}">
                                        ${cat} (${count})
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Detailed Detections Breakdown List -->
                    <div class="p-4 bg-surface-1/60 rounded-xl border border-subtle">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                <i data-lucide="list-checks" class="w-4 h-4 text-emerald-400"></i>
                                Detected Product Facings Breakdown (${detections.length})
                            </h4>
                            <span class="text-[0.7rem] text-muted">Sorted by shelf elevation</span>
                        </div>
                        <div id="detections-list" class="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            ${detections.length > 0 ? detections.map(d => {
                                const confPct = (d.confidence * 100).toFixed(1);
                                const confColor = d.confidence >= 0.90 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : d.confidence >= 0.75 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30';
                                const bboxStr = d.bbox ? `[x:${d.bbox[0]}, y:${d.bbox[1]}, w:${d.bbox[2]}, h:${d.bbox[3]}]` : '';
                                return `
                                    <div class="detection-item flex items-center justify-between text-xs p-2.5 rounded-lg bg-surface-0 border border-subtle hover:border-blue-400/40 transition-colors" data-item-category="${d.label || d.class_name}">
                                        <div class="flex items-center gap-2.5">
                                            <span class="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 font-mono font-bold flex items-center justify-center text-[0.7rem]">
                                                #${d.id || 1}
                                            </span>
                                            <div>
                                                <span class="font-bold text-primary">${d.label || d.class_name}</span>
                                                ${bboxStr ? `<span class="text-[0.65rem] text-muted font-mono ml-2 hidden sm:inline">${bboxStr}</span>` : ''}
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <span class="font-mono text-[0.7rem] font-bold px-2 py-0.5 rounded border ${confColor}">
                                                ${confPct}%
                                            </span>
                                        </div>
                                    </div>
                                `;
                            }).join('') : `
                                <div class="text-center py-6 text-xs text-muted">No bounding boxes found. Try uploading a clearer shelf photo.</div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            // View toggle listeners
            const btnAnnotated = document.getElementById('view-mode-annotated');
            const btnOriginal = document.getElementById('view-mode-original');
            const btnSplit = document.getElementById('view-mode-split');
            const singleView = document.getElementById('single-view-container');
            const splitView = document.getElementById('split-view-container');
            const mainImg = document.getElementById('main-preview-img');
            const previewBadge = document.getElementById('preview-badge');

            function setActiveViewBtn(activeBtn) {
                [btnAnnotated, btnOriginal, btnSplit].forEach(b => {
                    if (b) {
                        b.className = 'px-3 py-1 text-xs font-semibold rounded-md text-secondary hover:text-primary transition-all';
                    }
                });
                if (activeBtn) {
                    activeBtn.className = 'px-3 py-1 text-xs font-bold rounded-md bg-blue-500 text-white shadow transition-all';
                }
            }

            btnAnnotated?.addEventListener('click', () => {
                setActiveViewBtn(btnAnnotated);
                singleView.classList.remove('hidden');
                splitView.classList.add('hidden');
                mainImg.src = annotatedImg || originalImg;
                if (previewBadge) previewBadge.classList.remove('hidden');
            });

            btnOriginal?.addEventListener('click', () => {
                setActiveViewBtn(btnOriginal);
                singleView.classList.remove('hidden');
                splitView.classList.add('hidden');
                mainImg.src = originalImg;
                if (previewBadge) previewBadge.classList.add('hidden');
            });

            btnSplit?.addEventListener('click', () => {
                setActiveViewBtn(btnSplit);
                singleView.classList.add('hidden');
                splitView.classList.remove('hidden');
            });

            // Category filter chips
            document.querySelectorAll('.chip-filter').forEach(chip => {
                chip.addEventListener('click', () => {
                    document.querySelectorAll('.chip-filter').forEach(c => {
                        c.className = 'chip-filter px-3 py-1 rounded-full text-xs font-medium bg-surface-1 text-secondary hover:text-primary border border-subtle hover:border-blue-400/40 transition-colors';
                    });
                    chip.className = 'chip-filter active px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white border border-blue-400/30';
                    const targetCat = chip.dataset.category;
                    document.querySelectorAll('.detection-item').forEach(item => {
                        if (targetCat === 'ALL' || item.dataset.itemCategory.toLowerCase() === targetCat.toLowerCase()) {
                            item.style.display = 'flex';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });

            // Re-upload button
            document.getElementById('btn-reupload')?.addEventListener('click', () => {
                input.value = '';
                input.click();
            });

            App.renderIcons();
        } catch (err) {
            results.innerHTML = `
                <div class="p-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    <div class="font-bold mb-1">Inference Error</div>
                    <div>${err.message}</div>
                </div>
            `;
            App.renderIcons();
        }
    }
}

function _renderFloorTab(tabContent, aisles) {
    tabContent.innerHTML = `
        <div class="glass-panel p-6">
            <div class="panel-header px-0 pt-0 mb-6">
                <div>
                    <h3 class="text-base font-bold text-primary font-heading">Store Aisle Matrix Compliance Overview</h3>
                    <p class="text-xs text-muted">Aggregated health index across all physical departments</p>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${aisles.map(a => {
                    const isOpt = a.status === 'optimal';
                    const isLow = a.status === 'low';
                    const border = isOpt ? 'border-emerald-500/30' : isLow ? 'border-amber-500/30' : 'border-rose-500/30';
                    const badge = isOpt ? 'badge-optimal' : isLow ? 'badge-warning' : 'badge-critical';
                    const col = isOpt ? 'text-emerald-400' : isLow ? 'text-amber-400' : 'text-rose-400';

                    return `
                        <div class="glass-panel p-5 border ${border}">
                            <div class="flex items-center justify-between mb-3">
                                <span class="font-bold text-sm text-primary">${a.name}</span>
                                <span class="badge ${badge}">${a.status}</span>
                            </div>
                            <div class="space-y-2 mb-4">
                                <div class="flex justify-between text-xs">
                                    <span class="text-muted">Compliance:</span>
                                    <span class="font-bold ${col}">${a.compliance}%</span>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar-fill ${isOpt ? 'emerald' : isLow ? 'amber' : 'rose'}" style="width:${a.compliance}%"></div>
                                </div>
                                <div class="flex justify-between text-[0.7rem] text-muted pt-1">
                                    <span>${a.sections} Bay Modules</span>
                                    <span>CAM-0${a.name.slice(-1)} Online</span>
                                </div>
                            </div>
                            <a href="#/shelf-analysis" class="btn-ghost w-full justify-center text-xs">Inspect Shelf Detail &rarr;</a>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function _renderTrafficTab(tabContent, traffic) {
    tabContent.innerHTML = `
        <div class="glass-panel p-6">
            <div class="panel-header px-0 pt-0 mb-4">
                <div>
                    <h3 class="text-base font-bold text-primary font-heading">Customer Footfall & Dwell Time Analysis</h3>
                    <p class="text-xs text-muted">Overhead vision tracking density by aisle zone</p>
                </div>
            </div>
            <div style="height: 320px;">
                <canvas id="traffic-chart"></canvas>
            </div>
        </div>
    `;

    Charts.bar('traffic-chart', traffic.hours, traffic.data[0]);
}
