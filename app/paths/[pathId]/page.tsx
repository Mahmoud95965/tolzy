import TolzyPathDetailsPage from '@/src/pages/TolzyPathDetailsPage';

type Props = {
    params: Promise<{ pathId: string }>;
};

export default async function PathDetails({ params }: Props) {
    const { pathId } = await params;
    return <TolzyPathDetailsPage />;
}
