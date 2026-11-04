import PlayerFormPage from '@/components/PlayerFormPage';

export const metadata = {
  title: 'League1 Ontario Player Form',
  description: 'Want to work with BOJAS? Submit your interest and highlights for our team to scout your talent. We are accepting new players.',
  alternates: { canonical: '/league-1-ontario/' },
};

export default function Page() {
  return <PlayerFormPage formId="league1-ontario" />;
}
