import { Component, type ErrorInfo, type ReactNode } from 'react';
import { track } from '../lib/analytics';

interface Props {
  /** What to show instead of the crashed subtree; gets a retry callback. */
  fallback: (retry: () => void) => ReactNode;
  where: string;
  children: ReactNode;
}

/** Keeps one broken answer (or the whole app) from leaving a blank screen. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    track('error', undefined, { where: this.props.where, message: error.message.slice(0, 200) });
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback(() => this.setState({ failed: false })) : this.props.children;
  }
}
