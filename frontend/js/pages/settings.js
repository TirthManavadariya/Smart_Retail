/**
 * ShelfIQ — Store Analytics, AI Telemetry & System Settings
 */
const SettingsPage = {
    async render(container) {
        const sid = App.storeId;
        const [kpis, revData, catData] = await Promise.all([
            API.get('/api/analytics/kpis', { store_id: sid }),
            API.get('/api/analytics/revenue-trend', { store_id: sid }),
            API.get('/api/analytics/category-performance', { store_id: sid })
        ]);

        container.innerHTML = `
            <div class="fade-in">
                ${KpiCard.renderPageHeader('System Administration', 'Analytics, AI Parameters & Settings')}

                <!-- Performance KPIs -->
                ${KpiCard.renderRow([
                    { label: 'Revenue Protected (YTD)', value: kpis.revenue_protected, icon: 'shield-check', chip_text: kpis.revenue_delta + ' vs LY', trend: 'up', accent: 'primary', subtext: 'Loss prevention through instant stockout detection' },
                    { label: 'Store Compliance Index', value: kpis.compliance_score + '%', icon: 'check-circle-2', chip_text: 'Top 5% Tier', trend: 'up', accent: 'success', subtext: 'Chain-wide benchmark average: 88.4%' },
                    { label: 'Critical Stockout Events', value: kpis.stockout_events, unit: 'incidents', icon: 'trending-down', chip_text: kpis.stockout_delta + ' reduction', trend: 'up', accent: 'success', subtext: 'Decreased from 32 monthly events' },
                ])}

                <!-- Analytics Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div class="glass-panel">
                        <div class="panel-header">
                            <div>
                                <div class="panel-title">
                                    <i data-lucide="bar-chart-3" class="w-4 h-4 text-blue-400"></i>
                                    <span>Protected Revenue Velocity (6-Week Trend)</span>
                                </div>
                                <div class="panel-subtitle">Calculated recovery value across active store floor</div>
                            </div>
                            <span class="badge badge-optimal">+21.6% Growth</span>
                        </div>
                        <div class="panel-body">
                            <div style="height: 250px;">
                                <canvas id="rev-chart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="glass-panel">
                        <div class="panel-header">
                            <div>
                                <div class="panel-title">
                                    <i data-lucide="pie-chart" class="w-4 h-4 text-purple-400"></i>
                                    <span>Department Revenue Contribution</span>
                                </div>
                                <div class="panel-subtitle">Share of sales volume across store zones</div>
                            </div>
                        </div>
                        <div class="panel-body">
                            <div style="height: 250px;">
                                <canvas id="cat-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Settings Controls Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- AI Computer Vision Pipeline Settings -->
                    <div class="glass-panel p-6">
                        <div class="flex items-center gap-3 mb-4 pb-3 border-b border-subtle">
                            <div class="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                <i data-lucide="cpu" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-primary font-heading">Computer Vision Edge Parameters</h3>
                                <p class="text-xs text-muted">Inference confidence filters and throttle rates</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between text-xs font-semibold text-primary mb-1">
                                    <span>AI Confidence Threshold (mAP)</span>
                                    <span id="conf-val" class="font-mono text-blue-400 font-bold">85%</span>
                                </div>
                                <input type="range" id="conf-slider" min="50" max="98" value="85" class="w-full accent-blue-500 cursor-pointer">
                                <p class="text-[0.68rem] text-muted mt-1">Detections below this threshold are routed to verification queue.</p>
                            </div>

                            <div class="pt-2 border-t border-subtle">
                                <div class="flex justify-between text-xs font-semibold text-primary mb-1">
                                    <span>Edge Stream Frame Rate (FPS)</span>
                                    <span id="fps-val" class="font-mono text-emerald-400 font-bold">30 FPS</span>
                                </div>
                                <input type="range" id="fps-slider" min="10" max="60" value="30" class="w-full accent-emerald-500 cursor-pointer">
                            </div>

                            <div class="pt-2 border-t border-subtle space-y-3">
                                ${[
                                    ['Enable Optical OCR Price Tag Extraction', true],
                                    ['Enable Automated Associate Dispatch via Handheld', true],
                                    ['Real-time Stockout Loss Calculation', true],
                                    ['Heatmap Customer Footfall Density', true]
                                ].map(([lbl, checked]) => `
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs text-secondary">${lbl}</span>
                                        <input type="checkbox" ${checked ? 'checked' : ''} class="w-4 h-4 rounded accent-blue-500 cursor-pointer">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- User Profile & Store Configuration -->
                    <div class="glass-panel p-6">
                        <div class="flex items-center gap-3 mb-4 pb-3 border-b border-subtle">
                            <div class="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                <i data-lucide="user-check" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-primary font-heading">User Profile & Access</h3>
                                <p class="text-xs text-muted">Active credentials and permissions</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-4 mb-5 p-3 rounded-xl bg-surface-1 border border-subtle">
                            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                AS
                            </div>
                            <div>
                                <div class="font-bold text-sm text-primary">Arjun Sharma</div>
                                <div class="text-xs text-secondary">Store Operations Lead • Mumbai Flagship</div>
                                <div class="text-[0.68rem] text-emerald-400 font-semibold mt-0.5">● Super Admin Access</div>
                            </div>
                        </div>

                        <div class="space-y-3 text-xs">
                            <div class="flex justify-between py-1.5 border-b border-subtle">
                                <span class="text-muted">Assigned Store</span>
                                <span class="font-bold text-primary">Store #01 — Mumbai Flagship</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-subtle">
                                <span class="text-muted">Official Email</span>
                                <span class="font-mono text-primary">arjun.sharma@shelfiq.ai</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-subtle">
                                <span class="text-muted">Edge Device Gateway</span>
                                <span class="font-mono text-primary">NVIDIA Jetson AGX Orin (64GB)</span>
                            </div>
                            <div class="flex justify-between py-1.5">
                                <span class="text-muted">Connected Associates</span>
                                <span class="font-bold text-emerald-400">12 Online Handhelds</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Save Action Bar -->
                <div class="flex items-center gap-3">
                    <button id="save-settings-btn" class="btn-primary">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        <span>Save All Configuration</span>
                    </button>
                    <button id="reset-settings-btn" class="btn-secondary">
                        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                        <span>Reset to Factory Defaults</span>
                    </button>
                </div>
            </div>
        `;

        // Render Charts
        Charts.bar('rev-chart', revData.labels, revData.values);
        Charts.doughnut('cat-chart', catData.labels, catData.values, catData.colors);

        // Sliders
        const confSlider = document.getElementById('conf-slider');
        const confVal = document.getElementById('conf-val');
        if (confSlider && confVal) {
            confSlider.addEventListener('input', () => {
                confVal.textContent = confSlider.value + '%';
            });
        }

        const fpsSlider = document.getElementById('fps-slider');
        const fpsVal = document.getElementById('fps-val');
        if (fpsSlider && fpsVal) {
            fpsSlider.addEventListener('input', () => {
                fpsVal.textContent = fpsSlider.value + ' FPS';
            });
        }

        document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
            await API.post('/api/settings/save', { store_id: sid });
            App.showToast('Settings Saved', 'Edge CV parameters and store preferences updated.', 'success');
        });

        document.getElementById('reset-settings-btn')?.addEventListener('click', () => {
            App.showToast('Reset Applied', 'Restored default AI confidence and frame rates.', 'info');
        });
    }
};
