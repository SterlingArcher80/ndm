
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit3, Save, Undo, Redo, Monitor, Tablet, Smartphone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface EditorToolbarProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  isEditing,
  onToggleEdit,
  onSave,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={onToggleEdit}
        >
          {isEditing ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>

        {isEditing && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Responsive Preview Controls */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        {isEditing && (
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        )}
      </div>
    </div>
  );
};
