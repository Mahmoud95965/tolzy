import TolzyCoursePlayerPage from '@/src/pages/TolzyCoursePlayerPage';

type Props = {
    params: Promise<{ courseId: string }>;
};

export default async function CoursePlayer({ params }: Props) {
    const { courseId } = await params;
    return <TolzyCoursePlayerPage />;
}
