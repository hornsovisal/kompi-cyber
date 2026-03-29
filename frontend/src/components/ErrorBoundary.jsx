import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI crash captured:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = "#/";
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-2xl border border-red-900/40 bg-slate-900 p-8 text-center shadow-2xl">
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-slate-300 mb-6">
              The page crashed. Use the button below to return to the role chooser.
            </p>
            <button
              onClick={this.handleReset}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
            >
              Return to login chooser
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}