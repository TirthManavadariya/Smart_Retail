/** Alerts Page — Alert Inbox + Task Workflow */
const AlertsPage = {
    async render(container) {
        const sid = App.storeId;
        const [inbox, tasks, assoc] = await Promise.all([
            API.get('/api/alerts/inbox', { store_id: sid }),
            API.get('/api/alerts/tasks'),
            API.get('/api/alerts/associates'),
        ]);

        const alertCards = inbox.alerts.map((a, i) => {
            const sev = a.severity >= 4 ? 'critical' : a.severity >= 3 ? 'warning' : 'info';
            const rgb = a.severity >= 4 ? '255,180,171' : a.severity >= 3 ? '206,203,91' : '188,201,202';
            const assignedHtml = a.assigned_to ? `<span class="text-primary text-[0.65rem] font-semibold">✅ Assigned to ${a.assigned_to}</span>` : `<button class="btn-ghost text-xs mt-2 assign-btn" data-id="${a.id}">📋 Assign</button>`;
            return `<div class="rounded-xl p-3.5 mb-3" style="background:#222a3b;border:1px solid rgba(${rgb},0.2)">
                <div class="flex justify-between mb-2"><span class="text-[0.62rem] font-bold uppercase" style="color:rgb(${rgb});background:rgba(${rgb},0.1);padding:2px 8px;border-radius:3px">${a.impact}</span><span class="text-outline text-[0.65rem]">${a.time_ago}</span></div>
                <div class="flex gap-3 items-start"><div class="w-[60px] h-[50px] bg-surface-low rounded-md flex-shrink-0 flex items-center justify-center text-outline text-[0.7rem]">📷</div>
                <div class="flex-1"><div class="text-on-surface font-bold text-[0.88rem]">${a.title}</div><div class="text-on-surface-variant text-[0.72rem] mt-0.5">${a.detail}</div>
                <div class="text-primary text-[0.70rem] mt-1.5 px-2 py-1.5 bg-primary/[0.06] rounded-md border-l-2 border-primary">🔧 <b>Action:</b> ${a.corrective}</div>
                ${assignedHtml}</div></div></div>`;
        }).join('');

        const taskCard = (t, cls) => `<div class="task-card ${cls}"><div class="text-on-surface text-[0.82rem] font-semibold">${t.title}</div><div class="text-on-surface-variant text-[0.68rem] mt-0.5">📍 ${t.location || 'N/A'}</div><div class="flex justify-between mt-2"><span class="bg-surface-highest text-outline text-[0.6rem] px-2 py-0.5 rounded">${t.assignee || 'UN'}</span><span class="text-outline text-[0.65rem]">${t.due || t.started || ''}</span></div></div>`;

        const assocRows = assoc.associates.map(a => {
            const sColor = a.status === 'Active' ? '#6ee6ee' : '#cecb5b';
            return `<tr class="border-b border-outline-variant/[0.08]"><td class="px-3.5 py-3"><div class="flex items-center gap-2.5"><div class="w-[30px] h-[30px] rounded-full bg-surface-high flex items-center justify-center text-outline text-[0.7rem]">👤</div><span class="text-on-surface font-semibold text-[0.82rem]">${a.name}</span></div></td><td class="px-3.5 py-3 text-center"><span style="color:${sColor}" class="text-[0.72rem] font-medium"><span class="inline-block w-1.5 h-1.5 rounded-full mr-1" style="background:${sColor}"></span>${a.status}</span></td><td class="px-3.5 py-3 text-center text-on-surface font-semibold">${a.tasks_done}</td><td class="px-3.5 py-3 text-center text-on-surface-variant">${a.avg_resp}</td></tr>`;
        }).join('');

        container.innerHTML = `<div class="fade-in">
            <div class="flex justify-between items-start mb-6"><div><h1 class="section-title">Alert Management</h1><p class="text-on-surface-variant text-[0.82rem] mt-1">Operational response — Active Monitoring</p></div>
            <div class="flex gap-3">
                <div class="kpi-card accent-primary" style="padding:14px 18px;min-width:140px"><div class="text-on-surface-variant text-[0.62rem] uppercase tracking-wider font-medium">Avg Response Time</div><div class="text-primary text-[1.6rem] font-black">${assoc.avg_response_time}m</div><div class="text-on-surface-variant text-[0.65rem]">↘ 12% from yesterday</div></div>
                <div class="kpi-card accent-dim" style="padding:14px 18px;min-width:140px"><div class="text-on-surface-variant text-[0.62rem] uppercase tracking-wider font-medium">Tasks Resolved</div><div class="text-on-surface text-[1.6rem] font-black">${assoc.tasks_resolved}</div><div class="text-primary text-[0.65rem]">✅ 88% completion rate</div></div>
            </div></div>

            <div class="grid grid-cols-5 gap-4 mb-6">
                <div class="col-span-2"><div class="panel h-full"><div class="panel-header"><div class="flex items-center gap-2"><span class="text-error">✳</span><span class="text-on-surface text-[0.95rem] font-bold">Alert Inbox</span></div><span class="bg-primary/10 text-primary text-[0.68rem] px-2.5 py-1 rounded font-semibold">Priority</span></div><div class="p-3.5">${alertCards}</div></div></div>
                <div class="col-span-3">
                    <div class="flex justify-between items-center mb-3"><div class="flex items-center gap-2"><span class="text-primary">📋</span><span class="text-on-surface text-[0.95rem] font-bold">Task Workflow</span></div><span class="text-on-surface-variant text-[0.72rem]">Active Associates: 12 Online</span></div>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="panel"><div class="p-3.5 flex justify-between items-center"><span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-error"></span><span class="text-on-surface text-[0.82rem] font-bold">TO DO</span></span><span class="text-outline text-[0.75rem]">${tasks.todo.length}</span></div><div class="px-3.5 pb-3.5">${tasks.todo.map(t => taskCard(t, 'todo')).join('')}</div></div>
                        <div class="panel"><div class="p-3.5 flex justify-between items-center"><span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-secondary"></span><span class="text-on-surface text-[0.82rem] font-bold">IN PROGRESS</span></span><span class="text-outline text-[0.75rem]">${tasks.in_progress.length}</span></div><div class="px-3.5 pb-3.5">${tasks.in_progress.map(t => `<div class="task-card progress"><div class="flex justify-between items-center"><span class="text-on-surface text-[0.82rem] font-semibold">${t.title}</span><span class="bg-primary/10 text-primary text-[0.6rem] px-1.5 py-0.5 rounded">${t.progress}%</span></div><div class="compliance-bar-track mt-1.5"><div class="compliance-bar-fill healthy" style="width:${t.progress}%"></div></div><div class="flex justify-between mt-2"><span class="text-outline text-[0.65rem]">${t.assignee}</span><span class="text-outline text-[0.65rem]">${t.started}</span></div></div>`).join('')}</div></div>
                        <div class="panel"><div class="p-3.5 flex justify-between items-center"><span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-primary"></span><span class="text-on-surface text-[0.82rem] font-bold">COMPLETED</span></span><span class="text-outline text-[0.75rem]">${tasks.completed.length}</span></div><div class="px-3.5 pb-3.5">${tasks.completed.map(t => `<div class="task-card complete"><div class="flex justify-between items-center"><span class="text-on-surface text-[0.82rem] font-semibold">${t.title}</span><span class="text-primary">✅</span></div><div class="text-outline text-[0.65rem] mt-1.5">${t.assignee} • Verified</div></div>`).join('')}</div></div>
                    </div>
                </div>
            </div>

            <h2 class="text-on-surface text-[1.05rem] font-bold mb-3.5">Associate Performance</h2>
            <div class="panel overflow-x-auto"><table class="w-full border-collapse"><thead><tr class="border-b border-outline-variant/[0.15]"><th class="text-left px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider">Associate</th><th class="text-center px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider">Status</th><th class="text-center px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider">Tasks Done</th><th class="text-center px-3.5 py-3 text-on-surface-variant text-[0.65rem] uppercase tracking-wider">Avg Resp. Time</th></tr></thead><tbody>${assocRows}</tbody></table></div>
        </div>`;

        // Wire assign buttons
        container.querySelectorAll('.assign-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const res = await API.post('/api/alerts/assign', { alert_id: btn.dataset.id });
                btn.outerHTML = `<span class="text-primary text-[0.65rem] font-semibold">✅ Assigned to ${res.assignee}</span>`;
            });
        });
    }
};
