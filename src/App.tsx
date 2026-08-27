import React, { useState, useEffect } from 'react';
import { ScreenId, UserRole, getDefaultPortalForRole } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DivisionProvider, useDivision } from './context/DivisionContext';
import { BranchProvider } from './context/BranchContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { NotificationCenter } from './components/NotificationCenter';
import { DemoPersonaSwitcher } from './components/DemoPersonaSwitcher';
import { DivisionSelectorModal } from './components/DivisionSelectorModal';
import { AppOnboardingModal } from './components/AppOnboardingModal';
import { RbacGuard } from './components/RbacGuard';

// Screens
import { HomeDashboard } from './screens/HomeDashboard';
import { HomeDashboardWithFeedback } from './screens/HomeDashboardWithFeedback';
import { FabriQAiHomeDashboard } from './screens/FabriQAiHomeDashboard';
import { RoleLogin } from './screens/RoleLogin';
import { StoreManagerDashboard } from './screens/StoreManagerDashboard';
import { OwnerDashboard } from './screens/OwnerDashboard';
import { CEODashboard } from './screens/CEODashboard';
import { MISDashboard } from './screens/MISDashboard';
import { ServiceCatalog } from './screens/ServiceCatalog';
import { MyOrders } from './screens/MyOrders';
import { LiveOrderTracking } from './screens/LiveOrderTracking';
import { OrderTracking } from './screens/OrderTracking';
import { AccountManagement } from './screens/AccountManagement';
import { ServiceInsightsDashboard } from './screens/ServiceInsightsDashboard';
import { ConciergeSupportChat } from './screens/ConciergeSupportChat';
import { MembershipPlans } from './screens/MembershipPlans';
import { PaymentSuccess } from './screens/PaymentSuccess';
import { ServiceAddress } from './screens/ServiceAddress';
import { ConfirmServiceAddon } from './screens/ConfirmServiceAddon';
import { SelectPhoto } from './screens/SelectPhoto';
import { UpdateProfilePicture } from './screens/UpdateProfilePicture';
import { BoutiqueFitting } from './screens/BoutiqueFitting';
import { BespokeTailor } from './screens/BespokeTailor';
import { LuxuryApparelStore } from './screens/LuxuryApparelStore';
import { CartScreen } from './screens/CartScreen';
import { OrderReceipt } from './screens/OrderReceipt';
import { AIFabricAdvisor } from './screens/AIFabricAdvisor';
import { EnterpriseOperationsCenter } from './screens/EnterpriseOperationsCenter';
import { EnterpriseAnalyticsDashboard } from './screens/EnterpriseAnalyticsDashboard';

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App initialization/runtime exception caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[36px]">sync_problem</span>
          </div>
          <h2 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white mb-2">
            FabriQ AI Studio Recovered
          </h2>
          <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
            An internal session transition error occurred. Click below to safely reset session state and return to your active portal.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors cursor-pointer shadow-lg"
          >
            Reload FabriQ AI Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function MainContent() {
  const { currentRole } = useAuth();
  const { division } = useDivision();

  const getInitialScreen = (): ScreenId => {
    try {
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (hash) return hash;
      const savedRole = localStorage.getItem('fabriq_active_role') as UserRole;
      if (savedRole && savedRole !== 'customer') {
        return getDefaultPortalForRole(savedRole);
      }
    } catch {}
    return 'home';
  };

  const [currentScreen, setCurrentScreen] = useState<ScreenId>(getInitialScreen);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (hash) {
        setCurrentScreen(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.location.hash = screen;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getScreenTitle = (screen: ScreenId): string | undefined => {
    switch (screen) {
      case 'role-login':
        return 'Multi-Role Portals';
      case 'dashboard-customer':
      case 'home':
        return 'Customer Portal';
      case 'dashboard-store-manager':
        return 'Store Manager Portal';
      case 'dashboard-owner':
        return 'Store Owner Dashboard';
      case 'dashboard-ceo':
        return 'CEO Command Center';
      case 'dashboard-mis':
        return 'MIS Aggregated Portal';
      case 'service-catalog':
        return 'Care Menu';
      case 'cart':
        return 'FabriQ Cart';
      case 'boutique-fitting':
        return '3D Fitting Suite';
      case 'bespoke-tailor':
        return 'Book Master Tailor';
      case 'luxury-store':
        return 'FabriQ AI Cloth Store';
      case 'my-orders':
        return 'My Orders';
      case 'live-order-tracking':
        return 'Live Order Tracking';
      case 'order-tracking':
        return 'Order Status';
      case 'account':
        return 'Account & Profile';
      case 'service-insights':
        return 'Service Insights';
      case 'concierge-chat':
        return 'Concierge Support';
      case 'membership-plans':
        return 'Membership Plans';
      case 'service-address':
        return 'Service Address';
      case 'ai-fabric-advisor':
        return 'AI Fabric Advisor';
      case 'enterprise-analytics':
        return 'Enterprise Analytics';
      case 'operations-center':
        return 'Enterprise Operations Center';
      default:
        return undefined;
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'role-login':
        return <RoleLogin onNavigate={handleNavigate} />;
      case 'dashboard-customer':
      case 'home':
        if (currentRole !== 'customer') {
          const targetPortal = getDefaultPortalForRole(currentRole);
          if (targetPortal === 'dashboard-ceo') return <CEODashboard onNavigate={handleNavigate} />;
          if (targetPortal === 'dashboard-owner') return <OwnerDashboard onNavigate={handleNavigate} />;
          if (targetPortal === 'dashboard-store-manager') return <StoreManagerDashboard onNavigate={handleNavigate} />;
          if (targetPortal === 'dashboard-mis') return <MISDashboard onNavigate={handleNavigate} />;
        }
        if (division === 'boutique') return <BoutiqueFitting onNavigate={handleNavigate} />;
        if (division === 'luxury_store') return <LuxuryApparelStore onNavigate={handleNavigate} />;
        return <HomeDashboard onNavigate={handleNavigate} />;
      case 'dashboard-store-manager':
        return <StoreManagerDashboard onNavigate={handleNavigate} />;
      case 'dashboard-owner':
        return <OwnerDashboard onNavigate={handleNavigate} />;
      case 'dashboard-ceo':
        return <CEODashboard onNavigate={handleNavigate} />;
      case 'dashboard-mis':
        return <MISDashboard onNavigate={handleNavigate} />;
      case 'home-feedback':
        return <HomeDashboardWithFeedback onNavigate={handleNavigate} />;
      case 'home-fabriq':
        return <FabriQAiHomeDashboard onNavigate={handleNavigate} />;
      case 'boutique-fitting':
        return <BoutiqueFitting onNavigate={handleNavigate} />;
      case 'bespoke-tailor':
        return <BespokeTailor onNavigate={handleNavigate} />;
      case 'luxury-store':
        return <LuxuryApparelStore onNavigate={handleNavigate} />;
      case 'service-catalog':
        if (division === 'boutique') return <BoutiqueFitting onNavigate={handleNavigate} />;
        if (division === 'luxury_store') return <LuxuryApparelStore onNavigate={handleNavigate} />;
        return <ServiceCatalog onNavigate={handleNavigate} />;
      case 'schedule-pickup':
        if (division === 'boutique') return <BespokeTailor onNavigate={handleNavigate} />;
        if (division === 'luxury_store') return <LuxuryApparelStore onNavigate={handleNavigate} />;
        return <ServiceCatalog onNavigate={handleNavigate} />;
      case 'cart':
        return <CartScreen onNavigate={handleNavigate} />;
      case 'my-orders':
        return <MyOrders onNavigate={handleNavigate} />;
      case 'live-order-tracking':
        return <LiveOrderTracking onNavigate={handleNavigate} />;
      case 'order-tracking':
        return <OrderTracking onNavigate={handleNavigate} />;
      case 'account':
        return <AccountManagement onNavigate={handleNavigate} />;
      case 'service-insights':
        return <ServiceInsightsDashboard onNavigate={handleNavigate} />;
      case 'concierge-chat':
        return <ConciergeSupportChat onNavigate={handleNavigate} />;
      case 'membership-plans':
        return <MembershipPlans onNavigate={handleNavigate} />;
      case 'payment-success':
        return <PaymentSuccess onNavigate={handleNavigate} />;
      case 'service-address':
        return <ServiceAddress onNavigate={handleNavigate} />;
      case 'confirm-addon':
        return <ConfirmServiceAddon onNavigate={handleNavigate} />;
      case 'select-photo':
        return <SelectPhoto onNavigate={handleNavigate} />;
      case 'update-profile-picture':
        return <UpdateProfilePicture onNavigate={handleNavigate} />;
      case 'order-receipt':
        return <OrderReceipt onNavigate={handleNavigate} />;
      case 'ai-fabric-advisor':
        return <AIFabricAdvisor onNavigate={handleNavigate} />;
      case 'enterprise-analytics':
        return <EnterpriseAnalyticsDashboard onNavigate={handleNavigate} />;
      case 'operations-center':
        return <EnterpriseOperationsCenter onNavigate={handleNavigate} />;
      case 'checkout-summary':
      case 'edit-profile':
        return <ServiceCatalog onNavigate={handleNavigate} />;
      default:
        if (division === 'boutique') return <BoutiqueFitting onNavigate={handleNavigate} />;
        if (division === 'luxury_store') return <LuxuryApparelStore onNavigate={handleNavigate} />;
        return <HomeDashboard onNavigate={handleNavigate} />;
    }
  };


  const isHomeScreen = currentScreen === 'home' || currentScreen === 'home-feedback' || currentScreen === 'home-fabriq';

  return (
    <div className="min-h-screen bg-[#070F1E] text-[#FAF9F6] font-['Manrope',sans-serif] selection:bg-[#D4AF37] selection:text-[#0B1528]">
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        title={getScreenTitle(currentScreen)}
        showBack={!isHomeScreen}
        onBack={() => handleNavigate('home')}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Demo Persona Switcher: Rendered exclusively for Employee/Admin testing & verification, hidden from customer UI */}
      {(currentRole !== 'customer' || currentScreen === 'role-login') && (
        <DemoPersonaSwitcher currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}

      <main className="max-w-7xl mx-auto w-full min-h-screen">
        <RbacGuard screen={currentScreen} onNavigate={handleNavigate}>
          {renderScreen()}
        </RbacGuard>
      </main>

      <AppOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onNavigate={handleNavigate}
      />
      <DivisionSelectorModal onNavigate={handleNavigate} />
      <NotificationCenter onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <DivisionProvider>
              <BranchProvider>
                <OrderProvider>
                  <MainContent />
                </OrderProvider>
              </BranchProvider>
            </DivisionProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
