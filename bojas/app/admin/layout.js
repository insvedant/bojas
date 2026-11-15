export const metadata = {
  title: { default: 'Admin', template: '%s | BOJAS Admin' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <div className="admin">{children}</div>;
}
