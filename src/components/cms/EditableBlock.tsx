
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContentBlock } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, GripVertical, Edit3 } from 'lucide-react';

interface EditableBlockProps {
  block: ContentBlock;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const EditableBlock: React.FC<EditableBlockProps> = ({
  block,
  isSelected,
  isEditing,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderBlockContent = () => {
    const blockStyles = {
      ...block.styles,
      outline: isSelected && isEditing ? '2px solid #3b82f6' : 'none',
      position: 'relative' as const,
    };

    switch (block.block_type) {
      case 'heading':
        const HeadingTag = `h${block.content.level || 1}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag style={blockStyles} onClick={onSelect}>
            {block.content.text || 'New Heading'}
          </HeadingTag>
        );

      case 'paragraph':
      case 'text':
        return (
          <p style={blockStyles} onClick={onSelect}>
            {block.content.text || 'New paragraph text'}
          </p>
        );

      case 'image':
        return (
          <div style={blockStyles} onClick={onSelect}>
            {block.content.src ? (
              <img
                src={block.content.src}
                alt={block.content.alt || ''}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                Click to add image
              </div>
            )}
            {block.content.caption && (
              <p className="text-sm text-gray-600 mt-2">{block.content.caption}</p>
            )}
          </div>
        );

      case 'button':
        return (
          <div style={blockStyles} onClick={onSelect}>
            <Button
              variant={block.content.variant || 'default'}
              asChild
            >
              <a href={block.content.href || '#'}>
                {block.content.text || 'Click me'}
              </a>
            </Button>
          </div>
        );

      case 'hero':
        return (
          <div
            style={{
              ...blockStyles,
              backgroundImage: block.content.image ? `url(${block.content.image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
            onClick={onSelect}
          >
            <div>
              <h1 className="text-4xl font-bold mb-4">
                {block.content.title || 'Hero Title'}
              </h1>
              <p className="text-xl mb-6">
                {block.content.subtitle || 'Hero subtitle'}
              </p>
              <Button size="lg">
                {block.content.cta || 'Get Started'}
              </Button>
            </div>
          </div>
        );

      case 'card':
        return (
          <div
            style={blockStyles}
            className="border rounded-lg p-6 shadow-sm"
            onClick={onSelect}
          >
            {block.content.image && (
              <img
                src={block.content.image}
                alt=""
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <h3 className="text-xl font-semibold mb-2">
              {block.content.title || 'Card Title'}
            </h3>
            <p className="text-gray-600">
              {block.content.content || 'Card content goes here'}
            </p>
          </div>
        );

      case 'container':
        return (
          <div
            style={blockStyles}
            className="min-h-[100px] border-2 border-dashed border-gray-300 p-4"
            onClick={onSelect}
          >
            <p className="text-gray-500 text-center">
              Container - Drop elements here
            </p>
          </div>
        );

      case 'spacer':
        return (
          <div
            style={{
              ...blockStyles,
              height: block.content.height || '40px',
              backgroundColor: isEditing && isSelected ? '#f3f4f6' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onSelect}
          >
            {isEditing && isSelected && (
              <span className="text-xs text-gray-500">Spacer</span>
            )}
          </div>
        );

      default:
        return (
          <div
            style={blockStyles}
            className="p-4 border border-gray-300 rounded"
            onClick={onSelect}
          >
            <p className="text-gray-600">
              Unknown block type: {block.block_type}
            </p>
          </div>
        );
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {renderBlockContent()}
      
      {/* Edit Controls - Only show when editing and block is selected */}
      {isEditing && isSelected && (
        <div className="absolute top-0 right-0 flex gap-1 bg-white shadow-lg rounded p-1 -mt-2 -mr-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-grab"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onDuplicate}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
