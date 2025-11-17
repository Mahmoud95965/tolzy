export type ToolStatus = 'pending' | 'approved' | 'rejected' | 'approved_pending';

export type ToolCategory = 
  | 'Business'
  | 'Communication'
  | 'Creativity'
  | 'Data Science'
  | 'Design'
  | 'Education'
  | 'Games'
  | 'Language Learning'
  | 'Library'
  | 'Math'
  | 'Memory'
  | 'Online Learning'
  | 'Other'
  | 'Productivity'
  | 'Programming'
  | 'Project Management'
  | 'Reading'
  | 'Research'
  | 'Science'
  | 'Studying'
  | 'Teaching'
  | 'Technology'
  | 'Test Prep'
  | 'Video'
  | 'Writing';

export type ToolPricing = 
  | 'Free' 
  | 'Freemium' 
  | 'Paid' 
  | 'Subscription';

export interface Tool {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: ToolCategory | ToolCategory[]; // يدعم فئة واحدة أو عدة فئات
  subcategory?: string | string[];
  tags: string[];  
  url: string;
  imageUrl: string;
  pricing: ToolPricing;
  features: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  status?: ToolStatus;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  votes: {
    helpful: string[]; // Array of user IDs
    notHelpful: string[]; // Array of user IDs
  };
  votingStats: {
    helpfulCount: number;
    notHelpfulCount: number;
    totalVotes: number;
  };
  savedBy: string[]; // Array of user IDs who saved this tool
}

export interface FilterOptions {
  category: ToolCategory | 'All';
  pricing: ToolPricing | 'All';
  searchQuery?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  coverImageUrl?: string;
  createdAt: string;
  authorId: string;
  authorEmail?: string;
  tags?: string[];
  status: 'draft' | 'published';
  likes?: string[]; // Array of user IDs who liked
  likesCount?: number;
  shares?: number;
}