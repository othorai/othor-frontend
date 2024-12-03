// components/chat/chat-input/file-upload.tsx
import { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { FileUploadProps } from '@/types/chat';
import { useToast } from "@/hooks/use-toast";

export function FileUpload({
  onFileUpload,
  isUploading,
  maxFileSize
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 10MB"
      });
      return;
    }

    await onFileUpload(event);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.txt,.csv"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
        ) : (
          <Paperclip size={20} />
        )}
      </Button>
    </>
  );
}