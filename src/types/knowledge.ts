export interface KnowledgeDocument {
  id: string;
  user_id: string;
  name: string;
  file_type: string;
  document_type: 'research' | 'brand' | 'persona' | 'other';
  file_size: number;
  storage_path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_edited_by?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'research' | 'brand' | 'persona' | 'other';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  research: 'Research',
  brand: 'Brand Guidelines',
  persona: 'Persona/JTBD',
  other: 'Other'
};

export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
};