/** Shelf Analysis Page */
const ShelfAnalysisPage = {
    async render(container) {
        container.innerHTML = `<div class="fade-in">
            <div class="text-primary text-[0.75rem] mb-1">Aisle 4 &nbsp;›&nbsp; Section B &nbsp;›&nbsp; <span class="text-on-surface-variant">Shelf Detail</span></div>
            <div class="mb-7"><h1 class="section-title">Section B: Beverages & Tonics</h1></div>
            <div class="grid grid-cols-8 gap-4">
                <div class="col-span-5">
                    <div class="panel p-5 mb-3"><div class="text-center py-12 text-outline"><span class="text-4xl block mb-2">📷</span>Camera feed available when webcam is connected</div></div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="panel p-4"><div class="flex justify-between items-center mb-3"><span class="text-on-surface-variant text-[0.72rem] uppercase tracking-wider font-medium">Planogram Reference</span><span class="text-primary">📋</span></div><div class="flex items-center gap-3.5"><div class="w-[50px] h-[50px] bg-surface-high rounded-lg flex items-center justify-center text-outline">🖼️</div><div><div class="text-on-surface text-[1.5rem] font-black">96% Match</div><div class="text-outline text-[0.68rem] uppercase">Last Update: 2h ago</div></div></div></div>
                        <div class="panel p-4"><div class="flex justify-between items-center mb-3"><span class="text-on-surface-variant text-[0.72rem] uppercase tracking-wider font-medium">Health Index</span><span class="text-secondary">⚡</span></div><div class="flex items-center gap-3.5"><div class="w-[50px] h-[50px] rounded-full border-[3px] border-primary flex items-center justify-center text-primary text-[0.8rem] font-bold">82%</div><div><div class="text-on-surface text-[1.5rem] font-black">-12% Low</div><div class="text-outline text-[0.68rem] uppercase">Velocity: High (Aisle 4)</div></div></div></div>
                    </div>
                </div>
                <div class="col-span-3">
                    <div class="panel mb-3"><div class="panel-header"><div class="flex items-center gap-2"><span class="text-secondary">🚨</span><span class="text-on-surface text-[0.95rem] font-bold">High Priority Alerts</span></div></div>
                    <div class="p-3.5">
                        <div class="mb-3.5"><div class="flex items-start gap-2.5"><span class="text-error text-base">⚠</span><div><div class="text-on-surface font-bold text-[0.88rem]">Stockout: Spark Energy 250ml</div><div class="text-on-surface-variant text-[0.72rem] mt-0.5">4 expected facings detected as empty. Lost revenue: ₹240/hr.</div></div></div></div>
                        <div class="border-t border-outline-variant/10 my-3"></div>
                        <div><div class="flex items-start gap-2.5"><span class="text-secondary text-base">ℹ</span><div><div class="text-on-surface font-bold text-[0.88rem]">Price Mismatch: Alpine Water</div><div class="text-on-surface-variant text-[0.72rem] mt-0.5">Shelf tag shows ₹99. System lists ₹129.</div></div></div></div>
                    </div></div>
                    <div class="panel p-4"><div class="flex items-center gap-2 mb-3.5"><span class="text-primary">⚙️</span><span class="text-on-surface text-[0.92rem] font-bold">CV Performance</span></div>
                    <div class="mb-3.5"><div class="flex justify-between mb-1"><span class="text-on-surface-variant text-[0.75rem]">Inference Latency</span><span class="text-on-surface text-[0.75rem] font-bold">24ms</span></div><div class="compliance-bar-track"><div class="compliance-bar-fill healthy" style="width:72%"></div></div></div>
                    <div class="mb-3.5"><div class="flex justify-between mb-1"><span class="text-on-surface-variant text-[0.75rem]">Model Confidence</span><span class="text-on-surface text-[0.75rem] font-bold">99.2%</span></div><div class="compliance-bar-track"><div class="compliance-bar-fill healthy" style="width:99%"></div></div></div>
                    <div class="flex justify-between pt-2 border-t border-outline-variant/10"><span class="text-on-surface-variant text-[0.75rem]">Total SKU Detection Area</span><span class="text-on-surface text-[0.82rem] font-bold">14.2 sq.m</span></div></div>
                </div>
            </div>
            <div class="h-6"></div>
            ${KpiCard.renderSectionHeader('SKU-Level Detailed Analysis')}
            <div id="sku-table"></div>
        </div>`;
        _renderSkuTable(document.getElementById('sku-table'));
    }
};

function _renderSkuTable(el) {
    const products = [
        { name: 'Coca-Cola 500ml', sku: 'SKU-14829', exp: 6, det: 6, status: 'IN STOCK', price: 'Match', action: '—' },
        { name: "Lay's Classic Chips", sku: 'SKU-29341', exp: 4, det: 4, status: 'IN STOCK', price: 'Match', action: '—' },
        { name: 'Whole Milk 1L', sku: 'SKU-08123', exp: 8, det: 2, status: 'LOW STOCK', price: 'Match', action: 'REPLENISH' },
        { name: 'Greek Yogurt 500g', sku: 'SKU-55201', exp: 5, det: 0, status: 'OUT OF STOCK', price: 'N/A', action: 'REPLENISH' },
        { name: 'Sparkling Water 1L', sku: 'SKU-61033', exp: 6, det: 6, status: 'IN STOCK', price: 'Mismatch', action: 'FIX PRICE' },
    ];
    const rows = products.map(p => {
        const sCls = p.status === 'IN STOCK' ? 'in-stock' : p.status === 'LOW STOCK' ? 'low-stock' : 'out';
        const check = p.det >= p.exp ? '✅' : '⚠';
        const priceIcon = p.price === 'Match' ? '✅' : p.price === 'Mismatch' ? '🛑' : '⚫';
        return `<td class="px-3.5 py-3"><div class="flex items-center gap-2.5"><div class="w-9 h-9 bg-surface-high rounded-md flex items-center justify-center text-outline text-[0.7rem]">📦</div><div><div class="text-on-surface text-[0.82rem] font-semibold">${p.name}</div><div class="text-outline text-[0.68rem]">${p.sku}</div></div></div></td><td class="px-3.5 py-3 text-center"><span class="text-on-surface-variant">${p.exp}</span> / <span class="text-primary font-bold">${p.det}</span> ${check}</td><td class="px-3.5 py-3 text-center"><span class="sku-status ${sCls}">${p.status}</span></td><td class="px-3.5 py-3 text-center">${priceIcon} ${p.price}</td><td class="px-3.5 py-3 text-center text-outline">${p.action}</td>`;
    }).join('</tr><tr class="border-b border-outline-variant/[0.08]">');
    el.innerHTML = Tables.render(
        [{ label: 'Product Name / SKU' }, { label: 'Expected vs. Detected', align: 'center' }, { label: 'Stock Status', align: 'center' }, { label: 'Price Accuracy', align: 'center' }, { label: 'Actions', align: 'center' }],
        products.map(() => ''), // placeholder, we override
    ).replace('<tbody></tbody>', `<tbody><tr class="border-b border-outline-variant/[0.08]">${rows}</tr></tbody>`);
}
