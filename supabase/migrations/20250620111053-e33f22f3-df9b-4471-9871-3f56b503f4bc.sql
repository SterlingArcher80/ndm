
-- Create content management tables for the WYSIWYG editor system

-- Content blocks table to store all editable elements
CREATE TABLE public.content_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL,
  block_type TEXT NOT NULL, -- 'text', 'image', 'button', 'card', 'icon', 'form', 'container', etc.
  content JSONB NOT NULL DEFAULT '{}',
  styles JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES public.content_blocks(id) ON DELETE CASCADE,
  is_global BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Page configurations table
CREATE TABLE public.page_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  custom_css TEXT,
  layout_settings JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Content templates table for reusable layouts
CREATE TABLE public.content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Content revisions for version control
CREATE TABLE public.content_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL,
  revision_data JSONB NOT NULL,
  revision_number INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT false
);

-- Global settings for site-wide configurations
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_content_blocks_page_id ON public.content_blocks(page_id);
CREATE INDEX idx_content_blocks_position ON public.content_blocks(position);
CREATE INDEX idx_content_blocks_parent_id ON public.content_blocks(parent_id);
CREATE INDEX idx_content_revisions_page_id ON public.content_revisions(page_id);
CREATE INDEX idx_content_revisions_created_at ON public.content_revisions(created_at);

-- Add RLS policies
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Content blocks policies
CREATE POLICY "Anyone can view published content blocks" ON public.content_blocks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage content blocks" ON public.content_blocks
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Page configs policies
CREATE POLICY "Anyone can view published page configs" ON public.page_configs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated users can manage page configs" ON public.page_configs
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Content templates policies
CREATE POLICY "Anyone can view content templates" ON public.content_templates
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage content templates" ON public.content_templates
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Content revisions policies
CREATE POLICY "Authenticated users can view content revisions" ON public.content_revisions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage content revisions" ON public.content_revisions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Site settings policies
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage site settings" ON public.site_settings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Add triggers for updated_at columns
CREATE TRIGGER update_content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_configs_updated_at
  BEFORE UPDATE ON public.page_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at
  BEFORE UPDATE ON public.content_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default page configurations
INSERT INTO public.page_configs (page_id, page_name, is_published) VALUES
  ('/', 'Landing Page', true),
  ('/inventory', 'Inventory System', true),
  ('/bom', 'Bill of Materials', true),
  ('/work-orders', 'Work Orders', true),
  ('/documents', 'Documents', true),
  ('/settings', 'Settings', true),
  ('/auth', 'Authentication', true);

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, category) VALUES
  ('site_title', '"Nucleus - powered by DMSI"', 'general'),
  ('site_description', '"Streamline your inventory tracking and management"', 'general'),
  ('theme_colors', '{"primary": "#3b82f6", "secondary": "#64748b", "accent": "#10b981"}', 'appearance'),
  ('typography', '{"heading_font": "Inter", "body_font": "Inter", "heading_size": "2xl", "body_size": "base"}', 'appearance'),
  ('navigation_settings', '{"show_sidebar": true, "show_breadcrumbs": true, "sticky_navigation": true}', 'navigation');
