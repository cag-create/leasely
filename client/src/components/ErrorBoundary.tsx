import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // The component stack names the exact component that threw — the single
    // most useful thing for diagnosing a minified prod crash with no message.
    this.setState({ componentStack: info.componentStack ?? null });
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">An unexpected error occurred.</h2>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              {this.state.error?.message && (
                <p className="text-sm font-semibold text-destructive mb-2 whitespace-break-spaces">
                  {this.state.error.message}
                </p>
              )}
              <pre className="text-xs text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack || this.state.error?.toString() || "(no error message)"}
              </pre>
              {this.state.componentStack && (
                <pre className="text-[11px] text-muted-foreground/80 whitespace-break-spaces mt-2 pt-2 border-t border-border">
                  {this.state.componentStack.split("\n").slice(0, 6).join("\n")}
                </pre>
              )}
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
