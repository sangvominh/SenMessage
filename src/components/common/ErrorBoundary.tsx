import { Component, type ErrorInfo, type ReactNode } from "react";
import { vi } from "../../i18n/vi";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">😢</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{vi.errors.generic}</h2>
            {this.state.error && (
              <p className="text-sm text-gray-500 mb-4 break-all">{this.state.error.message}</p>
            )}
            <button
              onClick={this.handleRetry}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
            >
              {vi.analysis.retry}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
