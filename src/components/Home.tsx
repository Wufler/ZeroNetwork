'use client'
import Header from './Header'
import Gallery from './Gallery'
import Timeline from './Timeline'
import Features from './Features'
import Team from './Team'
import Footer from './Footer'
import WithersWrath from './WithersWrath'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export default function Home({ data }: ComponentProps) {
	const [gifPlayed, setGifPlayed] = useState(false)
	const [showGif, setShowGif] = useState(false)
	const [buh, setBuh] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const preloadImg = new Promise(resolve => {
			const img = new globalThis.Image()
			img.src = '/temp/skeleton.gif'
			img.onload = resolve
			img.onerror = resolve
		})

		const minDelay = new Promise(resolve => setTimeout(resolve, 800))

		Promise.all([preloadImg, minDelay]).then(() => {
			setIsLoading(false)
		})
	}, [])

	useEffect(() => {
		if (buh) {
			const originalClass = document.body.className
			document.body.className = 'sus'

			return () => {
				document.body.className = originalClass
			}
		}
	}, [buh])

	useEffect(() => {
		if (isLoading) return

		const handleScroll = () => {
			if (!gifPlayed) {
				setShowGif(true)
				setGifPlayed(true)
				setTimeout(() => {
					setShowGif(false)
					setBuh(true)
				}, 1000)
			}
		}

		window.addEventListener('scroll', handleScroll, { once: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [gifPlayed, isLoading])

	return (
		<>
			<AnimatePresence>
				{isLoading && (
					<motion.div
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.5, ease: 'easeOut' }}
						className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background"
					>
						<Loader2 className="size-12 animate-spin text-primary" />
					</motion.div>
				)}
			</AnimatePresence>

			<main className="relative min-h-screen overflow-x-hidden">
				<div className="fixed inset-0 z-[-1] h-full w-full bg-background">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
				</div>

				{showGif && (
					<img
						src="/temp/skeleton.gif"
						className="fixed top-0 w-full z-120 pointer-events-none"
						alt=""
					/>
				)}

				<Header data={data} aga={buh} />

				<Gallery data={data} />

				<Timeline data={data} />

				<Features />

				<WithersWrath />

				<Team />

				<Footer />
			</main>
		</>
	)
}
