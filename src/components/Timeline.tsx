'use client'

import { useState } from 'react'
import {
	ExternalLink,
	X,
	Calendar,
	Download,
	ChevronRight,
	Edit,
	Trash2,
	Plus,
	Image as ImageIcon,
	GripVertical,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useSession } from '@/lib/auth-client'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import {
	createTimelineItem,
	updateTimelineItem,
	deleteTimelineItem,
	addTimelineMedia,
	updateTimelineMedia,
	deleteTimelineMedia,
} from '@/app/actions/timeline'
import { toast } from 'sonner'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type TimelineItemType = ComponentProps['data']['timelineItems'][0]
type MediaItemType = TimelineItemType['media'][0]

function SortableMediaItem({
	media,
	editingMediaId,
	onEdit,
	onDelete,
}: {
	media: MediaItemType
	editingMediaId: number | null
	onEdit: (media: MediaItemType) => void
	onDelete: (id: number) => void
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: media.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				'flex items-center gap-2 p-2 border rounded-md bg-background',
				editingMediaId === media.id && 'ring-2 ring-primary',
				isDragging && 'opacity-50 shadow-lg',
			)}
		>
			<button
				className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="size-4 text-muted-foreground" />
			</button>
			<div className="relative size-12 rounded overflow-hidden bg-muted shrink-0">
				<Image
					src={media.imageUrl}
					alt={media.altText}
					fill
					className="object-cover"
				/>
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm wrap-anywhere max-w-96">{media.altText}</p>
				{media.galleryImage && (
					<span className="text-xs text-primary">• Gallery</span>
				)}
			</div>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onEdit(media)}
				disabled={editingMediaId !== null}
			>
				<Edit className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onDelete(media.id)}
				disabled={editingMediaId !== null}
			>
				<Trash2 className="size-4" />
			</Button>
		</div>
	)
}

