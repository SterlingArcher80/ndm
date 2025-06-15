
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';

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
      
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbPath.map((crumb, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {index === breadcrumbPath.length - 1 ? (
                  <BreadcrumbPage className="text-white">
                    {crumb.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={crumb.onClick}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {crumb.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbPath.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default WorkOrderBreadcrumb;
