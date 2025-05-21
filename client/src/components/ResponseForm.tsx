import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { MockResponse } from '../types/api';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { JsonEditor } from './JsonEditor';
import { Tabs } from './ui/Tabs';
import { Trash2 } from 'lucide-react';

interface ResponseFormProps {
  initialResponse?: MockResponse;
  onSave: (response: MockResponse) => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export const ResponseForm: React.FC<ResponseFormProps> = ({ 
  initialResponse, 
  onSave, 
  onCancel,
  onDelete
}) => {
  const defaultResponse: MockResponse = initialResponse || {
    request: {},
    responseHeader: {},
    response: {},
    statusCode: 200,
    delay: 0
  };
  
  const { control, handleSubmit, formState: { errors } } = useForm<MockResponse>({
    defaultValues: defaultResponse
  });
  
  const [requestJson, setRequestJson] = useState(JSON.stringify(defaultResponse.request || {}, null, 2));
  const [responseHeaderJson, setResponseHeaderJson] = useState(JSON.stringify(defaultResponse.responseHeader || {}, null, 2));
  const [responseJson, setResponseJson] = useState(JSON.stringify(defaultResponse.response || {}, null, 2));
  
  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const onSubmit = (data: MockResponse) => {
    try {
      const formattedResponse: MockResponse = {
        ...data,
        request: requestJson ? JSON.parse(requestJson) : {},
        responseHeader: responseHeaderJson ? JSON.parse(responseHeaderJson) : {},
        response: responseJson ? JSON.parse(responseJson) : {}
      };
      onSave(formattedResponse);
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Controller
              name="statusCode"
              control={control}
              rules={{ required: 'Status code is required' }}
              render={({ field }) => (
                <Input
                  label="Status Code"
                  type="number"
                  placeholder="200"
                  error={errors.statusCode?.message}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />
            
            <Controller
              name="delay"
              control={control}
              render={({ field }) => (
                <Input
                  label="Delay (ms)"
                  type="number"
                  placeholder="0"
                  error={errors.delay?.message}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />
          </div>
          
          <Tabs
            items={[
              {
                id: 'request',
                label: 'Request Body',
                content: (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Request JSON (optional)
                    </label>
                    <JsonEditor 
                      value={requestJson} 
                      onChange={setRequestJson}
                      height="200px"
                    />
                    {!validateJson(requestJson) && (
                      <p className="mt-1 text-xs text-red-500">Invalid JSON</p>
                    )}
                  </div>
                )
              },
              {
                id: 'headers',
                label: 'Response Headers',
                content: (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Response Headers (optional)
                    </label>
                    <JsonEditor 
                      value={responseHeaderJson} 
                      onChange={setResponseHeaderJson}
                      height="200px"
                    />
                    {!validateJson(responseHeaderJson) && (
                      <p className="mt-1 text-xs text-red-500">Invalid JSON</p>
                    )}
                  </div>
                )
              },
              {
                id: 'response',
                label: 'Response Body',
                content: (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Response JSON
                    </label>
                    <JsonEditor 
                      value={responseJson} 
                      onChange={setResponseJson}
                      height="200px"
                    />
                    {!validateJson(responseJson) && (
                      <p className="mt-1 text-xs text-red-500">Invalid JSON</p>
                    )}
                  </div>
                )
              }
            ]}
          />
          
          <div className="flex justify-between mt-4">
            <div>
              {onDelete && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={onDelete}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Delete Response
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button 
                type="button"
                // className='disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
                onClick={() => {

                  handleSubmit(onSubmit)()
                }}
                disabled={
                  !requestJson ||
                  !validateJson(requestJson) || 
                  !validateJson(responseHeaderJson) || 
                  !validateJson(responseJson)
                }
              >
                Save Response
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};