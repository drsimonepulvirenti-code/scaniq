import { useState, useCallback } from 'react';
import { Upload, FileText, X, FileImage, FileSpreadsheet, File } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { KnowledgeFile } from '@/types/onboarding';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

export const KnowledgeBase = () => {
  const [files, setFiles] = useState<KnowledgeFile[]>(() => {
    const stored = localStorage.getItem('knowledgeFiles');
    return stored ? JSON.parse(stored) : [];
  });

  const saveFiles = (newFiles: KnowledgeFile[]) => {
    setFiles(newFiles);
    localStorage.setItem('knowledgeFiles', JSON.stringify(newFiles));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: KnowledgeFile[] = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    }));

    saveFiles([...files, ...newFiles]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const removeFile = (id: string) => {
    saveFiles(files.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return FileImage;
    if (type.includes('sheet') || type.includes('excel')) return FileSpreadsheet;
    return File;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Knowledge Base</h2>
          <p className="text-muted-foreground">
            Upload documents to help AI agents understand your business context better.
          </p>
        </div>

        {/* Upload area */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {isDragActive ? 'Drop files here' : 'Import files'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supported: PDF, DOC, DOCX, TXT, Images, Excel
          </p>
        </div>

        {/* Uploaded files */}
        {files.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-foreground mb-4">
              Uploaded Documents ({files.length})
            </h3>
            <div className="grid gap-3">
              {files.map((file) => {
                const Icon = getFileIcon(file.type);

                return (
                  <Card key={file.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{file.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
