import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <h1 className="font-heading text-4xl">Something went wrong</h1>
          <p className="mt-3 text-text-secondary">An unexpected error occurred while rendering this page.</p>
          <button
            onClick={this.handleReset}
            className="mt-8 rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Back home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
