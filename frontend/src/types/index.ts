// frontend/src/types/index.ts

export interface Item {
  id: number;
  title: string;
  desc: string;
  price3h: number;
  price6h: number;
  price24h: number;
  category: string;
  available: boolean;
}

export interface Order {
  id: string;
  itemId: number;
  title: string;
  userId: string;
  tariff: string;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'delivery' | 'active' | 'returned';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  isAdmin?: boolean;
}
