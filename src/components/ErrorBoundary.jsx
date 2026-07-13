import React, { Component } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-4 max-w-md mx-auto my-12 shadow-lg">
          <div className="w-12 h-12 bg-red-50 dark:bg-neutral-950 text-red-650 flex items-center justify-center rounded-full mx-auto border border-red-200">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
          </div>
          <h2 className="text-base font-black text-neutral-850 dark:text-white uppercase tracking-tight">
            Component Error Encountered
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed font-mono">
            {this.state.error?.message || "An unexpected rendering error occurred inside this module."}
          </p>
          <button
            onClick={this.handleReset}
            className="w-full py-3 bg-[#121212] dark:bg-white text-white dark:text-black rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm hover:opacity-90"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Command Module</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
