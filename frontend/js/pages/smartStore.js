/**
 * ShelfIQ — Smart Store IoT Telemetry & Camera Sensor Grid
 */
const SmartStorePage = {
    async render(container) {
        container.innerHTML = `
            <div class="fade-in">
                ${KpiCard.renderPageHeader('IoT Infrastructure', 'Smart Store Telemetry & Multi-Sensor Grid')}

                <!-- Hero IoT KPIs -->
                ${KpiCard.renderRow([
                    { label: 'Active CV Cameras', value: '24 / 24', icon: 'camera', chip_text: '100% Online', trend: 'up', accent: 'primary', subtext: 'Full store 360° coverage' },
                    { label: 'Store Climate Stability', value: '22°C', icon: 'thermometer', chip_text: 'HVAC Optimal', trend: 'neutral', accent: 'success', subtext: 'Zone variance < 1.2°C' },
                    { label: 'Current Live Footfall', value: '142', unit: 'shoppers', icon: 'users', chip_text: 'Peak Velocity', trend: 'up', accent: 'purple', subtext: 'Avg dwell time 18.4 min' },
                    { label: 'Energy Optimization', value: '4.2 kW', icon: 'zap', chip_text: '-12% vs LW', trend: 'up', accent: 'success', subtext: 'Automated refrigeration & LED dimming' },
                ])}

                <!-- Multi-Camera Surveillance Grid (8 feeds) -->
                <div class="mb-6">
                    ${KpiCard.renderSectionHeader('Overhead Computer Vision Grid', 'Live RTSP edge inference feeds across all departments')}
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                            const isCam3 = i === 3;
                            return `
                                <div class="glass-panel p-0 relative overflow-hidden group cursor-pointer cam-grid-item" data-cam="CAM-0${i}">
                                    <div class="bg-slate-950 flex items-center justify-center h-32 relative border-b border-subtle">
                                        <div class="text-3xl text-slate-600 group-hover:scale-110 transition-transform">📹</div>
                                        <div class="absolute top-2 left-2 bg-slate-900/90 text-primary text-[0.65rem] font-bold px-2 py-0.5 rounded border border-slate-700 font-mono">
                                            CAM-0${i}
                                        </div>
                                        <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-slate-900/80 px-1.5 py-0.5 rounded-full">
                                            <span class="w-2 h-2 rounded-full ${isCam3 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}"></span>
                                            <span class="text-[0.58rem] font-bold ${isCam3 ? 'text-rose-400' : 'text-emerald-400'}">${isCam3 ? 'ALERT' : 'LIVE'}</span>
                                        </div>
                                    </div>
                                    <div class="p-2.5 bg-surface-0 flex items-center justify-between text-xs">
                                        <span class="text-primary font-bold">Aisle 0${Math.ceil(i/2)} Bay ${((i-1)%2)+1}</span>
                                        <span class="text-[0.68rem] text-muted">30 FPS</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Customer Journey & Flow Telemetry -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div class="glass-panel p-5">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="footprints" class="w-4 h-4 text-blue-400"></i>
                            <h3 class="text-sm font-bold text-primary font-heading">Shopper Trajectory Flow</h3>
                        </div>
                        <div class="space-y-3">
                            ${[
                                { route: 'Entrance → Fresh Produce', pct: 92 },
                                { route: 'Produce → Dairy & Cold', pct: 78 },
                                { route: 'Beverage → Snack Aisle', pct: 65 },
                                { route: 'Bakery → Express POS', pct: 48 }
                            ].map(f => `
                                <div class="space-y-1">
                                    <div class="flex justify-between text-xs">
                                        <span class="text-secondary">${f.route}</span>
                                        <span class="font-bold text-primary">${f.pct}%</span>
                                    </div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill blue" style="width:${f.pct}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="glass-panel p-5">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="timer" class="w-4 h-4 text-amber-400"></i>
                            <h3 class="text-sm font-bold text-primary font-heading">Average Dwell Time</h3>
                        </div>
                        <div class="space-y-3">
                            ${[
                                { zone: 'Aisle 1: Beverages', time: '4.8 min', pct: 85 },
                                { zone: 'Aisle 3: Dairy Refrigerated', time: '3.6 min', pct: 68 },
                                { zone: 'Aisle 2: Snacks & Confectionery', time: '2.4 min', pct: 52 },
                                { zone: 'Checkout Queue Zone', time: '1.8 min', pct: 35 }
                            ].map(d => `
                                <div class="space-y-1">
                                    <div class="flex justify-between text-xs">
                                        <span class="text-secondary">${d.zone}</span>
                                        <span class="font-bold text-amber-400 font-mono">${d.time}</span>
                                    </div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill amber" style="width:${d.pct}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="glass-panel p-5">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="shopping-bag" class="w-4 h-4 text-emerald-400"></i>
                            <h3 class="text-sm font-bold text-primary font-heading">High-Conversion Zones</h3>
                        </div>
                        <div class="space-y-3">
                            ${[
                                { cap: 'End Cap Promos (Aisle 1 & 2)', rate: '44%', pct: 88 },
                                { cap: 'Eye-Level Golden Shelf', rate: '36%', pct: 72 },
                                { cap: 'Checkout Impulse Coolers', rate: '28%', pct: 56 },
                                { cap: 'Bulk Floor Island Displays', rate: '19%', pct: 38 }
                            ].map(c => `
                                <div class="space-y-1">
                                    <div class="flex justify-between text-xs">
                                        <span class="text-secondary">${c.cap}</span>
                                        <span class="font-bold text-emerald-400 font-mono">${c.rate}</span>
                                    </div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill emerald" style="width:${c.pct}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- IoT Sensor Network Status -->
                <div class="mb-6">
                    ${KpiCard.renderSectionHeader('Cold Chain & Environmental IoT Node Matrix')}
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        ${[
                            { label: 'Zone A: Produce', temp: '4°C', humidity: '85%', icon: '🥬', status: 'optimal' },
                            { label: 'Zone B: Dairy Cold', temp: '3°C', humidity: '78%', icon: '🧀', status: 'optimal' },
                            { label: 'Zone C: Deep Freeze', temp: '-18°C', humidity: '42%', icon: '🧊', status: 'optimal' },
                            { label: 'Zone D: Bakery Ovens', temp: '24°C', humidity: '38%', icon: '🍞', status: 'optimal' },
                            { label: 'Zone E: Meat Vault', temp: '2°C', humidity: '82%', icon: '🥩', status: 'optimal' },
                            { label: 'Zone F: Main Ambient', temp: '22°C', humidity: '48%', icon: '🏪', status: 'optimal' },
                        ].map(s => `
                            <div class="glass-panel p-3.5 text-center">
                                <div class="text-2xl mb-1">${s.icon}</div>
                                <div class="font-bold text-xs text-primary mb-2">${s.label}</div>
                                <div class="grid grid-cols-2 gap-1 text-xs border-t border-subtle pt-2">
                                    <div>
                                        <div class="text-[0.6rem] text-muted uppercase">Temp</div>
                                        <div class="font-bold text-blue-400 font-mono">${s.temp}</div>
                                    </div>
                                    <div>
                                        <div class="text-[0.6rem] text-muted uppercase">Humid</div>
                                        <div class="font-bold text-secondary font-mono">${s.humidity}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Wire camera clicks for live modal preview
        container.querySelectorAll('.cam-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const cam = item.dataset.cam;
                App.showModal({
                    title: `Live Feed — ${cam}`,
                    body: `
                        <div class="space-y-3">
                            <div class="bg-slate-950 rounded-xl p-8 text-center border border-slate-800">
                                <div class="text-4xl mb-2">📹</div>
                                <div class="text-sm font-bold text-primary">Streaming 1080p Ultra-HD Stream</div>
                                <div class="text-xs text-muted font-mono mt-1">Camera IP: 192.168.1.10${cam.slice(-1)} • H.265 Encoded</div>
                            </div>
                            <div class="flex justify-between text-xs text-secondary">
                                <span>Bitrate: <b>4.8 Mbps</b></span>
                                <span>Packet Loss: <b>0.00%</b></span>
                                <span>TensorRT Pipeline: <b class="text-emerald-400">Active</b></span>
                            </div>
                        </div>
                    `,
                    confirmText: 'Open Full Monitor',
                    onConfirm: () => {
                        location.hash = '#/monitor';
                    }
                });
            });
        });
    }
};
