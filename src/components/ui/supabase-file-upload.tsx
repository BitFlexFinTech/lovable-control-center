import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from './progress';
import { toast } from '@/hooks/use-toast';
import { Check, Upload, X, FileText, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupabaseFileUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  folder?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

interface UploadStatus {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  url?: string;
  error?: string;
}

export function SupabaseFileUpload({
  onUploadComplete,
  folder = 'general',
  accept = 'image/*,application/pdf',
  multiple = true,
  maxSize = 10 * 1024 * 1024,
}: SupabaseFileUploadProps) {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    
    const initialStatuses: UploadStatus[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }));
    setUploads(initialStatuses);

    const completedUrls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      setUploads(prev => prev.map((u, idx) => 
        idx === i ? { ...u, status: 'uploading', progress: 50 } : u
      ));

      try {
        const url = await uploadFile(file);
        if (url) {
          completedUrls.push(url);
          setUploads(prev => prev.map((u, idx) => 
            idx === i ? { ...u, status: 'complete', progress: 100, url } : u
          ));
        }
      } catch (error) {
        setUploads(prev => prev.map((u, idx) => 
          idx === i ? { ...u, status: 'error', error: (error as Error).message } : u
        ));
      }
    }

    setIsUploading(false);

    if (completedUrls.length > 0) {
      toast({
        title: 'Upload complete',
        description: `${completedUrls.length} file(s) uploaded successfully`,
      });
      onUploadComplete?.(completedUrls);
    }
  }, [folder, maxSize, onUploadComplete]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(multiple ? files : [files[0]]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(multiple ? files : [files[0]]);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  const clearUploads = () => setUploads([]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        <Upload className={cn('h-10 w-10 mx-auto mb-4', isDragging ? 'text-primary' : 'text-muted-foreground')} />
        <p className="text-sm font-medium">{isDragging ? 'Drop files here' : 'Drag & drop files here'}</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
        <p className="text-xs text-muted-foreground mt-2">Max file size: {maxSize / 1024 / 1024}MB</p>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, idx) => {
            const FileIcon = getFileIcon(upload.file.type);
            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {upload.status === 'complete' ? (
                  <Check className="h-4 w-4 text-status-active" />
                ) : upload.status === 'error' ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : (
                  <FileIcon className="h-4 w-4 text-muted-foreground animate-pulse" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{upload.file.name}</p>
                  {upload.status === 'uploading' && <Progress value={upload.progress} className="h-1 mt-1" />}
                  {upload.status === 'error' && <p className="text-xs text-destructive">{upload.error}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{(upload.file.size / 1024).toFixed(1)} KB</span>
              </div>
            );
          })}
          {!isUploading && (
            <button onClick={clearUploads} className="text-xs text-muted-foreground hover:text-foreground">
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
