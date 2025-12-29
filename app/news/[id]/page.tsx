import NewsDetailPage from '@/src/pages/NewsDetailPage';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function NewsDetail({ params }: Props) {
    const { id } = await params;
    return <NewsDetailPage />;
}
