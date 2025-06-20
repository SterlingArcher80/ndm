
import React from 'react';
import { useParams } from 'react-router-dom';
import { VisualEditor } from '@/components/cms/VisualEditor';

const CMSEditor = () => {
  const { pageId } = useParams<{ pageId: string }>();
  
  return (
    <div className="h-screen">
      <VisualEditor pageId={pageId || '/'} />
    </div>
  );
};

export default CMSEditor;
