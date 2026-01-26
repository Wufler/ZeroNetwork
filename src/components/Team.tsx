'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const members = [
	{
		name: 'ImHer0',
		role: 'CEO & Founder',
		location: 'United Kingdom',
		description:
			'The creator of "The Im Her Zero Network" (ZeroNetwork) and the host of the servers. Does datapacks as a hobby.',
		image: '/team/imher0.png',
		url: 'https://github.com/ImHer0',
	},
	{
		name: 'Wolfey',
		role: 'Web Developer',
		location: 'Finland',
		description: 'hi i do some web stuff and this site and some mc server stuff',
		image: '/team/wolfey.png',
		url: 'https://wolfey.me',
	},
]

export default function Team() {
	return (
		<section className="py-16 md:py-20 px-4 relative overflow-hidden">
			<div className="container mx-auto relative z-10">
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
				>
					<h2 className="font-syne text-4xl md:text-6xl font-bold tracking-tight mb-6">
						Meet the Team
					</h2>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
					{members.map((member, i) => (
						<motion.div
							key={member.name}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: i * 0.1 }}
						>
							<a
								href={member.url}
								target="_blank"
								rel="noopener noreferrer"
								className="block h-full"
							>
								<Card className="h-full border-0 bg-transparent shadow-none group py-0">
									<CardContent className="p-0 h-full flex flex-col pt-16">
										<div className="px-8 pb-8 flex-1 bg-card dark:bg-linear-to-b dark:from-secondary/50 dark:to-background/70 text-card-foreground group-hover:bg-card/80 transition-all duration-300 rounded-2xl group-hover:shadow-2xl group-hover:-translate-y-1 relative">
											<div className="absolute -top-16 left-8">
												<div className="relative size-32 rounded-2xl overflow-hidden">
													<Image
														src={member.image}
														alt={member.name}
														fill
														className="object-cover transition-transform duration-500 group-hover:scale-110"
													/>
												</div>
											</div>

											<div className="mt-20">
												<div className="flex items-center justify-between mb-2">
													<h3 className="text-2xl font-bold font-syne">{member.name}</h3>
													<Badge variant="secondary" className="font-medium">
														{member.role}
													</Badge>
												</div>

												<div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
													<MapPin className="size-4" />
													{member.location}
												</div>

												<p className="text-muted-foreground leading-relaxed">
													{member.description}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</a>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
