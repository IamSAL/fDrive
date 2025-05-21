import { useState, useEffect } from 'react';
import { JsonEditor } from './JsonEditor';

// This component preloads Monaco in the background on first page load
export const MonacoPreload = () => {
    const [load, setLoad] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setLoad(true)
       }, 1500);
    
      return () => {
        
      }
    }, [])
    
    return <div className='opacity-0 h-0 absolute'>
      
        {load && <JsonEditor
            value={"{}"}
            onChange={() => { }}
            height="200px"
        />}
  </div>
};
