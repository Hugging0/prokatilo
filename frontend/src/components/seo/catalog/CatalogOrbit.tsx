"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CatalogOrbitInfo } from "./CatalogOrbitInfo";
import type { CatalogOrbitItem } from "./catalog-orbit.types";
import styles from "./CatalogOrbit.module.css";

interface CatalogOrbitProps {
  items: CatalogOrbitItem[];
  heading: string;
  intro: string;
  mobileIntro?: string;
}

interface OrbitStyle extends CSSProperties {
  "--drag-opacity"?: string;
  "--drag-rotate"?: string;
  "--drag-scale"?: string;
  "--drag-x"?: string;
  "--drag-y"?: string;
}

interface DragBounds {
  height: number;
  width: number;
}

function normalizeRelativeIndex(
  index: number,
  activeIndex: number,
  length: number,
) {
  let relativeIndex = (index - activeIndex + length) % length;
  if (relativeIndex > length / 2) relativeIndex -= length;
  return relativeIndex;
}

function positionClass(relativeIndex: number) {
  if (relativeIndex === 0) return styles.productActive;
  if (relativeIndex === 1) return styles.productRight;
  if (relativeIndex === -1) return styles.productLeft;
  return styles.productBack;
}

export function CatalogOrbit({
  items,
  heading,
  intro,
  mobileIntro,
}: CatalogOrbitProps) {
  const router = useRouter();
  const planeRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragOffsetRef = useRef(0);
  const wheelLocked = useRef(false);
  const suppressProductClickUntil = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragBounds, setDragBounds] = useState<DragBounds>({ height: 0, width: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const activeItem = items[activeIndex];

  const selectItem = (index: number) => {
    setActiveIndex((index + items.length) % items.length);
    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  const showPrevious = () => selectItem(activeIndex - 1);
  const showNext = () => selectItem(activeIndex + 1);

  const getDragStyle = (index: number): OrbitStyle | undefined => {
    if (!isDragging || dragBounds.width === 0) return undefined;

    const stageWidth = dragBounds.width;
    const stageHeight = dragBounds.height;
    const radiusX = Math.min(stageWidth * (stageWidth < 700 ? 0.43 : 0.28), 460);
    const relativeIndex = normalizeRelativeIndex(
      index,
      activeIndex,
      items.length,
    );
    const dragAngle = (dragOffset / Math.max(stageWidth, 1)) * (Math.PI * 1.25);
    const angle = relativeIndex * ((Math.PI * 2) / items.length) + dragAngle;
    const depth = (Math.cos(angle) + 1) / 2;
    const visibilityProgress = Math.min(depth / 0.5, 1);
    const visibilityEase = visibilityProgress * visibilityProgress * (3 - 2 * visibilityProgress);

    return {
      "--drag-x": `${Math.sin(angle) * radiusX}px`,
      "--drag-y": `${
        Math.abs(Math.sin(angle)) * Math.min(stageHeight * 0.13, 82) -
        depth * 16
      }px`,
      "--drag-scale": String(0.28 + depth * depth * 0.8),
      "--drag-opacity": String(visibilityEase * (0.48 + depth * 0.52)),
      "--drag-rotate": `${Math.sin(angle) * -18}deg`,
      zIndex: Math.round(depth * 80) + 10,
    };
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const completedOffset = dragOffsetRef.current;
    setIsDragging(false);

    if (Math.abs(completedOffset) > 8) {
      suppressProductClickUntil.current = window.performance.now() + 250;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (Math.abs(completedOffset) > 45) {
      if (completedOffset < 0) {
        showNext();
      } else {
        showPrevious();
      }
    } else {
      dragOffsetRef.current = 0;
      setDragOffset(0);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    } else if (event.key === "Enter") {
      event.preventDefault();
      router.push(`/app?item=${activeItem.appItemId}`);
    }
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (wheelLocked.current) return;

    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    if (Math.abs(delta) < 8) return;

    wheelLocked.current = true;
    if (delta > 0) {
      showNext();
    } else {
      showPrevious();
    }
    window.setTimeout(() => {
      wheelLocked.current = false;
    }, 520);
  };

  return (
    <section className={styles.catalogHero} aria-labelledby="catalog-orbit-title">
      <div className={styles.heroCopy}>
        <h1 id="catalog-orbit-title">{heading}</h1>
        <p>
          <span className={mobileIntro ? styles.desktopIntro : undefined}>
            {intro}
          </span>
          {mobileIntro && (
            <span className={styles.mobileIntro}>{mobileIntro}</span>
          )}
        </p>
      </div>

      <div
        className={`${styles.orbitStage} ${isDragging ? styles.dragging : ""}`}
        role="region"
        aria-roledescription="карусель"
        aria-label="Каталог вещей в аренду"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest(`.${styles.orbitControl}`)) return;
          dragStartX.current = event.clientX;
          dragOffsetRef.current = 0;
          setDragOffset(0);
          setDragBounds({
            height: event.currentTarget.clientHeight,
            width: event.currentTarget.clientWidth,
          });
          setIsDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (isDragging) {
            const nextOffset = event.clientX - dragStartX.current;
            dragOffsetRef.current = nextOffset;
            setDragOffset(nextOffset);
            return;
          }

          if (
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
            !planeRef.current
          ) {
            return;
          }
          const rect = event.currentTarget.getBoundingClientRect();
          planeRef.current.style.setProperty("--parallax-x", `${(((event.clientX - rect.left) / rect.width - 0.5) * 6).toFixed(2)}px`);
          planeRef.current.style.setProperty("--parallax-y", `${(((event.clientY - rect.top) / rect.height - 0.5) * 4).toFixed(2)}px`);
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={() => {
          if (!isDragging && planeRef.current) {
            planeRef.current.style.setProperty("--parallax-x", "0px");
            planeRef.current.style.setProperty("--parallax-y", "0px");
          }
        }}
      >
        <div ref={planeRef} className={styles.orbitPlane}>
          <div className={styles.orbitLine} aria-hidden="true" />
          <div className={styles.products}>
            {items.map((item, index) => {
              const relativeIndex = normalizeRelativeIndex(
                index,
                activeIndex,
                items.length,
              );
              const isActive = index === activeIndex;

              return (
                <button
                  key={item.appItemId}
                  type="button"
                  className={`${styles.product} ${positionClass(relativeIndex)} ${
                    isDragging ? styles.productDragging : ""
                  }`}
                  style={getDragStyle(index)}
                  aria-label={
                    isActive
                      ? `${item.title}. Открыть в приложении`
                      : `${item.title}. Выбрать вещь`
                  }
                  aria-pressed={isActive}
                  onClick={() => {
                    if (
                      window.performance.now() <
                      suppressProductClickUntil.current
                    ) {
                      return;
                    }
                    if (isActive) {
                      router.push(`/app?item=${item.appItemId}`);
                    } else {
                      selectItem(index);
                    }
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    width={960}
                    height={960}
                    sizes="(max-width: 860px) 92vw, 46vw"
                    preload={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding={index === 0 ? "sync" : "async"}
                    unoptimized
                    className={styles.productImage}
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.orbitControl} ${styles.previous}`}
          onClick={showPrevious}
          aria-label="Предыдущая вещь"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${styles.orbitControl} ${styles.next}`}
          onClick={showNext}
          aria-label="Следующая вещь"
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <CatalogOrbitInfo
        activeIndex={activeIndex}
        activeItem={activeItem}
        items={items}
        onSelect={selectItem}
      />
    </section>
  );
}
