/**
 * ShelfIQ — Reusable Table & Metric Visualizations
 */
const Tables = {
    render(headers, rows, opts = {}) {
        const ths = headers.map(h => {
            const align = h.align === 'center' ? 'text-center' : h.align === 'right' ? 'text-right' : 'text-left';
            return `<th class="${align}">${h.label}</th>`;
        }).join('');

        const trs = rows.map(r => `<tr>${r}</tr>`).join('');

        return `
            <div class="glass-panel">
                ${opts.title ? `
                    <div class="panel-header">
                        <div>
                            <div class="panel-title">${opts.title}</div>
                            ${opts.subtitle ? `<div class="panel-subtitle">${opts.subtitle}</div>` : ''}
                        </div>
                        ${opts.headerRight || ''}
                    </div>
                ` : ''}
                <div class="custom-table-wrapper">
                    <table class="custom-table">
                        <thead>
                            <tr>${ths}</tr>
                        </thead>
                        <tbody>${trs}</tbody>
                    </table>
                </div>
                ${opts.footer ? `<div class="p-3 border-t border-subtle bg-surface-1 text-xs text-muted">${opts.footer}</div>` : ''}
            </div>
        `;
    },

    complianceBars(aisles) {
        return aisles.map(a => {
            const isHealthy = a.pct >= 90;
            const isModerate = a.pct >= 80 && a.pct < 90;
            const colorClass = isHealthy ? 'emerald' : isModerate ? 'amber' : 'rose';
            const badgeClass = isHealthy ? 'badge-optimal' : isModerate ? 'badge-warning' : 'badge-critical';

            return `
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-1.5">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-primary">${a.name}</span>
                            <span class="badge ${badgeClass} text-[0.6rem] py-0.5 px-1.5">${a.pct >= 90 ? 'Optimal' : a.pct >= 80 ? 'Attention' : 'Deficit'}</span>
                        </div>
                        <span class="text-xs font-mono font-bold text-primary">${a.pct}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill ${colorClass}" style="width: ${a.pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
};
