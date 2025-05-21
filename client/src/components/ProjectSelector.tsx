import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/store';
import { apiService } from '../services/api';
import { Select } from './ui/Select';

export const ProjectSelector: React.FC = () => {
  const { setCurrentProject, currentProject } = useAppStore();
  const [projects, setProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const endpoints = await apiService.listMocks();
        
        // Extract unique project names
        const uniqueProjects = [...new Set(endpoints.map(endpoint => endpoint.project))];
        setProjects(uniqueProjects);
        
        // Set default project if none selected
        if (!currentProject && uniqueProjects.length > 0) {
          setCurrentProject(uniqueProjects[0]);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [currentProject, setCurrentProject]);
  
  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects.map(project => ({ value: project, label: project }))
  ];
  
  return (
    <div className="mb-4">
      <Select
        label="Filter by Project"
        options={projectOptions}
        value={currentProject}
        onChange={setCurrentProject}
        disabled={isLoading}
      />
    </div>
  );
};