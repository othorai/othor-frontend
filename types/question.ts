// types/question.ts

export interface Question {
    id: string;
    text: string;
  }
  
  export interface Answer {
    text: string;
    error?: string;
  }
  
  export interface SuggestedQuestionsProps {
    articleId: string;
    title: string;
    content: string;
    category: string;
    timePeriod: string;
    metrics: Record<string, any>;
  }
  
  export interface QuestionButtonProps {
    question: string;
    isSelected: boolean;
    onClick: () => void;
  }