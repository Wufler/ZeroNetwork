'use client'
import Header from './Header'
import Gallery from './Gallery'
import Timeline from './Timeline'
import Features from './Features'
import Team from './Team'
import Footer from './Footer'
import WithersWrath from './WithersWrath'

export default function Home({ data }: ComponentProps) {
	return (
		<main className="relative min-h-screen overflow-x-hidden">
			<div className="fixed inset-0 z-[-1] h-full w-full bg-background">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
			</div>

			<Header data={data} />

			<div className="w-full py-16 bg-background/50 backdrop-blur-sm border-y border-border/50">
				<Gallery data={data} />
			</div>

			<Timeline data={data} />

			<Features />

			<WithersWrath />

			<Team />

			<Footer />
		</main>
	)
}
