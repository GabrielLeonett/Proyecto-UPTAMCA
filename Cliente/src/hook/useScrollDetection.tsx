import { useEffect } from 'react';

export const useScrollDetection = (callback: () => void, threshold: number = 100) => {
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop } = document.documentElement;

      if (scrollTop > threshold) {
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, threshold]);
};