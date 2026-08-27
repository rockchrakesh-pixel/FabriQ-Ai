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

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
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
                onClick={this.handleTryAgain}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-[#9E7B4F] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Resume App Session</span>
              </button>

              <button
                onClick={this.handleReload}
                className="w-full py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Reload FabriQ Workspace</span>
              </button>

              <button
                onClick={this.handleResetState}
                className="w-full py-2.5 bg-slate-950 text-slate-400 hover:text-slate-200 rounded-xl text-[11px] font-medium border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                <span>Reset Cache & Restore Default View</span>
              </button>

              <div className="pt-2">
                <span className="text-[11px] text-amber-300 font-medium">
                  Official Support: 1800-202-0000 (24x7 Valet Concierge)
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
