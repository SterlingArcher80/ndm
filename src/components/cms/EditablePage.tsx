
import React from 'react';
import { useCMS } from '@/hooks/useCMS';
import { EditableBlock } from './EditableBlock';
import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EditablePageProps {
  pageId: string;
  children?: React.ReactNode;
  showEditButton?: boolean;
}

export const EditablePage: React.FC<EditablePageProps> = ({ 
  pageId, 
  children, 
  showEditButton = true 
}) => {
  const { blocks, isLoading } = useCMS(pageId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div>Loading page content...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Edit Button - Fixed position but more prominent */}
      {showEditButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link to={`/cms/edit/${encodeURIComponent(pageId)}`}>
            <Button className="shadow-lg bg-blue-600 hover:bg-blue-700">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Page
            </Button>
          </Link>
        </div>
      )}

      {/* Always render the original page content */}
      {children}

      {/* Render CMS blocks as overlay if any exist and are published */}
      {blocks.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="space-y-4 pointer-events-auto">
            {blocks.map((block) => (
              <EditableBlock
                key={block.id}
                block={block}
                isSelected={false}
                isEditing={false}
                onSelect={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
                onDuplicate={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
