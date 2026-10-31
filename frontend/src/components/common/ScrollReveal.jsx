import React, { useEffect, useRef, useState } from 'react';

export function ScrollReveal({ 
  children, 
  variant = 'slide', // 'slide' | 'scale' | 'fade'
  delay = 0, 
  threshold = 0.12,
  className = '',
  style = {} 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold,
      rootMargin: '0px 0px -40px 0px'
    });

    const currentElem = domRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, [threshold]);

  let variantClass = '';
  if (variant === 'scale') variantClass = 'scale-reveal';
  if (variant === 'fade') variantClass = 'fade-only';

  const delayStyle = delay ? { transitionDelay: `${delay}ms` } : {};

  return (
    <div
      ref={domRef}
      className={`scroll-reveal ${variantClass} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ ...style, ...delayStyle }}
    >
      {children}
    </div>
  );
}
