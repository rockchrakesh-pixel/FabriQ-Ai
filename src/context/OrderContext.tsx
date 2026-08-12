import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp 
} from '../lib/firebase';
import { useAuth } from './AuthContext';

export interface OrderItem {
  garmentName: string;
  service: string;
  qty: number;
  price: number;
  image?: string;
}

export type OrderStatus = 'Received' | 'In Processing' | 'Ready for delivery' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string; // Firestore Doc ID or generated ID
  orderCode: string; // e.g., FBQ-8829
  userId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: string | OrderItem[];
  tagId?: string;
  status: OrderStatus;
  stage?: string;
  priority?: string; // 'VIP Express' | 'Standard' | 'Walk-in Standard'
  amount: number; // numeric price
  type: 'Online App Booking' | 'Manual Offline Order' | 'Instant Chat Booking';
  paymentMode: 'Online Paid' | 'Pay on Delivery' | 'Cash (Collected at Counter)' | 'UPI Paid';
  decision: 'Accepted' | 'Pending' | 'Rejected';
  branchId?: string;
  branchName?: string;
  createdAt: string;
  updatedAt?: string;
  estReturnDate?: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<string>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, newStage?: string) => Promise<void>;
  updateOrderDecision: (orderId: string, decision: 'Accepted' | 'Pending' | 'Rejected') => Promise<void>;
  updateOrder: (orderId: string, partial: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getUserOrders: (userIdOrEmail?: string) => Order[];
  getStats: () => {
    totalOrders: number;
    activeOrdersCount: number;
    completedOrdersCount: number;
    pendingCount: number;
    totalRevenue: number;
    expressOrdersCount: number;
    onlineOrdersCount: number;
    offlineOrdersCount: number;
  };
}

const INITIAL_SEED_ORDERS: Omit<Order, 'id'>[] = [
  {
    orderCode: 'FBQ-8829',
    userId: 'cust-01',
    customerName: 'CH Rakesh',
    customerPhone: '+91 98765 43210',
    customerEmail: 'rakesh.ch@fabriq.ai',
    items: [
      { garmentName: 'Armani Silk Blazer', service: 'Dry Cleaning', qty: 1, price: 249 },
      { garmentName: 'Cashmere Sweater', service: 'Wash & Iron', qty: 1, price: 129 },
      { garmentName: 'Trouser', service: 'Steam Iron', qty: 1, price: 15 },
    ],
    tagId: 'RFID-9921-X',
    status: 'In Processing',
    stage: 'Hydro-Extractor Drum #2',
    priority: 'VIP Express',
    amount: 393,
    type: 'Online App Booking',
    paymentMode: 'Online Paid',
    decision: 'Accepted',
    branchId: 'b-hyd-01',
    branchName: 'Jubilee Hills Flagship Atelier',
    createdAt: new Date().toISOString(),
    estReturnDate: 'Tomorrow, 5:30 PM',
  },
  {
    orderCode: 'FBQ-8830',
    userId: 'cust-02',
    customerName: 'Karan Mehra',
    customerPhone: '+91 98123 45678',
    customerEmail: 'karan@fabriq.ai',
    items: [
      { garmentName: 'Italian Silk Suit (2-Piece)', service: 'Dry Cleaning', qty: 1, price: 449 },
    ],
    tagId: 'RFID-9922-Y',
    status: 'Ready for delivery',
    stage: 'Steam Press & Hanger',
    priority: 'Standard',
    amount: 449,
    type: 'Online App Booking',
    paymentMode: 'Online Paid',
    decision: 'Accepted',
    branchId: 'b-hyd-01',
    branchName: 'Jubilee Hills Flagship Atelier',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    estReturnDate: 'Today, 6:00 PM',
  },
  {
    orderCode: 'FBQ-8831',
    userId: 'cust-03',
    customerName: 'Rohan Gupta',
    customerPhone: '+91 97111 22334',
    customerEmail: 'rohan@fabriq.ai',
    items: [
      { garmentName: 'Cashmere Overcoat', service: 'Premium Care', qty: 2, price: 349 },
    ],
    tagId: 'RFID-9923-Z',
    status: 'Received',
    stage: 'Barcode Tagging Station',
    priority: 'VIP Express',
    amount: 698,
    type: 'Online App Booking',
    paymentMode: 'Pay on Delivery',
    decision: 'Pending',
    branchId: 'b-hyd-02',
    branchName: 'Banjara Hills Care Lounge',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    estReturnDate: 'Aug 07, 4:00 PM',
  },
  {
    orderCode: 'FBQ-8832',
    userId: 'cust-04',
    customerName: 'Meera Kapoor',
    customerPhone: '+91 99000 11223',
    customerEmail: 'meera@fabriq.ai',
    items: [
      { garmentName: 'Silk Saree', service: 'Dry Cleaning', qty: 2, price: 299 },
    ],
    tagId: 'RFID-9924-A',
    status: 'Delivered',
    stage: 'Valet Delivered',
    priority: 'Standard',
    amount: 598,
    type: 'Online App Booking',
    paymentMode: 'UPI Paid',
    decision: 'Accepted',
    branchId: 'b-hyd-01',
    branchName: 'Jubilee Hills Flagship Atelier',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    estReturnDate: 'Aug 04, 2:00 PM',
  },
  {
    orderCode: 'OFFLINE-9021',
    customerName: 'Siddharth Rao (Walk-in)',
    customerPhone: '+91 98888 77766',
    items: [
      { garmentName: 'Formal Shirts', service: 'Wash & Iron', qty: 5, price: 79 },
    ],
    tagId: 'COUNTER-512',
    status: 'In Processing',
    stage: 'Sorting & Stain Treatment',
    priority: 'Walk-in Standard',
    amount: 395,
    type: 'Manual Offline Order',
    paymentMode: 'Cash (Collected at Counter)',
    decision: 'Accepted',
    branchId: 'b-hyd-01',
    branchName: 'Jubilee Hills Flagship Atelier',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    estReturnDate: 'Tomorrow, 7:00 PM',
  },
];

