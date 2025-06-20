
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit3, Save, Undo, Redo, Monitor, Tablet, Smartphone } from 'lucide-react';

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
  const [viewport, setViewport] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <Button
          variant={isEditing ? "default" : "outline"}
          size="sm"
          onClick={onToggleEdit}
        >
          {isEditing ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {isEditing ? 'Editing' : 'Preview'}
        </Button>

        {isEditing && (
          <>
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
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={viewport === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewport('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewport('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewport('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
};
