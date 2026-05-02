/**
 * ShelfIQ — SPA Router & Application Controller
 * Hash-based routing, sidebar navigation, global state.
 */
const App = (() => {
    let storeId = 'STORE01';
    let currentPage = null;
    let refreshTimer = null;

    const ROUTES = [
        { hash: '#/dashboard',      label: '📊  Store Health',      page: DashboardPage,     section: 'OPERATIONS' },
        { hash: '#/monitor',        label: '📹  Live Monitor',      page: LiveMonitorPage,   section: 'OPERATIONS' },
        { hash: '#/shelf-analysis', label: '🔬  Shelf Analysis',    page: ShelfAnalysisPage, section: 'ANALYSIS' },
        { hash: '#/optimizer',      label: '🧠  Shelf Optimizer',   page: ShelfOptimizerPage,section: 'ANALYSIS' },
        { hash: '#/forecast',       label: '📈  Demand Forecast',   page: ForecastPage,      section: 'ANALYSIS' },
        { hash: '#/alerts',         label: '🚨  Alert Management',  page: AlertsPage,        section: 'RESPONSE' },
        { hash: '#/smart-store',    label: '🏪  Smart Store',       page: SmartStorePage,    section: 'SYSTEM' },
        { hash: '#/settings',       label: '⚙️  Settings',          page: SettingsPage,      section: 'SYSTEM' },
    ];

    function _buildNav() {
        const nav = document.getElementById('nav-list');
        let lastSection = '';
        let html = '';
        for (const r of ROUTES) {
            if (r.section !== lastSection) {
                html += `<div class="px-4 pt-4 pb-1 text-[0.6rem] uppercase tracking-[0.2em] text-outline font-medium">${r.section}</div>`;
                lastSection = r.section;
            }
            html += `<a href="${r.hash}" class="nav-item" data-hash="${r.hash}">${r.label}</a>`;
        }
        nav.innerHTML = html;
    }

    function _buildStoreSelector() {
        const sel = document.getElementById('store-selector');
        API.get('/api/stores').then(stores => {
            sel.innerHTML = stores.map(s => `<option value="${s.store_id}" ${s.store_id === storeId ? 'selected' : ''}>${s.name}</option>`).join('');
        }).catch(() => {
            sel.innerHTML = '<option value="STORE01">Mumbai — Flagship Store</option><option value="STORE02">Ahmedabad — CG Road</option><option value="STORE03">Delhi — Connaught Place</option>';
        });
        sel.addEventListener('change', () => { storeId = sel.value; _navigate(location.hash || '#/dashboard'); });
    }

    function _setActiveNav(hash) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.hash === hash);
        });
    }

    async function _navigate(hash) {
        Charts.destroyAll();
        clearInterval(refreshTimer);

        const route = ROUTES.find(r => r.hash === hash) || ROUTES[0];
        _setActiveNav(route.hash);

        const container = document.getElementById('app');
        container.innerHTML = '<div class="flex items-center justify-center h-64"><div class="text-primary text-sm">Loading...</div></div>';

        try {
            await route.page.render(container);
        } catch (err) {
            container.innerHTML = `<div class="panel p-8 text-center"><div class="text-4xl mb-3">⚠️</div><div class="text-on-surface text-[1.1rem] font-bold mb-1.5">Could not load page</div><div class="text-on-surface-variant text-[0.82rem] mb-5">${err.message}</div><div class="text-outline text-[0.72rem]">Make sure the backend is running at ${API.BASE}</div></div>`;
            console.error(err);
        }
        currentPage = route;
    }

    function init() {
        _buildNav();
        _buildStoreSelector();
        window.addEventListener('hashchange', () => _navigate(location.hash));
        _navigate(location.hash || '#/dashboard');
    }

    // Boot
    document.addEventListener('DOMContentLoaded', init);

    return {
        get storeId() { return storeId; },
        set storeId(v) { storeId = v; },
    };
})();
