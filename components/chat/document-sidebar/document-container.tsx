// components/chat/document-sidebar/document-container.tsx
import { useState } from 'react';
import { Document } from '@/types/chat';
import { DocumentSidebar } from './document-sidebar';
import { DocumentPreview } from './document-preview';

interface DocumentContainerProps {
  documents: Document[];
  showSidebar: boolean;
  onCloseSidebar: () => void;
}

export function DocumentContainer({
  documents,
  showSidebar,
  onCloseSidebar
}: DocumentContainerProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  return (
    <>
      {showSidebar && (
        <DocumentSidebar
          documents={documents}
          onClose={onCloseSidebar}
          onDocumentSelect={setSelectedDocument}
        />
      )}

      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
}