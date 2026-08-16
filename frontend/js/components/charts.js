/**
 * ShelfIQ — Chart.js Theme Engine & Responsive Visualizations
 */
const Charts = (() => {
    const instances = {};

    function _getThemeColors() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        return {
            textColor: isDark ? '#94a3b8' : '#475569',
            gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            tooltipBg: isDark ? '#0d1527' : '#ffffff',
            tooltipBorder: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.3)',
            tooltipText: isDark ? '#f1f5f9' : '#0f172a',
            primary: '#38bdf8',
            emerald: '#10b981',
            amber: '#f59e0b',
            rose: '#f43f5e',
            purple: '#a855f7'
        };
    }

    function _setDefaults() {
        const theme = _getThemeColors();
        Chart.defaults.color = theme.textColor;
        Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
        Chart.defaults.font.size = 11;
        Chart.defaults.plugins.legend.display = false;
        Chart.defaults.plugins.tooltip.backgroundColor = theme.tooltipBg;
        Chart.defaults.plugins.tooltip.borderColor = theme.tooltipBorder;
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.titleColor = theme.tooltipText;
        Chart.defaults.plugins.tooltip.bodyColor = theme.textColor;
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
    }

    function destroy(id) {
        if (instances[id]) {
            instances[id].destroy();
            delete instances[id];
        }
    }

    function destroyAll() {
        Object.keys(instances).forEach(destroy);
    }

    function line(canvasId, labels, datasets, opts = {}) {
        _setDefaults();
        destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const theme = _getThemeColors();
        instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: {
                        grid: { color: theme.gridColor, drawBorder: false },
                        ticks: { color: theme.textColor, maxTicksLimit: 10 }
                    },
                    y: {
                        grid: { color: theme.gridColor, drawBorder: false },
                        ticks: { color: theme.textColor }
                    }
                },
                plugins: {
                    tooltip: {
                        enabled: true,
                        usePointStyle: true
                    }
                },
                ...opts
            }
        });
        return instances[canvasId];
    }

    function bar(canvasId, labels, data, opts = {}) {
        _setDefaults();
        destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const theme = _getThemeColors();
        instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: data.map((_, i) => `rgba(56, 189, 248, ${0.45 + (i % 5) * 0.1})`),
                    borderColor: '#38bdf8',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false }, ticks: { color: theme.textColor } },
                    y: { grid: { color: theme.gridColor }, ticks: { color: theme.textColor } }
                },
                ...opts
            }
        });
        return instances[canvasId];
    }

    function doughnut(canvasId, labels, data, colors) {
        _setDefaults();
        destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const theme = _getThemeColors();
        instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors || [theme.primary, theme.emerald, theme.amber, theme.rose, theme.purple],
                    borderWidth: 3,
                    borderColor: theme.tooltipBg
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: { color: theme.textColor, padding: 14, usePointStyle: true, pointStyle: 'circle' }
                    }
                }
            }
        });
        return instances[canvasId];
    }

    return { line, bar, doughnut, destroy, destroyAll, getTheme: _getThemeColors };
})();
