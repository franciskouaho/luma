"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Types for Web Vitals metrics
export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  timestamp: number;
}

export interface PerformanceMetrics {
  // Core Web Vitals
  CLS?: WebVitalsMetric; // Cumulative Layout Shift
  FID?: WebVitalsMetric; // First Input Delay
  LCP?: WebVitalsMetric; // Largest Contentful Paint
  FCP?: WebVitalsMetric; // First Contentful Paint
  TTFB?: WebVitalsMetric; // Time to First Byte
  INP?: WebVitalsMetric; // Interaction to Next Paint

  // Custom metrics
  navigationTiming?: PerformanceNavigationTiming;
  resourceTimings?: PerformanceResourceTiming[];
  memoryUsage?: any;
  connectionInfo?: any;
}

export interface PerformanceConfig {
  enableWebVitals?: boolean;
  enableResourceTiming?: boolean;
  enableMemoryMonitoring?: boolean;
  enableNetworkInfo?: boolean;
  reportInterval?: number; // in milliseconds
  maxResourceEntries?: number;
  onMetricCapture?: (metric: WebVitalsMetric) => void;
  onPerformanceReport?: (metrics: PerformanceMetrics) => void;
}

// Thresholds for Web Vitals ratings
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

// Helper function to determine rating
const getRating = (
  name: string,
  value: number,
): "good" | "needs-improvement" | "poor" => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
};

// Helper function to format metrics for reporting
const formatMetric = (
  name: string,
  value: number,
  delta: number = 0,
  id: string = "",
): WebVitalsMetric => ({
  name,
  value,
  rating: getRating(name, value),
  delta,
  id,
  timestamp: Date.now(),
});

export function usePerformanceMonitor(config: PerformanceConfig = {}) {
  const {
    enableWebVitals = true,
    enableResourceTiming = true,
    enableMemoryMonitoring = true,
    enableNetworkInfo = true,
    reportInterval = 30000, // 30 seconds
    maxResourceEntries = 50,
    onMetricCapture,
    onPerformanceReport,
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isSupported, setIsSupported] = useState(false);
  const reportTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observersRef = useRef<PerformanceObserver[]>([]);

  // Check browser support
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "performance" in window &&
      "PerformanceObserver" in window;
    setIsSupported(supported);
  }, []);

  // Web Vitals observer
  const initWebVitalsObserver = useCallback(() => {
    if (!enableWebVitals || !isSupported) return;

    try {
      // Observer for LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          const metric = formatMetric(
            "LCP",
            lastEntry.startTime,
            0,
            lastEntry.id,
          );
          setMetrics((prev) => ({ ...prev, LCP: metric }));
          onMetricCapture?.(metric);
        }
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      observersRef.current.push(lcpObserver);

      // Observer for FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const metric = formatMetric(
            "FID",
            entry.processingStart - entry.startTime,
            0,
            entry.name,
          );
          setMetrics((prev) => ({ ...prev, FID: metric }));
          onMetricCapture?.(metric);
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
      observersRef.current.push(fidObserver);

      // Observer for CLS (Cumulative Layout Shift)
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            const metric = formatMetric("CLS", entry.value, 0, entry.id);
            setMetrics((prev) => ({ ...prev, CLS: metric }));
            onMetricCapture?.(metric);
          }
        });
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
      observersRef.current.push(clsObserver);
    } catch (error) {
      console.warn("Web Vitals observer setup failed:", error);
    }
  }, [enableWebVitals, isSupported, onMetricCapture]);

  // Resource timing observer
  const initResourceTimingObserver = useCallback(() => {
    if (!enableResourceTiming || !isSupported) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        setMetrics((prev) => ({
          ...prev,
          resourceTimings: entries.slice(-maxResourceEntries),
        }));
      });
      resourceObserver.observe({ entryTypes: ["resource"] });
      observersRef.current.push(resourceObserver);
    } catch (error) {
      console.warn("Resource timing observer setup failed:", error);
    }
  }, [enableResourceTiming, isSupported, maxResourceEntries]);

  // Memory and network info collection
  const collectSystemMetrics = useCallback(() => {
    const newMetrics: Partial<PerformanceMetrics> = {};

    // Navigation timing
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType(
        "navigation",
      ) as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        newMetrics.navigationTiming = navigationEntries[0];
      }
    }

    // Memory usage (Chrome only)
    if (enableMemoryMonitoring && "memory" in performance) {
      newMetrics.memoryUsage = (performance as any).memory;
    }

    // Network connection info
    if (enableNetworkInfo && "connection" in navigator) {
      newMetrics.connectionInfo = (navigator as any).connection;
    }

    setMetrics((prev) => ({ ...prev, ...newMetrics }));
  }, [enableMemoryMonitoring, enableNetworkInfo]);

  // Initialize observers
  useEffect(() => {
    if (!isSupported) return;

    initWebVitalsObserver();
    initResourceTimingObserver();
    collectSystemMetrics();

    // Set up periodic reporting
    if (reportInterval > 0) {
      reportTimerRef.current = setInterval(() => {
        collectSystemMetrics();
        onPerformanceReport?.(metrics);
      }, reportInterval);
    }

    return () => {
      // Cleanup observers
      observersRef.current.forEach((observer) => {
        try {
          observer.disconnect();
        } catch (error) {
          console.warn("Error disconnecting observer:", error);
        }
      });
      observersRef.current = [];

      // Cleanup timer
      if (reportTimerRef.current) {
        clearInterval(reportTimerRef.current);
      }
    };
  }, [
    isSupported,
    initWebVitalsObserver,
    initResourceTimingObserver,
    collectSystemMetrics,
    reportInterval,
    onPerformanceReport,
    metrics,
  ]);

  // Manual metric collection
  const captureMetrics = useCallback(() => {
    collectSystemMetrics();
    return metrics;
  }, [collectSystemMetrics, metrics]);

  // Get performance score based on Core Web Vitals
  const getPerformanceScore = useCallback(() => {
    const vitals = [metrics.CLS, metrics.FID, metrics.LCP].filter(Boolean);
    if (vitals.length === 0) return null;

    const scores = vitals.map((vital) => {
      switch (vital!.rating) {
        case "good":
          return 100;
        case "needs-improvement":
          return 50;
        case "poor":
          return 0;
        default:
          return 0;
      }
    });

    return Math.round(
      scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
    );
  }, [metrics]);

  return {
    metrics,
    isSupported,
    captureMetrics,
    getPerformanceScore,
  };
}
