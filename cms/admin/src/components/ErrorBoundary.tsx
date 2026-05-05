import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pastel-rose/8 flex items-center justify-center ring-1 ring-pastel-rose/15">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-xl font-semibold text-warm-charcoal mb-2">页面出错了</h2>
            <p className="text-sm text-warm-charcoal-muted mb-6">
              {this.state.error.message || '发生了意外错误，请刷新页面重试。'}
            </p>
            <button
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-pastel-blue text-white rounded-lg text-sm font-medium hover:shadow-paper-md transition-all duration-paper shadow-paper-xs"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
