// components/chat/document-sidebar/document-item.tsx
import { FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DocumentItemProps } from '@/types/chat';

export function DocumentItem({ document, onClick }: DocumentItemProps) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2"
      onClick={() => onClick(document)}
    >
      <FileText size={16} />
      <span className="truncate">{document.filename}</span>
    </Button>
  );
}