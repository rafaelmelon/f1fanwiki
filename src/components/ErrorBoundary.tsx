import { Component, type ErrorInfo, type ReactNode } from "react";

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

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-f1-text-muted">
            An unexpected error occurred while rendering this page.
          </p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            className="mt-6 rounded-lg border border-f1-border px-4 py-2 text-sm hover:border-f1-red/50 hover:text-f1-red transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
