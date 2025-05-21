import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { MockResponse } from '../types/dto';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { JsonEditor } from './JsonEditor';
import { Tabs } from './ui/Tabs';
import { Trash2, RotateCcw } from 'lucide-react';

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
  
  const { control, formState: { errors }, watch, setValue } = useForm<MockResponse>({
    defaultValues: defaultResponse
  });

  // Keep a ref to the original for reset/dirty check
  const originalRef = useRef({
    request: JSON.stringify(defaultResponse.request || {}, null, 2),
    responseHeader: JSON.stringify(defaultResponse.responseHeader || {}, null, 2),
    response: JSON.stringify(defaultResponse.response || {}, null, 2),
    statusCode: defaultResponse.statusCode,
    delay: defaultResponse.delay
  });

  const [requestJson, setRequestJson] = useState(originalRef.current.request);
  const [responseHeaderJson, setResponseHeaderJson] = useState(originalRef.current.responseHeader);
  const [responseJson, setResponseJson] = useState(originalRef.current.response);

  // Watch for statusCode and delay changes
  const statusCode = watch('statusCode');
  const delay = watch('delay');

  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  // Check if any field is dirty compared to original
  const isDirty =
    requestJson !== originalRef.current.request ||
    responseHeaderJson !== originalRef.current.responseHeader ||
    responseJson !== originalRef.current.response ||
    statusCode !== originalRef.current.statusCode ||
    delay !== originalRef.current.delay;

  // Auto-save when valid and dirty
  useEffect(() => {
    if (
      validateJson(requestJson) &&
      validateJson(responseHeaderJson) &&
      validateJson(responseJson) &&
      isDirty
    ) {
      const formattedResponse: MockResponse = {
        request: requestJson ? JSON.parse(requestJson) : {},
        responseHeader: responseHeaderJson ? JSON.parse(responseHeaderJson) : {},
        response: responseJson ? JSON.parse(responseJson) : {},
        statusCode,
        delay
      };
      onSave(formattedResponse);
      // Update originalRef to new value after save
      originalRef.current = {
        request: requestJson,
        responseHeader: responseHeaderJson,
        response: responseJson,
        statusCode,
        delay
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestJson, responseHeaderJson, responseJson, statusCode, delay]);

  // Reset handler
  const handleReset = () => {
    setRequestJson(originalRef.current.request);
    setResponseHeaderJson(originalRef.current.responseHeader);
    setResponseJson(originalRef.current.response);
    setValue('statusCode', originalRef.current.statusCode);
    setValue('delay', originalRef.current.delay);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={e => e.preventDefault()}>
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
                  onChange={e => field.onChange(parseInt(e.target.value, 10))}
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
                  onChange={e => field.onChange(parseInt(e.target.value, 10))}
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
            <div className="flex space-x-2 items-center">
              {isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  title="Reset to original"
                  className="p-2"
                >
                  <RotateCcw className="w-5 h-5 text-gray-400" />
                </Button>
              )}
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              {/* Save Response button removed, auto-save is now active */}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};