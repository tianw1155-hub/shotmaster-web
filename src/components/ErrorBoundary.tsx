import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="bg-white rounded-md p-6 max-w-md w-full text-center shadow-lg">
            <h2 className="text-xl font-bold text-ink mb-4">出错了</h2>
            <p className="text-ink-secondary mb-4">{this.state.error?.message || '未知错误'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-accent text-surface rounded-md font-semibold"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
