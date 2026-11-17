import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

export interface Order {
  id: string;
  crop_id: string;
  crop: string;
  quantity: string | number;
  total_price: number;
  seller_id: string;
  buyer_id: string;
  seller_name?: string;
  status: "In Transit" | "Delivered" | "Pending";
  date: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (order: Omit<Order, 'id' | 'date'>) => Promise<void>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const defaultMockOrders: Order[] = [
  {
    id: "ORD-9421A",
    crop_id: "mock-crop-1",
    crop: "Organic Premium Wheat",
    quantity: "50 Tons",
    total_price: 25000,
    seller_id: "farmer-1",
    buyer_id: "demo-merchant",
    seller_name: "Midwest Agritech Farms",
    status: "In Transit",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
  },
  {
    id: "ORD-7714C",
    crop_id: "mock-crop-2",
    crop: "Non-GMO Soybeans",
    quantity: "120 Tons",
    total_price: 35000,
    seller_id: "farmer-2",
    buyer_id: "demo-merchant",
    seller_name: "Valley Co-op",
    status: "Pending",
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: "ORD-1198D",
    crop_id: "mock-crop-3",
    crop: "Robusta Coffee Beans",
    quantity: "15 Tons",
    total_price: 15000,
    seller_id: "farmer-3",
    buyer_id: "demo-merchant",
    seller_name: "Highland Estates",
    status: "Delivered",
    date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0]
  },
  {
    id: "ORD-3392X",
    crop_id: "mock-crop-4",
    crop: "Sweet Yellow Corn",
    quantity: "80 Tons",
    total_price: 20000,
    seller_id: "farmer-4",
    buyer_id: "demo-merchant",
    seller_name: "Sunbelt Organics",
    status: "Delivered",
    date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0]
  }
];

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    if (user.id.startsWith('demo-')) {
       setOrders(defaultMockOrders);
       setLoading(false);
       return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          seller:seller_id(name),
          crop_details:crop_id(name)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setOrders(data.map((o: any) => ({
          ...o,
          crop: o.crop_details?.name || 'Crop',
          seller_name: o.seller?.name,
          date: o.created_at.split('T')[0],
          status: o.status === 'pending' ? 'Pending' : o.status === 'shipped' ? 'In Transit' : 'Delivered'
        })) as Order[]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'date'>) => {
    if (user?.id.startsWith('demo-')) {
       const newOrder: Order = {
          ...order,
          id: `ORD-${Math.floor(Math.random() * 10000)}Z`,
          date: new Date().toISOString().split('T')[0]
       };
       setOrders([newOrder, ...orders]);
       return;
    }

    try {
      const { data, error } = await supabase.rpc('place_order', {
        p_crop_id: order.crop_id,
        p_quantity: Number(order.quantity),
        p_total_price: order.total_price
      });

      if (error) throw error;
      // Refetch to get the joined fields properly
      fetchOrders();
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    if (user?.id.startsWith('demo-')) {
       setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
       return;
    }

    try {
      const dbStatus = status === 'Pending' ? 'pending' : status === 'In Transit' ? 'shipped' : 'completed';
      const { error } = await supabase
        .from('orders')
        .update({ status: dbStatus })
        .eq('id', id);

      if (error) throw error;
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }

  return (
    <OrderContext.Provider value={{ orders, loading, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
};
