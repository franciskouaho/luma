"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => key !== prevProps.resetKeys?.[index]
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Log to external service (Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional onError callback
    this.props.onError?.(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Here you would integrate with your error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });

    // For now, we'll just log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReportIssue = () => {
    const { error, errorInfo } = this.state;
    const body = encodeURIComponent(
      `Erreur rencontrée:\n\n${error?.message}\n\nStack:\n${error?.stack}\n\nComponent Stack:\n${errorInfo?.componentStack}`
    );
    window.open(`mailto:support@lumapost.com?subject=Rapport d'erreur&body=${body}`);
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback component
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Oups ! Une erreur s'est produite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Nous sommes désolés, quelque chose s'est mal passé.
                L'équipe technique a été notifiée.
              </p>

              {process.env.NODE_ENV === "development" && error && (
                <details className="bg-gray-100 p-3 rounded-md">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Détails techniques (dev uniquement)
                  </summary>
                  <div className="text-xs text-gray-600 font-mono">
                    <div className="mb-2">
                      <strong>Message:</strong> {error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 overflow-auto">{error.stack}</pre>
                    </div>
                  </div>
                </details>
              )}

              <div className="flex flex-col space-y-2">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Réessayer
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                  icon={<Home className="w-4 h-4" />}
                >
                  Retour à l'accueil
                </Button>

                <Button
                  onClick={this.handleReportIssue}
                  variant="ghost"
                  className="w-full text-sm"
                >
                  Signaler le problème
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Si le problème persiste, contactez-nous à{" "}
                <a
                  href="mailto:support@lumapost.com"
                  className="text-purple-600 hover:underline"
                >
                  support@lumapost.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    console.error("Error caught by useErrorHandler:", error);

    // You can integrate with error reporting service here
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 useErrorHandler");
      console.error("Error:", error);
      if (errorInfo) {
        console.error("Error Info:", errorInfo);
      }
      console.groupEnd();
    }
  }, []);
}

// Higher-order component version
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;
