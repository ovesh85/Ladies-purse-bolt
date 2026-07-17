import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { useToast } from '../lib/toast';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2 } from 'lucide-react';

export function AuthPage() {
  const { query, navigate } = useRouter();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'login' | 'signup'>(query.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirect = query.get('redirect') || '/';

  useEffect(() => {
    if (user) navigate(redirect);
  }, [user, navigate, redirect]);

  useEffect(() => {
    setMode(query.get('mode') === 'signup' ? 'signup' : 'login');
  }, [query]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) { setError(error); return; }
        toast('Welcome back!');
        navigate(redirect);
      } else {
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        const { error } = await signUp(email, password, fullName);
        if (error) { setError(error); return; }
        toast('Account created! Welcome to Marisol.');
        navigate(redirect);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] grid lg:grid-cols-2">
      {/* Image side */}
      <div className="hidden lg:block relative overflow-hidden bg-ink-900">
        <img src="https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Handbags" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <p className="font-serif text-4xl leading-tight">"A bag is the finishing touch to any outfit."</p>
          <p className="mt-3 text-ink-200 text-sm">— Join thousands of women who carry Marisol.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl lg:text-4xl text-ink-900">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {mode === 'login'
              ? 'Sign in to track orders, manage your wishlist, and check out faster.'
              : 'Join Marisol for a personalized shopping experience.'}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ananya Reddy"
                    className="input pl-10"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-ink-600">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => navigate(mode === 'login' ? '/login?mode=signup' : '/login')}
              className="text-sand-700 font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="mt-8 pt-6 border-t border-ink-200 text-center">
            <p className="text-xs text-ink-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
