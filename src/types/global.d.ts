interface Window {
  wx: {
    config: (config: any) => void;
    ready: (callback: () => void) => void;
    error: (callback: (res: any) => void) => void;
  };
}
