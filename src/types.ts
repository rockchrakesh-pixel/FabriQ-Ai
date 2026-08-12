export type AppDivision = 'laundry' | 'boutique' | 'luxury_store';

export type UserRole =
  | 'customer'
  | 'pickup_executive'
  | 'delivery_executive'
  | 'store_staff'
  | 'quality_inspector'
  | 'store_manager'
  | 'area_manager'
  | 'regional_manager'
  | 'mis'
  | 'finance'
  | 'inventory'
  | 'franchise_owner'
  | 'owner'
  | 'ceo'
  | 'super_admin';

export type ScreenId =
  | 'home'
  | 'luxury-store'
  | 'role-login'
  | 'dashboard-customer'
  | 'dashboard-store-manager'
  | 'dashboard-owner'
  | 'dashboard-ceo'
  | 'dashboard-mis'
  | 'home-feedback'
  | 'home-fabriq'
  | 'division-selector'
  | 'boutique-fitting'
  | 'bespoke-tailor'
  | 'payment-success'
  | 'update-profile-picture'
  | 'service-address'
  | 'service-insights'
  | 'my-orders'
  | 'order-tracking'
  | 'confirm-addon'
  | 'select-photo'
  | 'live-order-tracking'
  | 'account'
  | 'concierge-chat'
  | 'membership-plans'
  | 'schedule-pickup'
  | 'checkout-summary'
  | 'service-catalog'
  | 'cart'
  | 'edit-profile'
  | 'order-receipt'
  | 'ai-fabric-advisor';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  description?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  credits: number;
  garmentsSaved: number;
  avatarUrl: string;
  address: string;
  pickupTime: string;
  preferredDivision?: AppDivision;
  role?: UserRole;
  storeLocation?: string;
}

export type TransitionType = 'none' | 'push' | 'push_back' | 'slide_up';


