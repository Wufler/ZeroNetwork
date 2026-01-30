'use client'

import { LogOut, Eye, EyeOff, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'
import { Discord } from './ui/discord'
import { toast } from 'sonner'
import { useState } from 'react'
import { updateVisibility } from '@/app/actions/data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'motion/react'

export default function Login({ data }: ComponentProps) {
	const { data: session, isPending } = authClient.useSession()
	const isAdmin = session?.user?.role === 'admin'
	const [isVisible, setIsVisible] = useState(data.whitelistVisible)

	const signIn = async () => {
		await authClient.signIn.social({
			provider: 'discord',
		})
	}

	const signOut = async () => {
		await authClient.signOut()
	}

	const toggleVisibility = async () => {
		try {
			await updateVisibility(Number(data.id), 'whitelistVisible', !isVisible)
			setIsVisible(!isVisible)
			toast.success('Login visibility updated')
		} catch (error) {
			console.error('Failed to toggle visibility:', error)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.8 }}
			className="flex items-center gap-2"
		>
			{isAdmin && (
				<Button
					variant="outline"
					size="sm"
					onClick={toggleVisibility}
					className="gap-2 bg-background/80 backdrop-blur-sm border-border shadow-sm"
				>
					{isVisible ? (
						<>
							<EyeOff className="size-4" />
							<span className="hidden sm:inline">Disable Login</span>
						</>
					) : (
						<>
							<Eye className="size-4" />
							<span className="hidden sm:inline">Enable Login</span>
						</>
					)}
				</Button>
			)}
			{!session ? (
				<>
					{isVisible && (
						<Button
							variant="outline"
							onClick={signIn}
							disabled={isPending}
							className="backdrop-blur-sm relative overflow-hidden group bg-secondary hover:bg-secondary/70 dark:bg-secondary/70 dark:hover:bg-secondary/60 border border-border text-foreground rounded-full px-4"
						>
							<Discord className="size-5" />
							<span className={isPending ? 'animate-pulse opacity-50' : ''}>
								Login
							</span>
						</Button>
					)}
				</>
			) : (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-border hover:ring-primary transition-all"
						>
							<Avatar className="h-10 w-10">
								<AvatarImage
									src={session.user?.image || ''}
									alt={session.user?.name || ''}
								/>
								<AvatarFallback>
									<User className="size-5" />
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<div className="flex items-center justify-start gap-2 p-2">
							<div className="flex flex-col space-y-1 leading-none">
								{session.user?.name && (
									<p className="font-medium">{session.user.name}</p>
								)}
								{session.user?.email && (
									<p className="w-50 truncate text-xs text-muted-foreground">
										{session.user.email}
									</p>
								)}
							</div>
						</div>
						<DropdownMenuItem
							onClick={signOut}
							className="gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
							disabled={isPending}
						>
							<LogOut className="size-4" />
							<span>Logout</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</motion.div>
	)
}
