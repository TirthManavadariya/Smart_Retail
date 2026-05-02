/** Chart.js wrapper with ShelfIQ dark theme */
const Charts = (() => {
    const COLORS = { primary: '#6ee6ee', secondary: '#cecb5b', error: '#ffb4ab', surface: '#bcc9ca', grid: 'rgba(61,73,74,0.1)' };
    const instances = {};

    function _defaults() {
        Chart.defaults.color = '#bcc9ca';
        Chart.defaults.font.family = 'Inter';
        Chart.defaults.font.size = 11;
        Chart.defaults.plugins.legend.display = false;
    }

    function destroy(id) { if (instances[id]) { instances[id].destroy(); delete instances[id]; } }

    function line(canvasId, labels, datasets, opts = {}) {
        _defaults(); destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        instances[canvasId] = new Chart(ctx, {
            type: 'line', data: { labels, datasets },
            options: { responsive: true, maintainAspectRatio: false, scales: {
                x: { grid: { color: COLORS.grid }, ticks: { maxTicksLimit: 12 } },
                y: { grid: { color: COLORS.grid } } },
                plugins: { tooltip: { backgroundColor: '#141b2c', borderColor: COLORS.primary, borderWidth: 1 } }, ...opts }
        });
        return instances[canvasId];
    }

    function bar(canvasId, labels, data, opts = {}) {
        _defaults(); destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        instances[canvasId] = new Chart(ctx, {
            type: 'bar', data: { labels, datasets: [{ data, backgroundColor: data.map((_, i) => `rgba(110,230,238,${0.3 + i * 0.05})`), borderRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: {
                x: { grid: { display: false } }, y: { grid: { color: COLORS.grid } } }, ...opts }
        });
        return instances[canvasId];
    }

    function doughnut(canvasId, labels, data, colors) {
        _defaults(); destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        instances[canvasId] = new Chart(ctx, {
            type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#0b1323' }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { display: true, position: 'bottom', labels: { color: '#bcc9ca', padding: 12 } } } }
        });
        return instances[canvasId];
    }

    function destroyAll() { Object.keys(instances).forEach(destroy); }

    return { line, bar, doughnut, destroy, destroyAll, COLORS };
})();
