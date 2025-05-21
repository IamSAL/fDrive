import React from 'react';
import MonacoEditor from '@monaco-editor/react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  readOnly?: boolean;
  className?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  height = '200px',
  readOnly = false,
  className,
}) => {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const handleValidation = (markers: any[]) => {
    // Can be used to show validation errors outside the editor
    console.log('Validation markers:', markers);
  };

  return (
    <div className={className}>
      <MonacoEditor
        
        height={height}
        language="json"
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{
          
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly,
          folding: true,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          scrollbar: {
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
        onValidate={handleValidation}
      />
    </div>
  );
};