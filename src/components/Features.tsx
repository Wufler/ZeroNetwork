'use client'

import { CheckCircle2, Clock, Gamepad2, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { Discord } from './ui/discord'

const features = [
	{
		title: '24/7 Uptime',
		description:
			'Our servers are always online, so you can play whenever you want.',
		icon: Clock,
		className: 'md:col-span-1 md:row-span-2',
		gradient: 'from-orange-500/20 via-orange-500/5 to-transparent',
		border: 'group-hover:border-orange-500/50',
		iconColor: 'text-orange-500',
		delay: 0.1,
	},
	{
		title: 'Lag Free Experience',
		description: 'Optimized performance for smooth gameplay.',
		icon: Zap,
		className: 'md:col-span-2',
		gradient: 'from-yellow-500/20 via-yellow-500/5 to-transparent',
		border: 'group-hover:border-yellow-500/50',
		iconColor: 'text-yellow-500',
		delay: 0.2,
	},
	{
		title: 'Vibrant Community',
		description: 'Join our active Discord to chat, and suggest new features!',
		icon: Discord,
		className: 'md:col-span-2',
		gradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
		border: 'group-hover:border-indigo-500/50',
		iconColor: 'text-indigo-500',
		delay: 0.3,
	},
	{
		title: 'Always Updated',
		description:
			'We try to keep the servers updated with the latest versions and patches.',
		icon: CheckCircle2,
		className: 'md:col-span-1',
		gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
		border: 'group-hover:border-emerald-500/50',
		iconColor: 'text-emerald-500',
		delay: 0.4,
	},
	{
		title: 'Modded & Vanilla',
		description: 'From modpacks to modified vanilla survival, we have it all.',
		icon: Gamepad2,
		className: 'md:col-span-2',
		gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
		border: 'group-hover:border-blue-500/50',
		iconColor: 'text-blue-500',
		delay: 0.5,
	},
]

export default function Features() {
	return (
		<section className="py-16 md:py-20 px-4 relative overflow-hidden">
			<div className="mx-auto max-w-7xl relative z-10">
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
				>
					<h2 className="font-syne text-3xl md:text-7xl font-bold tracking-tight mb-6 bg-linear-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
						What are we doing!?
					</h2>
					<p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						We run different kind of servers with lots of fun features for everyone.
						Whether you like modded or modified vanilla Minecraft, we've got something
						for you. Suggest modpacks or ideas in our Discord!
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{features.map(feature => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: feature.delay }}
							className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-card/50 hover:bg-card p-8 transition-all duration-300 hover:border-primary/20 ${feature.className} ${feature.border}`}
						>
							<div className="relative z-10 h-full flex flex-col justify-between">
								<div>
									<div
										className={`p-4 rounded-xl bg-background/50 w-fit mb-6 border border-white/5 group-hover:scale-105 transition-transform duration-300 ${feature.iconColor}`}
									>
										<feature.icon className="size-8" />
									</div>
									<h3 className="text-2xl font-bold font-syne mb-3 text-foreground">
										{feature.title}
									</h3>
									<p className="text-muted-foreground font-medium leading-relaxed group-hover:text-foreground/80 transition-colors">
										{feature.description}
									</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
