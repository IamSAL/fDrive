import React from 'react';
import { EndpointForm } from '../components/EndpointForm';

export const CreateEndpoint: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Create New Mock Endpoint</h1>
      <EndpointForm />
    </div>
  );
};