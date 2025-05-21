import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Play, ChevronRight, ChevronDown, FileOutput, Clipboard } from 'lucide-react';
import { useAppStore } from '../store/store';
import { MockEndpoint } from '../types/dto';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TestModal } from './TestModal';
import toast from 'react-hot-toast';
import { generateOpenAPISpec } from '../lib/swagger';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from './ui/Dialog';
import { getCurlCommand } from '../lib/utils';

interface TestResult {
  status: number;
  headers: Record<string, string>;
  data: Record<string, unknown>;
}

export const EndpointList: React.FC = () => {
  const navigate = useNavigate();
  const { mockEndpoints, deleteMockEndpoint, currentProject, baseUrl } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});
  const [testModalEndpoint, setTestModalEndpoint] = useState<MockEndpoint | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const countdownRef = React.useRef<NodeJS.Timeout | null>(null);

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteMock(id);
      deleteMockEndpoint(id);
      toast.success('Endpoint deleted successfully');
    } catch (error) {
      toast.error('Failed to delete endpoint');
      console.error('Delete error:', error);
    }
  };

  const handleTestEndpoint = async (request?: Record<string, unknown>) => {
    console.log({request})
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

  const openDeleteDialog = (id: string) => {
    setDeleteTargetId(id);
    setDeleteCountdown(6);
    setDeleteDialogOpen(true);
  };

  React.useEffect(() => {
    if (!deleteDialogOpen) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }
    setDeleteCountdown(6);
    countdownRef.current = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [deleteDialogOpen]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    await handleDelete(deleteTargetId);
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
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
              {/* Copy as cURL for first response (unexpanded) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  if (endpoint.responses.length > 0) {
                    const curl = getCurlCommand(endpoint, endpoint.responses[0]);
                    navigator.clipboard.writeText(curl);
                    toast.success('Copied as cURL!');
                  }
                }}
                leftIcon={<Clipboard className="w-4 h-4" />}
                aria-label="Copy as cURL"
              >
                cURL
              </Button>
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
                  openDeleteDialog(endpoint.id!);
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
               
                {endpoint.responses.map((response, index) => (
                  <div key={index} className="mb-4 p-3 bg-white dark:bg-gray-900 rounded shadow-sm">
                    <h4 className="text-sm font-medium mb-2"> {index + 1}. {response.name || `Response ${index + 1}`}</h4>
                    <p className='px-2 pb-4 text-xs overflow-x-auto text-xs text-secondary-foreground opacity-50'>{ response.description}</p>
                    <div className="flex justify-between items-center mb-2 bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                      <div className="font-mono text-xs">
                        Status: <span className="text-blue-600">{response.statusCode}</span>
                        {response.delay > 0 && (
                          <span className="ml-2">
                            Delay: <span className="text-blue-600">{response.delay}ms</span>
                          </span>
                        )}
                      </div>
                      {/* Copy as cURL for each response (expanded) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const curl = getCurlCommand(endpoint, response);
                          navigator.clipboard.writeText(curl);
                          toast.success('Copied as cURL!');
                        }}
                        leftIcon={<Clipboard className="w-4 h-4" />}
                        aria-label="Copy as cURL"
                      >
                        cURL
                      </Button>
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
          testResult={testResult || undefined}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Endpoint</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this endpoint? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteCountdown > 0}
            >
              {deleteCountdown > 0 ? `Delete (${deleteCountdown})` : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};