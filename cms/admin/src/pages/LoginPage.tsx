import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { Globe, Eye, EyeOff, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Paper texture + grid are on body */}

      {/* Soft pastel blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]">
        <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-pastel-blue/8 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-pastel-amber/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-pastel-lavender/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-[1] animate-paper-in">
        {/* Brand — notebook style */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-pastel-blue/8 flex items-center justify-center mx-auto mb-4 ring-1 ring-pastel-blue/15 shadow-paper-sm">
            <PenLine className="h-8 w-8 text-pastel-blue" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-warm-charcoal tracking-tight">
            Puxijie CMS
          </h1>
          <p className="font-handwriting text-lg text-warm-charcoal-muted mt-0.5">
            content notebook
          </p>
        </div>

        {/* Paper card */}
        <Card variant="paper" padding="lg" className="paper-tape">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-pastel-rose/8 text-pastel-rose text-sm px-4 py-3 rounded-lg border border-pastel-rose/20">
                {error}
              </div>
            )}

            <FormField label="邮箱" required htmlFor="email">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@puxijietech.com"
              />
            </FormField>

            <FormField label="密码" required htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-charcoal-muted hover:text-warm-charcoal"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
            </FormField>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? '登录中...' : '登录'}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6 font-handwriting text-base text-warm-charcoal-muted/70">
          puxijietech.com
        </p>
      </div>
    </div>
  );
}
