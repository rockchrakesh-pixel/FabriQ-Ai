import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }


  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FabriQ App ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetState = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col items-center justify-center p-6 font-['Manrope',sans-serif]">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
            {/* Top Amber Light Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            {/* FabriQ Monogram / Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-300 mx-auto mb-5 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[36px]">dry_cleaning</span>
            </div>

            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-block mb-3">
              FABRIQ RESILIENCE SYSTEM
            </span>

            <h1 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white mb-2">
              Temporary Garment Care Pause
            </h1>

            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
              An unexpected glitch was intercepted. Your active garments and profile data remain completely secure in our vault.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-left font-mono text-[10px] text-slate-400 overflow-x-auto max-h-24">
                <p className="text-red-400 font-bold mb-1">Error: {this.state.error.message}</p>
                {this.state.error.stack && <p className="opacity-60">{this.state.error.stack.slice(0, 150)}...</p>}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-[#9E7B4F] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Reload FabriQ Workspace</span>
              </button>

              <button
                onClick={this.handleResetState}
                className="w-full py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset Cache & Restore Default View</span>
              </button>

              <a
                href="https://wa.me/?text=Hello%20FabriQ%20Support,%20I%20experienced%20an%20issue%20in%20the%20app."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[11px] text-amber-300 hover:underline pt-2 font-medium"
              >
                Need immediate help? Contact Official Support Hotline (1800-202-0000)
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
