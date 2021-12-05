interface Window {
  heap: HeapAnalytics;
}

interface HeapAnalytics {
  readonly identity?: string;
  track: (event: string, properties?: Record<string, any>) => void;
  identify: (identity: string) => void;
  resetIdentity: () => void;
  addUserProperties: (properties: Record<string, any>) => void;
  addEventProperties: (properties: Record<string, any>) => void;
  removeEventProperty: (property: string) => void;
  clearEventProperties: () => void;
}
