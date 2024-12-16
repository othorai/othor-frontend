// app/(dashboard)/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { API_URL } from '@/lib/config';
import { useChat } from '@/context/ChatContext';
import { format } from 'date-fns';


import { 
  Sheet,
  SheetContent,
  SheetTrigger, SheetTitle
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";


// Components
import { ChatHistory } from '@/components/chat/chat-history/chat-history';
import { MessageList } from '@/components/chat/chat-messages/message-list';
import { ChatInputContainer } from '@/components/chat/chat-input/chat-input-container';
import { Button } from "@/components/ui/button";
import { DocumentContainer } from '@/components/chat/document-sidebar/document-container';

// Types
import { Message, Document, ChatSession } from '@/types/chat';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ChatPage() {
  // State management
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showDocumentSidebar, setShowDocumentSidebar] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const {
    messages,
    setMessages,
    sessionId,
    setSessionId,
    selectedChatId,
    setSelectedChatId,
    documents,
    setDocuments,
    suggestions,
    setSuggestions,
    lastFetchDate,
    setLastFetchDate,
  } = useChat();

  // Initial setup
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    if (lastFetchDate !== today) {
      fetchSuggestions();
      fetchChatHistory();
      setLastFetchDate(today);
    }
  }, [router, lastFetchDate]);

  // API calls
  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/chatbot/suggested_questions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  interface ChatSessionHistory {
    id: string;
    title: string;
    timestamp: string;
    last_message?: string;
    created_at: string;
    updated_at: string;
  }
  
  // In the ChatContext or component state:
  const [chatHistory, setChatHistory] = useState<ChatSessionHistory[]>([]);
  
  // In the fetchChatHistory function:
  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;
  
      const response = await fetch(`${API_URL}/chatbot/user-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }
  
      const data = await response.json();
      console.log('Chat history response:', data); // Debug log
  
      // Transform the data to match our ChatSession interface
      const formattedHistory: ChatSession[] = data.map((session: any) => ({
        id: session.session_id || '',
        title: session.last_message?.split(' ').slice(0, 4).join(' ') || 'New Chat',
        timestamp: session.last_interaction || new Date().toISOString(),
        created_at: session.created_at || new Date().toISOString(),
        updated_at: session.updated_at || new Date().toISOString(),
        question_count: session.question_count || 0,
      }));
  
      console.log('Formatted chat history:', formattedHistory); // Debug log
      setChatHistory(formattedHistory);
  
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch chat history"
      });
      setChatHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Chat handlers
  const handleSendMessage = async (text = inputText) => {
    if (!text.trim() || isLoading) return;
  
    try {
      setIsLoading(true);
      setShowSuggestions(false);
      setShowLogo(false);
  
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token available');
  
      const userMessage: Message = { text, isUser: true };
      setMessages([...messages, userMessage]);
      setInputText('');
  
      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId || null,
          document_id: documents.length > 0 ? documents[0].id : null
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
  
      const botMessage: Message = { 
        text: data.response || "I'm sorry, but I couldn't process that request.", 
        isUser: false 
      };
      
      // Update messages with both user and bot messages
      setMessages([...messages, userMessage, botMessage]);
  
      // If this is a new chat session, create entry
      if (!sessionId && data.session_id) {
        const newSession: ChatSession = {
          id: data.session_id,
          title: text.split(' ').slice(0, 4).join(' '),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          question_count: 1,
        };
        setChatHistory([newSession, ...chatHistory]);
      }
  
      if (data.session_id) {
        setSessionId(data.session_id);
      }
  
      setShowSuggestions(true);
      fetchChatHistory();
  
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message"
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleChatSelect = async (chatId: string) => {
    try {
      if (!chatId) {
        throw new Error('No chat ID provided');
      }
  
      setIsLoading(true);
      setShowSuggestions(false);
      setShowLogo(false);
      
      // Clean the session ID
      const cleanSessionId = chatId.trim();
      
      setSelectedChatId(cleanSessionId);
      setSessionId(cleanSessionId);
  
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token available');
      }
  
      // Fetch chat messages
      const response = await fetch(`${API_URL}/chatbot/session-chats/${cleanSessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(
          response.status === 422 
            ? 'Invalid session format' 
            : `Failed to load chat session (${response.status})`
        );
      }
  
      const sessionChats = await response.json();
  
      if (!Array.isArray(sessionChats)) {
        throw new Error('Invalid response format');
      }
  
      // Format the messages
      const formattedMessages: Message[] = sessionChats
        .map((chat: any) => ([
          { text: chat.question, isUser: true },
          { text: chat.answer, isUser: false }
        ]))
        .flat();
  
      setMessages(formattedMessages);
  
      // Try to fetch documents if available
      try {
        const documentsResponse = await fetch(`${API_URL}/chatbot/get_documents/${cleanSessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
  
        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json();
          if (documentsData.documents?.length > 0) {
            setDocuments(documentsData.documents);
            setShowDocumentSidebar(true);
          }
        }
      } catch (docError) {
        console.warn('Failed to fetch documents:', docError);
        // Don't throw here, just log the warning
      }
  
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load chat session"
      });
      // Reset states on error
      setMessages([]);
      setDocuments([]);
      setShowDocumentSidebar(false);
    } finally {
      setIsLoading(false);
    }
  };


const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    toast({
      variant: "destructive",
      title: "File too large",
      description: "Please upload a file smaller than 10MB"
    });
    return;
  }

  try {
    setUploadingFile(true);
    setShowLogo(false);
    
    const uploadMessage: Message = { 
      text: `Uploading file: ${file.name}...`, 
      isUser: true 
    };
    setMessages([...messages, uploadMessage]);

    const formData = new FormData();
    formData.append('document', file);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No auth token available');

    const response = await fetch(`${API_URL}/chatbot/upload-document?session_id=${sessionId || 'null'}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload file');
    }

    // Add success message
    const successMessage: Message = { 
      text: `File uploaded successfully. You can now ask questions about ${file.name}.`, 
      isUser: false 
    };
    setMessages([...messages, uploadMessage, successMessage]);

    if (data.session_id) {
      setSessionId(data.session_id);
    }

    if (data.document) {
      // Properly type the document update
      setDocuments([...documents, data.document]);
      setShowDocumentSidebar(true);
    }

    await fetchSuggestions();

  } catch (error) {
    console.error('Upload error:', error);
    const uploadMessage: Message = { 
      text: `Uploading file: ${file.name}...`, 
      isUser: true 
    };
    
    // Add error message to chat
    const errorMessage: Message = { 
      text: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      isUser: false 
    };
    setMessages([...messages, uploadMessage, errorMessage]);

    toast({
      variant: "destructive",
      title: "Upload Failed",
      description: "Failed to upload document. Please try again."
    });
  } finally {
    setUploadingFile(false);
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  }
};

  const handleNewChat = () => {
    setMessages([]);
    setSessionId('');
    setShowLogo(true);
    setSelectedChatId(null);
    setDocuments([]);
    setShowDocumentSidebar(false);
    setInputText('');
    fetchSuggestions();
    setMessages([]); 
  };

  return (
    // Update the main container height class
<div className="flex h-[calc(100vh-2rem)] md:h-[calc(100vh-5rem)]">
<div className="md:hidden fixed top-4 left-4 z-[60]">
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetTitle className="sr-only">Chat History</SheetTitle>
        <div className="h-full overflow-y-auto">
          <ChatHistory
            isLoading={isLoadingHistory}
            chatHistory={chatHistory}
            selectedChatId={selectedChatId}
            onNewChat={handleNewChat}
            onChatSelect={(id) => {
              handleChatSelect(id);
              const closeButton = document.querySelector('[data-sheet-close]') as HTMLButtonElement;
              closeButton?.click();
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  </div>


      {/* Desktop Chat History */}
      <div className="hidden md:block">
        <ChatHistory
          isLoading={isLoadingHistory}
          chatHistory={chatHistory}
          selectedChatId={selectedChatId}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
        />
      </div>

      {/* Rest of the layout remains same */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <MessageList messages={messages} showLogo={showLogo} />
        <div className="absolute bottom-0 left-0 right-0 mb-20 md:mb-0">
        <ChatInputContainer
  inputText={inputText}
  setInputText={setInputText}
  onSend={handleSendMessage}
  onFileUpload={handleFileUpload}
  isLoading={isLoading}
  isUploading={uploadingFile}
  suggestions={suggestions}
  showSuggestions={showSuggestions}
  documents={documents}
  maxFileSize={MAX_FILE_SIZE}
/>
        </div>
      </div>

      <DocumentContainer
        documents={documents}
        showSidebar={showDocumentSidebar}
        onCloseSidebar={() => setShowDocumentSidebar(false)}
      />
    </div>
  );
}