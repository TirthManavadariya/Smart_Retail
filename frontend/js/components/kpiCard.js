/** Reusable KPI card components */
const KpiCard = {
    renderRow(metrics) {
        return `<div class="grid grid-cols-${metrics.length} gap-4 fade-in">${metrics.map(m => {
            const accent = m.accent || 'primary';
            return `<div class="kpi-card accent-${accent}">
                <div class="flex justify-between items-start mb-3.5">
                    <div class="kpi-icon-box ${accent}">${m.icon || ''}</div>
                    <span class="kpi-chip ${accent}">${m.chip_text || ''}</span>
                </div>
                <div class="kpi-label">${m.label}</div>
                <div class="kpi-value">${m.value}</div>
            </div>`;
        }).join('')}</div>`;
    },
    renderSectionHeader(title, subtitle = '') {
        const sub = subtitle ? `<p class="text-on-surface-variant text-[0.8rem] mt-0.5">${subtitle}</p>` : '';
        return `<div class="mb-4"><h2 class="text-on-surface text-[1.2rem] font-bold">${title}</h2>${sub}</div>`;
    },
    renderPageHeader(label, title) {
        return `<div class="mb-7"><div class="section-label">${label}</div><h1 class="section-title">${title}</h1></div>`;
    }
};
