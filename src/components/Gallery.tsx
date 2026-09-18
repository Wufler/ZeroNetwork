"use client";

import { Loader2 } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import Marquee from "react-fast-marquee";

export default function Gallery({ data }: ComponentProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { margin: "150px 0px" });
  const reduceMotion = useReducedMotion();

  const markImageAsSettled = (imageUrl: string) => {
    setLoadedImages((prev) => {
      if (prev.has(imageUrl)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(imageUrl);
      return next;
    });
  };

  return (
    <div
      ref={sectionRef}
      className="relative w-full overflow-hidden md:py-16 py-8 bg-background border-y border-border"
    >
      <Marquee
        play={isInView && !reduceMotion}
        speed={32}
        gradient
        gradientColor="hsl(var(--background))"
        gradientWidth={64}
        pauseOnHover
      >
        {data.galleryImages.map((item, index) => (
          <div
            key={`${item.imageUrl}-${index}`}
            className="group md:min-w-80 min-w-60 md:min-h-50 min-h-35 relative rounded-xl overflow-hidden border border-border/50 bg-muted mx-3"
          >
            {!loadedImages.has(item.imageUrl) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/30">
                <Loader2
                  className={`size-8 text-primary/50 ${isInView ? "animate-spin" : ""}`}
                />
              </div>
            )}
            <Image
              src={item.imageUrl}
              alt={item.altText}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
              placeholder="empty"
              loading="lazy"
              onLoad={() => markImageAsSettled(item.imageUrl)}
              onError={() => markImageAsSettled(item.imageUrl)}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-white font-medium font-syne text-lg drop-shadow-md">
                  {item.altText}
                </span>
              </div>
            </div>
            <div className="absolute inset-0 ring-1 ring-inset ring-border/30 rounded-xl pointer-events-none group-hover:ring-primary/50 transition-colors duration-300" />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
