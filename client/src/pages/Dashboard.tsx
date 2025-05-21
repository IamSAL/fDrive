import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/store';
import { apiService } from '../services/api';
import { EndpointList } from '../components/EndpointList';
import { ProjectSelector } from '../components/ProjectSelector';
import { Button } from '../components/ui/Button';
import { SwaggerImportModal } from '../components/SwaggerImportModal';
import { SwaggerDefinition } from '../types/swagger';
import toast from 'react-hot-toast';
import { isDevelopmentMode } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { setMockEndpoints, setLoading, isLoading, currentProject, error, setError } = useAppStore();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoints = await apiService.listMocks(currentProject);
      setMockEndpoints(endpoints);
    } catch (error) {
      console.error('Failed to fetch endpoints:', error);
      setError('Failed to fetch endpoints');
      toast.error('Failed to load endpoints');
    } finally {
      setLoading(false);
    }
  };

  const handleImportSwagger = async (swagger: SwaggerDefinition) => {
    try {
      await apiService.importSwagger(currentProject, swagger);
      await fetchEndpoints();
      toast.success('Swagger imported successfully');
    } catch (error) {
      console.error('Failed to import swagger:', error);
      toast.error('Failed to import swagger');
      throw error;
    }
  };
  
  useEffect(() => {
    fetchEndpoints();
  }, [currentProject]);
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Mock API Endpoints</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage and test your mock API endpoints
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={fetchEndpoints}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          {isDevelopmentMode() &&  <Button
            className='whitespace-nowrap'
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            leftIcon={<svg className="w-4 h-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>}
          >
            Import Swagger
          </Button>}
          <Link to="/create">
            <Button className='whitespace-nowrap ' leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create New
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mb-6">
        <ProjectSelector />
      </div>
      
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={fetchEndpoints}
          >
            Try Again
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center p-12">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <EndpointList />
      )}

      <SwaggerImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportSwagger}
      />
    </div>
  );
};