
import React from 'react';
import { ContentBlock } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PropertyPanelProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ block, onUpdate }) => {
  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: { ...block.content, [key]: value }
    });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      styles: { ...block.styles, [key]: value }
    });
  };

  const renderContentProperties = () => {
    switch (block.block_type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Heading Text</Label>
              <Input
                id="text"
                value={block.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Enter heading text"
              />
            </div>
            <div>
              <Label htmlFor="level">Heading Level</Label>
              <Select
                value={String(block.content.level || 1)}
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
            <Label htmlFor="text">Text Content</Label>
            <Textarea
              id="text"
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
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={block.content.src || ''}
                onChange={(e) => updateContent('src', e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={block.content.alt || ''}
                onChange={(e) => updateContent('alt', e.target.value)}
                placeholder="Describe the image"
              />
            </div>
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={block.content.caption || ''}
                onChange={(e) => updateContent('caption', e.target.value)}
                placeholder="Image caption"
              />
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Button Text</Label>
              <Input
                id="text"
                value={block.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Button text"
              />
            </div>
            <div>
              <Label htmlFor="href">Link URL</Label>
              <Input
                id="href"
                value={block.content.href || ''}
                onChange={(e) => updateContent('href', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="variant">Button Style</Label>
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={block.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Hero title"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                placeholder="Hero subtitle"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="image">Background Image URL</Label>
              <Input
                id="image"
                value={block.content.image || ''}
                onChange={(e) => updateContent('image', e.target.value)}
                placeholder="Background image URL"
              />
            </div>
            <div>
              <Label htmlFor="cta">Call to Action Text</Label>
              <Input
                id="cta"
                value={block.content.cta || ''}
                onChange={(e) => updateContent('cta', e.target.value)}
                placeholder="Get Started"
              />
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div>
            <Label htmlFor="height">Height (px)</Label>
            <Input
              id="height"
              type="number"
              value={parseInt(block.content.height) || 40}
              onChange={(e) => updateContent('height', `${e.target.value}px`)}
              placeholder="40"
            />
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            No properties available for this block type.
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Properties</h2>
        <p className="text-sm text-gray-600 capitalize">{block.block_type} Block</p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Content</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContentProperties()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Styling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="color">Text Color</Label>
            <Input
              id="color"
              type="color"
              value={block.styles.color || '#000000'}
              onChange={(e) => updateStyle('color', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fontSize">Font Size (px)</Label>
            <Input
              id="fontSize"
              type="number"
              value={parseInt(block.styles.fontSize) || 16}
              onChange={(e) => updateStyle('fontSize', `${e.target.value}px`)}
              placeholder="16"
            />
          </div>
          <div>
            <Label htmlFor="padding">Padding (px)</Label>
            <Input
              id="padding"
              value={block.styles.padding || ''}
              onChange={(e) => updateStyle('padding', e.target.value)}
              placeholder="20px"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
