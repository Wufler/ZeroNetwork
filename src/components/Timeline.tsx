"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteTimelineItem } from "@/app/actions/timeline";
import Linking from "@/components/Linking";
import Mentions from "@/components/Mentions";
import TimelineEditDialog from "@/components/TimelineEdit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { cn } from "@/lib/utils";

function TimelineModalContent({ item }: { item: TimelineItem }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [hasInteracted, setHasInteracted] = useState(false);
  const selectedImage = item.media?.[selectedImageIndex];
  const mediaRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!hasInteracted) return;
    mediaRefs.current[selectedImageIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedImageIndex, hasInteracted]);

  return (
    <div className="flex flex-col-reverse lg:flex-row w-screen h-dvh bg-background/95">
      {(item.detailsUrl || (item.downloadUrl && item.showDownload)) && (
        <div
          className={cn(
            "p-4 border-t border-border bg-muted/30 lg:hidden shrink-0 gap-3 z-10",
            item.detailsUrl && item.downloadUrl && item.showDownload
              ? "grid grid-cols-2"
              : "flex",
          )}
        >
          {item.detailsUrl && (
            <a
              href={item.detailsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                className: "w-full h-10 text-sm font-medium rounded-xl",
              })}
            >
              Learn More <ExternalLink className="size-4" />
            </a>
          )}
          {item.downloadUrl && item.showDownload && (
            <a
              href={item.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                className:
                  "w-full h-10 text-sm font-medium rounded-xl hover:bg-muted transition-all",
              })}
            >
              Download <Download className="size-4" />
            </a>
          )}
        </div>
      )}

      <div
        className={cn(
          "relative w-full h-[35vh] lg:h-full shrink-0 lg:flex-1 bg-black flex items-center justify-center overflow-hidden group",
          !hasInteracted && "hidden lg:flex",
        )}
      >
        {selectedImage ? (
          <>
            <div className="absolute inset-0">
              <Image
                key={`bg-${selectedImage.imageUrl}`}
                src={selectedImage.imageUrl}
                alt={selectedImage.altText}
                fill
                className="object-contain lg:object-cover blur-3xl opacity-30"
                sizes="(max-width: 1024px) 100vw, 70vw"
                priority
                onLoad={() =>
                  setLoadedImages((prev) =>
                    new Set(prev).add(selectedImage.imageUrl),
                  )
                }
                placeholder="empty"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
            <div className="relative w-full h-full p-4 lg:p-12">
              {!loadedImages.has(selectedImage.imageUrl) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="size-12 animate-spin text-primary/50" />
                </div>
              )}
              <Image
                key={`fg-${selectedImage.imageUrl}`}
                src={selectedImage.imageUrl}
                alt={selectedImage.altText}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 70vw"
                priority
                onLoad={() =>
                  setLoadedImages((prev) =>
                    new Set(prev).add(selectedImage.imageUrl),
                  )
                }
                placeholder={"empty"}
              />
            </div>

            {item.media && item.media.length > 1 && (
              <div className="z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? item.media!.length - 1 : prev - 1,
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white lg:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight className="size-6 rotate-180" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) =>
                      prev === item.media!.length - 1 ? 0 : prev + 1,
                    );
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white lg:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>
            )}

            <div className="absolute bottom-0 w-full p-4 bg-linear-to-t from-black/90 via-black/50 to-transparent pt-16">
              <p className="text-white/90 lg:text-lg text-sm font-medium wrap-anywhere text-center">
                <Mentions text={selectedImage.altText} />
              </p>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
            <ImageIcon className="size-8 opacity-50" />
            <span>No image selected</span>
          </div>
        )}
      </div>

      <div className="flex-1 lg:flex-none lg:w-110 xl:w-170 flex flex-col bg-background/95 dark:bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border-b lg:border-b-0 lg:border-l border-border overflow-hidden min-h-0">
        <div className="p-6 border-b border-border hidden lg:flex items-center justify-between shrink-0 bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider">
                {item.year}
              </div>
              <div className="text-xl font-bold font-syne truncate max-w-75">
                {item.title}
              </div>
            </div>
          </div>
          <DialogClose className="rounded-full p-2 hover:bg-muted transition-colors">
            <X className="size-5" />
          </DialogClose>
        </div>

        <div className="p-4 lg:hidden border-b border-border bg-muted/50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                {item.year}
              </span>
            </div>
            <h2 className="text-xl font-bold font-syne line-clamp-2">
              {item.title}
            </h2>
          </div>
          <DialogClose className="rounded-full p-2 hover:bg-background/50 transition-colors shrink-0 -mr-2 -mt-2">
            <X className="size-5" />
          </DialogClose>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 py-4 lg:px-6 space-y-6">
            <div>
              <DialogTitle className="sr-only">{item.title}</DialogTitle>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Description
              </h3>
              <div className="text-sm lg:text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
                <Mentions text={item.description} />
              </div>
            </div>

            {item.media && item.media.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Gallery ({item.media.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {item.media.map((mediaItem, i) => (
                    <div
                      key={mediaItem.id}
                      className={cn(
                        "relative aspect-video rounded-lg overflow-hidden bg-muted transition-all duration-300",
                        selectedImageIndex === i
                          ? hasInteracted
                            ? "ring-2 ring-primary z-10"
                            : "lg:ring-2 lg:ring-primary lg:z-10"
                          : "hover:ring-2 hover:ring-primary/50",
                      )}
                    >
                      {!loadedImages.has(mediaItem.imageUrl) && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/30">
                          <Loader2 className="size-5 animate-spin text-primary/50" />
                        </div>
                      )}
                      <Image
                        src={mediaItem.imageUrl}
                        alt={mediaItem.altText}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 50vw"
                        placeholder="empty"
                        onLoad={() =>
                          setLoadedImages((prev) => {
                            const next = new Set(prev);
                            next.add(mediaItem.imageUrl);
                            return next;
                          })
                        }
                      />
                      <button
                        type="button"
                        ref={(el) => {
                          mediaRefs.current[i] = el;
                        }}
                        onClick={() => {
                          setSelectedImageIndex(i);
                          setHasInteracted(true);
                        }}
                        aria-label={`View image: ${mediaItem.altText}`}
                        className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                      />
                      <div className="pointer-events-none absolute inset-0">
                        <span className="pointer-events-auto absolute bottom-1 left-1 right-1 text-[10px] text-white/90 truncate">
                          <Mentions text={mediaItem.altText} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {(item.detailsUrl || (item.downloadUrl && item.showDownload)) && (
          <div className="hidden lg:flex items-center justify-center px-6 py-4 border-t border-border bg-muted/30 shrink-0 gap-3">
            {item.detailsUrl && (
              <a
                href={item.detailsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  size: "lg",
                  className: "text-base font-medium rounded-xl flex-1",
                })}
              >
                Learn More <ExternalLink className="size-4" />
              </a>
            )}
            {item.downloadUrl && item.showDownload && (
              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "text-base font-medium rounded-xl hover:bg-muted flex-1",
                })}
              >
                Download <Download className="size-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineFeature({
  item,
  isAdmin,
  detailsOpen,
  onDetailsOpenChange,
}: {
  item: TimelineItem;
  isAdmin: boolean;
  detailsOpen: boolean;
  onDetailsOpenChange: (open: boolean) => void;
}) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTimelineItem(item.id);
      toast.success("Timeline item deleted successfully");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete timeline item");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
      className="flex min-h-0 flex-1 flex-col items-start justify-center-safe gap-4 py-12 lg:overflow-y-auto lg:py-4 xl:gap-5 xl:py-6"
    >
      <div className="w-full max-w-xl" aria-live="polite" aria-atomic="true">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {item.year}
        </span>
        <h3 className="font-syne text-4xl md:text-5xl lg:text-4xl xl:text-6xl font-semibold leading-tight tracking-tight text-balance wrap-anywhere">
          {item.title}
        </h3>
        <p className="mt-4 text-base md:text-lg lg:text-base xl:text-lg leading-relaxed text-muted-foreground wrap-anywhere">
          {item.subtitle}
        </p>
      </div>
      <div className="flex min-h-11 flex-wrap items-center gap-3">
        {item.showDetails &&
          (item.media.length > 0 ? (
            <Dialog open={detailsOpen} onOpenChange={onDetailsOpenChange}>
              <DialogTrigger
                render={<Button size="lg" className="rounded-full px-5 h-11" />}
              >
                View Details <ChevronRight data-icon="inline-end" />
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="w-screen! h-dvh! max-w-none! max-h-none m-0 p-0 rounded-none border-none bg-background/95"
              >
                <TimelineModalContent item={item} />
              </DialogContent>
            </Dialog>
          ) : (
            item.detailsUrl && (
              <a
                href={item.detailsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  size: "lg",
                  className: "rounded-full px-5 h-11",
                })}
              >
                Learn More <ExternalLink data-icon="inline-end" />
              </a>
            )
          ))}
        {item.showDownload && item.downloadUrl && (
          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "rounded-full px-5 h-11",
            })}
          >
            Download <Download data-icon="inline-end" />
          </a>
        )}
      </div>
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit data-icon="inline-start" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 data-icon="inline-start" /> Delete
          </Button>
        </div>
      )}

      {showEditDialog && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <TimelineEditDialog
            item={item}
            onClose={() => setShowEditDialog(false)}
          />
        </Dialog>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timeline Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{item.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

export default function Timeline({ data }: ComponentProps) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedMomentRef = useRef<HTMLButtonElement>(null);
  const dragScroll = useDragScroll();
  const reduceMotion = useReducedMotion();
  const items = data.timelineItems;
  const linkedItem = items.find(
    (item) =>
      String(item.id) === searchParams.get("timeline") &&
      item.showDetails &&
      item.media.length > 0,
  );
  const selectedItem =
    linkedItem ?? items.find((item) => item.id === selectedId) ?? items[0];
  const selectedIndex = items.indexOf(selectedItem);
  const backgroundUrl =
    selectedItem?.backgroundUrl || selectedItem?.media[0]?.imageUrl;

  const handleDetailsOpenChange = (open: boolean) => {
    setSelectedId(selectedItem.id);
    const url = new URL(window.location.href);
    if (open) {
      url.searchParams.set("timeline", String(selectedItem.id));
      window.history.pushState(null, "", url);
    } else {
      url.searchParams.delete("timeline");
      window.history.replaceState(null, "", url);
    }
  };

  useEffect(() => {
    if (selectedId === null) return;
    selectedMomentRef.current?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: reduceMotion ? "instant" : "smooth",
    });
  }, [selectedId, reduceMotion]);

  return (
    <section>
      <div className="relative isolate grid overflow-hidden bg-background text-foreground px-4 lg:aspect-video">
        {backgroundUrl && (
          <Image
            src={backgroundUrl}
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none -z-10 object-cover object-center"
          />
        )}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-background via-background/80 to-background/30"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-background/95 via-background/60 to-transparent"
          aria-hidden="true"
        />
        <div className="mx-auto flex min-w-0 w-full max-w-7xl flex-col pt-4 pb-7 lg:h-full xl:pt-12 xl:pb-8">
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-4">
            <h2 className="font-syne text-3xl xl:text-4xl font-semibold tracking-tight">
              Our Journey
            </h2>
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                <Linking profiles={data.minecraftProfiles} />
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(true)}
                  className="rounded-full"
                >
                  <Plus data-icon="inline-start" /> Add Timeline Item
                </Button>
              </div>
            )}
          </header>

          {selectedItem ? (
            <>
              <TimelineFeature
                key={selectedItem.id}
                item={selectedItem}
                isAdmin={isAdmin}
                detailsOpen={!!linkedItem}
                onDetailsOpenChange={handleDetailsOpenChange}
              />
              <div className="mb-4 flex shrink-0 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon-lg"
                    className="rounded-full"
                    aria-label="Previous timeline moment"
                    disabled={selectedIndex === 0}
                    onClick={() => setSelectedId(items[selectedIndex - 1].id)}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-lg"
                    className="rounded-full"
                    aria-label="Next timeline moment"
                    disabled={selectedIndex === items.length - 1}
                    onClick={() => setSelectedId(items[selectedIndex + 1].id)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
              <div
                {...dragScroll}
                className="-mx-1 flex shrink-0 select-none snap-x snap-proximity scroll-px-1 items-start gap-4 overflow-x-auto overscroll-x-contain px-1 pt-4 pb-3 data-[dragging]:cursor-grabbing data-[dragging]:snap-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6"
                role="group"
                aria-label="Timeline moments"
              >
                {items.map((item) => {
                  const isSelected = selectedItem.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      ref={isSelected ? selectedMomentRef : null}
                      className={cn(
                        "flex flex-none basis-40 flex-col items-stretch gap-2 rounded-lg text-left text-muted-foreground cursor-inherit snap-start outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring md:basis-56",
                        isSelected && "text-foreground",
                      )}
                      aria-pressed={isSelected}
                      aria-label={`${item.year}: ${item.title}`}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <span
                        className={cn(
                          "relative mb-2 block overflow-hidden rounded-lg bg-muted h-32 cursor-pointer",
                          isSelected &&
                            "outline-2 outline-primary outline-offset-2",
                        )}
                      >
                        {item.thumbnailUrl ? (
                          <Image
                            src={item.thumbnailUrl}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 160px, 224px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="font-syne flex h-full items-center justify-center text-3xl text-muted-foreground">
                            {item.year}
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-medium wrap-anywhere">
                        {item.title}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {item.year}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="py-32 text-muted-foreground">
              No timeline available. Check back soon.
            </p>
          )}
        </div>
      </div>

      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <TimelineEditDialog onClose={() => setShowCreateDialog(false)} />
        </Dialog>
      )}
    </section>
  );
}
