/**
 * ShelfIQ — Reusable KPI & Header Components
 */
const KpiCard = {
    renderRow(metrics) {
        return `
            <div class="kpi-grid fade-in">
                ${metrics.map(m => {
                    const accent = m.accent || 'primary';
                    const trendClass = m.trend === 'up' ? 'up' : m.trend === 'down' ? 'down' : 'neutral';
                    const iconName = m.icon || 'activity';

                    return `
                        <div class="kpi-card accent-${accent}">
                            <div class="kpi-top">
                                <div class="kpi-icon-box ${accent}">
                                    <i data-lucide="${iconName}" class="w-5 h-5"></i>
                                </div>
                                ${m.chip_text ? `
                                    <span class="kpi-trend-pill ${trendClass}">
                                        ${m.trend === 'up' ? '↗ ' : m.trend === 'down' ? '↘ ' : ''}${m.chip_text}
                                    </span>
                                ` : ''}
                            </div>
                            <div class="kpi-label">${m.label}</div>
                            <div class="kpi-value-row">
                                <div class="kpi-value">${m.value}</div>
                                ${m.unit ? `<span class="text-xs font-semibold text-secondary">${m.unit}</span>` : ''}
                            </div>
                            ${m.subtext ? `<div class="kpi-subtext">${m.subtext}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderPageHeader(badge, title, actions = '') {
        return `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="badge badge-info">${badge}</span>
                        <span class="text-xs text-muted font-medium">• Live Telemetry</span>
                    </div>
                    <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary font-heading">${title}</h1>
                </div>
                ${actions ? `<div class="flex items-center gap-3 flex-wrap">${actions}</div>` : ''}
            </div>
        `;
    },

    renderSectionHeader(title, subtitle = '', rightElement = '') {
        return `
            <div class="flex items-center justify-between gap-4 mb-3.5">
                <div>
                    <h2 class="text-base font-bold text-primary font-heading">${title}</h2>
                    ${subtitle ? `<p class="text-xs text-muted mt-0.5">${subtitle}</p>` : ''}
                </div>
                ${rightElement ? `<div>${rightElement}</div>` : ''}
            </div>
        `;
    }
};
