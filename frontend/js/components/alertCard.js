/** Reusable alert card component */
const AlertCard = {
    render(a) {
        const sev = a.severity >= 4 ? 'critical' : a.severity >= 3 ? 'warning' : 'info';
        const badge = a.severity >= 4 ? 'Loss Warning' : a.severity >= 3 ? 'Compliance' : 'Low Risk';
        const loss = a.revenue_impact ? `₹${Number(a.revenue_impact).toLocaleString()}` : '₹0';
        return `<div class="alert-card severity-${sev}">
            <div class="flex justify-between items-start mb-2">
                <span class="alert-badge ${sev}">${badge}</span>
                <span class="text-on-surface-variant text-[0.65rem]">${a.time_ago || ''}</span>
            </div>
            <div class="text-on-surface font-bold text-[0.9rem] mb-1">${a.message}</div>
            <div class="text-on-surface-variant text-[0.75rem] mb-2.5">${a.detail || a.sku_id || ''}</div>
            <div class="bg-surface-lowest rounded-md px-3 py-2 flex justify-between items-center">
                <span class="text-on-surface-variant text-[0.6rem] uppercase font-semibold tracking-wide">Est. Loss</span>
                <span class="text-on-surface text-[0.85rem] font-black">${loss}</span>
            </div>
        </div>`;
    }
};
