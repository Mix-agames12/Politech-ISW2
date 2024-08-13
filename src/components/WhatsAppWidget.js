// src/WhatsAppWidget.js
import { useEffect } from 'react';

const WhatsAppWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://w.app/widget-v1/qIkiZP.js';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default WhatsAppWidget;
