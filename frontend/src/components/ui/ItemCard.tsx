import React from 'react';
import { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  onClick: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  return (
    <div 
      onClick={() => onClick(item)}
      className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center hover:shadow-lg transition-all cursor-pointer active:scale-[0.98] group"
    >
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-600 mr-4 group-hover:rotate-3 transition-transform shadow-inner">
        {/* В будущем здесь будет <img />, пока используем первую букву названия как лого */}
        <span className="font-black text-2xl">{item.title.charAt(0)}</span>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-800 text-base leading-tight mb-1">{item.title}</h3>
        {item.available && (
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider italic bg-emerald-50 px-2 py-1 rounded-md inline-block">
            В наличии
          </span>
        )}
      </div>
      <div className="text-right pl-2">
        <span className="text-xl font-black text-slate-900 leading-none">{item.price3h}₽</span>
        <p className="text-[9px] font-black text-slate-400 uppercase mt-1">за 3 часа</p>
      </div>
    </div>
  );
};
