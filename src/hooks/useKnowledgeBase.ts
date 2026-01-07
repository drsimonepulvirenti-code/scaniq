import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeDocument, DocumentType } from '@/types/knowledge';
import { toast } from 'sonner';

export const useKnowledgeBase = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data properly
      setDocuments((data || []) as unknown as KnowledgeDocument[]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (
    file: File, 
    documentType: DocumentType = 'other'
  ): Promise<boolean> => {
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upload documents');
        return false;
      }

      // Upload file to storage
      const filePath = `${user.id}/${crypto.randomUUID()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('knowledge-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('knowledge_documents')
        .insert({
          user_id: user.id,
          name: file.name,
          file_type: file.type,
          document_type: documentType,
          file_size: file.size,
          storage_path: filePath,
          is_active: true,
          processing_status: 'pending',
        })
        .select()
        .single();

      if (docError) throw docError;

      // Read file content and trigger processing
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const base64Content = content.split(',')[1] || btoa(content);
        
        try {
          const { error: fnError } = await supabase.functions.invoke('process-document', {
            body: {
              documentId: docData.id,
              fileContent: base64Content,
              fileName: file.name,
            },
          });

          if (fnError) {
            console.error('Processing error:', fnError);
            toast.error('Document uploaded but processing failed');
          } else {
            toast.success('Document uploaded and processed');
          }
          
          fetchDocuments();
        } catch (err) {
          console.error('Error invoking function:', err);
          fetchDocuments();
        }
      };
      
      reader.readAsDataURL(file);
      toast.success('Document uploaded');
      return true;
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const toggleDocumentActive = async (documentId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('knowledge_documents')
        .update({ is_active: isActive })
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId ? { ...doc, is_active: isActive } : doc
        )
      );

      toast.success(isActive ? 'Document activated' : 'Document deactivated');
    } catch (error) {
      console.error('Error toggling document:', error);
      toast.error('Failed to update document');
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const doc = documents.find(d => d.id === documentId);
      if (!doc) return;

      // Delete from storage
      await supabase.storage
        .from('knowledge-docs')
        .remove([doc.storage_path]);

      // Delete from database (cascades to chunks)
      const { error } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== documentId));
      toast.success('Document deleted');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const updateDocumentType = async (documentId: string, documentType: DocumentType) => {
    try {
      const { error } = await supabase
        .from('knowledge_documents')
        .update({ document_type: documentType })
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId ? { ...doc, document_type: documentType } : doc
        )
      );
    } catch (error) {
      console.error('Error updating document type:', error);
      toast.error('Failed to update document type');
    }
  };

  return {
    documents,
    isLoading,
    isUploading,
    uploadDocument,
    toggleDocumentActive,
    deleteDocument,
    updateDocumentType,
    refetch: fetchDocuments,
  };
};