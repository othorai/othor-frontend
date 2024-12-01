'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Paperclip, Menu, FileText, Star, X } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
}

interface Document {
  id?: string;
  filename: string;
  type: string;
  data: string;
}

export default function ChatPage() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showDocumentSidebar, setShowDocumentSidebar] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Add this utility function in your chat page
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  
  // Get month abbreviation
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Get day, month, year
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  // Get time in 12-hour format
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12; // Convert to 12-hour format

  return `${day} ${month} ${year} ${hours}.${minutes}${ampm}`;
};

  const groupChats = (chats: ChatSession[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const groups = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 days': [],
      'Previous 30 Days': [],
      'Older': []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.timestamp);
      if (chatDate >= today) {
        groups['Today'].push(chat);
      } else if (chatDate >= yesterday) {
        groups['Yesterday'].push(chat);
      } else if (chatDate >= weekAgo) {
        groups['Previous 7 days'].push(chat);
      } else if (chatDate >= monthAgo) {
        groups['Previous 30 Days'].push(chat);
      } else {
        groups['Older'].push(chat);
      }
    });

    return Object.entries(groups).filter(([_, chats]) => chats.length > 0);
  };

  const handleChatSelect = async (chatId: string) => {
    try {
      setIsLoading(true);
      setShowSuggestions(false);
      setShowLogo(false);
      setSelectedChatId(chatId);
      setSessionId(chatId);
  
      const token = localStorage.getItem('authToken');
      if (!token) return;
  
      const response = await fetch(`/api/chatbot/chat/session/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to load chat session');
      }
  
      const sessionChats = await response.json();
  
      // Format the messages
      const formattedMessages = sessionChats
        .map((chat: any) => ([
          { text: chat.question, isUser: true },
          { text: chat.answer, isUser: false }
        ]))
        .flat()
        .reverse();
  
      setMessages(formattedMessages);
  
      // Check for documents in this session
      if (sessionChats.documents?.length > 0) {
        setDocuments(sessionChats.documents);
        setShowDocumentSidebar(true);
      } else {
        setDocuments([]);
        setShowDocumentSidebar(false);
      }
  
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat session"
      });
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchSuggestions();
    fetchChatHistory();
  }, [router]);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/chatbot/chat/suggested_questions', {
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

  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/chatbot/chat/user-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(data);
      } else {
        throw new Error('Failed to fetch chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat history"
      });
      setChatHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size too large. Please upload a file smaller than 10MB.');
      }
      
      const uploadMessage: Message = { 
        text: `Uploading file: ${file.name}...`, 
        isUser: true 
      };
      setMessages(prev => [uploadMessage, ...prev]);

      const formData = new FormData();
      formData.append('document', file);
      if (sessionId) {
        formData.append('session_id', sessionId);
      }

      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token available');

      const response = await fetch('/api/chatbot/upload', {
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

      const successMessage: Message = { 
        text: `File uploaded successfully. You can now ask questions about ${file.name}.`, 
        isUser: false 
      };
      setMessages(prev => [successMessage, ...prev]);

      if (data.session_id) {
        setSessionId(data.session_id);
      }

      if (data.document) {
        setDocuments(prev => [...prev, data.document]);
        setShowDocumentSidebar(true);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await fetchSuggestions();

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage: Message = { 
        text: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        isUser: false 
      };
      setMessages(prev => [errorMessage, ...prev]);

      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload document. Please try again."
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const sendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    try {
      setIsLoading(true);
      setShowSuggestions(false);
      setShowLogo(false);

      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token available');

      const userMessage: Message = { text, isUser: true };
      setMessages(prev => [userMessage, ...prev]);
      setInputText('');

      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
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
      setMessages(prev => [botMessage, ...prev]);

      if (data.session_id) {
        setSessionId(data.session_id);
      }

      setShowSuggestions(true);
      
      // Refresh chat history after sending a message
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

  const handleNewChat = () => {
    setMessages([]);
    setSessionId('');
    setShowLogo(true);
    setSelectedChatId(null);
    setDocuments([]);
    setShowDocumentSidebar(false);
    setInputText('');
    fetchSuggestions();
    fetchChatHistory(); // Refresh chat history after starting new chat
  };

  

  const DocumentPreview = ({ document }: { document: Document }) => (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute inset-4 bg-white rounded-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">{document.filename}</h3>
          <button 
            onClick={() => setSelectedDocument(null)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          {document.type === 'pdf' ? (
            <iframe
              src={document.data}
              className="w-full h-full border-none"
              title={document.filename}
            />
          ) : (
            <pre className="whitespace-pre-wrap">{document.data}</pre>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* Chat History Sidebar */}
 {/* Chat History Sidebar */}
<div className="w-64 border-r bg-white hidden md:flex flex-col h-full">
  {/* New Chat Button - Static */}
  <div className="flex-shrink-0 p-4 border-b">
    <Button 
      onClick={handleNewChat}
      className="w-full justify-start gap-2" 
      variant="ghost"
    >
      <MessageSquare size={20} />
      New Chat
    </Button>
  </div>

  {/* Chat History Header - Static */}
  <div className="flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-500 border-b">
    Chat History
  </div>

  {/* Chat History - Scrollable */}
  <div className="flex-1 overflow-y-auto">
    {isLoadingHistory ? (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    ) : chatHistory.length === 0 ? (
      <div className="px-4 py-3 text-sm text-gray-500">
        No chat history yet
      </div>
    ) : (
      <div>
        {groupChats(chatHistory).map(([groupName, chats]) => (
          <div key={groupName}>
            <div className="px-4 py-2 text-xs font-medium text-gray-500 sticky top-0 bg-white z-10">
              {groupName}
            </div>
            {(chats as ChatSession[]).map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors
                  ${selectedChatId === chat.id ? 'bg-gray-100' : ''}
                `}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span className="truncate text-sm">{chat.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(chat.timestamp)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    )}
  </div>
</div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0" ref={chatContainerRef}>
          {showLogo && (
            <div className="flex flex-col items-center justify-center h-full">
              <Image
                src="/images/othor-logo.png"
                alt="Othor AI"
                width={120}
                height={120}
                className="mb-4"
              />
              <h2 className="text-2xl font-semibold mb-4">How can I help you today?</h2>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isUser 
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap"
                onClick={() => sendMessage(suggestion)}
                disabled={isLoading}
              >
                <Star size={16} />
                {suggestion}
              </Button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-white p-4 mt-auto">
          <div className="flex gap-2 items-center">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.txt,.csv"
              onChange={handleFileUpload}
              disabled={uploadingFile}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
            >
              {uploadingFile ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
              ) : (
                <Paperclip size={20} />
              )}
            </Button>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                documents.length > 0 
                  ? "Ask questions about your document..." 
                  : "Ask anything..."
              }
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1"
              disabled={isLoading || uploadingFile}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || uploadingFile || !inputText.trim()}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send size={20} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Document Sidebar */}
      {showDocumentSidebar && documents.length > 0 && (
        <div className="w-64 border-l bg-white hidden md:block">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-medium">Documents</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowDocumentSidebar(false)}>
              <X size={20} />
            </Button>
          </div>
          <div className="p-4 space-y-2">
            {documents.map((doc, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => setSelectedDocument(doc)}
              >
                <FileText size={16} />
                <span className="truncate">{doc.filename}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <DocumentPreview document={selectedDocument} />
      )}
    </div>
  );
}