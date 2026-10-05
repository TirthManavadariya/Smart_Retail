import { useState } from 'react';
import { Plus, Pencil, Trash2, UserCheck, UserX, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/cn';
import type { StaffMember } from '@/lib/types';

export default function StaffManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['staff-list'],
    queryFn: () => api.staff.list(),
  });

  const addMutation = useMutation({
    mutationFn: api.staff.add,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-list'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: Record<string, unknown> }) =>
      api.staff.update(userId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-list'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: api.staff.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-list'] }),
  });

  if (user?.role !== 'manager') {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <UserX className="mx-auto mb-3 size-12 text-danger" />
        <p className="text-sm font-semibold text-content">Access Denied</p>
        <p className="mt-1 text-xs text-content-faint">Only managers can manage staff</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const staff = data?.staff ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-content">
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            Add, edit, and manage staff members
          </p>
        </div>
        <AddStaffModal onAdd={addMutation.mutate} />
      </div>

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <UserCheck className="mx-auto mb-3 size-12 text-content-faint" />
          <p className="text-sm font-semibold text-content">No staff members</p>
          <p className="mt-1 text-xs text-content-faint">Add your first staff member</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <StaffCard
              key={member.user_id}
              member={member}
              onUpdate={(data) => updateMutation.mutate({ userId: member.user_id, data })}
              onDelete={() => deleteMutation.mutate(member.user_id)}
              isPending={updateMutation.isPending || deleteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StaffCard({
  member,
  onUpdate,
  onDelete,
  isPending,
}: {
  member: StaffMember;
  onUpdate: (data: Record<string, unknown>) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(member.full_name);
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone);
  const [password, setPassword] = useState('');

  const handleSave = () => {
    const data: Record<string, unknown> = { full_name: fullName, email, phone };
    if (password) data.password = password;
    onUpdate(data);
    setEditing(false);
    setPassword('');
  };

  const toggleActive = () => {
    onUpdate({ is_active: member.is_active ? false : true });
  };

  if (editing) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-content">Edit Staff</h3>
          <button onClick={() => setEditing(false)} className="text-content-faint hover:text-content">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content focus:border-primary focus:outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content focus:border-primary focus:outline-none"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (leave blank to keep)"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-on hover:bg-primary-hover disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <UserCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-content">{member.full_name}</h3>
            <p className="text-xs text-content-faint">@{member.username}</p>
          </div>
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase',
            member.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400',
          )}
        >
          {member.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs text-content-muted">
        {member.email && <p>{member.email}</p>}
        {member.phone && <p>{member.phone}</p>}
        <p className="text-content-faint">
          Joined: {new Date(member.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setEditing(true)}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-surface-high px-3 py-1.5 text-xs font-semibold text-content-muted transition-colors hover:text-content"
        >
          <Pencil className="size-3" />
          Edit
        </button>
        <button
          onClick={toggleActive}
          disabled={isPending}
          className={cn(
            'flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
            member.is_active
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-green-500/10 text-green-400 hover:bg-green-500/20',
          )}
        >
          {member.is_active ? <UserX className="size-3" /> : <UserCheck className="size-3" />}
          {member.is_active ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={onDelete}
          disabled={isPending}
          className="flex items-center justify-center rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/20"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}

function AddStaffModal({ onAdd }: { onAdd: (data: { username: string; password: string; full_name: string; email?: string; phone?: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !fullName) return;
    onAdd({ username, password, full_name: fullName, email, phone });
    setUsername('');
    setPassword('');
    setFullName('');
    setEmail('');
    setPhone('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-on transition-colors hover:bg-primary-hover"
      >
        <Plus className="size-4" />
        Add Staff
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-lg rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-bold text-content">Add New Staff Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-content-faint">Username *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-content focus:border-primary focus:outline-none"
              placeholder="e.g., jane.doe"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-content-faint">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-content focus:border-primary focus:outline-none"
              placeholder="Set a password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-content-faint">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-content focus:border-primary focus:outline-none"
              placeholder="e.g., Jane Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-content-faint">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-content focus:border-primary focus:outline-none"
                placeholder="jane@shelfiq.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-content-faint">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-content focus:border-primary focus:outline-none"
                placeholder="+91-9876543210"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-content-muted transition-colors hover:bg-surface-high"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-on transition-colors hover:bg-primary-hover"
            >
              <Plus className="size-4" />
              Add Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