function TimelineEditDialog({
	item,
	onClose,
}: {
	item?: TimelineItemType
	onClose: () => void
}) {
	const [formData, setFormData] = useState({
		title: item?.title || '',
		subtitle: item?.subtitle || '',
		description: item?.description || '',
		year: item?.year || new Date().getFullYear(),
		showDetails: item?.showDetails || false,
		showDownload: item?.showDownload || false,
		detailsUrl: item?.detailsUrl || '',
		downloadUrl: item?.downloadUrl || '',
	})
	const [mediaItems, setMediaItems] = useState(item?.media || [])
	const [newMediaUrl, setNewMediaUrl] = useState('')
	const [newMediaAlt, setNewMediaAlt] = useState('')
	const [newMediaGalleryImage, setNewMediaGalleryImage] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editingMediaId, setEditingMediaId] = useState<number | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	const handleSave = async () => {
		if (!formData.title || !formData.subtitle || !formData.description) {
			toast.error('Please fill in all required fields')
			return
		}

		setIsSaving(true)
		try {
			if (item) {
				await updateTimelineItem(item.id, formData)
				toast.success('Timeline item updated successfully')
			} else {
				await createTimelineItem(formData)
				toast.success('Timeline item created successfully')
			}
			onClose()
		} catch (error) {
			toast.error('Failed to save timeline item')
			console.error(error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleAddMedia = async () => {
		if (!newMediaUrl || !newMediaAlt || !item) return

		try {
			const media = await addTimelineMedia(item.id, {
				imageUrl: newMediaUrl,
				altText: newMediaAlt,
				displayOrder: mediaItems.length,
				galleryImage: newMediaGalleryImage,
			})
			setMediaItems([...mediaItems, media])
			setNewMediaUrl('')
			setNewMediaAlt('')
			setNewMediaGalleryImage(false)
			toast.success('Media added successfully')
		} catch (error) {
			toast.error('Failed to add media')
			console.error(error)
		}
	}

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event
		if (!over || active.id === over.id) return

		const oldIndex = mediaItems.findIndex(m => m.id === active.id)
		const newIndex = mediaItems.findIndex(m => m.id === over.id)

		const newItems = arrayMove(mediaItems, oldIndex, newIndex)
		setMediaItems(newItems)

		try {
			await Promise.all(
				newItems.map((item, index) =>
					updateTimelineMedia(item.id, { displayOrder: index }),
				),
			)
			toast.success('Order updated')
		} catch (error) {
			toast.error('Failed to update order')
			console.error(error)
		}
	}

	const handleStartEdit = (media: MediaItemType) => {
		setEditingMediaId(media.id)
		setNewMediaUrl(media.imageUrl)
		setNewMediaAlt(media.altText)
		setNewMediaGalleryImage(media.galleryImage)
	}

	const handleCancelEdit = () => {
		setEditingMediaId(null)
		setNewMediaUrl('')
		setNewMediaAlt('')
		setNewMediaGalleryImage(false)
	}

	const handleUpdateMedia = async () => {
		if (!editingMediaId || !newMediaUrl || !newMediaAlt) return

		try {
			const updated = await updateTimelineMedia(editingMediaId, {
				imageUrl: newMediaUrl,
				altText: newMediaAlt,
				galleryImage: newMediaGalleryImage,
			})
			setMediaItems(
				mediaItems.map(m => (m.id === editingMediaId ? { ...m, ...updated } : m)),
			)
			setEditingMediaId(null)
			setNewMediaUrl('')
			setNewMediaAlt('')
			setNewMediaGalleryImage(false)
			toast.success('Media updated successfully')
		} catch (error) {
			toast.error('Failed to update media')
			console.error(error)
		}
	}

	const handleDeleteMedia = async (mediaId: number) => {
		try {
			await deleteTimelineMedia(mediaId)
			setMediaItems(mediaItems.filter(m => m.id !== mediaId))
			toast.success('Media deleted successfully')
		} catch (error) {
			toast.error('Failed to delete media')
			console.error(error)
		}
	}

	return (
		<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
			<DialogTitle>
				{item ? 'Edit Timeline Item' : 'Create Timeline Item'}
			</DialogTitle>
			<DialogDescription>
				{item
					? 'Update the timeline item details below'
					: 'Create a new timeline item'}
			</DialogDescription>

			<div className="space-y-4 py-4">
				<div>
					<label className="text-sm font-medium">Title *</label>
					<Input
						value={formData.title}
						onChange={e => setFormData({ ...formData, title: e.target.value })}
						placeholder="Timeline title"
					/>
				</div>

				<div>
					<label className="text-sm font-medium">Subtitle *</label>
					<Input
						value={formData.subtitle}
						onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
						placeholder="Short description"
					/>
				</div>

				<div>
					<label className="text-sm font-medium">Description *</label>
					<textarea
						value={formData.description}
						onChange={e => setFormData({ ...formData, description: e.target.value })}
						placeholder="Full description"
						className="w-full min-h-25 p-2 border rounded-md resize-none bg-background text-foreground"
					/>
				</div>

				<div>
					<label className="text-sm font-medium">Year *</label>
					<Input
						type="number"
						value={formData.year}
						onChange={e =>
							setFormData({ ...formData, year: parseInt(e.target.value) || 0 })
						}
						placeholder="2024"
					/>
				</div>

				<div className="flex items-center justify-between">
					<label className="text-sm font-medium">Show Details</label>
					<Switch
						checked={formData.showDetails}
						onCheckedChange={checked =>
							setFormData({ ...formData, showDetails: checked })
						}
					/>
				</div>

				{formData.showDetails && (
					<div>
						<label className="text-sm font-medium">Details URL</label>
						<Input
							value={formData.detailsUrl}
							onChange={e => setFormData({ ...formData, detailsUrl: e.target.value })}
							placeholder="https://..."
						/>
					</div>
				)}

				<div className="flex items-center justify-between">
					<label className="text-sm font-medium">Show Download</label>
					<Switch
						checked={formData.showDownload}
						onCheckedChange={checked =>
							setFormData({ ...formData, showDownload: checked })
						}
					/>
				</div>

				{formData.showDownload && (
					<div>
						<label className="text-sm font-medium">Download URL</label>
						<Input
							value={formData.downloadUrl}
							onChange={e => setFormData({ ...formData, downloadUrl: e.target.value })}
							placeholder="https://..."
						/>
					</div>
				)}

				{item && (
					<div className="border-t pt-4">
						<h3 className="text-sm font-medium mb-3 flex items-center gap-2">
							<ImageIcon className="size-4" />
							Media Items
							<span className="text-xs text-muted-foreground ml-auto">
								Drag to reorder
							</span>
						</h3>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={mediaItems.map(m => m.id)}
								strategy={verticalListSortingStrategy}
							>
								<div className="space-y-2 mb-3">
									{mediaItems.map(media => (
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

						<div className="space-y-2">
							<Input
								value={newMediaUrl}
								onChange={e => setNewMediaUrl(e.target.value)}
								placeholder="Image URL"
							/>
							<Input
								value={newMediaAlt}
								onChange={e => setNewMediaAlt(e.target.value)}
								placeholder="Image description"
							/>
							<div className="flex items-center gap-2 px-3 py-2 border rounded-md">
								<label className="text-sm text-muted-foreground">Show in Gallery</label>
								<Switch
									checked={newMediaGalleryImage}
									onCheckedChange={setNewMediaGalleryImage}
								/>
							</div>
							{editingMediaId ? (
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={handleCancelEdit}
										className="flex-1"
									>
										Cancel
									</Button>
									<Button
										variant="default"
										size="sm"
										onClick={handleUpdateMedia}
										disabled={!newMediaUrl || !newMediaAlt}
										className="flex-1"
									>
										<Edit className="size-4" />
										Update Media
									</Button>
								</div>
							) : (
								<Button
									variant="outline"
									size="sm"
									onClick={handleAddMedia}
									disabled={!newMediaUrl || !newMediaAlt}
									className="w-full"
								>
									<Plus className="size-4" />
									Add Media
								</Button>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={onClose} disabled={isSaving}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</DialogContent>
	)
}

function TimelineModalContent({
	item,
}: {
	item: ComponentProps['data']['timelineItems'][0]
}) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)

	const selectedImage = item.media?.[selectedImageIndex]

	return (
		<div className="flex flex-col md:flex-row w-full h-[90vh] md:h-[85vh] max-h-225">
			<div className="flex-1 relative bg-black/50 flex items-center justify-center min-h-62.5 md:min-h-0">
				{selectedImage ? (
					<div className="relative w-full h-full">
						<Image
							src={selectedImage.imageUrl}
							alt={selectedImage.altText}
							fill
							className="object-contain"
							priority
						/>
						<div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-linear-to-t from-black/80 to-transparent">
							<p className="text-white/90 text-xs md:text-sm font-medium">
								{selectedImage.altText}
							</p>
						</div>
					</div>
				) : (
					<div className="text-muted-foreground text-sm">No image selected</div>
				)}
			</div>

			<div className="w-full md:max-w-sm flex flex-col border-t md:border-t-0 md:border-l border-border/50 bg-background max-h-[40vh] md:max-h-none">
				<div className="p-3 md:p-4 border-b border-border/50 flex items-center justify-between shrink-0">
					<div className="flex items-center gap-2 text-primary font-mono text-xs md:text-sm">
						<Calendar className="size-3 md:size-4" />
						{item.year}
					</div>
					<DialogClose className="rounded-full p-2 hover:bg-muted transition-colors">
						<X className="size-4 md:size-5" />
					</DialogClose>
				</div>

				<ScrollArea className="flex-1 overflow-auto">
					<div className="p-3 md:p-4 space-y-4 md:space-y-6">
						<div>
							<DialogTitle className="text-xl md:text-2xl font-bold font-syne mb-2">
								{item.title}
							</DialogTitle>
							<DialogDescription className="text-xs md:text-sm text-muted-foreground leading-relaxed">
								{item.description}
							</DialogDescription>
						</div>

						{item.media && item.media.length > 0 && (
							<div>
								<div className="grid grid-cols-2 gap-2">
									{item.media.map((mediaItem, i) => (
										<button
											key={mediaItem.id}
											onClick={() => setSelectedImageIndex(i)}
											className={cn(
												'relative aspect-video rounded-lg overflow-hidden bg-muted ring-2 transition-all hover:ring-primary/50',
												selectedImageIndex === i ? 'ring-primary' : 'ring-transparent',
											)}
										>
											<Image
												src={mediaItem.imageUrl}
												alt={mediaItem.altText}
												fill
												className="object-cover"
												sizes="150px"
											/>
											<div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
												<span className="absolute bottom-1 left-1 right-1 text-[10px] text-white/90 truncate">
													{mediaItem.altText}
												</span>
											</div>
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</ScrollArea>

				{item.detailsUrl && (
					<div className="p-3 md:p-4 border-t border-border/50 shrink-0">
						<Button
							asChild
							className="w-full rounded-full shadow-lg shadow-primary/20"
							size="sm"
						>
							<a href={item.detailsUrl} target="_blank">
								Learn More <ExternalLink className="ml-2 size-3 md:size-4" />
							</a>
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}

function TimelineRow({
	item,
	index,
	isAdmin,
}: {
	item: ComponentProps['data']['timelineItems'][0]
	index: number
	isAdmin: boolean
}) {
	const isEven = index % 2 === 0
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			await deleteTimelineItem(item.id)
			toast.success('Timeline item deleted successfully')
			setShowDeleteDialog(false)
		} catch (error) {
			toast.error('Failed to delete timeline item')
			console.error(error)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<motion.div
			className={cn(
				'relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0 group',
				isEven ? 'md:flex-row-reverse' : '',
			)}
			initial={{ opacity: 0, y: 50 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-10% 0px' }}
			transition={{ duration: 0.6, delay: index * 0.1 }}
		>
			<div
				className={cn(
					'hidden md:flex w-1/2 flex-col justify-center px-16',
					isEven ? 'items-start text-left' : 'items-end text-right',
				)}
			>
				<div className="text-8xl font-bold font-syne text-primary/30 select-none transition-colors duration-500 group-hover:text-primary/40">
					{item.year}
				</div>
			</div>

			<div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
				<div className="w-4 h-4 rounded-full bg-background border-2 border-primary ring-4 ring-background shadow-[0_0_20px_rgba(var(--primary),0.3)] z-10 transition-transform duration-500 group-hover:scale-150" />
			</div>

			<div
				className={cn(
					'w-full md:w-1/2 pl-16 md:pl-0',
					isEven ? 'md:pr-16' : 'md:pl-16',
				)}
			>
				<Card className="border-primary/10 backdrop-blur-md hover:border-primary/20 transition-all duration-500 group/card overflow-hidden bg-transparent border-none">
					<CardContent className="p-6 md:p-8">
						{isAdmin && (
							<div className="flex gap-2 mb-4">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowEditDialog(true)}
									className="rounded-full"
								>
									<Edit className="size-3 mr-1" />
									Edit
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowDeleteDialog(true)}
									className="rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
								>
									<Trash2 className="size-3 mr-1" />
									Delete
								</Button>
							</div>
						)}

						<div className="md:hidden flex items-center gap-2 text-primary font-bold mb-4 font-mono">
							<Calendar className="size-4" />
							{item.year}
						</div>

						<h3 className="text-2xl md:text-3xl font-bold font-syne mb-3 group-hover/card:text-primary transition-colors duration-300">
							{item.title}
						</h3>
						<p className="text-muted-foreground mb-6 leading-relaxed text-base">
							{item.subtitle}
						</p>

						<div className="flex flex-wrap gap-3">
							{item.showDownload && item.downloadUrl && (
								<Button
									asChild
									variant="outline"
									size="sm"
									className="rounded-full hover:bg-primary dark:hover:text-white hover:text-primary-foreground transition-all duration-300 group/btn"
								>
									<a href={item.downloadUrl} target="_blank">
										Download
										<Download className="ml-1 size-3 group-hover/btn:translate-y-0.5 transition-transform" />
									</a>
								</Button>
							)}

							{item.showDetails &&
								(item.media && item.media.length > 0 ? (
									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant="default"
												size="sm"
												className="rounded-full group/btn shadow-lg shadow-primary/20"
											>
												View Details
												<ChevronRight className="ml-1 size-3 group-hover/btn:translate-x-0.5 transition-transform" />
											</Button>
										</DialogTrigger>
										<DialogContent
											showCloseButton={false}
											className="max-w-6xl w-[95vw] h-[90vh] md:h-auto p-0 overflow-hidden bg-background/95 backdrop-blur-2xl border-border/50"
										>
											<TimelineModalContent item={item} />
										</DialogContent>
									</Dialog>
								) : (
									item.detailsUrl && (
										<Button
											asChild
											variant="default"
											size="sm"
											className="rounded-full group/btn shadow-lg shadow-primary/20"
										>
											<a href={item.detailsUrl} target="_blank">
												Learn More
												<ChevronRight className="ml-2 size-3 group-hover/btn:translate-x-0.5 transition-transform" />
											</a>
										</Button>
									)
								))}
						</div>
					</CardContent>
				</Card>
			</div>

			{showEditDialog && (
				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<TimelineEditDialog item={item} onClose={() => setShowEditDialog(false)} />
				</Dialog>
			)}

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Timeline Item?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{item.title}"? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</motion.div>
	)
}

export default function Timeline({ data }: ComponentProps) {
	const { data: session } = useSession()
	const isAdmin = session?.user?.role === 'admin'
	const [showCreateDialog, setShowCreateDialog] = useState(false)

	return (
		<section className="py-16 md:py-20 relative overflow-hidden">
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--primary),transparent_50%)] opacity-10" />

			<div className="max-w-6xl mx-auto">
				<motion.div
					className="text-center mb-24"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
				>
					<h2 className="font-syne text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-linear-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
						Our Journey
					</h2>
					{isAdmin && (
						<Button
							onClick={() => setShowCreateDialog(true)}
							className="rounded-full shadow-lg shadow-primary/20"
						>
							<Plus className="size-4" />
							Add Timeline Item
						</Button>
					)}
				</motion.div>

				<div className="relative">
					<div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2 bg-linear-to-b from-primary/0 via-primary/20 to-primary/0 hidden md:block" />

					<div className="absolute left-6 top-0 bottom-0 w-px bg-linear-to-b from-primary/0 via-primary/20 to-primary/0 md:hidden" />

					<div className="space-y-24 md:space-y-32">
						{data.timelineItems.map((item, index) => (
							<TimelineRow
								key={`${item.year}-${index}`}
								item={item}
								index={index}
								isAdmin={isAdmin}
							/>
						))}
					</div>
				</div>
			</div>

			{showCreateDialog && (
				<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
					<TimelineEditDialog onClose={() => setShowCreateDialog(false)} />
				</Dialog>
			)}
		</section>
	)
}
