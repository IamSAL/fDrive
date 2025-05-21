import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { SwaggerDefinition } from '../types/swagger';
import toast from 'react-hot-toast';

interface SwaggerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (swagger: SwaggerDefinition) => Promise<void>;
}

export const SwaggerImportModal: React.FC<SwaggerImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setIsLoading(true);
      const content = await file.text();
      const swagger = JSON.parse(content) as SwaggerDefinition;
      
      if (!swagger.openapi && !swagger.swagger) {
        throw new Error('Invalid Swagger/OpenAPI specification');
      }
      
      await onImport(swagger);
      onClose();
      toast.success('Swagger file imported successfully');
    } catch (error) {
      console.error('Failed to import swagger:', error);
      toast.error('Failed to import swagger file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
                  <DialogTitle >Import Swagger</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Input
              type="file"
              accept=".json,.yaml,.yml"
              onChange={handleFileChange}
              label="Swagger File"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload a Swagger/OpenAPI specification file (JSON or YAML)
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} >
            Cancel
          </Button>
          <Button onClick={handleImport} isLoading={isLoading}>
            Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};