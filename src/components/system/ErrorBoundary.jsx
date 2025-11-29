import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { createPageUrl } from "@/utils";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Optional: Send to error reporting service
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = createPageUrl('Dashboard');
  };

  render() {
    if (this.state.hasError) {
      // Check if we're in development mode (simple check for dev environment)
      const isDevelopment = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('preview'));
      
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 bg-[#0a0a0a]">
          <Card className="max-w-2xl w-full bg-[#111111] border-[#262626]">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#ef4444]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-[#ef4444]" />
              </div>
              <CardTitle className="text-white text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-[#a3a3a3] mb-4">
                  We encountered an unexpected error. Our team has been notified.
                </p>
                
                {isDevelopment && this.state.error && (
                  <div className="mt-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#262626]">
                    <h4 className="text-sm font-semibold text-[#ef4444] mb-2">Error Details (Development Only):</h4>
                    <pre className="text-xs text-[#a3a3a3] whitespace-pre-wrap overflow-auto max-h-40">
                      {this.state.error?.toString() ?? 'Unknown error'}\n
                      {this.state.errorInfo?.componentStack ?? 'No component stack available.'}
                    </pre>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {this.state.retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
              
              {this.state.retryCount > 0 && (
                <p className="text-xs text-[#6b7280] text-center">
                  Retry attempts: {this.state.retryCount}/3
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}