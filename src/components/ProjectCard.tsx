'use client';

import { ProjectData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DownloadButton } from './DownloadButton';

interface ProjectCardProps {
  project: ProjectData;
  onLoad: (project: ProjectData) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onLoad, onDelete }: ProjectCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {project.name}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Project Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{project.files?.length || 0} files</span>
            <span>•</span>
            <span>Created {formatDate(project.createdAt)}</span>
            {project.updatedAt && project.updatedAt !== project.createdAt && (
              <>
                <span>•</span>
                <span>Updated {formatDate(project.updatedAt)}</span>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">
              {project.language}
            </Badge>
            {project.framework && (
              <Badge variant="outline">
                {project.framework}
              </Badge>
            )}
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* File List Preview */}
          {project.files && project.files.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Files:
              </p>
              <div className="space-y-1">
                {project.files.slice(0, 3).map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="font-mono text-gray-600 dark:text-gray-400 truncate">
                      {file.path}
                    </span>
                    <Badge variant="outline" className="text-xs py-0">
                      {file.language}
                    </Badge>
                  </div>
                ))}
                {project.files.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 pl-3.5">
                    +{project.files.length - 3} more files
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLoad(project)}
              className="flex-1 mr-2"
            >
              Load Project
            </Button>
            
            <div className="flex items-center gap-2">
              <DownloadButton
                projectData={project}
                size="sm"
                variant="outline"
              />
              
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(project.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}