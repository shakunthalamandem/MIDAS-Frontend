import React, { Component } from "react";
import DashboardStateCard from "./DashboardStateCard";

interface Props {
  tabLabel: string;
  ticker?: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class TabErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || "An unexpected error occurred",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[${this.props.tabLabel}] Render error:`, error, info);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when tab or ticker changes
    if (
      prevProps.tabLabel !== this.props.tabLabel ||
      prevProps.ticker !== this.props.ticker
    ) {
      if (this.state.hasError) {
        this.setState({ hasError: false, errorMessage: "" });
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <DashboardStateCard
          variant="error"
          title={`${this.props.tabLabel} failed to load`}
          message={this.state.errorMessage}
          context={
            this.props.ticker
              ? [{ label: "Ticker", value: this.props.ticker }]
              : undefined
          }
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default TabErrorBoundary;
