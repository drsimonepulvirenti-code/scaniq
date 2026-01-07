-- Enable pgvector extension first
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Knowledge Base Documents table
CREATE TABLE public.knowledge_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'other',
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_edited_by UUID,
  processing_status TEXT NOT NULL DEFAULT 'pending'
);

-- Knowledge Chunks table for processed document content
CREATE TABLE public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding extensions.vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policies for knowledge_documents
CREATE POLICY "Users can view their own documents" 
ON public.knowledge_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
ON public.knowledge_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.knowledge_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.knowledge_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for knowledge_chunks (via document ownership)
CREATE POLICY "Users can view chunks of their documents" 
ON public.knowledge_chunks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_documents 
    WHERE id = document_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert chunks for their documents" 
ON public.knowledge_chunks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.knowledge_documents 
    WHERE id = document_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update chunks of their documents" 
ON public.knowledge_chunks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_documents 
    WHERE id = document_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete chunks of their documents" 
ON public.knowledge_chunks 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_documents 
    WHERE id = document_id AND user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_documents_updated_at
BEFORE UPDATE ON public.knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

CREATE TRIGGER update_knowledge_chunks_updated_at
BEFORE UPDATE ON public.knowledge_chunks
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- Create storage bucket for knowledge documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('knowledge-docs', 'knowledge-docs', false);

-- Storage policies
CREATE POLICY "Users can upload their own knowledge docs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'knowledge-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own knowledge docs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'knowledge-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own knowledge docs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'knowledge-docs' AND auth.uid()::text = (storage.foldername(name))[1]);