'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useAnimationControls } from 'motion/react'

export default function Gallery({ data }: ComponentProps) {
	const [width, setWidth] = useState(0)
	const carousel = useRef<HTMLDivElement>(null)
	const controls = useAnimationControls()

	const DURATION_PER_IMAGE = 5.5

	useEffect(() => {
		if (carousel.current) {
			setWidth(carousel.current.scrollWidth / 2)
		}
	}, [carousel])

	useEffect(() => {
		if (width > 0) {
			controls.start({
				x: -width,
				transition: {
					duration: data.galleryImages.length * DURATION_PER_IMAGE,
					ease: 'linear',
					repeat: Infinity,
					repeatDelay: 0,
					repeatType: 'loop',
				},
			})
		}
	}, [controls, width, data.galleryImages.length])

	return (
		<div className="relative w-full overflow-hidden py-8">
			<div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-black to-transparent z-10 pointer-events-none" />
			<div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-black to-transparent z-10 pointer-events-none" />

			<motion.div
				ref={carousel}
				className="flex gap-6"
				animate={controls}
				initial={{ x: 0 }}
				style={{
					width: 'fit-content',
				}}
			>
				{[...data.galleryImages, ...data.galleryImages, ...data.galleryImages].map(
					(item, index) => (
						<div
							key={`${item.imageUrl}-${index}`}
							className="group min-w-87.5 min-h-55 relative rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm"
						>
							<Image
								src={item.imageUrl}
								alt={item.altText}
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-110"
								priority
								sizes="(max-width: 768px) 100vw, 33vw"
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
								<div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
									<span className="text-white font-medium font-syne text-lg drop-shadow-md">
										{item.altText}
									</span>
								</div>
							</div>
							<div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none group-hover:ring-primary/50 transition-colors duration-300" />
						</div>
					)
				)}
			</motion.div>
		</div>
	)
}
