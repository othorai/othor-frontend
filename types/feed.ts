// types/feed.ts

export interface Article {
    id: string;
    title: string;
    content: string;
    isLiked: boolean;
    created_at?: string;
    updated_at?: string;
    graph_data?: Record<string, any>;
    metrics?: {
      likes?: number;
      views?: number;
      shares?: number;
    };
    author?: {
      id: string;
      name: string;
      avatar?: string;
    };
    [key: string]: any; // For any additional properties
  }
  
  export interface ApiError {
    message: string;
    code?: string;
    details?: Record<string, any>;
  }
  
  export interface FeedResponse {
    articles: Article[];
    metadata?: {
      total: number;
      page: number;
      per_page: number;
    };
  }
  
  export interface FeedState {
    feedData: Article[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;
  }
  
  export interface UseFeedReturn {
    feedData: Article[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    fetchData: (date?: Date) => Promise<void>;
    handleLike: (articleId: string, isLiked: boolean) => Promise<void>;
    handleDownload: (articleId: string) => Promise<void>;
  }