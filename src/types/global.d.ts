import { HTMLMotionProps } from 'framer-motion';

interface Window {
  wx: {
    config: (config: any) => void;
    ready: (callback: () => void) => void;
    error: (callback: (res: any) => void) => void;
  };
}

declare module 'framer-motion' {
  export interface MotionProps extends HTMLMotionProps<"div"> {
    className?: string;
  }
}
