'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Discord } from './ui/discord'

export default function Footer() {
	const { setTheme, resolvedTheme } = useTheme()

	return (
		<footer className="border-t bg-background">
			<div className="mx-auto max-w-7xl px-6 py-2">
				<div className="flex items-center justify-between gap-2">
					<p className="text-sm font-medium text-foreground">&copy; 2026 Joe Inc.</p>

					<div className="flex items-center gap-4">
						<Button
							asChild
							size="icon"
							variant="ghost"
							className="rounded-full hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors"
						>
							<Link
								href="https://discord.gg/a6JrZMa"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Discord className="size-5" />
								<span className="sr-only">Discord</span>
							</Link>
						</Button>
						<div className="h-6 w-px bg-border" />
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
							className="rounded-full hover:bg-yellow-500/10 hover:text-yellow-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-500 transition-colors"
						>
							<Sun className="size-5 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
							<Moon className="size-5 absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
							<span className="sr-only">Toggle theme</span>
						</Button>
					</div>
				</div>
			</div>
		</footer>
	)
}
