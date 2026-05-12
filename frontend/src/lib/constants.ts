// frontend/src/lib/constants.ts
import { Item } from '@/types';

export const STATUSES = {
  pending: { label: 'Ожидает', color: 'bg-amber-100 text-amber-600' },
  confirmed: { label: 'Подтвержден', color: 'bg-blue-100 text-blue-600' },
  delivery: { label: 'В пути', color: 'bg-indigo-100 text-indigo-600' },
  active: { label: 'У клиента', color: 'bg-emerald-100 text-emerald-600' },
  returned: { label: 'Возвращен', color: 'bg-slate-100 text-slate-500' },
};

export const CATEGORIES = ['Все', 'Игры', 'Уборка', 'Развлечения'];

export const INITIAL_ITEMS: Item[] = [
  { 
    id: 1, 
    title: "PlayStation 5", 
    desc: "Идеально для выходных. 2 геймпада, установлены FIFA 24, Mortal Kombat 1 и Spider-Man 2. Привезу и подключу за 15 минут.",
    price3h: 600, price6h: 900, price24h: 1500, 
    category: "Игры",
    available: true
  },
  { 
    id: 2, 
    title: "PlayStation VR2", 
    desc: "Шлем виртуальной реальности. Полный комплект. Погрузитесь в другие миры прямо у себя дома.",
    price3h: 800, price6h: 1200, price24h: 2000, 
    category: "Игры",
    available: true
  },
  { 
    id: 3, 
    title: "Робот-мойщик окон", 
    desc: "Безопасно и быстро вымоет окна с двух сторон. Страховочный трос в комплекте, покажу как пользоваться.",
    price3h: 400, price6h: 600, price24h: 1000, 
    category: "Уборка",
    available: true
  },
  { 
    id: 4, 
    title: "Моющий пылесос Karcher", 
    desc: "Профессиональная химчистка диванов и ковров своими руками. Порция профессиональной химии предоставляется бесплатно.",
    price3h: 700, price6h: 1000, price24h: 1800, 
    category: "Уборка",
    available: true
  }
];
