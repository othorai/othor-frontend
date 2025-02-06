// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, you might want to log this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Log to your preferred error tracking service
      console.error('Uncaught error:', error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return process.env.NODE_ENV === 'production' ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">Something went wrong</h2>
            <p className="mt-2 text-gray-600">Please try again later</p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800">Development Error:</h2>
          <pre className="mt-2 text-sm text-red-700">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;