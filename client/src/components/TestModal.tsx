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
    label: `Response ${index + 1} (${response.statusCode})`
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
      <DialogContent className="sm:max-w-[90vw]  ">
        <DialogHeader className='dark:text-gray-100'>
          <DialogTitle >Test Endpoint: {endpoint.path}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
         

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              
              <Select
                label="Select Request"
                options={[
                  ...responseOptions,
                  // { value: 'custom', label: 'Custom Request' }
                ]}
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
            </div>

            {
              isCustomRequest ?<div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Request JSON:</label>
                <JsonEditor
                  value={customRequest}
                  onChange={setCustomRequest}
                  height="100px"
                />
              </div> : <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Request JSON:</label>
                <JsonEditor
                    value={JSON.stringify(selectedResponse?.request, null, 2)}
                  onChange={setCustomRequest}
                  height="100px"
                />
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
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                     
                      <JsonEditor
                        value={JSON.stringify(testResult.headers, null, 2)}
                        onChange={() => {
                          
                        }}
                        height="220px"
                      />
                     
                    </pre>
                  </div>
                )}
                
                <div className="space-y-1">
                  <span className="text-sm font-medium">Body:</span>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                  

                    <JsonEditor
                      value={ JSON.stringify(testResult.data, null, 2) }
                      onChange={() => {

                      }}
                      height="450px"
                    />
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" className='dark:text-gray-100' onClick={onClose}>Cancel</Button>
          <Button onClick={handleTest}>Test Endpoint</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};