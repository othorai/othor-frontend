import { X } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentPreviewProps {
  document: {
    type: string;
    data: string;
    filename: string;
  };
  onClose: () => void;
}

export function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  const renderContent = () => {
    if (document.type === 'pdf') {
      return (
        <iframe
          src={document.data}
          className="w-full h-full border-none"
          title={document.filename}
        />
      );
    } else if (document.type === 'csv' || document.type === 'text') {
      return (
        <ScrollArea className="h-full w-full p-4">
          <pre className="whitespace-pre-wrap">{document.data}</pre>
        </ScrollArea>
      );
    }
    return <div>Preview not available for this file type.</div>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute inset-4 bg-white rounded-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">{document.filename}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}