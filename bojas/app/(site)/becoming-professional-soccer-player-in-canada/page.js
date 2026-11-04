import ArticlePage, { articleMetadata } from '@/components/ArticlePage';

const SLUG = 'becoming-professional-soccer-player-in-canada';
export const generateMetadata = () => articleMetadata(SLUG);

export default function Page() {
  return <ArticlePage slug={SLUG} />;
}
