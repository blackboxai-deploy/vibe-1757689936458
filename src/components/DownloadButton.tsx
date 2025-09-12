'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectData } from '@/lib/types';
import { toast } from 'sonner';

interface DownloadButtonProps {
  projectData: ProjectData;
  onDownload?: (projectData: ProjectData) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

export function DownloadButton({ 
  projectData, 
  onDownload,
  size = 'default',
  variant = 'default'
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Call custom download handler if provided
      if (onDownload) {
        onDownload(projectData);
        return;
      }

      // Generate and download ZIP file
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectData.id,
          projectData
        }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.name.replace(/[^a-zA-Z0-9-]/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Project downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download project. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      size={size}
      variant={variant}
      className="flex items-center gap-2"
    >
      {isDownloading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Downloading...</span>
        </>
      ) : (
        <>
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <span>Download</span>
        </>
      )}
    </Button>
  );
}