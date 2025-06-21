
import React from 'react';

const SidebarLoadingState = () => {
  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Workflow Stages</h2>
        <div className="space-y-2">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLoadingState;
