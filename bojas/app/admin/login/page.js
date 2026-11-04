import LoginForm from '@/components/admin/LoginForm';
import { LogoMark, Wordmark } from '@/components/Logo';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="stack" style={{ alignItems: 'center', gap: 14 }}>
          <LogoMark size={72} />
          <Wordmark large />
          <p className="muted" style={{ fontSize: 15 }}>Admin panel</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
