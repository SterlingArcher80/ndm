
export interface ContentBlock {
  id: string;
  page_id: string;
  block_type: BlockType;
  content: Record<string, any>;
  styles: Record<string, any>;
  position: number;
  parent_id?: string;
  is_global: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageConfig {
  id: string;
  page_id: string;
  page_name: string;
  meta_title?: string;
  meta_description?: string;
  custom_css?: string;
  layout_settings: Record<string, any>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: Record<string, any>;
  thumbnail_url?: string;
  category: string;
  is_system: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentRevision {
  id: string;
  page_id: string;
  revision_data: Record<string, any>;
  revision_number: number;
  created_by?: string;
  created_at: string;
  is_published: boolean;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  category: string;
  created_at: string;
  updated_at: string;
}

export type BlockType = 
  | 'text'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'button'
  | 'card'
  | 'icon'
  | 'form'
  | 'container'
  | 'columns'
  | 'spacer'
  | 'hero'
  | 'features'
  | 'testimonial'
  | 'navigation'
  | 'footer';

export interface EditorState {
  selectedBlockId?: string;
  isEditing: boolean;
  draggedBlock?: ContentBlock;
  clipboard?: ContentBlock;
  history: HistoryEntry[];
  historyIndex: number;
}

export interface HistoryEntry {
  action: 'create' | 'update' | 'delete' | 'move';
  blocks: ContentBlock[];
  timestamp: number;
}

export interface BlockComponent {
  type: BlockType;
  name: string;
  icon: string;
  category: string;
  defaultContent: Record<string, any>;
  defaultStyles: Record<string, any>;
  properties: BlockProperty[];
}

export interface BlockProperty {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'color' | 'number' | 'boolean' | 'image' | 'url';
  options?: string[];
  section: string;
}
