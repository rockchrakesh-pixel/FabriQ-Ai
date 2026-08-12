import React, { useState } from 'react';
import { ScreenId } from './types';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DivisionProvider } from './context/DivisionContext';
import { BranchProvider } from './context/BranchContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { NotificationCenter } from './components/NotificationCenter';
import { PrototypeBar } from './components/PrototypeBar';
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

export function MainContent() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    // Show onboarding on first launch or if not completed
    return !localStorage.getItem('hasCompletedFabriqOnboarding');
  });

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
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
      case 'schedule-pickup':
      case 'checkout-summary':
      case 'edit-profile':
        return <ServiceCatalog onNavigate={handleNavigate} />;
      default:
        return <HomeDashboard onNavigate={handleNavigate} />;
    }
  };


  const isHomeScreen = currentScreen === 'home' || currentScreen === 'home-feedback' || currentScreen === 'home-fabriq';

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 font-['Manrope',sans-serif] selection:bg-[#9E7B4F] selection:text-white">
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        title={getScreenTitle(currentScreen)}
        showBack={!isHomeScreen}
        onBack={() => handleNavigate('home')}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

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
  );
}
