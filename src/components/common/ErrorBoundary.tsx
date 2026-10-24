// ==============================================================================
// BrightPath CRM — ErrorBoundary Component
// Catches uncaught UI exceptions, displays actionable fallback, allows safe reset
// ==============================================================================

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronRight } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error caught by BrightPath ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'var(--slate-50)',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '36px 32px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xl)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)',
              backgroundColor: '#ffffff',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fff1f2',
                border: '2px solid #fecdd3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#e11d48',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h1
              style={{
                fontSize: '1.375rem',
                fontWeight: 700,
                color: 'var(--slate-900)',
                marginBottom: '8px',
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--slate-600)',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              BrightPath CRM encountered an unexpected client error. Your data in
              Supabase remains intact. Try resetting the current view or reloading the page.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '20px',
              }}
            >
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{ gap: '8px' }}
              >
                <RefreshCw size={15} />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-secondary"
                style={{ gap: '8px' }}
              >
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn btn-secondary"
                style={{ gap: '8px' }}
              >
                <Home size={15} />
                <span>Dashboard</span>
              </button>
            </div>

            {/* Collapsible Error Technical Diagnostics */}
            {this.state.error && (
              <div
                style={{
                  marginTop: '16px',
                  textAlign: 'left',
                  borderTop: '1px solid var(--slate-100)',
                  paddingTop: '16px',
                }}
              >
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 0',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--slate-500)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {this.state.showDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span>Technical Diagnostics</span>
                </button>

                {this.state.showDetails && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '12px',
                      backgroundColor: 'var(--slate-900)',
                      color: '#f87171',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      overflowX: 'auto',
                      maxHeight: '180px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    <p style={{ fontWeight: 700, color: '#fca5a5', marginBottom: '6px' }}>
                      {this.state.error.name}: {this.state.error.message}
                    </p>
                    {this.state.errorInfo?.componentStack}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
