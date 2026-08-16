/**
 * ShelfIQ — Reusable Alert Card Component
 */
const AlertCard = {
    render(a) {
        const isCritical = a.severity >= 4;
        const isWarning = a.severity === 3;
        const sevClass = isCritical ? 'border-rose-500/30 bg-rose-500/5' : isWarning ? 'border-amber-500/30 bg-amber-500/5' : 'border-blue-500/30 bg-blue-500/5';
        const badgeClass = isCritical ? 'badge-critical' : isWarning ? 'badge-warning' : 'badge-info';
        const badgeText = isCritical ? 'Critical Impact' : isWarning ? 'Compliance' : 'Notice';
        const iconName = isCritical ? 'alert-octagon' : isWarning ? 'alert-triangle' : 'info';
        const lossFormatted = a.revenue_impact ? `₹${Number(a.revenue_impact).toLocaleString()}/hr` : '₹0';

        return `
            <div class="glass-panel p-3.5 mb-3 border ${sevClass} hover:translate-x-1 transition-transform">
                <div class="flex items-center justify-between mb-2">
                    <span class="badge ${badgeClass}">
                        <i data-lucide="${iconName}" class="w-3 h-3"></i>
                        ${badgeText}
                    </span>
                    <span class="text-[0.68rem] text-muted font-medium">${a.time_ago || 'Just now'}</span>
                </div>
                <div class="text-sm font-bold text-primary mb-1">${a.message}</div>
                <div class="text-xs text-secondary mb-3">${a.detail || a.sku_id || ''}</div>
                <div class="flex items-center justify-between pt-2 border-t border-subtle">
                    <div class="flex items-center gap-1.5 text-xs text-muted">
                        <span>Est. Revenue Loss:</span>
                        <span class="font-bold text-rose-400 font-mono">${lossFormatted}</span>
                    </div>
                    <a href="#/alerts" class="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
                        Respond <i data-lucide="arrow-right" class="w-3 h-3"></i>
                    </a>
                </div>
            </div>
        `;
    }
};
