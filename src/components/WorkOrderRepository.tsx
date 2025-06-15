
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WorkOrderHeader from './work-order/WorkOrderHeader';
import WorkOrderSidebar from './work-order/WorkOrderSidebar';
import WorkOrderMainContent from './work-order/WorkOrderMainContent';
import WorkOrderDialogs from './work-order/WorkOrderDialogs';
import { WorkOrderFile, WorkOrderFolder } from './work-order/types';

const WorkOrderRepository = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; itemName: string; itemId: string }>({
    open: false,
    itemName: '',
    itemId: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Fetch work order items from Supabase
  const { data: workOrderItems = [], isLoading } = useQuery({
    queryKey: ['work-order-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_items')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching work order items:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <WorkOrderHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFolder={selectedFolder}
        setShowNewFolderDialog={setShowNewFolderDialog}
      />

      <div className="flex h-[calc(100vh-80px)]">
        <WorkOrderSidebar
          workOrderItems={workOrderItems}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          setCurrentPath={setCurrentPath}
          searchQuery={searchQuery}
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
        showNewFolderDialog={showNewFolderDialog}
        setShowNewFolderDialog={setShowNewFolderDialog}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedFolder={selectedFolder}
        currentPath={currentPath}
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
      />
    </div>
  );
};

export default WorkOrderRepository;
