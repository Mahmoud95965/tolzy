export interface Attachment {
    id: string;
    title: string;
    url: string;
    type: 'file' | 'audio' | 'book';
}

export interface Lesson {
    id: string;
    title: string;
    content: string; // Markdown content
    videoUrl?: string;
    duration: number; // in minutes
    order: number;
    attachments?: Attachment[];
    likes?: number;
    likedBy?: string[]; // User IDs
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    instructor: string;
    price: 'free' | 'paid';
    lessons: Lesson[];
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    studentsCount: number;
    enrolledUserIds?: string[];
    rating: number;
    sourceUrl?: string;
    platform?: string;
    language?: string;
    hasCertificate?: boolean;
    duration?: string;
    instructorRole?: string;
    instructorBio?: string;
    instructorAvatar?: string;
    reviewsCount?: number;
    whatYouWillLearn?: string[];
}
