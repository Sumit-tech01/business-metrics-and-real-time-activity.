import { Component } from 'react';
import { Button } from '../common/Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Surface runtime errors for production debugging.
    console.error('Unhandled application error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-100">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              An unexpected error occurred. Try reloading the dashboard.
            </p>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => window.location.reload()}>Reload App</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
