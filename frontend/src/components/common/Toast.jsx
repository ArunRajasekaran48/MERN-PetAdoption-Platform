import React, { useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} ${textColor} border ${borderColor} px-4 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
        {type === 'success' && <CheckCircle className="text-green-600" size={20} />}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast; 