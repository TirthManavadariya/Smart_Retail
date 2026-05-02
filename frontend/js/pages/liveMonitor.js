/** Live Monitor Page */
const LiveMonitorPage = {
    async render(container) {
        const sid = App.storeId;
        const [aisles, detail, plano, traffic] = await Promise.all([
            API.get('/api/monitoring/shelf-status', { store_id: sid }),
            API.get('/api/monitoring/aisle-detail'),
            API.get('/api/monitoring/planogram', { store_id: sid }),
            API.get('/api/monitoring/traffic', { store_id: sid }),
        ]);
        const COLORS = { optimal: '#6ee6ee', low: '#cecb5b', critical: '#ffb4ab' };

        container.innerHTML = `<div class="fade-in">
            ${KpiCard.renderPageHeader('Real-Time Intelligence', 'Live Monitor')}
            <div class="flex gap-2 mb-4 bg-surface rounded-lg p-1 border border-outline-variant/[0.15] w-fit">
                <button class="tab-btn active" data-tab="status">Shelf Status</button>
                <button class="tab-btn" data-tab="scanner">🔬 AI Shelf Scanner</button>
                <button class="tab-btn" data-tab="planogram">Planogram Compliance</button>
                <button class="tab-btn" data-tab="traffic">Customer Traffic</button>
            </div>
            <div id="tab-content"></div>
        </div>`;

        const tabContent = document.getElementById('tab-content');
        const tabs = { status: () => _renderStatus(aisles, detail, COLORS), scanner: _renderScanner, planogram: () => _renderPlano(plano), traffic: () => _renderTraffic(traffic) };
        tabs.status();

        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Charts.destroyAll();
                tabs[btn.dataset.tab]();
            });
        });

        function _renderStatus(aisles, detail, C) {
            let aisleHtml = aisles.map(a => {
                const c = C[a.status]; const h = 60 + a.sections * 40;
                const border = a.status !== 'optimal' ? `2px dashed ${c}` : `1px solid rgba(110,230,238,0.15)`;
                const glow = a.status === 'critical' ? '0 0 15px rgba(255,180,171,0.3)' : 'none';
                return `<div style="width:80px;height:${h}px;background:${c}${a.status==='optimal'?'25':a.status==='low'?'40':'80'};border:${border};border-radius:6px;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;font-size:0.65rem;font-weight:600;color:${c};box-shadow:${glow}" title="${a.name}">${a.name.toUpperCase()}</div>`;
            }).join('');

            let detHtml = detail.detections.map(d => `<div class="detection-item"><div class="detection-icon ${d.icon}">${d.emoji}</div><div class="flex-1"><div class="text-on-surface text-[0.82rem] font-semibold">${d.sku}</div><div class="text-on-surface-variant text-[0.72rem]">${d.msg}</div></div><div class="text-outline text-[0.68rem] whitespace-nowrap">${d.time}</div></div>`).join('');

            tabContent.innerHTML = `<div class="grid grid-cols-5 gap-4 fade-in">
                <div class="col-span-3 panel-low p-6"><div class="flex gap-4 justify-center items-end min-h-[280px] p-5">${aisleHtml}</div>
                <div class="flex gap-2 justify-center mt-4">${'<div class="w-7 h-7 bg-surface-high rounded"></div>'.repeat(3)}</div>
                <div class="text-center text-[0.6rem] text-outline mt-1 uppercase tracking-widest">POS Terminals</div></div>
                <div class="col-span-2">
                    <div class="panel mb-2"><div class="panel-header"><div><h3 class="text-on-surface text-[1.1rem] font-bold">Aisle 03: Beverage</h3><p class="text-on-surface-variant text-[0.72rem] mt-0.5">📷 Camera Unit CAM-09</p></div><span class="alert-badge critical">Critical Alert</span></div></div>
                    <div class="panel mt-2"><div class="flex gap-0"><div class="flex-1 text-center p-3"><div class="text-on-surface-variant text-[0.65rem] uppercase tracking-wider font-medium">Stock Level</div><div class="text-primary text-[1.8rem] font-black">${detail.stock_pct}%</div><div class="text-error text-[0.68rem]">↘ -${detail.delta_pct}% (1h)</div></div><div class="flex-1 text-center p-3 border-l border-outline-variant/10"><div class="text-on-surface-variant text-[0.65rem] uppercase tracking-wider font-medium">Compliance</div><div class="text-on-surface text-[1.8rem] font-black">${detail.compliance_pct}%</div><div class="text-on-surface-variant text-[0.68rem]">${detail.violations} Violations</div></div></div></div>
                    <div class="panel mt-2"><div class="panel-header border-b border-outline-variant/10"><div class="text-on-surface text-[0.82rem] font-bold uppercase tracking-wider">Real-Time Detections</div><span class="bg-surface-high text-on-surface-variant text-[0.6rem] px-2 py-0.5 rounded">LOGS_03</span></div>${detHtml}</div>
                </div>
            </div>`;
        }

        function _renderScanner() {
            tabContent.innerHTML = `<div class="fade-in">
                <div class="panel p-5 mb-4"><div class="flex items-center gap-3"><span class="text-[1.6rem]">🧠</span><div><div class="text-on-surface text-[1.05rem] font-bold">Custom-Trained AI Shelf Scanner</div><div class="text-on-surface-variant text-[0.72rem]">Model: YOLOv8n • Trained on SKU-110K • mAP50: 85.4% • Precision: 88.4%</div></div></div></div>
                <div class="panel p-5"><label class="block text-on-surface-variant text-sm mb-2">📷 Upload a shelf image to scan</label><input type="file" id="scanner-upload" accept="image/*" class="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold hover:file:bg-primary/20 cursor-pointer"><div id="scanner-results" class="mt-4"></div></div>
            </div>`;
            document.getElementById('scanner-upload').addEventListener('change', async (e) => {
                const file = e.target.files[0]; if (!file) return;
                const results = document.getElementById('scanner-results');
                results.innerHTML = '<div class="text-primary text-sm py-8 text-center">🔍 Running AI detection...</div>';
                try {
                    const fd = new FormData(); fd.append('image', file);
                    const data = await API.upload('/api/detect', fd);
                    results.innerHTML = `<img src="data:image/jpeg;base64,${data.annotated_image}" class="w-full rounded-lg mb-4" alt="Detection result"><div class="grid grid-cols-4 gap-3">${[['Products', data.num_products], ['Avg Confidence', (data.avg_confidence * 100).toFixed(1) + '%'], ['Processing', data.processing_time_ms + 'ms'], ['Detections', data.detections.length]].map(([l, v]) => `<div class="panel p-3 text-center"><div class="text-on-surface-variant text-[0.65rem] uppercase">${l}</div><div class="text-on-surface text-xl font-black">${v}</div></div>`).join('')}</div>`;
                } catch (err) { results.innerHTML = `<div class="text-error text-sm">${err.message}</div>`; }
            });
        }

        function _renderPlano(plano) {
            tabContent.innerHTML = `<div class="fade-in">${KpiCard.renderSectionHeader('Real Time Error in Placement', 'Real-time compliance monitoring')}<div class="panel p-5">${Tables.complianceBars(plano)}</div></div>`;
        }

        function _renderTraffic(traffic) {
            tabContent.innerHTML = `<div class="fade-in">${KpiCard.renderSectionHeader('Customer Traffic', 'Overhead camera tracking')}<div class="panel p-5" style="height:340px"><canvas id="traffic-chart"></canvas></div></div>`;
            // Simple heatmap approximation using stacked bars
            const datasets = traffic.zones.map((z, i) => ({ label: z, data: traffic.data[i], backgroundColor: `rgba(110,230,238,${0.15 + i * 0.15})`, borderRadius: 2 }));
            Charts.bar('traffic-chart', traffic.hours, traffic.data[0], { plugins: { legend: { display: false } } });
        }
    }
};
