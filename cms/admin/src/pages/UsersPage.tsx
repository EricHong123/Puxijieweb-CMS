import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/useAuth';
import { UserPlus, Shield, ShieldAlert, MoreHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CMSUser {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'editor';
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<CMSUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CMSUser | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'editor'>('editor');

  const isAdmin = user?.role === 'admin';

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      if (data.success) setUsers(data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setFormEmail('');
    setFormPassword('');
    setFormName('');
    setFormRole('editor');
    setModalOpen(true);
  };

  const openEdit = (u: CMSUser) => {
    setEditingUser(u);
    setFormEmail(u.email);
    setFormPassword('');
    setFormName(u.display_name || '');
    setFormRole(u.role);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formEmail || (!editingUser && !formPassword) || !formName) {
      toast.error('请填写所有必填字段');
      return;
    }
    if (!editingUser && formPassword.length < 8) {
      toast.error('密码至少 8 位');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          email: formEmail,
          display_name: formName,
          role: formRole,
        });
        toast.success('用户已更新');
      } else {
        await api.post('/users', {
          email: formEmail,
          password: formPassword,
          display_name: formName,
          role: formRole,
        });
        toast.success('用户已创建');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u: CMSUser) => {
    try {
      await api.put(`/users/${u.id}`, { is_active: !u.is_active });
      toast.success(u.is_active ? '用户已禁用' : '用户已启用');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || '操作失败');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <ShieldAlert className="h-12 w-12 text-pastel-rose mx-auto" />
          <h2 className="text-lg font-semibold text-warm-charcoal">权限不足</h2>
          <p className="text-sm text-warm-charcoal-muted">只有管理员可以管理用户</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-charcoal">用户管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理 CMS 后台用户</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" />
          添加用户
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-warm-charcoal-muted text-sm">加载中...</div>
      ) : (
        <div className="bg-[hsl(var(--card))] rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-[hsl(var(--muted))]/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-charcoal-muted uppercase tracking-wider">用户</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-charcoal-muted uppercase tracking-wider">角色</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-charcoal-muted uppercase tracking-wider">状态</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-charcoal-muted uppercase tracking-wider">创建时间</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-warm-charcoal-muted uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-[hsl(var(--accent))]/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-pastel-blue/10 flex items-center justify-center ring-1 ring-pastel-blue/20 text-pastel-blue font-semibold text-xs">
                        {u.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-warm-charcoal">{u.display_name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium',
                      u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600',
                    )}>
                      {u.role === 'admin' ? <Shield className="h-3 w-3" /> : null}
                      {u.role === 'admin' ? '管理员' : '编辑者'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={cn(
                        'px-2 py-0.5 rounded-lg text-xs font-medium cursor-pointer',
                        u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
                      )}
                    >
                      {u.is_active ? '活跃' : '已禁用'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(u)}
                      className="text-xs text-warm-charcoal-muted hover:text-pastel-blue px-2 py-1"
                    >
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-warm-charcoal-muted text-sm">
                    暂无用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-warm-charcoal/20 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[hsl(var(--card))] rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-warm-charcoal">
                {editingUser ? '编辑用户' : '添加用户'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-warm-charcoal-muted hover:text-warm-charcoal">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">邮箱 *</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-warm-charcoal mb-1.5">密码 *</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="至少 8 位"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">显示名称 *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-1.5">角色</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as 'admin' | 'editor')}
                className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white"
              >
                <option value="editor">编辑者 (Editor)</option>
                <option value="admin">管理员 (Admin)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium text-warm-charcoal-muted hover:bg-[hsl(var(--accent))]"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {saving ? '保存中...' : editingUser ? '更新' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
