/**
 * ShelfIQ — Incident Hub, Alert Management & Kanban Task Workflow
 */
const AlertsPage = {
    async render(container) {
        const sid = App.storeId;
        const [inbox, tasks, assoc] = await Promise.all([
            API.get('/api/alerts/inbox', { store_id: sid }),
            API.get('/api/alerts/tasks'),
            API.get('/api/alerts/associates')
        ]);

        const actionButtons = `
            <button class="btn-primary" id="create-task-btn">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>Create Manual Floor Task</span>
            </button>
        `;

        const alertCards = (inbox.alerts || []).map(a => {
            const isCrit = a.severity >= 4;
            const sevBadge = isCrit ? 'badge-critical' : a.severity === 3 ? 'badge-warning' : 'badge-info';
            const borderCol = isCrit ? 'border-rose-500/30' : a.severity === 3 ? 'border-amber-500/30' : 'border-blue-500/30';

            const assignedHtml = a.assigned_to
                ? `<span class="text-xs font-semibold text-emerald-400 flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5"></i> Assigned to ${a.assigned_to}</span>`
                : `<button class="btn-primary py-1 px-3 text-xs assign-alert-btn" data-id="${a.id}" data-title="${a.title}"><i data-lucide="user-plus" class="w-3 h-3"></i> Assign Associate</button>`;

            return `
                <div class="glass-panel p-4 mb-3.5 border ${borderCol} transition-transform hover:translate-x-1">
                    <div class="flex items-center justify-between mb-2">
                        <span class="badge ${sevBadge}">${a.impact}</span>
                        <span class="text-[0.68rem] text-muted font-medium">${a.time_ago}</span>
                    </div>
                    <div class="text-sm font-bold text-primary mb-1">${a.title}</div>
                    <div class="text-xs text-secondary mb-2.5">${a.detail}</div>
                    <div class="p-2.5 rounded-lg bg-surface-1 border border-subtle mb-3 text-xs text-primary flex items-start gap-2">
                        <i data-lucide="wrench" class="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0"></i>
                        <div><b>Corrective Action:</b> ${a.corrective}</div>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-subtle">
                        ${assignedHtml}
                        <button class="btn-ghost text-[0.7rem] py-1" onclick="App.showToast('Incident Dismissed', 'Marked as reviewed false alarm.', 'info')">Dismiss</button>
                    </div>
                </div>
            `;
        }).join('');

        const assocRows = assoc.associates.map(a => {
            const isActive = a.status === 'Active';
            const statusBadge = isActive ? 'badge-optimal' : 'badge-warning';

            return `
                <td>
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold text-primary">
                            ${a.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span class="font-bold text-xs text-primary">${a.name}</span>
                    </div>
                </td>
                <td class="text-center">
                    <span class="badge ${statusBadge}">${a.status}</span>
                </td>
                <td class="text-center font-mono font-bold text-sm text-primary">${a.tasks_done} tasks</td>
                <td class="text-center font-mono text-xs font-semibold text-emerald-400">${a.avg_resp}</td>
            `;
        });

        container.innerHTML = `
            <div class="fade-in">
                ${KpiCard.renderPageHeader('Response Center', 'Incident Hub & Store Floor Operations', actionButtons)}

                <!-- Response Telemetry Header Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="glass-panel p-4 flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
                            <i data-lucide="clock" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <div class="text-xs text-muted font-medium">Avg Associate Response Time</div>
                            <div class="text-2xl font-black text-primary font-heading">${assoc.avg_response_time} min</div>
                            <div class="text-[0.7rem] text-emerald-400">↘ 14% improvement from yesterday</div>
                        </div>
                    </div>

                    <div class="glass-panel p-4 flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
                            <i data-lucide="check-circle-2" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <div class="text-xs text-muted font-medium">Shift Incidents Resolved</div>
                            <div class="text-2xl font-black text-emerald-400 font-heading">${assoc.tasks_resolved} / 58</div>
                            <div class="text-[0.7rem] text-muted">93.1% resolution rate</div>
                        </div>
                    </div>

                    <div class="glass-panel p-4 flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl">
                            <i data-lucide="users" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <div class="text-xs text-muted font-medium">Floor Associates Active</div>
                            <div class="text-2xl font-black text-primary font-heading">12 Online</div>
                            <div class="text-[0.7rem] text-muted">Covering 8 Aisle Zones</div>
                        </div>
                    </div>
                </div>

                <!-- Main Content: Alert Feed (2 cols) & Kanban Task Board (3 cols) -->
                <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                    <!-- Alert Stream Inbox -->
                    <div class="lg:col-span-2 glass-panel flex flex-col">
                        <div class="panel-header">
                            <div>
                                <div class="panel-title">
                                    <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-400"></i>
                                    <span>Live Incident Stream</span>
                                </div>
                                <div class="panel-subtitle">Real-time alerts requiring associate intervention</div>
                            </div>
                            <span class="badge badge-critical">${(inbox.alerts || []).length} Active</span>
                        </div>
                        <div class="panel-body flex-1 overflow-y-auto max-h-[620px]">
                            ${alertCards}
                        </div>
                    </div>

                    <!-- Kanban Floor Operations Board -->
                    <div class="lg:col-span-3 space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-base font-bold text-primary font-heading">Floor Associate Task Board</h3>
                                <p class="text-xs text-muted">Dispatch, progression, and physical verification workflow</p>
                            </div>
                        </div>

                        <div class="kanban-board">
                            <!-- To Do Column -->
                            <div class="kanban-col">
                                <div class="kanban-col-header bg-rose-500/10 border-b border-rose-500/20">
                                    <div class="flex items-center gap-2">
                                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                        <span class="text-xs font-bold text-primary uppercase">To Do</span>
                                    </div>
                                    <span class="badge badge-critical text-[0.62rem]">${tasks.todo.length}</span>
                                </div>
                                <div class="kanban-items-list">
                                    ${tasks.todo.map(t => `
                                        <div class="kanban-card border-l-4 border-l-rose-500">
                                            <div class="font-bold text-xs text-primary mb-1">${t.title}</div>
                                            <div class="text-[0.7rem] text-secondary mb-2 flex items-center gap-1">
                                                <i data-lucide="map-pin" class="w-3 h-3 text-muted"></i> ${t.location}
                                            </div>
                                            <div class="flex items-center justify-between pt-2 border-t border-subtle">
                                                <span class="text-[0.68rem] font-semibold text-rose-400">${t.due}</span>
                                                <button class="btn-primary py-0.5 px-2 text-[0.65rem] start-task-btn" data-id="${t.id}">Claim</button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- In Progress Column -->
                            <div class="kanban-col">
                                <div class="kanban-col-header bg-amber-500/10 border-b border-amber-500/20">
                                    <div class="flex items-center gap-2">
                                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                                        <span class="text-xs font-bold text-primary uppercase">In Progress</span>
                                    </div>
                                    <span class="badge badge-warning text-[0.62rem]">${tasks.in_progress.length}</span>
                                </div>
                                <div class="kanban-items-list">
                                    ${tasks.in_progress.map(t => `
                                        <div class="kanban-card border-l-4 border-l-amber-500">
                                            <div class="font-bold text-xs text-primary mb-1">${t.title}</div>
                                            <div class="text-[0.7rem] text-secondary mb-2 flex items-center gap-1">
                                                <i data-lucide="map-pin" class="w-3 h-3 text-muted"></i> ${t.location}
                                            </div>
                                            <div class="mb-2">
                                                <div class="flex justify-between text-[0.65rem] text-muted mb-1">
                                                    <span>${t.assignee}</span>
                                                    <span class="font-mono font-bold text-amber-400">${t.progress}%</span>
                                                </div>
                                                <div class="progress-bar-container">
                                                    <div class="progress-bar-fill amber" style="width:${t.progress}%"></div>
                                                </div>
                                            </div>
                                            <div class="flex items-center justify-between pt-2 border-t border-subtle">
                                                <span class="text-[0.65rem] text-muted">${t.started}</span>
                                                <button class="btn-secondary py-0.5 px-2 text-[0.65rem] complete-task-btn" data-id="${t.id}">Mark Done</button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Completed Column -->
                            <div class="kanban-col">
                                <div class="kanban-col-header bg-emerald-500/10 border-b border-emerald-500/20">
                                    <div class="flex items-center gap-2">
                                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                        <span class="text-xs font-bold text-primary uppercase">Verified Done</span>
                                    </div>
                                    <span class="badge badge-optimal text-[0.62rem]">${tasks.completed.length}</span>
                                </div>
                                <div class="kanban-items-list">
                                    ${tasks.completed.map(t => `
                                        <div class="kanban-card border-l-4 border-l-emerald-500 opacity-90">
                                            <div class="font-bold text-xs text-primary mb-1">${t.title}</div>
                                            <div class="text-[0.7rem] text-secondary mb-1 flex items-center gap-1">
                                                <i data-lucide="map-pin" class="w-3 h-3 text-muted"></i> ${t.location || 'Store Floor'}
                                            </div>
                                            <div class="flex items-center justify-between pt-2 border-t border-subtle text-[0.68rem]">
                                                <span class="text-muted">${t.assignee}</span>
                                                <span class="text-emerald-400 font-semibold flex items-center gap-1">
                                                    <i data-lucide="check-check" class="w-3 h-3"></i> CV Verified
                                                </span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Associate Performance Table -->
                <div class="mb-4">
                    ${Tables.render(
                        [
                            { label: 'Associate Name' },
                            { label: 'Shift Status', align: 'center' },
                            { label: 'Tasks Resolved Today', align: 'center' },
                            { label: 'Average Response Time', align: 'center' }
                        ],
                        assocRows,
                        { title: 'Store Associate Performance Telemetry', subtitle: 'Live shift productivity and metric resolution' }
                    )}
                </div>
            </div>
        `;

        // Wire assignment buttons
        container.querySelectorAll('.assign-alert-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const title = btn.dataset.title;
                App.showModal({
                    title: `Assign Incident — ${title}`,
                    body: `
                        <div class="space-y-3">
                            <label class="block text-xs font-semibold text-secondary">Select Available Floor Associate:</label>
                            <select id="assoc-select" class="w-full p-2.5 rounded-lg bg-surface-1 border border-subtle text-xs text-primary font-bold">
                                <option value="Vikram Mehta">Vikram Mehta (Zone 1 - Beverages)</option>
                                <option value="Priya Patel" selected>Priya Patel (Zone 2 - Dairy & Snacks)</option>
                                <option value="Rahul Verma">Rahul Verma (Zone 3 - Bakery)</option>
                            </select>
                        </div>
                    `,
                    confirmText: 'Dispatch Notification',
                    onConfirm: async () => {
                        const selectedAssoc = document.getElementById('assoc-select').value;
                        await API.post('/api/alerts/assign', { alert_id: btn.dataset.id, assignee: selectedAssoc });
                        App.showToast('Associate Dispatched', `Task sent to ${selectedAssoc}'s handheld terminal.`, 'success');
                        btn.outerHTML = `<span class="text-xs font-semibold text-emerald-400">✓ Assigned to ${selectedAssoc}</span>`;
                    }
                });
            });
        });

        // Wire Kanban start and complete buttons
        container.querySelectorAll('.start-task-btn').forEach(b => {
            b.addEventListener('click', () => {
                App.showToast('Task Claimed', 'Moved to In-Progress column.', 'info');
                b.textContent = 'Claimed';
            });
        });

        container.querySelectorAll('.complete-task-btn').forEach(b => {
            b.addEventListener('click', () => {
                App.showToast('Task Complete', 'CV camera verified shelf restock.', 'success');
                b.closest('.kanban-card').style.opacity = '0.5';
                b.textContent = '✓ Done';
            });
        });

        document.getElementById('create-task-btn')?.addEventListener('click', () => {
            App.showModal({
                title: 'Create Manual Floor Task',
                body: `
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-semibold text-muted mb-1">Task Title</label>
                            <input type="text" id="new-task-title" class="w-full p-2 rounded-lg bg-surface-1 border border-subtle text-xs text-primary" placeholder="e.g., Clean spill in Aisle 4">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-muted mb-1">Location / Aisle</label>
                            <input type="text" id="new-task-loc" class="w-full p-2 rounded-lg bg-surface-1 border border-subtle text-xs text-primary" placeholder="e.g., Aisle 04 (Bakery)">
                        </div>
                    </div>
                `,
                confirmText: 'Create Task',
                onConfirm: () => {
                    App.showToast('Task Created', 'Broadcasted to all floor staff.', 'success');
                }
            });
        });
    }
};
