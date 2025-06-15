
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

  const { data: workOrderItems = [] } = useQuery({
    queryKey: ['work-order-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="h-[calc(100vh-12rem)] bg-gray-900 text-white rounded-lg overflow-hidden border border-gray-800">
      <WorkOrderHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFolder={selectedFolder}
        currentPath={currentPath}
        folders={[]}
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
        selectedFolder={selectedFolder}
        currentPath={currentPath}
      />
    </div>
  );
};

export default WorkOrderRepository;
