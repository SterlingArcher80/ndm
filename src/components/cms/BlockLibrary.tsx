
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Type, Image, MousePointer, Layout, Star, Container, Minus } from 'lucide-react';
import { BlockType } from '@/types/cms';

interface BlockLibraryProps {
  onAddBlock: (blockType: string) => void;
}

const blockCategories = [
  {
    name: 'Basic',
    blocks: [
      { type: 'heading', name: 'Heading', icon: Type, description: 'Add a heading' },
      { type: 'paragraph', name: 'Paragraph', icon: Type, description: 'Add text content' },
      { type: 'image', name: 'Image', icon: Image, description: 'Add an image' },
      { type: 'button', name: 'Button', icon: MousePointer, description: 'Add a button' },
    ]
  },
  {
    name: 'Layout',
    blocks: [
      { type: 'container', name: 'Container', icon: Container, description: 'Container for other elements' },
      { type: 'spacer', name: 'Spacer', icon: Minus, description: 'Add spacing' },
    ]
  },
  {
    name: 'Advanced',
    blocks: [
      { type: 'card', name: 'Card', icon: Layout, description: 'Add a card component' },
      { type: 'hero', name: 'Hero Section', icon: Star, description: 'Add a hero section' },
    ]
  }
];

export const BlockLibrary: React.FC<BlockLibraryProps> = ({ onAddBlock }) => {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold">Add Elements</h2>
      
      {blockCategories.map((category) => (
        <div key={category.name}>
          <h3 className="text-sm font-medium text-gray-700 mb-3">{category.name}</h3>
          <div className="space-y-2">
            {category.blocks.map((block) => (
              <Card 
                key={block.type} 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onAddBlock(block.type)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <block.icon className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">{block.name}</div>
                      <div className="text-xs text-gray-500">{block.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
