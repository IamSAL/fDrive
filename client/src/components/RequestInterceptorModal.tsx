import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent } from './ui/Card';
import { Tabs } from './ui/Tabs';
import { JsonEditor } from './JsonEditor';
import { Clock, Save, Play, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface RequestInterceptorModalProps {
  isOpen: boolean;
  onClose: () => void;
  interceptedRequest?: any;
  onContinue?: (reqId: string, response: any) => void;
}

export const RequestInterceptorModal: React.FC<RequestInterceptorModalProps> = ({
  isOpen,
  onClose,
  interceptedRequest,
  onContinue,
}) => {
  // Use interceptedRequest if provided, else fallback to mock
  const request = interceptedRequest?.request || {
    id: '123',
    method: 'POST',
    path: '/api/users',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token123',
    },
    body: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  };
  const [responseJson, setResponseJson] = useState('');
  const [responseDelay, setResponseDelay] = useState('0');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setResponseJson(
      JSON.stringify(interceptedRequest?.defaultResponse?.body || { message: 'Success' }, null, 2)
    );
    setResponseDelay(interceptedRequest?.defaultResponse?.delay?.toString() || '0');
  }, [interceptedRequest, isOpen]);

  const handleContinue = async () => {
    try {
      const parsed = JSON.parse(responseJson);
      if (onContinue && interceptedRequest?.reqId) {
        onContinue(interceptedRequest.reqId, {
          statusCode: interceptedRequest?.defaultResponse?.statusCode || 200,
          headers: interceptedRequest?.defaultResponse?.headers || {},
          body: parsed,
          delay: Number(responseDelay) || 0,
        });
      }
      toast.success('Response sent successfully');
      onClose();
    } catch (error) {
      toast.error('Invalid JSON response');
    }
  };

  const handleSaveAsMock = async () => {
    try {
      setIsSaving(true);
      // Save logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Saved as mock endpoint');
    } catch (error) {
      toast.error('Failed to save mock');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh]">
        <DialogHeader>
          <DialogTitle>Intercept Request</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
          {/* Request Details */}
          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-4">Request Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Method & Path
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="font-mono text-blue-600 dark:text-blue-400">{request.method}</span>
                      <span className="text-gray-600 dark:text-gray-400">{request.path}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Headers
                    </label>
                    <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm font-mono overflow-x-auto">
                      {JSON.stringify(request.headers, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Body
                    </label>
                    <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm font-mono overflow-x-auto">
                      {JSON.stringify(request.body, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Response Editor */}
          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-4">Response</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={responseDelay}
                      onChange={(e) => setResponseDelay(e.target.value)}
                      placeholder="Delay (ms)"
                      leftIcon={<Clock className="w-4 h-4" />}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Response Body
                    </label>
                    <div className="mt-1 border rounded-md">
                      <JsonEditor
                        value={responseJson}
                        onChange={setResponseJson}
                        height="300px"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleSaveAsMock}
                leftIcon={<Save className="w-4 h-4" />}
                isLoading={isSaving}
              >
                Save as Mock
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleContinue}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};