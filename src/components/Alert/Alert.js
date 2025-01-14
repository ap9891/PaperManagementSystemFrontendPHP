import React, { useState, useEffect } from 'react';
import './Alert.css'

const Alert = ({ 
  type = 'info', 
  message, 
  duration = 10000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const alertStyles = {
    success: {
      background: '#dff0d8',
      color: '#3c763d',
      borderColor: '#d6e9c6',
      icon: '✅'
    },
    error: {
      background: '#f2dede',
      color: '#a94442',
      borderColor: '#ebccd1',
      icon: '❌'
    },
    warning: {
      background: '#fcf8e3',
      color: '#8a6d3b',
      borderColor: '#faebcc',
      icon: '⚠️'
    },
    info: {
      background: '#d9edf7',
      color: '#31708f',
      borderColor: '#bce8f1',
      icon: 'ℹ️'
    }
  };

  const currentStyle = alertStyles[type] || alertStyles.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px',
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '90%',
        backgroundColor: currentStyle.background,
        color: currentStyle.color,
        border: `1px solid ${currentStyle.borderColor}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
        <span 
          style={{ 
            marginRight: '10px', 
            fontSize: '20px' 
          }}
        >
          {currentStyle.icon}
        </span>
        <p style={{ margin: 0, fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {message}
        </p>
      </div>
      <button className="button-alert"
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        style={{
          marginLeft: '15px',
          background: 'none',
          border: 'none',
          color: currentStyle.color,
          cursor: 'pointer',
          fontSize: '20px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Alert;

