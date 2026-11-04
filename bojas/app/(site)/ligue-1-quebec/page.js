import PlayerFormPage from '@/components/PlayerFormPage';

export const metadata = {
  title: 'Ligue1 Québec Player Form',
  description: 'Want to work with BOJAS? Submit your interest and highlights for our team to scout your talent. We are accepting new players.',
  alternates: { canonical: '/ligue-1-quebec/' },
};

export default function Page() {
  return <PlayerFormPage formId="ligue1-quebec" />;
}
