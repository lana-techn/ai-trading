'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  CloudArrowUpIcon, 
  PhotoIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import imageUploadService, { type ImageUploadResponse } from '@/lib/imageUploadService';

interface ImageUploadProps {
  onImageUpload?: (file: File, additionalContext?: string) => Promise<void>;
  onImageUploaded?: (uploadResponse: ImageUploadResponse) => void;
  isUploading?: boolean;
  className?: string;
  enableSupabaseUpload?: boolean;
}

interface PreviewImage {
  file: File;
  url: string;
}

interface UploadSuccess {
  imageId: string;
  publicUrl: string;
  fileName: string;
}

export default function ImageUpload({ 
  onImageUpload, 
  onImageUploaded,
  isUploading = false, 
  className,
  enableSupabaseUpload = true 
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const [additionalContext, setAdditionalContext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<UploadSuccess | null>(null);
  const [isInternalUploading, setIsInternalUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!supportedFormats.includes(file.type)) {
      return `Unsupported file format. Please use: ${supportedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      return `File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`;
    }
    
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewImage({ file, url });
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const clearPreview = useCallback(() => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage.url);
    }
    setPreviewImage(null);
    setError(null);
    setUploadSuccess(null);
    setAdditionalContext('');
    setIsInternalUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewImage]);

  const handleUpload = useCallback(async () => {
    if (!previewImage) return;
    
    setError(null);
    setIsInternalUploading(true);
    
    try {
      if (enableSupabaseUpload && imageUploadService.isImageUploadEnabled()) {
        // Upload to Supabase
        const uploadResponse = await imageUploadService.uploadImage(
          previewImage.file, 
          additionalContext
        );

        if (uploadResponse.success && uploadResponse.data && uploadResponse.publicUrl) {
          const successData: UploadSuccess = {
            imageId: uploadResponse.data.id,
            publicUrl: uploadResponse.publicUrl,
            fileName: uploadResponse.data.file_name
          };
          
          setUploadSuccess(successData);
          
          // Notify parent component
          if (onImageUploaded) {
            onImageUploaded(uploadResponse);
          }
          
          // Clear preview after short delay to show success
          setTimeout(() => {
            clearPreview();
          }, 2000);
        } else {
          setError(uploadResponse.error || 'Upload failed. Please try again.');
        }
      } else if (onImageUpload) {
        // Use legacy upload handler
        await onImageUpload(previewImage.file, additionalContext);
        clearPreview();
      } else {
        setError('No upload handler configured.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsInternalUploading(false);
    }
  }, [previewImage, additionalContext, onImageUpload, onImageUploaded, enableSupabaseUpload, clearPreview]);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const currentUploading = isUploading || isInternalUploading;

  if (previewImage) {
    return (
      <div className={cn("bg-card border border-border rounded-lg shadow-sm", className)}>
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <PhotoIcon className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-foreground">
              {uploadSuccess ? 'Upload Successful!' : 'Chart Preview'}
            </h3>
            {uploadSuccess && (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            )}
          </div>
          <button
            onClick={clearPreview}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={currentUploading}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-lg overflow-hidden border border-border bg-muted/50">
            <img
              src={previewImage.url}
              alt="Chart preview"
              className="w-full h-auto max-h-64 object-contain"
            />
            {currentUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center px-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent" />
                  <div className="text-white space-y-1">
                    <div className="text-sm font-medium">
                      {enableSupabaseUpload ? 'Uploading to database...' : 'AI Analysis in Progress...'}
                    </div>
                    <div className="text-xs opacity-80">
                      {enableSupabaseUpload ? 'Saving to cloud storage' : '⚡ Optimizing • 📊 Analyzing patterns'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {uploadSuccess && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-green-600">
                  <CheckCircleIcon className="h-12 w-12" />
                  <span className="text-sm font-medium">Upload Complete!</span>
                  <span className="text-xs opacity-80">Redirecting...</span>
                </div>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{previewImage.file.name}</span>
            <span>{(previewImage.file.size / 1024 / 1024).toFixed(2)}MB</span>
          </div>

          {/* Success Info */}
          {uploadSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="font-medium">Successfully uploaded to database!</span>
              </div>
              <div className="mt-1 text-xs text-green-600 dark:text-green-500">
                Image ID: {uploadSuccess.imageId.substring(0, 8)}...
              </div>
            </div>
          )}

          {/* Additional Context */}
          <div className="space-y-2">
            <label htmlFor="context" className="block text-sm font-medium text-foreground">
              Additional Context (Optional)
            </label>
            <textarea
              id="context"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="e.g., What timeframe is this? Any specific questions about the chart?"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
              rows={2}
              disabled={currentUploading || !!uploadSuccess}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!uploadSuccess && (
              <button
                onClick={handleUpload}
                disabled={currentUploading}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2",
                  currentUploading
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm hover:shadow-md"
                )}
              >
                {currentUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    {enableSupabaseUpload ? 'Uploading...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4" />
                    {enableSupabaseUpload ? 'Upload to Database' : 'Analyze Chart'}
                  </>
                )}
              </button>
            )}
            <button
              onClick={clearPreview}
              disabled={currentUploading}
              className={cn(
                "px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50",
                uploadSuccess
                  ? "flex-1 bg-green-600 text-white hover:bg-green-700"
                  : "text-muted-foreground bg-background border border-input hover:bg-muted hover:text-foreground"
              )}
            >
              {uploadSuccess ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-card border border-border rounded-lg shadow-sm", className)}>
      {/* Upload Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <PhotoIcon className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-foreground">Upload Chart for Analysis</h3>
      </div>

      <div className="p-4">
        {/* Drop Zone */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={supportedFormats.join(',')}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                dragActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <CloudArrowUpIcon className="h-6 w-6" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                {dragActive ? "Drop your chart here" : "Upload a chart image"}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to browse
              </p>
            </div>
          </div>
        </div>

        {/* Format Info */}
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
            <span>Supported: JPEG, PNG, GIF, WebP (max 10MB)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
            <span>
              {enableSupabaseUpload 
                ? 'Images will be saved to your personal database' 
                : 'AI will analyze: trends, patterns, indicators, support/resistance'}
            </span>
          </div>
          {enableSupabaseUpload && (
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-blue-500" />
              <span>Secure cloud storage with analysis history</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-destructive text-sm">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}