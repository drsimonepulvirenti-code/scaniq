import { useState, useCallback } from 'react';
import { Upload, FileText, X, FileImage, File, ToggleLeft, ToggleRight, Loader2, CheckCircle, AlertCircle, Trash2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { DOCUMENT_TYPE_LABELS, ALLOWED_FILE_TYPES, DocumentType } from '@/types/knowledge';
import { KBTestMode } from './KBTestMode';

export const KnowledgeBase = () => {
  const { 
    documents, 
    isLoading, 
    isUploading, 
    uploadDocument, 
    toggleDocumentActive, 
    deleteDocument,
    updateDocumentType 
  } = useKnowledgeBase();

  const [selectedType, setSelectedType] = useState<DocumentType>('other');
  const [showTestMode, setShowTestMode] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await uploadDocument(file, selectedType);
    }
  }, [uploadDocument, selectedType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxSize: 20 * 1024 * 1024, // 20MB
    disabled: isUploading,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return FileImage;
    return File;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Ready</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const activeCount = documents.filter(d => d.is_active && d.processing_status === 'completed').length;
  const totalCount = documents.length;
  const isKBReady = activeCount > 0;

  // Show test mode
  if (showTestMode) {
    return (
      <KBTestMode 
        onBack={() => setShowTestMode(false)} 
        isKBReady={isKBReady}
        activeDocCount={activeCount}
      />
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-foreground">Knowledge Base</h2>
            <Button 
              onClick={() => setShowTestMode(true)}
              disabled={!isKBReady}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Test Knowledge Base
            </Button>
          </div>
          <p className="text-muted-foreground">
            Upload UX research, brand guidelines, and product documents. Active documents will be used by AI to enrich feedback analysis.
          </p>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{activeCount}</span> of {totalCount} documents active
            </p>
          )}
        </div>

        {/* Document type selector */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Document type for new uploads
          </label>
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as DocumentType)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload area */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30',
            isUploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {isDragActive ? 'Drop files here' : isUploading ? 'Uploading...' : 'Import documents'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supported: PDF, DOC, DOCX, TXT, MD (max 20MB)
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="mt-8 flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Uploaded documents */}
        {!isLoading && documents.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-foreground mb-4">
              Your Documents
            </h3>
            <div className="grid gap-3">
              {documents.map((doc) => {
                const Icon = getFileIcon(doc.file_type);

                return (
                  <Card key={doc.id} className={cn(
                    "p-4 transition-all",
                    !doc.is_active && "opacity-60"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
                          {getStatusBadge(doc.processing_status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.created_at)}</span>
                          <span>•</span>
                          <Select 
                            value={doc.document_type} 
                            onValueChange={(v) => updateDocumentType(doc.id, v as DocumentType)}
                          >
                            <SelectTrigger className="h-6 w-auto border-none p-0 text-sm text-muted-foreground hover:text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDocumentActive(doc.id, !doc.is_active)}
                          className={cn(
                            "gap-1.5",
                            doc.is_active ? "text-green-600" : "text-muted-foreground"
                          )}
                        >
                          {doc.is_active ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              Inactive
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteDocument(doc.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && documents.length === 0 && (
          <div className="mt-8 text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload research reports, brand guidelines, or personas to enhance AI analysis.
            </p>
          </div>
        )}

        {/* Info section */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">How it works</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Documents are processed and split into searchable chunks</li>
            <li>• Only <strong>active</strong> documents are used by AI for feedback analysis</li>
            <li>• Toggle documents on/off to control what AI references</li>
            <li>• Categorize documents to improve relevance matching</li>
          </ul>
        </div>
      </div>
    </div>
  );
};