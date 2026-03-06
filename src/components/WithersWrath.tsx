'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ExternalLink, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { motion, AnimatePresence } from 'motion/react'

const images = [
	'/witherswrath/spawn.webp',
	'/witherswrath/half.gif',
	'/witherswrath/charge.webp',
	'/witherswrath/homing.webp',
	'/witherswrath/dying.webp',
]

export default function WithersWrath() {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isHovered, setIsHovered] = useState(false)
	const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

	useEffect(() => {
		if (isHovered) return

		const interval = setInterval(() => {
			setCurrentImageIndex(prev => (prev + 1) % images.length)
		}, 5000)

		return () => clearInterval(interval)
	}, [isHovered])

	const nextImage = () => {
		setCurrentImageIndex(prev => (prev + 1) % images.length)
	}

	const previousImage = () => {
		setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
	}

	return (
		<section className="py-16 lg:py-20 px-4 relative overflow-hidden">
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
								{!loadedImages.has('/witherswrath/icon.png') && (
									<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/30">
										<Loader2 className="size-5 animate-spin text-primary/50" />
									</div>
								)}
								<Image
									src="/witherswrath/icon.png"
									alt="Withers Wrath Logo"
									fill
									className="object-cover"
									onLoad={() =>
										setLoadedImages(prev => {
											const next = new Set(prev)
											next.add('/witherswrath/icon.png')
											return next
										})
									}
								/>
							</div>
							<h2 className="font-syne text-4xl lg:text-5xl font-bold bg-linear-to-r from-[#9333EA] to-[#fd7704] bg-clip-text text-transparent">
								Wither&apos;s Wrath
							</h2>
						</div>

						<p className="text-lg text-muted-foreground leading-relaxed lg:mb-8 mb-4 lg:text-left text-center">
							Experience the ultimate challenge in our custom datapack. Push your
							skills to the limit with enhanced wither battles.
						</p>

						<div className="flex flex-wrap gap-4 lg:justify-start justify-center">
							<Button
								asChild
								size="lg"
								className="bg-[#9333EA] hover:bg-[#7C22CB] text-white rounded-full px-8"
							>
								<a
									href="https://modrinth.com/datapack/witherswrath/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span>View on Modrinth</span>
									<ExternalLink className="ml-2 size-4" />
								</a>
							</Button>
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
											<Loader2 className="size-8 animate-spin text-primary/50" />
										</div>
									)}
									<Image
										src={images[currentImageIndex]}
										alt="Withers Wrath Gameplay"
										fill
										className="object-cover"
										unoptimized
										onLoad={() =>
											setLoadedImages(prev => {
												const next = new Set(prev)
												next.add(images[currentImageIndex])
												return next
											})
										}
									/>
									<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
								</motion.div>
							</AnimatePresence>

							<div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<button
									onClick={previousImage}
									className="p-2 rounded-full bg-background/90 text-foreground hover:bg-[#9333EA] hover:text-white border border-border/50 backdrop-blur-sm transition-colors"
								>
									<ChevronLeft className="size-6" />
								</button>
								<button
									onClick={nextImage}
									className="p-2 rounded-full bg-background/90 text-foreground hover:bg-[#9333EA] hover:text-white border border-border/50 backdrop-blur-sm transition-colors"
								>
									<ChevronRight className="size-6" />
								</button>
							</div>

							<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
								{images.map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentImageIndex(index)}
										className={`h-1.5 rounded-full transition-all duration-300 ${
											index === currentImageIndex
												? 'w-8 bg-[#9333EA]'
												: 'w-2 bg-white/50 hover:bg-[#9333EA]/80'
										}`}
									/>
								))}
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	)
}
