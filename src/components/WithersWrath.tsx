"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";

const images = [
  "/witherswrath/spawn.webp",
  "/witherswrath/half.gif",
  "/witherswrath/charge.webp",
  "/witherswrath/homing.webp",
  "/witherswrath/dying.webp",
];

export default function WithersWrath() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "150px 0px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (isHovered || !isInView || reduceMotion) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, isInView, reduceMotion]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section
      ref={sectionRef}
      className="withers-wrath py-16 px-4 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 lg:gap-12 gap-6 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex lg:flex-row flex-col items-center lg:justify-start justify-center gap-4 lg:mb-4 mb-2">
              <div className="relative size-16 rounded-lg overflow-hidden">
                {!loadedImages.has("/witherswrath/icon.png") && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/30">
                    <Loader2
                      className={cn(
                        "size-5 text-(--wrath-purple)",
                        isInView && "animate-spin",
                      )}
                    />
                  </div>
                )}
                <Image
                  src="/witherswrath/icon.png"
                  alt="Withers Wrath Logo"
                  fill
                  sizes="64px"
                  className="object-cover"
                  onLoad={() =>
                    setLoadedImages((prev) => {
                      const next = new Set(prev);
                      next.add("/witherswrath/icon.png");
                      return next;
                    })
                  }
                />
              </div>
              <h2 className="font-syne text-4xl lg:text-5xl font-bold text-(--wrath-purple) text-center lg:text-left">
                Wither&apos;s Wrath
              </h2>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed lg:mb-8 mb-4 lg:text-left text-center">
              Experience the ultimate challenge in our custom datapack. Push
              your skills to the limit with enhanced wither battles.
            </p>

            <div className="flex flex-wrap gap-4 lg:justify-start justify-center">
              <a
                href="https://modrinth.com/datapack/witherswrath/"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "feature-primary",
                  size: "feature",
                })}
              >
                <span>View on Modrinth</span>
                <ExternalLink
                  aria-hidden="true"
                  data-icon="inline-end"
                  className="group-hover/button:translate-x-0.5 motion-reduce:transform-none"
                />
              </a>
            </div>

            <p className="lg:mt-4 mt-2 text-xs text-muted-foreground uppercase tracking-widest opacity-50 lg:text-left text-center">
              #ad
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="order-1 lg:order-2"
          >
            <div
              className="relative aspect-video rounded-lg overflow-hidden group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {!loadedImages.has(images[currentImageIndex]) && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/30">
                      <Loader2
                        className={cn(
                          "size-8 text-(--wrath-purple)",
                          isInView && "animate-spin",
                        )}
                      />
                    </div>
                  )}
                  <Image
                    src={images[currentImageIndex]}
                    alt="Withers Wrath Gameplay"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                    onLoad={() =>
                      setLoadedImages((prev) => {
                        const next = new Set(prev);
                        next.add(images[currentImageIndex]);
                        return next;
                      })
                    }
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 flex items-center justify-between p-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
                <Button
                  variant="secondary"
                  size="icon-lg"
                  aria-label="Previous Wither's Wrath image"
                  onClick={previousImage}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon-lg"
                  aria-label="Next Wither's Wrath image"
                  onClick={nextImage}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex z-10">
                {images.map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    aria-label={`Show Wither's Wrath image ${index + 1}`}
                    aria-pressed={index === currentImageIndex}
                    onClick={() => setCurrentImageIndex(index)}
                    className="group flex h-6 shrink-0 cursor-pointer items-center justify-center rounded-sm px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        index === currentImageIndex
                          ? "w-8 bg-(--wrath-orange)"
                          : "w-2 bg-white/70 group-hover:bg-white",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
