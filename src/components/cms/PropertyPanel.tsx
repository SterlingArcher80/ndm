
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentBlock } from '@/types/cms';
import { Palette, Type, Layout, Settings } from 'lucide-react';

interface PropertyPanelProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ block, onUpdate }) => {
  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: {
        ...block.content,
        [key]: value,
      },
    });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      styles: {
        ...block.styles,
        [key]: value,
      },
    });
  };

  const renderContentProperties = () => {
    switch (block.block_type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <Label>Text Content</Label>
              <Input
                value={block.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Enter heading text"
              />
            </div>
            <div>
              <Label>Heading Level</Label>
              <Select
                value={block.content.level?.toString() || '1'}
                onValueChange={(value) => updateContent('level', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                  <SelectItem value="4">H4</SelectItem>
                  <SelectItem value="5">H5</SelectItem>
                  <SelectItem value="6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'paragraph':
      case 'text':
        return (
          <div>
            <Label>Text Content</Label>
            <Textarea
              value={block.content.text || ''}
              onChange={(e) => updateContent('text', e.target.value)}
              placeholder="Enter text content"
              rows={4}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                value={block.content.src || ''}
                onChange={(e) => updateContent('src', e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input
                value={block.content.alt || ''}
                onChange={(e) => updateContent('alt', e.target.value)}
                placeholder="Enter alt text"
              />
            </div>
            <div>
              <Label>Caption</Label>
              <Input
                value={block.content.caption || ''}
                onChange={(e) => updateContent('caption', e.target.value)}
                placeholder="Enter caption"
              />
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label>Button Text</Label>
              <Input
                value={block.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Enter button text"
              />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input
                value={block.content.href || ''}
                onChange={(e) => updateContent('href', e.target.value)}
                placeholder="Enter link URL"
              />
            </div>
            <div>
              <Label>Variant</Label>
              <Select
                value={block.content.variant || 'default'}
                onValueChange={(value) => updateContent('variant', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={block.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Enter hero title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                placeholder="Enter hero subtitle"
                rows={3}
              />
            </div>
            <div>
              <Label>Background Image</Label>
              <Input
                value={block.content.image || ''}
                onChange={(e) => updateContent('image', e.target.value)}
                placeholder="Enter background image URL"
              />
            </div>
            <div>
              <Label>Call to Action</Label>
              <Input
                value={block.content.cta || ''}
                onChange={(e) => updateContent('cta', e.target.value)}
                placeholder="Enter CTA text"
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label>Content (JSON)</Label>
            <Textarea
              value={JSON.stringify(block.content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onUpdate({ content: parsed });
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        );
    }
  };

  const renderStyleProperties = () => (
    <div className="space-y-4">
      {/* Typography */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Typography</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Font Size</Label>
            <Input
              value={block.styles.fontSize || ''}
              onChange={(e) => updateStyle('fontSize', e.target.value)}
              placeholder="16px"
            />
          </div>
          <div>
            <Label className="text-xs">Font Weight</Label>
            <Select
              value={block.styles.fontWeight || 'normal'}
              onValueChange={(value) => updateStyle('fontWeight', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="lighter">Light</SelectItem>
                <SelectItem value="bolder">Bolder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs">Text Color</Label>
          <Input
            type="color"
            value={block.styles.color || '#000000'}
            onChange={(e) => updateStyle('color', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Layout */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Layout</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Padding</Label>
            <Input
              value={block.styles.padding || ''}
              onChange={(e) => updateStyle('padding', e.target.value)}
              placeholder="20px"
            />
          </div>
          <div>
            <Label className="text-xs">Margin</Label>
            <Input
              value={block.styles.margin || ''}
              onChange={(e) => updateStyle('margin', e.target.value)}
              placeholder="10px"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Text Align</Label>
          <Select
            value={block.styles.textAlign || 'left'}
            onValueChange={(value) => updateStyle('textAlign', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="justify">Justify</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Background */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Background</h4>
        <div>
          <Label className="text-xs">Background Color</Label>
          <Input
            type="color"
            value={block.styles.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Border Radius</Label>
          <Input
            value={block.styles.borderRadius || ''}
            onChange={(e) => updateStyle('borderRadius', e.target.value)}
            placeholder="8px"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 h-full">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Edit Element</h3>
        <p className="text-sm text-gray-600 capitalize">{block.block_type} Block</p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">
              <Settings className="h-4 w-4 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="style">
              <Palette className="h-4 w-4 mr-1" />
              Style
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Layout className="h-4 w-4 mr-1" />
              Layout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-4">
            {renderContentProperties()}
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-4">
            {renderStyleProperties()}
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Width</Label>
                <Input
                  value={block.styles.width || ''}
                  onChange={(e) => updateStyle('width', e.target.value)}
                  placeholder="100%"
                />
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <Input
                  value={block.styles.height || ''}
                  onChange={(e) => updateStyle('height', e.target.value)}
                  placeholder="auto"
                />
              </div>
              <div>
                <Label className="text-xs">Display</Label>
                <Select
                  value={block.styles.display || 'block'}
                  onValueChange={(value) => updateStyle('display', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="inline">Inline</SelectItem>
                    <SelectItem value="inline-block">Inline Block</SelectItem>
                    <SelectItem value="flex">Flex</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
