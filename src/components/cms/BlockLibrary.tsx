
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Type, 
  Image, 
  Square, 
  Layout, 
  Columns, 
  Star, 
  FileText, 
  Navigation,
  Sparkles,
  Users,
  MessageSquare
} from 'lucide-react';

interface BlockLibraryProps {
  onAddBlock: (blockType: string) => void;
}

const blockCategories = {
  basic: [
    { type: 'heading', name: 'Heading', icon: Type, description: 'Add headings and titles' },
    { type: 'paragraph', name: 'Paragraph', icon: FileText, description: 'Add body text and content' },
    { type: 'image', name: 'Image', icon: Image, description: 'Add images and media' },
    { type: 'button', name: 'Button', icon: Square, description: 'Add clickable buttons' },
  ],
  layout: [
    { type: 'container', name: 'Container', icon: Layout, description: 'Group other elements' },
    { type: 'columns', name: 'Columns', icon: Columns, description: 'Create column layouts' },
    { type: 'spacer', name: 'Spacer', icon: Star, description: 'Add spacing between elements' },
  ],
  advanced: [
    { type: 'hero', name: 'Hero Section', icon: Sparkles, description: 'Large banner with title and CTA' },
    { type: 'features', name: 'Features', icon: Star, description: 'Showcase product features' },
    { type: 'testimonial', name: 'Testimonial', icon: MessageSquare, description: 'Customer testimonials' },
    { type: 'card', name: 'Card', icon: Square, description: 'Content cards with images' },
  ],
  navigation: [
    { type: 'navigation', name: 'Navigation', icon: Navigation, description: 'Navigation menus' },
    { type: 'footer', name: 'Footer', icon: Layout, description: 'Page footer' },
  ],
};

export const BlockLibrary: React.FC<BlockLibraryProps> = ({ onAddBlock }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredBlocks = React.useMemo(() => {
    if (!searchTerm) return blockCategories;

    const filtered: typeof blockCategories = {};
    Object.entries(blockCategories).forEach(([category, blocks]) => {
      const matchingBlocks = blocks.filter(block =>
        block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingBlocks.length > 0) {
        filtered[category as keyof typeof blockCategories] = matchingBlocks;
      }
    });
    return filtered;
  }, [searchTerm]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Add Elements</h3>
        <Input
          placeholder="Search blocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            {filteredBlocks.basic && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Basic Elements</h4>
                <div className="grid grid-cols-1 gap-2">
                  {filteredBlocks.basic.map((block) => (
                    <Button
                      key={block.type}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => onAddBlock(block.type)}
                    >
                      <block.icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{block.name}</div>
                        <div className="text-xs text-gray-500">{block.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {filteredBlocks.layout && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Layout</h4>
                <div className="grid grid-cols-1 gap-2">
                  {filteredBlocks.layout.map((block) => (
                    <Button
                      key={block.type}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => onAddBlock(block.type)}
                    >
                      <block.icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{block.name}</div>
                        <div className="text-xs text-gray-500">{block.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            {filteredBlocks.advanced && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Advanced</h4>
                <div className="grid grid-cols-1 gap-2">
                  {filteredBlocks.advanced.map((block) => (
                    <Button
                      key={block.type}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => onAddBlock(block.type)}
                    >
                      <block.icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{block.name}</div>
                        <div className="text-xs text-gray-500">{block.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {filteredBlocks.navigation && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Navigation</h4>
                <div className="grid grid-cols-1 gap-2">
                  {filteredBlocks.navigation.map((block) => (
                    <Button
                      key={block.type}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => onAddBlock(block.type)}
                    >
                      <block.icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{block.name}</div>
                        <div className="text-xs text-gray-500">{block.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
