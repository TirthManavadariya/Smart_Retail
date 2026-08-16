/**
 * ShelfIQ — Application Controller, Router & UI State Management
 */
const App = (() => {
    let storeId = 'STORE01';
    let currentPage = null;
    let refreshTimer = null;
    let currentTheme = localStorage.getItem('shelfiq_theme') || 'dark';

    const ROUTES = [
        { hash: '#/dashboard',      label: 'Store Health',       icon: 'layout-dashboard', page: DashboardPage,     section: 'OPERATIONS' },
        { hash: '#/monitor',        label: 'Live CV Monitor',    icon: 'camera',           page: LiveMonitorPage,   section: 'OPERATIONS' },
        { hash: '#/shelf-analysis', label: 'Shelf Intelligence', icon: 'scan-line',        page: ShelfAnalysisPage, section: 'INTELLIGENCE' },
        { hash: '#/optimizer',      label: 'AI Shelf Optimizer', icon: 'sparkles',         page: ShelfOptimizerPage,section: 'INTELLIGENCE' },
        { hash: '#/forecast',       label: 'Demand & Replenish', icon: 'trending-up',      page: ForecastPage,      section: 'INTELLIGENCE' },
        { hash: '#/alerts',         label: 'Incident Hub',       icon: 'alert-triangle',   page: AlertsPage,        section: 'RESPONSE', badge: '3' },
        { hash: '#/smart-store',    label: 'Smart Store IoT',    icon: 'store',            page: SmartStorePage,    section: 'SYSTEM' },
        { hash: '#/settings',       label: 'Settings & Telemetry',icon: 'sliders',          page: SettingsPage,      section: 'SYSTEM' },
    ];

    function _initTheme() {
        document.documentElement.setAttribute('data-theme', currentTheme);
        _updateThemeIcons();
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', currentTheme);
                localStorage.setItem('shelfiq_theme', currentTheme);
                _updateThemeIcons();
                Charts.destroyAll();
                if (currentPage && currentPage.page) {
                    _navigate(location.hash || '#/dashboard');
                }
                showToast('Theme Changed', `Switched to ${currentTheme} mode`, 'info');
            });
        }
    }

    function _updateThemeIcons() {
        const sun = document.querySelector('.theme-icon-sun');
        const moon = document.querySelector('.theme-icon-moon');
        if (sun && moon) {
            if (currentTheme === 'dark') {
                sun.classList.remove('hidden');
                moon.classList.add('hidden');
            } else {
                sun.classList.add('hidden');
                moon.classList.remove('hidden');
            }
        }
    }

    function _buildNav() {
        const nav = document.getElementById('nav-list');
        if (!nav) return;
        let lastSection = '';
        let html = '';

        for (const r of ROUTES) {
            if (r.section !== lastSection) {
                html += `<div class="nav-section-title">${r.section}</div>`;
                lastSection = r.section;
            }
            const badgeHtml = r.badge ? `<span class="nav-badge bg-rose-500/20 text-rose-400 border border-rose-500/30">${r.badge}</span>` : '';
            html += `
                <a href="${r.hash}" class="nav-link-item" data-hash="${r.hash}">
                    <span class="nav-icon"><i data-lucide="${r.icon}" class="w-4 h-4"></i></span>
                    <span class="nav-label">${r.label}</span>
                    ${badgeHtml}
                </a>
            `;
        }
        nav.innerHTML = html;
        _renderLucideIcons();
    }

    function _buildStoreSelector() {
        const sel = document.getElementById('store-selector');
        if (!sel) return;
        API.get('/api/stores').then(stores => {
            sel.innerHTML = stores.map(s => `<option value="${s.store_id}" ${s.store_id === storeId ? 'selected' : ''}>${s.name}</option>`).join('');
        }).catch(() => {});

        sel.addEventListener('change', () => {
            storeId = sel.value;
            const selectedText = sel.options[sel.selectedIndex].text;
            showToast('Store Switch', `Switched view to ${selectedText}`, 'info');
            _navigate(location.hash || '#/dashboard');
        });
    }

    function _initNotifications() {
        const btn = document.getElementById('notif-btn');
        const dropdown = document.getElementById('notif-dropdown');
        const list = document.getElementById('notif-list-container');

        if (btn && dropdown) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && e.target !== btn) {
                    dropdown.classList.remove('show');
                }
            });
        }

        // Render mock notification items
        if (list) {
            const notifs = [
                { icon: 'alert-triangle', col: 'text-rose-400', title: 'Critical Stockout Alert', desc: 'Red Bull 250ml facings empty on Bay 3', time: '3m ago' },
                { icon: 'scan-line', col: 'text-amber-400', title: 'Planogram Violation', desc: 'Misplaced chips detected in snack section', time: '14m ago' },
                { icon: 'sparkles', col: 'text-blue-400', title: 'AI Optimizer Ready', desc: 'New planogram calculated (+16.4% lift)', time: '1h ago' }
            ];
            list.innerHTML = notifs.map(n => `
                <div class="notif-item">
                    <div class="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center ${n.col} flex-shrink-0">
                        <i data-lucide="${n.icon}" class="w-4 h-4"></i>
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <div class="text-xs font-bold text-primary truncate">${n.title}</div>
                        <div class="text-[0.7rem] text-secondary truncate">${n.desc}</div>
                        <div class="text-[0.65rem] text-muted mt-0.5">${n.time}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    function _initSidebarToggles() {
        const sidebar = document.getElementById('sidebar');
        const collapseBtn = document.getElementById('sidebar-collapse-btn');
        const mobileBtn = document.getElementById('mobile-menu-btn');

        if (collapseBtn && sidebar) {
            collapseBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                _renderLucideIcons();
            });
        }

        if (mobileBtn && sidebar) {
            mobileBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        const refreshBtn = document.getElementById('refresh-page-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                refreshBtn.querySelector('i')?.classList.add('animate-spin');
                setTimeout(() => refreshBtn.querySelector('i')?.classList.remove('animate-spin'), 600);
                showToast('Refreshing', 'Fetching latest computer vision telemetry...', 'info');
                _navigate(location.hash || '#/dashboard');
            });
        }
    }

    function _setActiveNav(hash) {
        document.querySelectorAll('.nav-link-item').forEach(item => {
            item.classList.toggle('active', item.dataset.hash === hash);
        });
    }

    function _renderLucideIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    async function _navigate(hash) {
        Charts.destroyAll();
        clearInterval(refreshTimer);

        const route = ROUTES.find(r => r.hash === hash) || ROUTES[0];
        _setActiveNav(route.hash);

        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-80 gap-3">
                <div class="w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <div class="text-xs font-semibold text-secondary tracking-wider uppercase">Loading Intelligence Telemetry...</div>
            </div>
        `;

        try {
            await route.page.render(container);
            _renderLucideIcons();
        } catch (err) {
            container.innerHTML = `
                <div class="glass-panel p-10 text-center max-w-lg mx-auto my-12">
                    <div class="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center text-2xl mb-4">⚠️</div>
                    <h2 class="text-lg font-bold text-primary mb-1.5">Failed to render view</h2>
                    <p class="text-xs text-secondary mb-5">${err.message}</p>
                    <button class="btn-primary text-xs mx-auto" onclick="location.reload()">Reload Application</button>
                </div>
            `;
            console.error('Render error:', err);
        }
        currentPage = route;
    }

    function showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: 'check-circle-2',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        toast.innerHTML = `
            <div class="text-${type === 'success' ? 'emerald' : type === 'error' ? 'rose' : type === 'warning' ? 'amber' : 'blue'}-400 flex-shrink-0">
                <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 overflow-hidden">
                <div class="text-xs font-bold text-primary">${title}</div>
                <div class="text-[0.75rem] text-secondary truncate">${message}</div>
            </div>
        `;
        container.appendChild(toast);
        _renderLucideIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function showModal({ title, body, confirmText = 'Confirm', onConfirm }) {
        const modal = document.getElementById('global-modal');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const footerEl = document.getElementById('modal-footer');
        const closeBtn = document.getElementById('modal-close-btn');

        if (!modal) return;

        titleEl.textContent = title;
        bodyEl.innerHTML = typeof body === 'string' ? body : '';
        footerEl.innerHTML = `
            <button class="btn-secondary text-xs" id="modal-cancel-btn">Cancel</button>
            <button class="btn-primary text-xs" id="modal-confirm-btn">${confirmText}</button>
        `;

        modal.classList.add('show');
        _renderLucideIcons();

        const close = () => modal.classList.remove('show');
        closeBtn.onclick = close;
        document.getElementById('modal-cancel-btn').onclick = close;
        document.getElementById('modal-confirm-btn').onclick = async () => {
            if (onConfirm) await onConfirm();
            close();
        };
    }

    function init() {
        _initTheme();
        _buildNav();
        _buildStoreSelector();
        _initNotifications();
        _initSidebarToggles();
        window.addEventListener('hashchange', () => _navigate(location.hash));
        _navigate(location.hash || '#/dashboard');
    }

    // Boot
    document.addEventListener('DOMContentLoaded', init);

    return {
        get storeId() { return storeId; },
        set storeId(v) { storeId = v; },
        showToast,
        showModal,
        renderIcons: _renderLucideIcons
    };
})();