const OrderContext = createContext<OrderContextType>({
  orders: [],
  loading: true,
  addOrder: async () => '',
  updateOrderStatus: async () => {},
  updateOrderDecision: async () => {},
  updateOrder: async () => {},
  deleteOrder: async () => {},
  getUserOrders: () => [],
  getStats: () => ({
    totalOrders: 0,
    activeOrdersCount: 0,
    completedOrdersCount: 0,
    pendingCount: 0,
    totalRevenue: 0,
    expressOrdersCount: 0,
    onlineOrdersCount: 0,
    offlineOrdersCount: 0,
  }),
});

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { profile } = useAuth();

  useEffect(() => {
    const ordersRef = collection(db, 'orders');

    const unsubscribe = onSnapshot(
      ordersRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed initial orders to Firestore if empty
          console.log('Seeding initial orders into Firestore...');
          for (const seed of INITIAL_SEED_ORDERS) {
            try {
              await addDoc(collection(db, 'orders'), {
                ...seed,
                createdAt: serverTimestamp(),
              });
            } catch (err) {
              console.error('Error seeding order:', err);
            }
          }
          setLoading(false);
          return;
        }

        const fetchedOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedOrders.push({
            id: docSnap.id,
            orderCode: data.orderCode || docSnap.id,
            userId: data.userId || '',
            customerName: data.customerName || 'Valued Client',
            customerPhone: data.customerPhone || '',
            customerEmail: data.customerEmail || '',
            items: data.items || 'Standard Garments',
            tagId: data.tagId || `TAG-${docSnap.id.substring(0, 4)}`,
            status: data.status || 'Received',
            stage: data.stage || 'Intake Counter',
            priority: data.priority || 'Standard',
            amount: typeof data.amount === 'number' ? data.amount : parseInt(String(data.amount || '0').replace(/\D/g, '')) || 0,
            type: data.type || 'Online App Booking',
            paymentMode: data.paymentMode || 'Pay on Delivery',
            decision: data.decision || 'Accepted',
            branchId: data.branchId || 'b-hyd-01',
            branchName: data.branchName || 'Jubilee Hills Flagship Atelier',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            estReturnDate: data.estReturnDate || 'Tomorrow, 6:00 PM',
          });
        });

        // Sort orders newest first
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore onSnapshot error for orders:', error);
        // Fallback to local state if Firestore connection has transient issue
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error('Failed to add order to Firestore:', err);
      // Local fallback
      const localId = `LOCAL-${Date.now()}`;
      const newOrder: Order = {
        ...orderData,
        id: localId,
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [newOrder, ...prev]);
      return localId;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, newStage?: string) => {
    try {
      const orderDocRef = doc(db, 'orders', orderId);
      await updateDoc(orderDocRef, {
        status: newStatus,
        ...(newStage ? { stage: newStage } : {}),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to update order status in Firestore:', err);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, stage: newStage || o.stage } : o))
      );
    }
  };

  const updateOrderDecision = async (orderId: string, decision: 'Accepted' | 'Pending' | 'Rejected') => {
    try {
      const orderDocRef = doc(db, 'orders', orderId);
      await updateDoc(orderDocRef, {
        decision,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to update decision in Firestore:', err);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, decision } : o))
      );
    }
  };

  const updateOrder = async (orderId: string, partial: Partial<Order>) => {
    try {
      const orderDocRef = doc(db, 'orders', orderId);
      await updateDoc(orderDocRef, {
        ...partial,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to update order in Firestore:', err);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...partial } : o))
      );
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const orderDocRef = doc(db, 'orders', orderId);
      await deleteDoc(orderDocRef);
    } catch (err) {
      console.error('Failed to delete order in Firestore:', err);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const getUserOrders = (userIdOrEmail?: string): Order[] => {
    const queryTerm = (userIdOrEmail || profile?.email || profile?.name || '').toLowerCase();
    if (!queryTerm) return orders;
    return orders.filter(
      (o) =>
        (o.customerEmail && o.customerEmail.toLowerCase().includes(queryTerm)) ||
        (o.customerName && o.customerName.toLowerCase().includes(queryTerm)) ||
        (o.userId && o.userId.toLowerCase().includes(queryTerm)) ||
        queryTerm.includes('rakesh') // Default demo customer matches CH Rakesh
    );
  };

  const getStats = () => {
    const totalOrders = orders.length;
    const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const completedOrdersCount = orders.filter((o) => o.status === 'Delivered').length;
    const pendingCount = orders.filter((o) => o.decision === 'Pending' || o.status === 'Received').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const expressOrdersCount = orders.filter((o) => o.priority?.includes('VIP') || o.priority?.includes('Express')).length;
    const onlineOrdersCount = orders.filter((o) => o.type === 'Online App Booking' || o.type === 'Instant Chat Booking').length;
    const offlineOrdersCount = orders.filter((o) => o.type === 'Manual Offline Order').length;

    return {
      totalOrders,
      activeOrdersCount,
      completedOrdersCount,
      pendingCount,
      totalRevenue,
      expressOrdersCount,
      onlineOrdersCount,
      offlineOrdersCount,
    };
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrderStatus,
        updateOrderDecision,
        updateOrder,
        deleteOrder,
        getUserOrders,
        getStats,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
