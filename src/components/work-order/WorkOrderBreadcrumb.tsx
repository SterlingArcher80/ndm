
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  name: string;
  onClick: () => void;
}

interface WorkOrderBreadcrumbProps {
  breadcrumbPath: BreadcrumbItem[];
  currentPath: string[];
  navigateBack: () => void;
}

const WorkOrderBreadcrumb = ({ breadcrumbPath, currentPath, navigateBack }: WorkOrderBreadcrumbProps) => {
  // Only show the back button if we have navigation depth
  const shouldShowBack = currentPath.length > 0;
  
  if (!shouldShowBack) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={navigateBack}
        className="text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>
    </div>
  );
};

export default WorkOrderBreadcrumb;
