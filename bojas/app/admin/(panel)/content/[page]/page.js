import { notFound } from 'next/navigation';
import ContentEditor from '@/components/admin/ContentEditor';
import { getPageDef } from '@/lib/contentSchema';
import { getPageContentFresh } from '@/lib/content';

export async function generateMetadata({ params }) {
  return { title: getPageDef(params.page)?.label || 'Content' };
}

export default async function ContentPage({ params }) {
  if (!getPageDef(params.page)) notFound();
  let data;
  try {
    data = await getPageContentFresh(params.page);
  } catch (err) {
    return <p className="form-error" role="alert">Couldn't load this page's content: {err.message}. Check MONGODB_URI.</p>;
  }
  return <ContentEditor key={params.page} pageId={params.page} initial={data.values} updatedAt={data.updatedAt} />;
}
