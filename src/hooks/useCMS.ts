
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentBlock, PageConfig, SiteSetting, EditorState } from '@/types/cms';
import { toast } from 'sonner';

export const useCMS = (pageId: string) => {
  const queryClient = useQueryClient();
  const [editorState, setEditorState] = useState<EditorState>({
    isEditing: false,
    history: [],
    historyIndex: -1,
  });

  // Fetch content blocks for a page
  const { data: blocks = [], isLoading: blocksLoading } = useQuery({
    queryKey: ['content-blocks', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', true)
        .order('position');
      
      if (error) throw error;
      return data as ContentBlock[];
    },
  });

  // Fetch page configuration
  const { data: pageConfig, isLoading: configLoading } = useQuery({
    queryKey: ['page-config', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_configs')
        .select('*')
        .eq('page_id', pageId)
        .single();
      
      if (error) throw error;
      return data as PageConfig;
    },
  });

  // Create block mutation
  const createBlockMutation = useMutation({
    mutationFn: async (blockData: Partial<ContentBlock>) => {
      const { data, error } = await supabase
        .from('content_blocks')
        .insert([blockData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-blocks', pageId] });
      toast.success('Block created successfully');
    },
    onError: (error) => {
      console.error('Error creating block:', error);
      toast.error('Failed to create block');
    },
  });

  // Update block mutation
  const updateBlockMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ContentBlock> & { id: string }) => {
      const { data, error } = await supabase
        .from('content_blocks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-blocks', pageId] });
      toast.success('Block updated successfully');
    },
    onError: (error) => {
      console.error('Error updating block:', error);
      toast.error('Failed to update block');
    },
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const { error } = await supabase
        .from('content_blocks')
        .update({ is_active: false })
        .eq('id', blockId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-blocks', pageId] });
      toast.success('Block deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting block:', error);
      toast.error('Failed to delete block');
    },
  });

  // Reorder blocks mutation
  const reorderBlocksMutation = useMutation({
    mutationFn: async (blockUpdates: { id: string; position: number }[]) => {
      const updates = blockUpdates.map(({ id, position }) =>
        supabase
          .from('content_blocks')
          .update({ position })
          .eq('id', id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-blocks', pageId] });
      toast.success('Blocks reordered successfully');
    },
    onError: (error) => {
      console.error('Error reordering blocks:', error);
      toast.error('Failed to reorder blocks');
    },
  });

  // Helper functions
  const addBlock = (blockType: string, position?: number) => {
    const newPosition = position ?? blocks.length;
    createBlockMutation.mutate({
      page_id: pageId,
      block_type: blockType as any,
      content: getDefaultContent(blockType),
      styles: getDefaultStyles(blockType),
      position: newPosition,
      is_global: false,
      is_active: true,
    });
  };

  const updateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    updateBlockMutation.mutate({ id: blockId, ...updates });
  };

  const deleteBlock = (blockId: string) => {
    deleteBlockMutation.mutate(blockId);
  };

  const selectBlock = (blockId?: string) => {
    setEditorState(prev => ({ ...prev, selectedBlockId: blockId }));
  };

  const toggleEditMode = () => {
    setEditorState(prev => ({ ...prev, isEditing: !prev.isEditing }));
  };

  const duplicateBlock = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      createBlockMutation.mutate({
        page_id: pageId,
        block_type: block.block_type,
        content: { ...block.content },
        styles: { ...block.styles },
        position: block.position + 1,
        is_global: false,
        is_active: true,
      });
    }
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const updatedBlocks = [...blocks];
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1);
    updatedBlocks.splice(toIndex, 0, movedBlock);

    const blockUpdates = updatedBlocks.map((block, index) => ({
      id: block.id,
      position: index,
    }));

    reorderBlocksMutation.mutate(blockUpdates);
  };

  return {
    blocks,
    pageConfig,
    editorState,
    isLoading: blocksLoading || configLoading,
    addBlock,
    updateBlock,
    deleteBlock,
    selectBlock,
    toggleEditMode,
    duplicateBlock,
    moveBlock,
    setEditorState,
  };
};

// Helper functions for default content and styles
const getDefaultContent = (blockType: string): Record<string, any> => {
  const defaults: Record<string, any> = {
    text: { text: 'New text block' },
    heading: { text: 'New Heading', level: 1 },
    paragraph: { text: 'New paragraph text' },
    image: { src: '', alt: '', caption: '' },
    button: { text: 'Click me', href: '#', variant: 'primary' },
    card: { title: 'Card Title', content: 'Card content', image: '' },
    icon: { name: 'star', size: 24 },
    hero: { title: 'Hero Title', subtitle: 'Hero subtitle', image: '', cta: 'Get Started' },
    features: { title: 'Features', items: [] },
    container: { children: [] },
  };
  return defaults[blockType] || {};
};

const getDefaultStyles = (blockType: string): Record<string, any> => {
  const defaults: Record<string, any> = {
    text: { fontSize: '16px', color: '#000000' },
    heading: { fontSize: '32px', fontWeight: 'bold', color: '#000000' },
    paragraph: { fontSize: '16px', lineHeight: '1.5', color: '#666666' },
    button: { padding: '12px 24px', borderRadius: '6px', backgroundColor: '#3b82f6' },
    card: { padding: '24px', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    container: { padding: '20px', margin: '0 auto' },
  };
  return defaults[blockType] || {};
};
