// types/chat.ts

// Message types
export interface Message {
    text: string;
    isUser: boolean;
  }
  
  // Document types
  export interface Document {
    id?: string;
    filename: string;
    type: string;
    data: string;
  }
  
  // Props for various components
  export interface MessageListProps {
    messages: Message[];
    showLogo: boolean;
  }
  
  export interface MessageItemProps {
    message: Message;
  }
  
  export interface WelcomeScreenProps {
    logoUrl: string;
    welcomeMessage: string;
  }
  
  export interface ChatInputProps {
    inputText: string;
    setInputText: (text: string) => void;
    onSend: (text?: string) => Promise<void>;
    isLoading: boolean;
    placeholder?: string;
    disabled?: boolean;
  }
  
  export interface FileUploadProps {
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    isUploading: boolean;
    maxFileSize: number;
  }
  
  export interface SuggestionsBarProps {
    suggestions: string[];
    onSuggestionClick: (suggestion: string) => void;
    isLoading: boolean;
    show: boolean;
  }
  
  export interface DocumentSidebarProps {
    documents: Document[];
    onClose: () => void;
    onDocumentSelect: (document: Document) => void;
  }
  
  export interface DocumentItemProps {
    document: Document;
    onClick: (document: Document) => void;
  }
  
  export interface DocumentPreviewProps {
    document: Document | null;
    onClose: () => void;
  }
  
  // State interfaces for managing component state
  export interface ChatState {
    inputText: string;
    messages: Message[];
    isLoading: boolean;
    suggestions: string[];
    showSuggestions: boolean;
    sessionId: string;
    showLogo: boolean;
    documents: Document[];
    showDocumentSidebar: boolean;
    uploadingFile: boolean;
    selectedDocument: Document | null;
  }
  
  // API Response types
  export interface ChatResponse {
    response: string;
    session_id: string;
  }
  
  export interface FileUploadResponse {
    document: Document;
    session_id: string;
  }
  
  export interface SuggestedQuestionsResponse {
    questions: string[];
  }