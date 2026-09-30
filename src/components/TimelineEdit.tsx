"use client";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  addTimelineMedia,
  createTimelineItem,
  deleteTimelineMedia,
  updateTimelineItem,
  updateTimelineMedia,
} from "@/app/actions/timeline";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function SortableMediaItem({
  media,
  editingMediaId,
  onEdit,
  onDelete,
}: {
  media: TimelineMediaItem;
  editingMediaId: number | null;
  onEdit: (media: TimelineMediaItem) => void;
  onDelete: (id: number) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id, disabled: editingMediaId !== null });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex shrink-0 items-center gap-2 p-2 border border-border rounded-lg",
        editingMediaId === media.id && "ring-2 ring-primary border-primary",
        isDragging && "opacity-50 shadow-xl",
      )}
    >
      <button
        type="button"
        aria-label={`Reorder ${media.altText}`}
        className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4 text-muted-foreground" />
      </button>
      <div className="relative size-12 rounded overflow-hidden bg-muted shrink-0">
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40">
            <Loader2 className="size-4 animate-spin text-primary/50" />
          </div>
        )}
        <Image
          src={media.imageUrl}
          alt={media.altText}
          fill
          sizes="48px"
          className="object-cover"
          placeholder="empty"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm line-clamp-2 wrap-anywhere">{media.altText}</p>
        {media.galleryImage && (
          <span className="text-xs text-primary">• Gallery</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit ${media.altText}`}
        onClick={() => onEdit(media)}
        disabled={editingMediaId !== null}
      >
        <Edit />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${media.altText}`}
        onClick={() => onDelete(media.id)}
        disabled={editingMediaId !== null}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

export default function TimelineEditDialog({
  item,
  onClose,
}: {
  item?: TimelineItem;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    subtitle: item?.subtitle || "",
    description: item?.description || "",
    thumbnailUrl: item?.thumbnailUrl || "",
    backgroundUrl: item?.backgroundUrl || "",
    year: item?.year || new Date().getFullYear(),
    showDetails: item?.showDetails || false,
    showDownload: item?.showDownload || false,
    detailsUrl: item?.detailsUrl || "",
    downloadUrl: item?.downloadUrl || "",
  });
  const [mediaItems, setMediaItems] = useState(item?.media || []);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaAlt, setNewMediaAlt] = useState("");
  const [newMediaGalleryImage, setNewMediaGalleryImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMediaId, setEditingMediaId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const mediaUrlRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleSave = async () => {
    if (!formData.title || !formData.subtitle || !formData.description) {
      setActiveTab("details");
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      if (item) {
        await updateTimelineItem(item.id, formData);
        toast.success("Timeline item updated successfully");
      } else {
        await createTimelineItem(formData);
        toast.success("Timeline item created successfully");
      }
      onClose();
    } catch (error) {
      toast.error("Failed to save timeline item");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMedia = async () => {
    if (!newMediaUrl || !newMediaAlt || !item) return;

    try {
      const media = await addTimelineMedia(item.id, {
        imageUrl: newMediaUrl,
        altText: newMediaAlt,
        displayOrder: mediaItems.length,
        galleryImage: newMediaGalleryImage,
      });
      setMediaItems([...mediaItems, media]);
      setNewMediaUrl("");
      setNewMediaAlt("");
      setNewMediaGalleryImage(false);
      toast.success("Media added successfully");
    } catch (error) {
      toast.error("Failed to add media");
      console.error(error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = mediaItems.findIndex((m) => m.id === active.id);
    const newIndex = mediaItems.findIndex((m) => m.id === over.id);

    const newItems = arrayMove(mediaItems, oldIndex, newIndex);
    setMediaItems(newItems);

    try {
      await Promise.all(
        newItems.map((item, index) =>
          updateTimelineMedia(item.id, { displayOrder: index }),
        ),
      );
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to update order");
      console.error(error);
    }
  };

  const handleStartEdit = (media: TimelineMediaItem) => {
    setEditingMediaId(media.id);
    setNewMediaUrl(media.imageUrl);
    setNewMediaAlt(media.altText);
    setNewMediaGalleryImage(media.galleryImage);
    mediaUrlRef.current?.focus({ preventScroll: true });
    mediaUrlRef.current?.scrollIntoView({
      behavior: reduceMotion ? "instant" : "smooth",
      block: "center",
    });
  };

  const handleCancelEdit = () => {
    setEditingMediaId(null);
    setNewMediaUrl("");
    setNewMediaAlt("");
    setNewMediaGalleryImage(false);
  };

  const handleUpdateMedia = async () => {
    if (!editingMediaId || !newMediaUrl || !newMediaAlt) return;

    try {
      const updated = await updateTimelineMedia(editingMediaId, {
        imageUrl: newMediaUrl,
        altText: newMediaAlt,
        galleryImage: newMediaGalleryImage,
      });
      setMediaItems(
        mediaItems.map((m) =>
          m.id === editingMediaId ? { ...m, ...updated } : m,
        ),
      );
      setEditingMediaId(null);
      setNewMediaUrl("");
      setNewMediaAlt("");
      setNewMediaGalleryImage(false);
      toast.success("Media updated successfully");
    } catch (error) {
      toast.error("Failed to update media");
      console.error(error);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    try {
      await deleteTimelineMedia(mediaId);
      setMediaItems(mediaItems.filter((m) => m.id !== mediaId));
      toast.success("Media deleted successfully");
    } catch (error) {
      toast.error("Failed to delete media");
      console.error(error);
    }
  };

  return (
    <DialogContent className="flex h-[min(44rem,90dvh)] max-w-3xl flex-col gap-0 overflow-hidden p-0">
      <DialogHeader className="shrink-0 px-5 pt-6 pb-5 pr-12 sm:px-7 sm:pr-12">
        <DialogTitle>
          {item ? "Edit timeline item" : "New timeline item"}
        </DialogTitle>
        <DialogDescription>
          {item ? item.title : "Add a new chapter to your community’s story."}
        </DialogDescription>
      </DialogHeader>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(String(value))}
        className="min-h-0 flex-1 gap-0"
      >
        <div className="shrink-0 border-b px-5 sm:px-7">
          <TabsList
            variant="line"
            className="w-full justify-start gap-4 sm:w-auto sm:gap-6"
          >
            <TabsTrigger value="details" className="pb-3">
              Details
            </TabsTrigger>
            <TabsTrigger value="images" className="pb-3">
              Images
            </TabsTrigger>
            <TabsTrigger value="links" className="pb-3">
              Links
            </TabsTrigger>
            {item && (
              <TabsTrigger value="media" className="pb-3">
                Media{" "}
                <span className="text-xs tabular-nums text-muted-foreground">
                  {mediaItems.length}
                </span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        <TabsContent
          value="details"
          className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7"
        >
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-[1fr_7rem]">
              <Field>
                <FieldLabel htmlFor="timeline-title">
                  Title <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="timeline-title"
                  className="h-10"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. FTB StoneBlock 4"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="timeline-year">
                  Year <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="timeline-year"
                  className="h-10"
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="timeline-subtitle">
                Subtitle <span aria-hidden="true">*</span>
              </FieldLabel>
              <Input
                id="timeline-subtitle"
                className="h-10"
                required
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="A short introduction"
                aria-describedby="timeline-subtitle-help"
              />
              <FieldDescription id="timeline-subtitle-help">
                Shown below the title on the timeline.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="timeline-description">
                Description <span aria-hidden="true">*</span>
              </FieldLabel>
              <Textarea
                id="timeline-description"
                required
                className="min-h-36 resize-y"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Tell the story of this server or modpack…"
                aria-describedby="timeline-description-help"
              />
              <FieldDescription id="timeline-description-help">
                The full story, shown when visitors open the details.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </TabsContent>
        <TabsContent
          value="images"
          className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="timeline-thumbnail">
                Timeline thumbnail
              </FieldLabel>
              <Input
                id="timeline-thumbnail"
                className="h-10"
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                placeholder="https://…"
                aria-describedby="timeline-thumbnail-help"
              />
              <FieldDescription id="timeline-thumbnail-help">
                A cover image for the timeline strip. Leave blank to show the
                year.
              </FieldDescription>
            </Field>
            <Separator />
            <Field>
              <FieldLabel htmlFor="timeline-background">
                Background image
              </FieldLabel>
              <Input
                id="timeline-background"
                className="h-10"
                type="url"
                value={formData.backgroundUrl}
                onChange={(e) =>
                  setFormData({ ...formData, backgroundUrl: e.target.value })
                }
                placeholder="https://…"
                aria-describedby="timeline-background-help"
              />
              <FieldDescription id="timeline-background-help">
                The large backdrop behind this entry. Leave blank to use its
                first media image.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </TabsContent>
        <TabsContent
          value="links"
          className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7"
        >
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="timeline-show-details">
                  Show details
                </FieldLabel>
                <FieldDescription>
                  Let visitors open the gallery and read more.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="timeline-show-details"
                checked={formData.showDetails}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, showDetails: checked })
                }
              />
            </Field>
            {formData.showDetails && (
              <Field>
                <FieldLabel htmlFor="timeline-details-url">
                  Learn more URL
                </FieldLabel>
                <Input
                  id="timeline-details-url"
                  className="h-10"
                  type="url"
                  value={formData.detailsUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, detailsUrl: e.target.value })
                  }
                  placeholder="https://…"
                  aria-describedby="timeline-details-help"
                />
                <FieldDescription id="timeline-details-help">
                  Optional external page, such as the modpack website.
                </FieldDescription>
              </Field>
            )}
            <Separator />
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="timeline-show-download">
                  Show download
                </FieldLabel>
                <FieldDescription>
                  Add a download button to this entry.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="timeline-show-download"
                checked={formData.showDownload}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, showDownload: checked })
                }
              />
            </Field>
            {formData.showDownload && (
              <Field>
                <FieldLabel htmlFor="timeline-download-url">
                  Download URL
                </FieldLabel>
                <Input
                  id="timeline-download-url"
                  className="h-10"
                  type="url"
                  value={formData.downloadUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, downloadUrl: e.target.value })
                  }
                  placeholder="https://…"
                />
              </Field>
            )}
          </FieldGroup>
        </TabsContent>
        {item && (
          <TabsContent
            value="media"
            className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7"
          >
            <div className="flex min-h-0 flex-col md:h-full">
              <div className="mb-5 flex shrink-0 flex-col gap-1">
                <h3 className="font-medium">Gallery media</h3>
                <p className="text-sm text-muted-foreground">
                  Drag to reorder. Media changes are saved immediately.
                </p>
              </div>
              <div className="grid min-h-0 flex-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_16rem] md:items-stretch">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={mediaItems.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex max-h-64 min-h-0 min-w-0 flex-col gap-2 overflow-y-auto overscroll-contain p-1 md:max-h-none">
                      {mediaItems.length === 0 && (
                        <p className="py-8 text-sm text-muted-foreground">
                          Add your first image using the media form.
                        </p>
                      )}
                      {mediaItems.map((media) => (
                        <SortableMediaItem
                          key={media.id}
                          media={media}
                          editingMediaId={editingMediaId}
                          onEdit={handleStartEdit}
                          onDelete={handleDeleteMedia}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <FieldGroup className="min-w-0 gap-4">
                  <h3 className="font-medium">
                    {editingMediaId ? "Edit image" : "Add an image"}
                  </h3>
                  <Field>
                    <FieldLabel htmlFor="timeline-media-url">
                      Image URL
                    </FieldLabel>
                    <Input
                      ref={mediaUrlRef}
                      id="timeline-media-url"
                      className="h-10"
                      type="url"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="timeline-media-alt">
                      Image description
                    </FieldLabel>
                    <Textarea
                      id="timeline-media-alt"
                      className="min-h-20 resize-y"
                      value={newMediaAlt}
                      onChange={(e) => setNewMediaAlt(e.target.value)}
                      placeholder="What’s happening in this image?"
                    />
                  </Field>
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor="timeline-media-gallery">
                      Show in site gallery
                    </FieldLabel>
                    <Switch
                      id="timeline-media-gallery"
                      checked={newMediaGalleryImage}
                      onCheckedChange={setNewMediaGalleryImage}
                    />
                  </Field>
                  <div className="flex gap-2">
                    {editingMediaId && (
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      className="flex-1"
                      onClick={
                        editingMediaId ? handleUpdateMedia : handleAddMedia
                      }
                      disabled={!newMediaUrl || !newMediaAlt}
                    >
                      {editingMediaId ? (
                        <Edit data-icon="inline-start" />
                      ) : (
                        <Plus data-icon="inline-start" />
                      )}
                      {editingMediaId ? "Update image" : "Add image"}
                    </Button>
                  </div>
                </FieldGroup>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
      <div className="flex shrink-0 items-center justify-between gap-4 border-t px-5 py-4 sm:px-7">
        <p className="hidden text-xs text-muted-foreground sm:block">
          * Required fields
        </p>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            className="flex-1 sm:flex-none"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            )}
            {isSaving ? "Saving…" : item ? "Save changes" : "Create item"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
