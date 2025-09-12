'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectCard } from '@/components/ProjectCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProjectData, User } from '@/lib/types';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'language'>('date');

  // Load user and projects from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('blackbox_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (e) {
        console.error('Failed to load user:', e);
      }
    }

    const savedProjects = localStorage.getItem('blackbox_projects');
    if (savedProjects) {
      try {
        const projectsData = JSON.parse(savedProjects);
        setProjects(projectsData);
      } catch (e) {
        console.error('Failed to load projects:', e);
      }
    }
  }, []);

  // Filter and sort projects
  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Language filter
    if (languageFilter !== 'all') {
      filtered = filtered.filter(project => project.language === languageFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'language':
          return a.language.localeCompare(b.language);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredProjects(filtered);
  }, [projects, searchTerm, languageFilter, sortBy]);

  const handleLoadProject = (project: ProjectData) => {
    // Store selected project and navigate back to main page
    localStorage.setItem('blackbox_selected_project', JSON.stringify(project));
    window.location.href = '/';
    toast.success(`Loaded project: ${project.name}`);
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('blackbox_projects', JSON.stringify(updatedProjects));
    toast.success('Project deleted successfully');
  };

  const uniqueLanguages = [...new Set(projects.map(p => p.language))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Project History
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage your generated projects
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {user.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {uniqueLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {(lang as string).charAt(0).toUpperCase() + (lang as string).slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: 'name' | 'date' | 'language') => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="language">Sort by Language</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {projects.length === 0 ? 'No Projects Yet' : 'No Projects Found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {projects.length === 0 
                ? 'Start creating projects with the Blackbox AI Agent to see them here.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {projects.length === 0 && (
              <Button
                onClick={() => window.location.href = '/'}
                className="mt-4"
              >
                Start Creating
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onLoad={handleLoadProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {projects.length > 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Total Projects: {projects.length}</span>
                <span>Filtered Results: {filteredProjects.length}</span>
                <span>Languages: {uniqueLanguages.length}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}