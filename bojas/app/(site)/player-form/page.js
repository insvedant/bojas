import PlayerFormPage from '@/components/PlayerFormPage';

export const metadata = {
  title: 'Player Form',
  description: 'Want to work with BOJAS? Submit your interest and highlights for our team to scout your talent. We are accepting new players.',
  alternates: { canonical: '/player-form/' },
};

export default function Page() {
  return <PlayerFormPage formId="comprehensive" />;
}
