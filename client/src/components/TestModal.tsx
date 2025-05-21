import React, { useState } from 'react';
import { MockEndpoint, MockResponse } from '../types/dto';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from './ui/Dialog';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { JsonEditor } from './JsonEditor';

interface TestResult {
  status: number;
  headers: Record<string, string>;
  data: Record<string, unknown>;
}

interface TestModalProps {
  endpoint: MockEndpoint;
  isOpen: boolean;
  onClose: () => void;
  onTest: (request?: Record<string, unknown>) => Promise<void>;
  testResult?: TestResult;
}

export const TestModal: React.FC<TestModalProps> = ({
  endpoint,
  isOpen,
  onClose,
  onTest,
  testResult
}) => {
  const responseOptions = endpoint.responses.map((response, index) => ({
    value: index.toString(),
    label: response.name ? `${response.name} (${response.statusCode})` : `Response ${index + 1} (${response.statusCode})`,
    description: response.description
  }));
  const [selectedResponse, setSelectedResponse] = useState<MockResponse | null>(endpoint.responses[0] ||  null);
  const [customRequest, setCustomRequest] = useState('');
  const [isCustomRequest, setIsCustomRequest] = useState(false);

  const handleTest = async () => {
    if (isCustomRequest) {
      try {
        const parsedRequest = JSON.parse(customRequest) as Record<string, unknown>;
        await onTest(parsedRequest);
      } catch (error) {
        console.error('Invalid JSON:', error);
      }
    } else if (selectedResponse) {
      await onTest(selectedResponse.request);
    } else {
      await onTest();
    }
  };

  

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="sm:max-w-[90vw] max-w-full w-full max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className='dark:text-gray-100 px-6 pt-6'>
          <DialogTitle >Test Endpoint: {endpoint.path}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Select
                label="Select Response"
                options={responseOptions}
                value={isCustomRequest ? 'custom' : selectedResponse ? responseOptions.find(opt =>
                  opt.value === endpoint.responses.indexOf(selectedResponse).toString()
                )?.value : ''}
                onChange={(value) => {
                  if (value === 'custom') {
                    setIsCustomRequest(true);
                    setSelectedResponse(null);
                  } else {
                    setIsCustomRequest(false);
                    const response = endpoint.responses[parseInt(value)];
                    setSelectedResponse(response);
                  }
                }}
              />
              {selectedResponse && (selectedResponse.name || selectedResponse.description) && (
                <div className="mt-2">
                  {selectedResponse.name && <div className="font-semibold text-sm">{selectedResponse.name}</div>}
                  {selectedResponse.description && <div className="text-xs text-gray-500 dark:text-gray-400">{selectedResponse.description}</div>}
                </div>
              )}
            </div>

            {
              isCustomRequest ?<div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Request JSON:</label>
                <div className="min-h-[100px] max-h-[200px] h-[20vh]">
                  <JsonEditor
                    value={customRequest}
                    onChange={setCustomRequest}
                    height="100px"
                  />
                </div>
              </div> : <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Request JSON:</label>
                <div className="min-h-[100px] max-h-[200px] h-[20vh]">
                  <JsonEditor
                      value={JSON.stringify(selectedResponse?.request, null, 2)}
                    onChange={setCustomRequest}
                    height="100px"
                  />
                </div>
              </div>
            }
          </div>
          {testResult && (
            <div className="space-y-2 mt-4 dark:text-gray-100">
              <h3 className="text-sm font-medium">Response:</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm text-blue-600">{testResult.status}</span>
                </div>
                
                {Object.keys(testResult.headers).length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Headers:</span>
                    <div className="min-h-[60px] max-h-[120px] h-[12vh]">
                      <JsonEditor
                        value={JSON.stringify(testResult.headers, null, 2)}
                        onChange={() => {
                          
                        }}
                        height="100px"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <span className="text-sm font-medium">Body:</span>
                  <div className="min-h-[120px] max-h-[300px] h-[28vh]">
                    <JsonEditor
                      value={ JSON.stringify(testResult.data, null, 2) }
                      onChange={() => {

                      }}
                      height="100px"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Button variant="outline" className='dark:text-gray-100' onClick={onClose}>Cancel</Button>
          <Button onClick={handleTest}>Test Endpoint</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};