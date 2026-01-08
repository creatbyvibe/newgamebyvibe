import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorHandler } from '@/lib/errorHandler';
import { createAppError, ErrorCode } from '@/lib/errorTypes';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 全局错误边界组件
 * 捕获 React 组件树中的 JavaScript 错误
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误
    const appError = createAppError(
      ErrorCode.UNKNOWN_ERROR,
      error.message,
      {
        componentStack: errorInfo.componentStack,
        errorStack: error.stack,
      }
    );

    ErrorHandler.logError(appError, 'ErrorBoundary');

    this.setState({
      error,
      errorInfo,
    });

    // 调用自定义错误处理
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 使用自定义 fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-surface border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h1 className="text-xl font-bold text-text-primary">
                出错了
              </h1>
            </div>

            <p className="text-text-muted">
              {ErrorHandler.getUserMessage(this.state.error)}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-text-dim mb-2">
                  错误详情（仅开发环境显示）
                </summary>
                <pre className="text-xs bg-black/50 p-3 rounded overflow-auto max-h-48 text-text-dim">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="default"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
