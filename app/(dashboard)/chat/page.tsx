// app/(dashboard)/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { API_URL } from '@/lib/config';
import { useChat } from '@/context/ChatContext';
import { format } from 'date-fns';
import { usePathname } from 'next/navigation';

import { 
  Message, 
  Document, 
  ChatSession, 
  ChatSessionHistory, 
  PageChatSession 
} from '@/types/chat';

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
    setChatHistory, 
    messages,
    setMessages,
    sessionId,
    setSessionId,
    selectedChatId,
    chatHistory,
    setSelectedChatId,
    documents,
    setDocuments,
    suggestions,
    setSuggestions,
    lastFetchDate,
    setLastFetchDate,
    fetchChatHistory,
  } = useChat();

  // Initial setup
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    const loadInitialData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
  
      setIsLoadingHistory(true);
      try {
        await Promise.all([
          fetchChatHistory(), // Using context's function
          fetchSuggestions()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
  
    loadInitialData();
  }, [pathname]);

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
      
      setMessages([...messages, userMessage, botMessage]);
  
      if (!sessionId && data.session_id) {
        const newSession: ChatSessionHistory = {
          session_id: data.session_id,
          initial_message: text,
          title: text.split(' ').slice(0, 4).join(' '),
          last_interaction: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message: text,
          question_count: 1
        };
        setChatHistory([newSession, ...chatHistory]);
      }
  
      if (data.session_id) {
        setSessionId(data.session_id);
      }
  
      setShowSuggestions(true);
      await fetchChatHistory();
  
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

  const transformedHistory: PageChatSession[] = chatHistory.map((session) => {
    const interactionTime = 
      session.last_interaction || 
      session.timestamp || 
      session.updated_at || 
      new Date().toISOString();
  
    return {
      id: session.session_id,
      initial_message: session.initial_message || session.title || 'New Chat',
      last_interaction: interactionTime,
      timestamp: interactionTime,
      question_count: session.question_count
    };
  });


  return (
    <div className="flex h-[calc(100vh-2rem)] md:h-[calc(100vh-5rem)]">
      {/* Chat History sidebar */}
      <div className="hidden md:block">
        <ChatHistory
          isLoading={isLoadingHistory}
          chatHistory={transformedHistory}
          selectedChatId={selectedChatId}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
        />
      </div>
  
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <MessageList messages={messages} showLogo={showLogo} />
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
  
      {/* Document sidebar */}
      <DocumentContainer
        documents={documents}
        showSidebar={showDocumentSidebar}
        onCloseSidebar={() => setShowDocumentSidebar(false)}
      />
    </div>
  );
}