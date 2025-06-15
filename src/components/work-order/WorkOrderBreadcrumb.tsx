
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
  if (breadcrumbPath.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      {currentPath.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateBack}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      )}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {breadcrumbPath.map((crumb, index) => (
          <React.Fragment key={index}>
            <button
              onClick={crumb.onClick}
              className="hover:text-white transition-colors"
            >
              {crumb.name}
            </button>
            {index < breadcrumbPath.length - 1 && <span>/</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WorkOrderBreadcrumb;
