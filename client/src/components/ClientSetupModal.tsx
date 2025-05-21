import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Tabs } from './ui/Tabs';
import { Copy, Check, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface ClientSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Client {
  id: string;
  name: string;
  createdAt: number;
}

export const ClientSetupModal: React.FC<ClientSetupModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('pin');
  const [copied, setCopied] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  
  // Mock data
  const [clients] = useState<Client[]>([
    { id: 'client-1', name: 'Test Client 1', createdAt: Date.now() },
    { id: 'client-2', name: 'Production API', createdAt: Date.now() - 86400000 },
  ]);

  const handleCopyPin = async () => {
    const pin = '123456'; // This will be generated
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      toast.success('PIN copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy PIN');
    }
  };

  const handleCreateClient = () => {
    if (!newClientName.trim()) {
      toast.error('Please enter a client name');
      return;
    }
    // Add client logic here
    toast.success('Client created successfully');
    setNewClientName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Client Setup</DialogTitle>
        </DialogHeader>

        <Tabs
          items={[
            {
              id: 'pin',
              label: 'Quick Connect (PIN)',
              content: (
                <div className="space-y-4 py-4">
                  <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-3xl font-mono font-bold mb-4">123456</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      This PIN will expire in 5 minutes
                    </p>
                    <Button
                      onClick={handleCopyPin}
                      leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    >
                      {copied ? 'Copied!' : 'Copy PIN'}
                    </Button>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How to use</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <li>Copy the PIN shown above</li>
                      <li>Add the following header to your API requests:</li>
                      <code className="block bg-blue-100 dark:bg-blue-800 p-2 rounded mt-1 font-mono text-sm">
                        X-Mocker-Pin: 123456
                      </code>
                      <li>Your requests will now be intercepted by Mocker</li>
                    </ol>
                  </div>
                </div>
              ),
            },
            {
              id: 'clients',
              label: 'Saved Clients',
              content: (
                <div className="space-y-4 py-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter client name"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                    />
                    <Button onClick={handleCreateClient} leftIcon={<Plus className="w-4 h-4" />}>
                      Create
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {clients.map((client) => (
                      <Card key={client.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{client.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {client.id}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Created {new Date(client.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {}}
                              leftIcon={<Copy className="w-4 h-4" />}
                            >
                              Copy ID
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 dark:text-red-400"
                              onClick={() => {}}
                              leftIcon={<Trash2 className="w-4 h-4" />}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ),
            },
          ]}
          defaultTabId="pin"
          onTabChange={setActiveTab}
        />
      </DialogContent>
    </Dialog>
  );
};