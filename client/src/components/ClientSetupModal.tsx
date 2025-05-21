import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Tabs } from './ui/Tabs';
import { Copy, Check, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/store';

interface ClientSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientSetupModal: React.FC<ClientSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const clients = useAppStore((s) => s.clients);
  const addClient = useAppStore((s) => s.addClient);
  const removeClient = useAppStore((s) => s.removeClient);
  const regeneratePin = useAppStore((s) => s.regeneratePin);
  const setActiveClient = useAppStore((s) => s.setActiveClient);
  const activeClientId = useAppStore((s) => s.activeClient);

  // Show PIN for active client
  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0];
  const pin = activeClient?.pin || '';
  const pinExpiresAt = activeClient?.pinExpiresAt || 0;
  const pinExpired = Date.now() > pinExpiresAt;
  const [now, setNow] = useState(Date.now());
  React.useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);
  const timeLeft = Math.max(0, Math.floor((pinExpiresAt - now) / 1000));

  const handleCopyPin = async () => {
    if (!pin) return;
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      toast.success('PIN copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy PIN');
    }
  };

  const handleCreateClient = () => {
    if (!newClientName.trim()) {
      toast.error('Please enter a client name');
      return;
    }
    addClient({ name: newClientName });
    toast.success('Client created successfully');
    setNewClientName('');
  };

  const handleDeleteClient = (id: string) => {
    removeClient(id);
    toast.success('Client deleted');
  };

  const handleRegeneratePin = () => {
    if (activeClient) {
      regeneratePin(activeClient.id);
      toast.success('PIN regenerated');
    }
  };

  const handleSelectClient = (id: string) => {
    setActiveClient(id);
    toast.success('Client selected');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Client Setup</DialogTitle>
        </DialogHeader>

        <Tabs
          items={[{
            id: 'pin',
            label: 'Quick Connect (PIN)',
            content: (
              <div className="space-y-4 py-4">
                <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-3xl font-mono font-bold mb-4">{pin || '------'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {pinExpired ? 'PIN expired' : `This PIN will expire in ${Math.floor(timeLeft/60)}:${('0'+(timeLeft%60)).slice(-2)}`}
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Button onClick={handleCopyPin} leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} disabled={!pin || pinExpired}>
                      {copied ? 'Copied!' : 'Copy PIN'}
                    </Button>
                    <Button onClick={handleRegeneratePin} variant="outline" disabled={!activeClient}>Regenerate PIN</Button>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How to use</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li>Copy the PIN shown above</li>
                    <li>Add the following header to your API requests:</li>
                    <code className="block bg-blue-100 dark:bg-blue-800 p-2 rounded mt-1 font-mono text-sm">
                      X-Mocker-Pin: {pin || '------'}
                    </code>
                    <li>Your requests will now be intercepted by Mocker</li>
                  </ol>
                </div>
              </div>
            ),
          }, {
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
                  <Button onClick={handleCreateClient} leftIcon={<Plus className="w-4 h-4" />}>Create</Button>
                </div>
                <div className="space-y-2">
                  {clients.map((client) => (
                    <Card key={client.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">ID: {client.id}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Created {new Date(client.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => {navigator.clipboard.writeText(client.id); toast.success('Copied!')}} leftIcon={<Copy className="w-4 h-4" />}>Copy ID</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteClient(client.id)} className="text-red-600 dark:text-red-400" leftIcon={<Trash2 className="w-4 h-4" />}>Delete</Button>
                          <Button variant="outline" size="sm" onClick={() => handleSelectClient(client.id)} disabled={activeClientId === client.id}>Select</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          }]}
          defaultTabId="pin"
        />
      </DialogContent>
    </Dialog>
  );
}