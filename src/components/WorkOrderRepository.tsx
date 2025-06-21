
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import WorkOrderSidebar from './work-order/WorkOrderSidebar';
import WorkOrderMainContent from './work-order/WorkOrderMainContent';
import WorkOrderHeader from './work-order/WorkOrderHeader';
import WorkOrderDialogs from './work-order/WorkOrderDialogs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const WorkOrderRepository = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    itemName: '',
    itemId: ''
  });
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const { data: workOrderItems = [], refetch } = useQuery({
    queryKey: ['work-order-items'],
    queryFn: async () => {
      console.log('🔍 Fetching work order items from database...');
      const { data, error } = await supabase
        .from('work_order_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching work order items:', error);
        throw error;
      }
      
      console.log('📋 Raw data from database:', data);
      console.log(`📊 Total items found: ${data?.length || 0}`);
      
      // Log each item to debug field mapping
      data?.forEach((item, index) => {
        console.log(`📄 Item ${index + 1}:`, {
          id: item.id,
          name: item.name,
          type: item.type,
          file_url: item.file_url,
          mime_type: item.mime_type,
          file_type: item.file_type,
          file_size: item.file_size,
          file_path: item.file_path,
          workflow_stage_id: item.workflow_stage_id,
          parent_id: item.parent_id,
          is_locked: (item as any).is_locked,
          is_stage_subfolder: item.is_stage_subfolder,
          created_at: item.created_at,
          updated_at: item.updated_at
        });
      });

      // Group by workflow stage for debugging
      const groupedByStage = data?.reduce((acc, item) => {
        const stage = item.workflow_stage_id || 'no-stage';
        if (!acc[stage]) acc[stage] = [];
        acc[stage].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      console.log('📊 Items grouped by workflow stage:', groupedByStage);
      
      return data || [];
    }
  });

  // Add effect to log when items change
  React.useEffect(() => {
    console.log('📋 WorkOrderRepository items updated:', {
      totalItems: workOrderItems.length,
      selectedFolder,
      currentPath,
      itemsByType: workOrderItems.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });
  }, [workOrderItems, selectedFolder, currentPath]);

  return (
    <div className="min-h-[900px] bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      <WorkOrderHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFolder={selectedFolder}
        setShowNewFolderDialog={setShowNewFolderDialog}
      />
      
      <div className="flex h-[calc(100%-4rem)]">
        <WorkOrderSidebar 
          workOrderItems={workOrderItems}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          setCurrentPath={setCurrentPath}
          searchQuery={searchQuery}
          currentPath={currentPath}
        />
        
        <WorkOrderMainContent 
          workOrderItems={workOrderItems}
          selectedFolder={selectedFolder}
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          searchQuery={searchQuery}
          setDeleteDialog={setDeleteDialog}
          setShowNewFolderDialog={setShowNewFolderDialog}
        />
      </div>

      <WorkOrderDialogs
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        showNewFolderDialog={showNewFolderDialog}
        setShowNewFolderDialog={setShowNewFolderDialog}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedFolder={selectedFolder}
        currentPath={currentPath}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
      />
    </div>
  );
};

export default WorkOrderRepository;
