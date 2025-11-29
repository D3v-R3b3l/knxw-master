import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { createPageUrl } from "@/utils";

/**
 * Global Error Boundary
 * Catches unhandled errors at the application root level
 * Provides graceful degradation and error reporting
 */
export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Log to external error tracking service if available
    if (typeof window !== 'undefined') {
      try {
        // Send to backend error logging
        fetch('/functions/logError', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: {
              message: error?.message,
              stack: error?.stack,
              componentStack: errorInfo?.componentStack
            },
            errorId: this.state.errorId,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error);
      } catch (loggingError) {
        console.error('Failed to log error:', loggingError);
      }
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname.includes('preview') ||
         window.location.hostname.includes('127.0.0.1'));
      
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a]">
          <Card className="max-w-2xl w-full bg-[#111111] border-[#262626]">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#ef4444]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-[#ef4444]" />
              </div>
              <CardTitle className="text-white text-2xl">Application Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-[#a3a3a3] mb-2">
                  We encountered an unexpected error. Our team has been automatically notified.
                </p>
                {this.state.errorId && (
                  <p className="text-xs text-[#6b7280] font-mono">
                    Error ID: {this.state.errorId}
                  </p>
                )}
                
                {isDevelopment && this.state.error && (
                  <div className="mt-6 p-4 bg-[#0a0a0a] rounded-lg border border-[#262626] text-left">
                    <h4 className="text-sm font-semibold text-[#ef4444] mb-2">
                      Development Mode - Error Details:
                    </h4>
                    <div className="text-xs text-[#a3a3a3] space-y-2">
                      <div>
                        <strong className="text-white">Message:</strong>
                        <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-20 bg-[#111111] p-2 rounded">
                          {this.state.error?.message || 'Unknown error'}
                        </pre>
                      </div>
                      <div>
                        <strong className="text-white">Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-32 bg-[#111111] p-2 rounded text-[10px]">
                          {this.state.error?.stack || 'No stack trace available'}
                        </pre>
                      </div>
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <strong className="text-white">Component Stack:</strong>
                          <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-32 bg-[#111111] p-2 rounded text-[10px]">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {this.state.retryCount >= 3 ? 'Max Retries Reached' : `Try Again${this.state.retryCount > 0 ? ` (${this.state.retryCount}/3)` : ''}`}
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
              
              <div className="text-center pt-4 border-t border-[#262626]">
                <p className="text-xs text-[#6b7280]">
                  If this problem persists, please contact{' '}
                  <a href="mailto:support@knxw.app" className="text-[#00d4ff] hover:underline">
                    support@knxw.app
                  </a>
                  {this.state.errorId && ` with error ID: ${this.state.errorId}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}