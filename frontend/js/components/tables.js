/** Dynamic HTML table renderer */
const Tables = {
    render(headers, rows, opts = {}) {
        const ths = headers.map(h => `<th class="text-left px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider font-medium ${h.align === 'center' ? 'text-center' : ''}">${h.label}</th>`).join('');
        const trs = rows.map(r => `<tr class="border-b border-outline-variant/[0.08] hover:bg-surface-high/30 transition-colors">${r}</tr>`).join('');
        return `<div class="panel overflow-x-auto"><table class="w-full border-collapse"><thead><tr class="border-b border-outline-variant/[0.15]">${ths}</tr></thead><tbody>${trs}</tbody></table>${opts.footer || ''}</div>`;
    },
    complianceBars(aisles) {
        return aisles.map(a => {
            const cls = a.pct >= 85 ? 'healthy' : 'warning';
            const col = a.pct >= 85 ? '#dbe2f9' : '#ffb4ab';
            return `<div class="mb-3.5"><div class="flex justify-between mb-1"><span class="text-[0.78rem] font-medium" style="color:${col}">${a.name}</span><span class="text-[0.78rem] font-bold" style="color:${col}">${a.pct}%</span></div><div class="compliance-bar-track"><div class="compliance-bar-fill ${cls}" style="width:${a.pct}%"></div></div></div>`;
        }).join('');
    }
};
