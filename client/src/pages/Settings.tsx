import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/store';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Sun, Moon, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { baseUrl, setBaseUrl, theme, setTheme } = useAppStore();
  const [localBaseUrl, setLocalBaseUrl] = useState(baseUrl);
  
  useEffect(() => {
    setLocalBaseUrl(baseUrl);
  }, [baseUrl]);
  
  const handleSave = () => {
    try {
      // Validate URL
      new URL(localBaseUrl);
      setBaseUrl(localBaseUrl);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Please enter a valid URL');
    }
  };

  const themeOptions = [
    { 
      value: 'system', 
      label: (
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4" /> 
          System
        </div>
      ) 
    },
    { 
      value: 'light', 
      label: (
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4" /> 
          Light
        </div>
      ) 
    },
    { 
      value: 'dark', 
      label: (
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4" /> 
          Dark
        </div>
      ) 
    },
  ];
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Base URL"
                placeholder="http://localhost:3000"
                value={localBaseUrl}
                onChange={(e) => setLocalBaseUrl(e.target.value)}
              />
              
              <div className="pt-4">
                <Button onClick={handleSave}>Save Settings</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                label="Theme"
                value={theme}
                options={themeOptions}
                onChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose how Mocker looks to you. Select a theme preference or let Mocker match your system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
