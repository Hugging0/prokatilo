import React from 'react';
import { AppBadge } from "@/components/ui/AppBadge";
import { AppCard } from "@/components/ui/AppCard";
import { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  onClick: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  return (
    <AppCard
      variant="compact"
      onClick={() => onClick(item)}
      className="flex cursor-pointer items-center transition-all active:scale-[0.98]"
    >
      <div className="mr-4 flex size-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 shadow-inner transition-transform">
        {/* В будущем здесь будет <img />, пока используем первую букву названия как лого */}
        <span className="font-black text-2xl">{item.title.charAt(0)}</span>
      </div>
      <div className="flex-1">
        <h3 className="mb-2 text-base font-black leading-snug text-slate-950">
          {item.title}
        </h3>
        <AppBadge tone={item.available ? "success" : "warning"}>
          {item.available ? "В наличии" : "Сейчас занято"}
        </AppBadge>
      </div>
      <div className="text-right pl-2">
        <span className="text-xl font-black text-slate-900 leading-none">{item.price3h}₽</span>
        <p className="mt-1 text-xs font-black uppercase text-slate-400">за 3 часа</p>
      </div>
    </AppCard>
  );
};
