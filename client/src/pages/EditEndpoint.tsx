import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/store';
import { apiService } from '../services/api';
import { EndpointForm } from '../components/EndpointForm';
import { Button } from '../components/ui/Button';
import { MockEndpoint } from '../types/api';
import toast from 'react-hot-toast';

export const EditEndpoint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [endpoint, setEndpoint] = useState<MockEndpoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEndpoint = async () => {
      if (!id) {
        navigate('/');
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.getMockById(id);
        setEndpoint(data);
      } catch (error) {
        console.error('Failed to fetch endpoint:', error);
        setError('Failed to fetch endpoint details');
        toast.error('Failed to load endpoint details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEndpoint();
  }, [id, navigate]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 flex justify-center items-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  if (error || !endpoint) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <h2 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-400 mb-4">
            {error || 'Unable to find the requested endpoint'}
          </p>
          <Button
            onClick={() => navigate('/')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Mock Endpoint</h1>
      <EndpointForm initialData={endpoint} isEditing />
    </div>
  );
};