import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { MockEndpoint, MockResponse, HttpMethod } from '../types/dto';
import { useAppStore } from '../store/store';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { ResponseForm } from './ResponseForm';
import toast from 'react-hot-toast';

interface EndpointFormProps {
  initialData?: MockEndpoint;
  isEditing?: boolean;
}

export const EndpointForm: React.FC<EndpointFormProps> = ({ 
  initialData,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const { addMockEndpoint, updateMockEndpoint, currentProject } = useAppStore();
  
  const [responses, setResponses] = useState<MockResponse[]>(
    initialData?.responses || [{
      request: {},
      responseHeader: {},
      response: { message: "Success" },
      statusCode: 200,
      delay: 0
    }]
  );
  
  const { control, handleSubmit, formState: { errors } } = useForm<Omit<MockEndpoint, 'responses'>>({
    defaultValues: {
      id: initialData?.id,
      project: initialData?.project || currentProject || '',
      method: initialData?.method || 'GET',
      path: initialData?.path || '',
    }
  });
  
  const handleSaveResponse = (index: number, response: MockResponse) => {
    console.log("save")
    const newResponses = [...responses];
    newResponses[index] = response;
    setResponses(newResponses);
  };
  
  const handleAddResponse = () => {
    setResponses([...responses, {
      request: {},
      responseHeader: {},
      response: { message: "Success" },
      statusCode: 200,
      delay: 0
    }]);
  };
  
  const handleDeleteResponse = (index: number) => {
    if (responses.length <= 1) {
      toast.error('Cannot delete the only response');
      return;
    }
    
    const newResponses = [...responses];
    newResponses.splice(index, 1);
    setResponses(newResponses);
  };
  
  const onSubmit = async (data: Omit<MockEndpoint, 'responses'>) => {
    if (responses.length === 0) {
      toast.error('At least one response is required');
      return;
    }
    
    const endpoint: MockEndpoint = {
      ...data,
      responses
    };
    
    try {
      if (isEditing && initialData?.id) {
        // For editing, we need to update the endpoint
        // This is a simplification - in a real app, you'd have a dedicated update endpoint
        const updatedEndpoint = await apiService.updateMock(endpoint, initialData?.id);
        updateMockEndpoint(updatedEndpoint);
        toast.success('Endpoint updated successfully');
      } else {
        // For creating a new endpoint
        const newEndpoint = await apiService.createMock(endpoint);
        addMockEndpoint(newEndpoint);
        toast.success('Endpoint created successfully');
      }
      
      navigate('/');
    } catch (error) {
      console.log(error)
      toast.error('Failed to save endpoint');
      console.error('Save error:', error);
    }
  };
  
  const methodOptions = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'DELETE', label: 'DELETE' }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Endpoint' : 'Create New Endpoint'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 mb-6">
            <Controller
              name="project"
              control={control}
              rules={{ required: 'Project is required' }}
              render={({ field }) => (
                <Input
                  label="Project"
                  placeholder="Project name"
                  error={errors.project?.message}
                  {...field}
                />
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="method"
                control={control}
                rules={{ required: 'Method is required' }}
                render={({ field }) => (
                  <Select
                    label="Method"
                    options={methodOptions}
                    error={errors.method?.message}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              
              <div className="md:col-span-2">
                <Controller
                  name="path"
                  control={control}
                  rules={{ required: 'Path is required' }}
                  render={({ field }) => (
                    <Input
                      label="Path"
                      placeholder="/api/users"
                      error={errors.path?.message}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Responses</h3>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleAddResponse}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Add Response
              </Button>
            </div>
            
            {responses.map((response, index) => (
              <div key={index} className="mb-4">
                <h4 className="text-sm font-medium mb-2">Response {index + 1}</h4>
                <ResponseForm
                  initialResponse={response}
                  onSave={(updatedResponse) => handleSaveResponse(index, updatedResponse)}
                  onDelete={() => handleDeleteResponse(index)}
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Endpoint' : 'Create Endpoint'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};