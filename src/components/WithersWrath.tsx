'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ExternalLink, ChevronLeft, ChevronRight, Swords } from 'lucide-react'
import { Button } from './ui/button'
import { motion, AnimatePresence } from 'motion/react'

const images = [
	'/witherswrath/charge.webp',
	'/witherswrath/dying.webp',
	'/witherswrath/spawn.webp',
	'/witherswrath/dying.webp',
	'/witherswrath/half.gif',
]

export default function WithersWrath() {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isHovered, setIsHovered] = useState(false)

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
		<section className="py-24 px-4 relative overflow-hidden">
			<div className="max-w-7xl mx-auto relative z-10">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
					>
						<div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-6">
							<span className="text-sm font-bold uppercase tracking-wider">
								Featured Datapack
							</span>
						</div>

						<div className="flex items-center gap-4 mb-6">
							<div className="relative size-16 rounded-2xl overflow-hidden">
								<Image
									src="/witherswrath/icon.png"
									alt="Withers Wrath Logo"
									fill
									className="object-cover"
								/>
							</div>
							<h2 className="font-syne text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
								Withers Wrath
							</h2>
						</div>

						<p className="text-lg text-muted-foreground leading-relaxed mb-8">
							Experience the ultimate challenge in our custom datapack. Push your
							skills to the limit with enhanced wither battles.
						</p>

						<div className="flex flex-wrap gap-4">
							<Button
								asChild
								size="lg"
								className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8"
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

						<p className="mt-4 text-xs text-muted-foreground uppercase tracking-widest opacity-50">
							#ad
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="order-1 lg:order-2"
					>
						<div
							className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border group"
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
									<Image
										src={images[currentImageIndex]}
										alt="Withers Wrath Gameplay"
										fill
										className="object-cover"
										unoptimized
									/>
									<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
								</motion.div>
							</AnimatePresence>

							<div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<button
									onClick={previousImage}
									className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
								>
									<ChevronLeft className="size-6" />
								</button>
								<button
									onClick={nextImage}
									className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
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
												? 'w-8 bg-white'
												: 'w-2 bg-white/50 hover:bg-white/80'
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
