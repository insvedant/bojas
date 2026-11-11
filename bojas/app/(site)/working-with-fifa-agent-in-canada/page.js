import ArticlePage, { articleMetadata } from '@/components/ArticlePage';

const SLUG = 'working-with-fifa-agent-in-canada';
export const generateMetadata = () => articleMetadata(SLUG);

export default function Page() {
  return <ArticlePage slug={SLUG} />;
}
