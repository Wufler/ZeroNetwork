"use client";

import { CheckCircle2, Clock, Gamepad2, Pause, Play, Zap } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { cn } from "@/lib/utils";
import wolfey from "../../public/header/1.png";
import wither from "../../public/header/2.png";
import golem from "../../public/header/3.png";
import imher0 from "../../public/header/4.png";
import { Discord } from "./ui/discord";

type FeatureMedia = {
  /** Static import or public image path; also the video's poster and fallback. */
  image: string | StaticImageData;
  video?: string;
  position?: string;
};

type Feature = {
  title: string;
  description: string;
  icon: typeof Clock | typeof Discord;
  className: string;
  media: FeatureMedia;
};

// Replace these existing server shots with each card's final media.
// Video example: { image: "/features/uptime.webp", video: "/features/uptime.mp4" }
const features: Feature[] = [
  {
    title: "24/7 Uptime",
    description:
      "Our servers are always online, so you can play whenever you want.",
    icon: Clock,
    className: "md:col-span-3 lg:col-span-7",
    media: { image: wolfey },
  },
  {
    title: "Lag Free Experience",
    description: "Optimized performance for smooth gameplay.",
    icon: Zap,
    className: "md:col-span-3 lg:col-span-5",
    media: { image: wither },
  },
  {
    title: "Vibrant Community",
    description: "Join our active Discord to chat, and suggest new features!",
    icon: Discord,
    className: "md:col-span-2 lg:col-span-4",
    media: { image: golem },
  },
  {
    title: "Always Updated",
    description:
      "We try to keep the servers updated with the latest versions and patches.",
    icon: CheckCircle2,
    className: "md:col-span-2 lg:col-span-4",
    media: { image: "/witherswrath/spawn.webp" },
  },
  {
    title: "Modded & Vanilla",
    description: "From modpacks to modified vanilla survival, we have it all.",
    icon: Gamepad2,
    className: "md:col-span-2 lg:col-span-4",
    media: { image: imher0 },
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const reveal = useScrollReveal();
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(cardRef, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (
      inView &&
      (reducedMotion === false || paused === false) &&
      !paused &&
      !videoFailed
    ) {
      void video.play().catch(() => setPaused(true));
    } else {
      video.pause();
    }
  }, [inView, reducedMotion, paused, videoFailed]);

  return (
    <motion.article
      {...reveal}
      ref={cardRef}
      className={cn(
        "group relative isolate flex min-h-80 min-w-0 flex-col justify-end overflow-hidden rounded-2xl bg-neutral-900 text-white",
        index < 2 ? "lg:min-h-100" : "lg:min-h-84",
        feature.className,
      )}
    >
      {!mediaFailed && (
        <Image
          src={feature.media.image}
          alt=""
          fill
          sizes={
            index < 2
              ? "(max-width: 767px) 100vw, 60vw"
              : "(max-width: 767px) 100vw, 33vw"
          }
          className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
          style={{ objectPosition: feature.media.position }}
          onError={() => setMediaFailed(true)}
        />
      )}
      {feature.media.video && !videoFailed && (
        <video
          ref={videoRef}
          src={inView ? feature.media.video : undefined}
          poster={
            typeof feature.media.image === "string"
              ? feature.media.image
              : feature.media.image.src
          }
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 -z-10 size-full object-cover"
          style={{ objectPosition: feature.media.position }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setVideoFailed(true)}
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-black/95 via-black/50 to-black/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10"
      />
      {feature.media.video && !videoFailed && (
        <button
          type="button"
          aria-label={`${playing ? "Pause" : "Play"} ${feature.title} video`}
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            if (playing) {
              setPaused(true);
              video.pause();
            } else {
              setPaused(false);
              void video.play().catch(() => setPaused(true));
            }
          }}
          className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-4" />
          ) : (
            <Play aria-hidden="true" className="size-4" />
          )}
        </button>
      )}
      <div className={cn("px-6 pb-6 pt-30")}>
        <feature.icon
          aria-hidden="true"
          className="mb-4 size-5 text-white/80"
        />
        <h3
          className={cn(
            "font-syne text-2xl font-semibold leading-tight tracking-tight text-balance",
            index < 2 && "lg:text-3xl",
          )}
        >
          {feature.title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 lg:text-base">
          {feature.description}
        </p>
      </div>
    </motion.article>
  );
}

export default function Features() {
  const reveal = useScrollReveal();
  return (
    <section
      aria-labelledby="features-heading"
      className="relative bg-linear-to-b from-background to-transparent px-4 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <motion.header {...reveal} className="mb-8 flex flex-col gap-2">
          <h2
            id="features-heading"
            className="font-syne text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl"
          >
            What are we doing!?
          </h2>
          <p className="max-w-2xl text-base lg:text-lg leading-relaxed text-muted-foreground">
            We run different kind of servers with lots of fun features for
            everyone. Whether you like modded or modified vanilla Minecraft,
            we&apos;ve got something for you. Suggest modpacks or ideas in our
            Discord!
          </p>
        </motion.header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
