import PlayerFormPage from '@/components/PlayerFormPage';

export const metadata = {
  title: 'OPDL Player Form',
  description: 'Want to work with BOJAS? Submit your interest and highlights for our team to scout your talent. We are accepting new players.',
  alternates: { canonical: '/odpl-player-form/' },
};

export default function Page() {
  return <PlayerFormPage formId="opdl" />;
}
