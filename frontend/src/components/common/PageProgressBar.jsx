import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function PageProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reset to top of page on route change
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Start progress
    setVisible(true);
    setProgress(25);

    const timer1 = setTimeout(() => {
      setProgress(65);
    }, 80);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 220);

    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div className="page-progress-bar-container">
      <div 
        className="page-progress-bar pulse"
        style={{ 
          width: `${progress}%`,
          opacity: visible ? 1 : 0
        }}
      />
    </div>
  );
}
