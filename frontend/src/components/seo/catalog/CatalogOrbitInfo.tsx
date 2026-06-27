import Link from "next/link";
import { MoveHorizontal } from "lucide-react";

import type { CatalogOrbitItem } from "./catalog-orbit.types";
import styles from "./CatalogOrbit.module.css";

interface CatalogOrbitInfoProps {
  activeIndex: number;
  activeItem: CatalogOrbitItem;
  items: CatalogOrbitItem[];
  onSelect: (index: number) => void;
}

const moneyFormatter = new Intl.NumberFormat("ru-RU");

export function CatalogOrbitInfo({
  activeIndex,
  activeItem,
  items,
  onSelect,
}: CatalogOrbitInfoProps) {
  return (
    <div className={styles.infoRail}>
      <div className={styles.progress} aria-label="Позиция в каталоге">
        <div className={styles.progressCount}>
          <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
          <span>/ {String(items.length).padStart(2, "0")}</span>
        </div>
        <div className={styles.progressDots}>
          {items.map((item, index) => (
            <button
              key={item.appItemId}
              type="button"
              aria-label={`Показать: ${item.title}`}
              aria-current={index === activeIndex}
              onClick={() => onSelect(index)}
            />
          ))}
        </div>
      </div>

      <div className={styles.productSummary} aria-live="polite">
        <h2>{activeItem.title}</h2>
        <p>{activeItem.description}</p>
      </div>

      <dl className={styles.prices}>
        <div>
          <dt>3 часа</dt>
          <dd>{moneyFormatter.format(activeItem.prices.short)} ₽</dd>
        </div>
        <div>
          <dt>Сутки</dt>
          <dd>{moneyFormatter.format(activeItem.prices.day)} ₽</dd>
        </div>
        <div>
          <dt>Неделя</dt>
          <dd>{moneyFormatter.format(activeItem.prices.week)} ₽</dd>
        </div>
      </dl>

      <Link
        className={styles.bookButton}
        href={`/app?item=${activeItem.appItemId}`}
      >
        Забронировать
      </Link>

      <div className={styles.gestureHint} aria-hidden="true">
        <MoveHorizontal />
        <span>Листайте каталог</span>
      </div>
    </div>
  );
}
