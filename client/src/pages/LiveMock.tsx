import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { ClientSetupModal } from '../components/ClientSetupModal';
import { RequestInterceptorModal } from '../components/RequestInterceptorModal';
import { Wifi, WifiOff, Plus, RefreshCw, Search } from 'lucide-react';
import { Input } from '../components/ui/Input';

export const LiveMock: React.FC = () => {
  const [isClientSetupOpen, setIsClientSetupOpen] = useState(false);
  const [isInterceptorOpen, setIsInterceptorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for development
  const requests = [
    { id: '1', method: 'GET', path: '/api/users', timestamp: Date.now(), status: 'pending' as const },
    { id: '2', method: 'POST', path: '/api/orders', timestamp: Date.now() - 5000, status: 'completed' as const },
  ];

  const getStatusIcon = (status: 'connected' | 'disconnected' | 'connecting') => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-blue-600 dark:text-blue-400';
      case 'POST':
        return 'text-green-600 dark:text-green-400';
      case 'PUT':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'DELETE':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Live Mock</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and modify API responses in real-time
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsClientSetupOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Client
          </Button>
          <Button
            variant="outline"
            onClick={() => {}}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Client</span>
            {getStatusIcon('connected')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Client ID: test-client-1</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected since: 2 minutes ago</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400">
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex justify-between items-center">
        <div className="w-64">
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="text-red-600">
            Clear All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {requests.map((request) => (
              <div
                key={request.id}
                className="py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => setIsInterceptorOpen(true)}
              >
                <div className="flex items-center space-x-4">
                  <span className={`font-mono font-medium ${getMethodColor(request.method)}`}>
                    {request.method}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">{request.path}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {new Date(request.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ClientSetupModal
        isOpen={isClientSetupOpen}
        onClose={() => setIsClientSetupOpen(false)}
      />

      <RequestInterceptorModal
        isOpen={isInterceptorOpen}
        onClose={() => setIsInterceptorOpen(false)}
      />
    </div>
  );
};