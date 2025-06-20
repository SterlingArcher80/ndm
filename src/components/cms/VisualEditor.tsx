
import React from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCMS } from '@/hooks/useCMS';
import { ContentBlock } from '@/types/cms';
import { EditorToolbar } from './EditorToolbar';
import { BlockLibrary } from './BlockLibrary';
import { PropertyPanel } from './PropertyPanel';
import { EditableBlock } from './EditableBlock';
import { Button } from '@/components/ui/button';
import { Eye, Edit3, Save, Undo, Redo } from 'lucide-react';

interface VisualEditorProps {
  pageId: string;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ pageId }) => {
  const {
    blocks,
    editorState,
    isLoading,
    addBlock,
    updateBlock,
    deleteBlock,
    selectBlock,
    toggleEditMode,
    duplicateBlock,
    moveBlock,
    setEditorState,
  } = useCMS(pageId);

  const [draggedBlock, setDraggedBlock] = React.useState<ContentBlock | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const block = blocks.find(b => b.id === active.id);
    if (block) {
      setDraggedBlock(block);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedBlock(null);

    if (!over || active.id === over.id) return;

    const activeIndex = blocks.findIndex(b => b.id === active.id);
    const overIndex = blocks.findIndex(b => b.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      moveBlock(activeIndex, overIndex);
    }
  };

  const selectedBlock = blocks.find(b => b.id === editorState.selectedBlockId);

  // Render the existing page content in an iframe for background reference
  const renderPagePreview = () => {
    // Prevent circular loading by checking if we're already in the editor
    const isInEditor = window.location.pathname.includes('/cms/edit/');
    if (isInEditor) {
      return (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Original Page Preview
            </h3>
            <p className="text-sm text-gray-500">
              The original page content would appear here
            </p>
          </div>
        </div>
      );
    }

    const previewUrl = `${window.location.origin}${pageId}`;
    
    return (
      <div className="absolute inset-0">
        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          title="Page Preview"
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Block Library Sidebar */}
      {editorState.isEditing && (
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <BlockLibrary onAddBlock={addBlock} />
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Toolbar */}
        <EditorToolbar
          isEditing={editorState.isEditing}
          onToggleEdit={toggleEditMode}
          onSave={() => console.log('Save functionality')}
          canUndo={editorState.historyIndex > 0}
          canRedo={editorState.historyIndex < editorState.history.length - 1}
          onUndo={() => console.log('Undo functionality')}
          onRedo={() => console.log('Redo functionality')}
        />

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto relative">
          {/* Show existing page content as background in preview mode */}
          {!editorState.isEditing && renderPagePreview()}

          {/* Editable content overlay - only show when editing */}
          {editorState.isEditing && (
            <div className="absolute inset-0 bg-white z-10">
              <div className="max-w-7xl mx-auto p-6">
                {blocks.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Add elements to customize this page
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start adding blocks from the sidebar to build your page content.
                    </p>
                    <p className="text-sm text-gray-500">
                      Your changes will overlay on top of the existing page when published.
                    </p>
                  </div>
                ) : (
                  <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <SortableContext 
                      items={blocks.map(b => b.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {blocks.map((block) => (
                          <EditableBlock
                            key={block.id}
                            block={block}
                            isSelected={block.id === editorState.selectedBlockId}
                            isEditing={editorState.isEditing}
                            onSelect={() => selectBlock(block.id)}
                            onUpdate={(updates) => updateBlock(block.id, updates)}
                            onDelete={() => deleteBlock(block.id)}
                            onDuplicate={() => duplicateBlock(block.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {draggedBlock && (
                        <div className="opacity-50">
                          <EditableBlock
                            block={draggedBlock}
                            isSelected={false}
                            isEditing={false}
                            onSelect={() => {}}
                            onUpdate={() => {}}
                            onDelete={() => {}}
                            onDuplicate={() => {}}
                          />
                        </div>
                      )}
                    </DragOverlay>
                  </DndContext>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Panel */}
      {editorState.isEditing && selectedBlock && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <PropertyPanel
            block={selectedBlock}
            onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
          />
        </div>
      )}
    </div>
  );
};
