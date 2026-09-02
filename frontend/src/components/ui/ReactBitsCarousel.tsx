"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type Transition,
  type PanInfo,
} from "framer-motion";

import "./ReactBitsCarousel.css";

export interface CarouselItemData {
  title: string;
  description: string;
  id: string | number;
  icon?: React.ReactNode;
  number?: string;
  numberGradient?: string;
}

export interface CarouselRef {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  activeIndex: number;
}

export interface CarouselProps {
  items: CarouselItemData[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
  showIndicators?: boolean;
  className?: string;
  onActiveIndexChange?: (index: number) => void;
}

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

interface CarouselItemProps {
  item: CarouselItemData;
  index: number;
  itemWidth: number;
  round: boolean;
  trackItemOffset: number;
  x: MotionValue<number>;
  transition: Transition;
}

function CarouselItem({
  item,
  index,
  itemWidth,
  round,
  trackItemOffset,
  x,
  transition,
}: CarouselItemProps) {
  const range = [
    -(index + 1) * trackItemOffset,
    -index * trackItemOffset,
    -(index - 1) * trackItemOffset,
  ];
  const outputRange = [90, 0, -90];
  const rotateY = useTransform(x, range, outputRange, { clamp: false });

  return (
    <motion.div
      key={`${item?.id ?? index}-${index}`}
      className={`carousel-item ${round ? "round" : ""}`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : "100%",
        rotateY: rotateY,
        ...(round && { borderRadius: "50%" }),
      }}
      transition={transition}
    >
      {!round && (
        <>
          <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[color:var(--theme-accent-periwinkle)]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[color:var(--theme-accent-periwinkle)]/20 blur-2xl pointer-events-none" />
        </>
      )}

      <div className={`carousel-item-header ${round ? "round" : ""}`}>
        {round ? (
          item.icon && <span className="carousel-icon-container">{item.icon}</span>
        ) : (
          <div className="carousel-pillar-top">
            {item.number && (
              <span
                className={`carousel-pillar-number font-display font-black italic bg-gradient-to-br ${
                  item.numberGradient ||
                  "from-[color:var(--theme-accent-periwinkle)] via-[color:var(--theme-typography-main)] to-[color:var(--theme-accent-periwinkle)]"
                } bg-clip-text text-transparent`}
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  paddingRight: "0.15em",
                  paddingTop: "0.05em",
                }}
              >
                {item.number}
              </span>
            )}
            {item.icon && (
              <div className="carousel-icon-container">
                {item.icon}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="carousel-item-content">
        <div className="carousel-item-title">{item.title}</div>
        <p className="carousel-item-description">{item.description}</p>
      </div>
    </motion.div>
  );
}

const ReactBitsCarousel = forwardRef<CarouselRef, CarouselProps>(function ReactBitsCarousel(
  {
    items,
    baseWidth = 880,
    autoplay = false,
    autoplayDelay = 3000,
    pauseOnHover = false,
    loop = false,
    round = false,
    showIndicators = true,
    className = "",
    onActiveIndexChange,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute responsive baseWidth for mobile screens
  const [effectiveBaseWidth, setEffectiveBaseWidth] = useState(baseWidth);

  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== "undefined") {
        const parent = containerRef.current?.parentElement;
        const availableWidth = parent && parent.clientWidth > 0 ? parent.clientWidth : window.innerWidth - 32;
        setEffectiveBaseWidth(Math.max(280, Math.min(baseWidth, availableWidth)));
      }
    };
    updateWidth();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current?.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        updateWidth();
      });
      resizeObserver.observe(containerRef.current.parentElement);
    }

    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      resizeObserver?.disconnect();
    };
  }, [baseWidth]);

  const containerPadding = 20;
  const itemWidth = effectiveBaseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const itemsForRender = useMemo(() => {
    if (!loop) return items;
    if (items.length === 0) return [];
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);

  const [position, setPosition] = useState(loop ? 1 : 0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1) return undefined;
    if (pauseOnHover && isHovered) return undefined;

    const timer = setInterval(() => {
      setPosition((prev) => {
        if (loop) {
          return prev >= itemsForRender.length - 1 ? 2 : prev + 1;
        }
        return Math.min(prev + 1, itemsForRender.length - 1);
      });
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length, loop]);

  const initialRender = useRef(true);
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      const startingPosition = loop ? 1 : 0;
      setPosition(startingPosition);
      x.set(-startingPosition * trackItemOffset);
    }
  }, [items.length, loop, trackItemOffset, x]);

  const [prevItemsCount, setPrevItemsCount] = useState(itemsForRender.length);
  if (itemsForRender.length !== prevItemsCount) {
    setPrevItemsCount(itemsForRender.length);
    if (!loop && position > itemsForRender.length - 1) {
      setPosition(Math.max(0, itemsForRender.length - 1));
    }
  }

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationStart = () => {
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }
    const lastCloneIndex = itemsForRender.length - 1;

    if (position === lastCloneIndex) {
      setIsJumping(true);
      const target = 1;
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    if (position === 0) {
      setIsJumping(true);
      const target = items.length;
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    setIsAnimating(false);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;

    if (direction === 0) return;

    setPosition((prev) => {
      const next = prev + direction;
      const max = itemsForRender.length - 1;
      return Math.max(0, Math.min(next, max));
    });
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
          right: 0,
        },
      };

  const activeIndex = useMemo(() => {
    if (items.length === 0) return 0;
    return loop
      ? (position - 1 + items.length) % items.length
      : Math.min(position, items.length - 1);
  }, [items.length, loop, position]);

  useEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  const goTo = useCallback(
    (index: number) => {
      setPosition(loop ? index + 1 : Math.max(0, Math.min(index, items.length - 1)));
    },
    [items.length, loop]
  );

  const next = useCallback(() => {
    setPosition((prev) => {
      const nextPos = prev + 1;
      const max = itemsForRender.length - 1;
      return Math.min(nextPos, max);
    });
  }, [itemsForRender.length]);

  const prev = useCallback(() => {
    setPosition((prev) => {
      const prevPos = prev - 1;
      return Math.max(0, prevPos);
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      goTo,
      next,
      prev,
      activeIndex,
    }),
    [goTo, next, prev, activeIndex]
  );

  return (
    <div
      ref={containerRef}
      className={`carousel-container ${round ? "round" : ""} ${className}`}
      style={{
        width: `${effectiveBaseWidth}px`,
        ...(round && { height: `${effectiveBaseWidth}px`, borderRadius: "50%" }),
      }}
    >
      <motion.div
        className="carousel-track"
        drag={isAnimating ? false : "x"}
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={handleAnimationStart}
        onAnimationComplete={handleAnimationComplete}
      >
        {itemsForRender.map((item, index) => (
          <CarouselItem
            key={`${item?.id ?? index}-${index}`}
            item={item}
            index={index}
            itemWidth={itemWidth}
            round={round}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={effectiveTransition}
          />
        ))}
      </motion.div>

      {showIndicators && (
        <div className={`carousel-indicators-container ${round ? "round" : ""}`}>
          <div className="carousel-indicators">
            {items.map((_, index) => (
              <motion.button
                type="button"
                key={index}
                className={`carousel-indicator ${
                  activeIndex === index ? "active" : "inactive"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeIndex === index}
                animate={{
                  scale: activeIndex === index ? 1.2 : 1,
                }}
                onClick={() => setPosition(loop ? index + 1 : index)}
                transition={{ duration: 0.15 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ReactBitsCarousel;
