import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Play, ChevronRight, ChevronDown, FileOutput } from 'lucide-react';
import { useAppStore } from '../store/store';
import { MockEndpoint } from '../types/api';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TestModal } from './TestModal';
import toast from 'react-hot-toast';
import { generateOpenAPISpec } from '../lib/swagger';

interface TestResult {
  status: number;
  headers: Record<string, string>;
  data: Record<string, unknown>;
}

export const EndpointList: React.FC = () => {
  const navigate = useNavigate();
  const { mockEndpoints, removeMockEndpoint, currentProject, baseUrl } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});
  const [testModalEndpoint, setTestModalEndpoint] = useState<MockEndpoint | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteMock(id);
      removeMockEndpoint(id);
      toast.success('Endpoint deleted successfully');
    } catch (error) {
      toast.error('Failed to delete endpoint');
      console.error('Delete error:', error);
    }
  };

  const handleTestEndpoint = async (request?: Record<string, unknown>) => {
    if (!testModalEndpoint) return;
    
    try {
      toast.loading('Testing endpoint...', { id: 'test-endpoint' });
      const result = await apiService.callMockApi(
        baseUrl,
        testModalEndpoint.path,
        testModalEndpoint.method,
        request
      );
      
      toast.dismiss('test-endpoint');
      if(result.status > 200) {
        toast.error(`Response received: ${result.status}`);
      
      } else {
        toast.success(`Response received: ${result.status}`);
      
      }
      setTestResult(result);
     
    } catch (error) {
      toast.dismiss('test-endpoint');
      toast.error('Failed to test endpoint');
      console.error('Test error:', error);
    }
  };

  const closeTestModal = () => {
    setTestModalEndpoint(null);
    setTestResult(null);
  };

  const filteredEndpoints = mockEndpoints.filter((endpoint) => {
    if (currentProject && endpoint.project !== currentProject) {
      return false;
    }
    
    if (
      searchTerm &&
      !endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !endpoint.method.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportSwagger = () => {
    try {
      const spec = generateOpenAPISpec(filteredEndpoints);
      const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'swagger.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Swagger specification exported successfully');
    } catch (error) {
      console.error('Failed to export swagger:', error);
      toast.error('Failed to export swagger specification');
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 flex justify-between">
        <Input
          placeholder="Search endpoints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <Button
          variant="outline"
          onClick={handleExportSwagger}
          rightIcon={<FileOutput className='rotate-180 h-8 w-4'/>}
        >
          Export Swagger
        </Button>
      </div>

      {filteredEndpoints.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Endpoints Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm
                ? 'No endpoints match your search criteria.'
                : 'No endpoints available. Create a new one to get started.'}
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate('/create')}
            >
              Create New Endpoint
            </Button>
          </CardContent>
        </Card>
      )}
      
      {filteredEndpoints.map((endpoint) => (
        <Card key={endpoint.id} className="overflow-hidden transition-all duration-200">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => toggleEndpoint(endpoint.id!)}
          >
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(endpoint.method)}`}>
                {endpoint.method}
              </span>
              <span className="font-mono text-sm truncate max-w-md">
                {endpoint.path}
              </span>
              {endpoint.project && (
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                  {endpoint.project}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setTestModalEndpoint(endpoint);
                }}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Test
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit/${endpoint.id}`);
                }}
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(endpoint.id!);
                }}
                leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
              >
                Delete
              </Button>
              {expandedEndpoints[endpoint.id!] ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
          
          {expandedEndpoints[endpoint.id!] && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <h4 className="font-medium mb-2">Responses ({endpoint.responses.length})</h4>
                {endpoint.responses.map((response, index) => (
                  <div key={index} className="mb-4 p-3 bg-white dark:bg-gray-900 rounded shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-mono text-xs">
                        Status: <span className="text-blue-600">{response.statusCode}</span>
                        {response.delay > 0 && (
                          <span className="ml-2">
                            Delay: <span className="text-blue-600">{response.delay}ms</span>
                          </span>
                        )}
                      </div>
                    </div>
                    {response.request && (
                      <div className="mb-2">
                        <h5 className="text-xs font-medium mb-1">Request:</h5>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(response.request, null, 2)}
                        </pre>
                      </div>
                    )}
                    <div>
                      <h5 className="text-xs font-medium mb-1">Response:</h5>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(response.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}

      {testModalEndpoint && (
        <TestModal
          endpoint={testModalEndpoint}
          isOpen={true}
          onClose={closeTestModal}
          onTest={handleTestEndpoint}
          testResult={testResult}
        />
      )}
    </div>
  );
};