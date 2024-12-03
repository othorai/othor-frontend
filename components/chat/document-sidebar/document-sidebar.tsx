// components/chat/document-sidebar/document-sidebar.tsx
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DocumentSidebarProps } from '@/types/chat';
import { DocumentItem } from './document-item';

export function DocumentSidebar({
  documents,
  onClose,
  onDocumentSelect,
}: DocumentSidebarProps) {
  if (documents.length === 0) return null;

  return (
    <div className="w-64 border-l bg-white hidden md:flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">Documents</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {documents.map((doc, index) => (
          <DocumentItem
            key={index}
            document={doc}
            onClick={onDocumentSelect}
          />
        ))}
      </div>
    </div>
  );
}