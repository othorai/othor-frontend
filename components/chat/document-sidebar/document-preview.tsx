// components/chat/document-sidebar/document-preview.tsx
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DocumentPreviewProps } from '@/types/chat';

export function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute inset-4 bg-white rounded-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">{document.filename}</h3>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          {document.type === 'pdf' ? (
            <iframe
              src={document.data}
              className="w-full h-full border-none"
              title={document.filename}
            />
          ) : (
            <pre className="whitespace-pre-wrap overflow-auto">
              {document.data}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}