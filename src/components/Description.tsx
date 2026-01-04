'use client'

import { CheckCircle2, Clock, Wifi, Gamepad2, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Discord } from './ui/discord'

const features = [
	{
		title: '24/7 Uptime',
		description:
			'Our servers are always online, so you can play whenever you want.',
		icon: Clock,
		className:
			'md:col-span-1 md:row-span-2 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20',
		iconColor: 'text-orange-500',
	},
	{
		title: 'Lag Free',
		description: 'sometimes lol',
		icon: Zap,
		className:
			'md:col-span-2 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20',
		iconColor: 'text-yellow-500',
	},
	{
		title: 'Community',
		description: 'Join our Discord to chat and suggest new features!',
		icon: Discord,
		link: 'https://discord.gg/a6JrZMa',
		className:
			'md:col-span-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
		iconColor: 'text-indigo-500',
	},
	{
		title: 'Always Updated',
		description: 'We keep our servers up to date with the latest versions.',
		icon: CheckCircle2,
		className:
			'md:col-span-1 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20',
		iconColor: 'text-green-500',
	},
	{
		title: 'Modded & Vanilla',
		description: 'Something for everyone, from modpacks to customized vanilla.',
		icon: Gamepad2,
		className:
			'md:col-span-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20',
		iconColor: 'text-blue-500',
	},
]

export default function Description() {
	return (
		<section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
			<div className="mx-auto max-w-7xl relative z-10">
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
				>
					<h2 className="font-syne text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-linear-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
						Why Choose Us?
					</h2>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
					{features.map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, scale: 0.95 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.4, delay: index * 0.1 }}
							className={`group relative overflow-hidden rounded-3xl border p-6 transition-all hover:shadow-lg ${feature.className}`}
						>
							<div className="relative z-10 h-full flex flex-col justify-between">
								<div className="mb-4">
									<div
										className={`p-3 rounded-2xl bg-background/50 w-fit backdrop-blur-sm ${feature.iconColor}`}
									>
										<feature.icon className="size-8" />
									</div>
								</div>
								<div>
									<h3 className="text-2xl font-bold font-syne mb-2">{feature.title}</h3>
									<p className="text-muted-foreground font-medium">
										{feature.link ? (
											<Link
												href={feature.link}
												target="_blank"
												className="hover:underline decoration-2 underline-offset-4"
											>
												{feature.description}
											</Link>
										) : (
											feature.description
										)}
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
