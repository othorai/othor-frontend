// types/chat.ts

// Message types
export interface Message {
  text: string;
  isUser: boolean;
}

// Document types
export interface Document {
  id: string; // Remove optional marker since it's required
  filename: string;
  type: string;
  data: string;
}

// Props for various components
export interface ChatHistoryProps {
  isLoading: boolean;
  chatHistory: ChatSession[];
  selectedChatId: string | null;
  onNewChat: () => void;
  onChatSelect: (chatId: string) => void;
}

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

export interface ChatInputContainerProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSend: (text?: string) => Promise<void>;
  isLoading: boolean;
  isUploading: boolean;
  suggestions: string[];
  showSuggestions: boolean;
  documents: { id: string; filename: string; }[]; // Update to match expected type
  maxFileSize: number;
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

interface BaseChat {
  session_id?: string;
  initial_message?: string;
  title?: string;
  last_interaction?: string;
  timestamp?: string;
  question_count?: number;
}

export interface ChatSessionHistory {
  session_id: string;
  initial_message?: string;
  title?: string;
  last_interaction?: string;
  timestamp?: string;
  created_at?: string;
  updated_at?: string;
  last_message?: string;
  question_count: number;
}

export interface ChatSession {
  id: string;             
  session_id: string;     
  initial_message?: string;
  title?: string;
  last_interaction: string; 
  timestamp?: string;
  question_count: number;  
  documents?: Document[];
}

export interface PageChatSession {
  id: string;
  initial_message: string;
  last_interaction: string;
  timestamp: string;
  question_count: number;
}

export interface Message {
  text: string;
  isUser: boolean;
}

export interface Document {
  id: string;
  filename: string;
  type: string;
  data: string;
}