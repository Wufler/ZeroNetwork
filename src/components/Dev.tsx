import { Construction } from 'lucide-react'

export default function Dev({ h1 }: { h1?: string }) {
	return (
		<main className="flex justify-center items-center min-h-dvh px-6 py-24 sm:py-32 lg:px-8 relative overflow-hidden">
			<div className="absolute inset-0 bg-background">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
			</div>

			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-linear-to-r from-purple-400/10 to-blue-400/10 dark:from-purple-600/10 dark:to-blue-600/10 opacity-30 blur-[100px]" />
			</div>

			<div className="text-center relative z-10 bg-background/50 backdrop-blur-xl p-12 rounded-3xl border border-border/50 shadow-2xl">
				<div className="flex justify-center mb-6">
					<div className="p-4 rounded-full bg-orange-500/10 text-orange-500">
						<Construction className="h-12 w-12" />
					</div>
				</div>
				<h1 className="mt-4 text-3xl font-bold font-syne tracking-tight text-foreground sm:text-4xl">
					{h1 || 'Under Maintenance'}
				</h1>
				<p className="mt-4 text-base leading-7 text-muted-foreground max-w-md mx-auto">
					We&apos;re currently working on making things better. Please check back
					later!
				</p>
			</div>
		</main>
	)
}
