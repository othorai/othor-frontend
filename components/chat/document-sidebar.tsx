import { FileText, X } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface Document {
  filename: string;
  type: string;
  data: string;
}

interface DocumentSidebarProps {
  documents: Document[];
  onPreview: (doc: Document) => void;
  onClose?: () => void;
  className?: string;
}

export function DocumentSidebar({ documents, onPreview, onClose, className = "" }: DocumentSidebarProps) {
  return (
    <div className={`w-64 border-l bg-white ${className}`}>
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">Documents</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-4 space-y-2">
          {documents.map((doc, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => onPreview(doc)}
            >
              <FileText size={16} />
              <span className="truncate">{doc.filename}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}