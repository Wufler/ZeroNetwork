'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { AlertCircle, Clipboard, Check, X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import * as Editable from '@/components/ui/editable'
import { updateServerIps, updateVisibility } from '@/app/actions/data'
import { updateAlert } from '@/app/actions/alert'
import { authClient } from '@/lib/auth-client'
import Poll from './Poll'
import Login from './Login'
import { motion, useScroll, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

export default function Header({ data }: ComponentProps) {
	const { scrollY } = useScroll()
	const margin = useTransform(scrollY, [0, 100], [32, 0])
	const borderRadius = useTransform(scrollY, [0, 100], [24, 0])
	const borderWidth = useTransform(scrollY, [0, 100], [1, 0])

	const [isMobile, setIsMobile] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [servers, setServers] = useState<ServerInfo[]>([])
	const [alertVisible, setAlertVisible] = useState(data.alertVisible)
	const [server1Visible, setServer1Visible] = useState(data.server1Visible)
	const [server2Visible, setServer2Visible] = useState(data.server2Visible)
	const [alertText, setAlertText] = useState(data.alertMessage)
	const { data: session } = authClient.useSession()
	const isAdmin = session?.user?.role === 'admin'

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768)
		}
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	useEffect(() => {
		const fetchServers = async () => {
			setIsLoading(true)
			try {
				const api = await Promise.all(
					data.serverIps.map(ip =>
						ip
							? fetch(`https://api.mcsrvstat.us/3/${ip}`).then(res => res.json())
							: ({} as ServerInfo)
					)
				)
				setServers(api)
			} catch (error) {
				console.error('Error fetching servers:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchServers()
	}, [data.serverIps])

	const handleIpChange = useCallback(
		async (index: number, newIp: string) => {
			try {
				const updated = await updateServerIps(
					Number(data.id),
					index.toString(),
					newIp
				)
				const response = await fetch(
					`https://api.mcsrvstat.us/3/${updated.serverIps[index]}`
				)
				const updatedServer = await response.json()
				setServers(prev =>
					prev.map((server, i) => (i === index ? updatedServer : server))
				)
				toast.success('Server IP updated successfully!')
			} catch (error) {
				console.error('Failed to update IP:', error)
				toast.error('Failed to update server IP')
			}
		},
		[data.id]
	)

	const handleCopyIp = useCallback(async (text: string) => {
		try {
			await navigator.clipboard.writeText(text)
			toast.success('Server IP copied to clipboard!')
		} catch (err) {
			console.error('Failed to copy:', err)
			toast.error('Failed to copy server IP')
		}
	}, [])

	const handleToggleAlert = useCallback(async () => {
		try {
			await updateVisibility(Number(data.id), 'alertVisible', !alertVisible)
			setAlertVisible(!alertVisible)
			toast.success('Alert visibility updated!')
		} catch (error) {
			console.error('Failed to update visibility:', error)
			toast.error('Failed to update visibility')
		}
	}, [data.id, alertVisible])

	const handleToggleServer1 = useCallback(async () => {
		try {
			await updateVisibility(Number(data.id), 'server1Visible', !server1Visible)
			setServer1Visible(!server1Visible)
			toast.success('Server 1 visibility updated!')
		} catch (error) {
			console.error('Failed to update visibility:', error)
			toast.error('Failed to update visibility')
		}
	}, [data.id, server1Visible])

	const handleToggleServer2 = useCallback(async () => {
		try {
			await updateVisibility(Number(data.id), 'server2Visible', !server2Visible)
			setServer2Visible(!server2Visible)
			toast.success('Server 2 visibility updated!')
		} catch (error) {
			console.error('Failed to update visibility:', error)
			toast.error('Failed to update visibility')
		}
	}, [data.id, server2Visible])

	const handleAlertChange = useCallback(
		async (newAlert: string) => {
			try {
				await updateAlert(Number(data.id), newAlert)
				setAlertText(newAlert)
				toast.success('Alert message updated successfully!')
			} catch (error) {
				console.error('Failed to update alert:', error)
				toast.error('Failed to update alert message')
				setAlertText(data.alertMessage)
			}
		},
		[data.id, data.alertMessage]
	)

	const getFullServerIp = (server: ServerInfo) => {
		if (!server.hostname) return 'Missing IP'
		const port = server.port || 25565
		return port === 25565 ? server.hostname : `${server.hostname}:${port}`
	}

	const renderServerInfo = (server: ServerInfo | undefined, index: number) => {
		const isPrimary = index === 0

		if (isLoading) {
			return (
				<div className="flex flex-col gap-2 w-64">
					<Skeleton
						className={cn('bg-muted', isPrimary ? 'h-8 w-48' : 'h-6 w-32 opacity-50')}
					/>
					<Skeleton
						className={cn('bg-muted', isPrimary ? 'h-5 w-64' : 'h-3 w-40 opacity-50')}
					/>
				</div>
			)
		}

		if (!server) return null

		return (
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.5, delay: index * 0.1 }}
				className={cn(
					'flex flex-col group',
					isPrimary ? 'gap-3' : 'gap-1 opacity-80 hover:opacity-100'
				)}
			>
				<div className="flex items-center gap-4">
					{server.icon && (
						<div
							className={cn(
								'relative rounded overflow-hidden bg-muted ring-1 ring-border transition-all duration-300',
								isPrimary ? 'size-14 shadow-lg' : 'size-10 opacity-80'
							)}
						>
							<Image
								src={server.icon}
								alt={`${server.hostname} icon`}
								fill
								className="object-cover"
							/>
						</div>
					)}
					<div className="flex flex-col justify-center">
						<div className="flex items-center gap-2">
							<div className="relative flex size-2.5">
								<span
									className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
										server.online ? 'bg-green-500' : 'bg-red-500'
									}`}
								/>
								<span
									className={`relative inline-flex rounded-full size-2.5 ${
										server.online ? 'bg-green-500' : 'bg-red-500'
									}`}
								/>
							</div>
							<div className="group/ip relative">
								{isAdmin ? (
									<Editable.Root
										defaultValue={getFullServerIp(server)}
										placeholder="Missing IP"
										triggerMode="dblclick"
										dismissible={false}
										onSubmit={newIp => handleIpChange(index, newIp)}
										className="font-syne font-bold gap-0 text-foreground"
									>
										<div className="flex items-center gap-2">
											<Editable.Area>
												<Editable.Preview
													className={cn(isPrimary ? 'text-xl' : 'text-sm')}
												/>
												<Editable.Input className="bg-muted border-border text-foreground text-sm h-6 py-0 px-1" />
											</Editable.Area>
											<Editable.Toolbar className="flex gap-1">
												<Editable.Cancel asChild>
													<Button
														variant="outline"
														size="sm"
														className="h-6 w-6 p-0 bg-muted border-border text-foreground hover:bg-muted/80"
													>
														<X className="size-3" />
													</Button>
												</Editable.Cancel>
												<Editable.Submit asChild>
													<Button
														size="sm"
														className="h-6 w-6 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
													>
														<Check className="size-3" />
													</Button>
												</Editable.Submit>
											</Editable.Toolbar>
										</div>
									</Editable.Root>
								) : (
									<Button
										variant="link"
										className={cn(
											'font-syne h-auto p-0 font-bold text-foreground hover:text-primary transition-colors',
											isPrimary ? 'text-2xl tracking-tight' : 'text-sm font-medium'
										)}
										onClick={() => handleCopyIp(getFullServerIp(server))}
									>
										{getFullServerIp(server)}
										<Clipboard
											className={cn(
												'opacity-0 group-hover/ip:opacity-100 transition-opacity text-primary',
												isPrimary ? 'ml-3 size-5' : 'ml-2 size-3'
											)}
										/>
									</Button>
								)}
							</div>
						</div>
						{server.online && server.players && (
							<div
								className={cn(
									'bg-muted rounded-full overflow-hidden transition-all',
									isPrimary
										? 'h-1.5 w-full max-w-70'
										: 'h-0.5 w-full max-w-45 opacity-60'
								)}
							>
								<motion.div
									initial={{ width: 0 }}
									animate={{
										width: `${(server.players.online / server.players.max) * 100}%`,
									}}
									transition={{ duration: 1, ease: 'easeOut' }}
									className="h-full bg-primary"
								/>
							</div>
						)}
						{server.online && server.players && (
							<div
								className={cn(
									'text-muted-foreground flex items-center gap-2 font-mono',
									isPrimary ? 'text-sm mt-0.5' : 'text-[10px]'
								)}
							>
								<span>
									{server.players.online} / {server.players.max} Players
								</span>
							</div>
						)}
					</div>
				</div>
				{server.motd && server.motd.clean && server.motd.clean.length > 0 && (
					<div
						className={cn(
							'text-muted-foreground mt-2',
							isPrimary ? 'text-sm' : 'text-xs'
						)}
					>
						{isPrimary ? (
							<div className="flex flex-col gap-1">
								{server.motd.html.map((line, idx) => (
									<span key={idx} dangerouslySetInnerHTML={{ __html: line }} />
								))}
							</div>
						) : (
							<span dangerouslySetInnerHTML={{ __html: server.motd.html[0] }} />
						)}
					</div>
				)}
			</motion.div>
		)
	}

	return (
		<motion.header
			style={{
				margin: isMobile ? 0 : margin,
				borderRadius: isMobile ? 0 : borderRadius,
				borderWidth: isMobile ? 0 : borderWidth,
			}}
			className="relative min-h-[calc(100svh-4rem)] flex flex-col overflow-hidden py-8 px-6 md:px-12 border-border bg-linear-to-br from-background/50 to-transparent backdrop-blur-sm"
		>
			<div className="absolute top-4 right-4 z-50">
				<Login data={data} />
			</div>

			<div className="z-30 flex flex-col items-start max-w-2xl">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8 }}
				>
					<h1 className="font-syne text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight bg-linear-to-b from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent drop-shadow-sm mb-2 text-left">
						The Im Her Zero Network
					</h1>
				</motion.div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="text-lg text-muted-foreground font-light max-w-lg text-left"
				>
					Join our incredible Minecraft community and experience unique gameplay with
					friends.
				</motion.p>

				<div className="mt-4 flex flex-col items-start gap-2">
					{isAdmin && (
						<Button
							onClick={handleToggleAlert}
							variant="outline"
							size="sm"
							className="bg-secondary/50 border-border text-foreground hover:bg-secondary h-7 text-xs"
						>
							{alertVisible ? (
								<>
									<EyeOff className="size-3 mr-1" /> Hide Alert
								</>
							) : (
								<>
									<Eye className="size-3 mr-1" /> Show Alert
								</>
							)}
						</Button>
					)}
					{(isAdmin || alertVisible) && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							className="max-w-md"
						>
							<Alert className="bg-yellow-500/10 backdrop-blur-sm border-yellow-500/20 text-yellow-700 dark:text-yellow-200 py-2 px-3">
								<AlertDescription className="flex items-center gap-2 text-sm">
									<AlertCircle className="size-4 text-yellow-500 shrink-0" />
									{isAdmin ? (
										<Editable.Root
											defaultValue={alertText}
											placeholder="Enter alert message"
											triggerMode="dblclick"
											dismissible={false}
											onSubmit={handleAlertChange}
											className="w-full"
										>
											<div className="flex items-center gap-2 w-full">
												<Editable.Area className="w-full">
													<Editable.Preview className="text-left" />
													<Editable.Input className="bg-black/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-200 text-sm h-6 py-0" />
												</Editable.Area>
												<Editable.Toolbar className="flex gap-1">
													<Editable.Cancel asChild>
														<Button
															variant="outline"
															size="sm"
															className="h-6 w-6 p-0 bg-black/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-500/20"
														>
															<X className="size-3" />
														</Button>
													</Editable.Cancel>
													<Editable.Submit asChild>
														<Button
															size="sm"
															className="h-6 w-6 p-0 bg-yellow-500 text-black hover:bg-yellow-400"
														>
															<Check className="size-3" />
														</Button>
													</Editable.Submit>
												</Editable.Toolbar>
											</div>
										</Editable.Root>
									) : (
										<span>{alertText}</span>
									)}
								</AlertDescription>
							</Alert>
							<Poll />
						</motion.div>
					)}
				</div>
			</div>

			<div className="z-30 mt-auto flex flex-col items-start gap-4">
				{isAdmin && (
					<div className="flex gap-2 mb-2">
						<Button
							onClick={handleToggleServer1}
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground h-6 text-xs p-0 px-2"
						>
							{server1Visible ? 'Hide S1' : 'Show S1'}
						</Button>
						<Button
							onClick={handleToggleServer2}
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground h-6 text-xs p-0 px-2"
						>
							{server2Visible ? 'Hide S2' : 'Show S2'}
						</Button>
					</div>
				)}
				<div className="flex flex-col gap-6">
					{(isAdmin || server2Visible) &&
						(isLoading || servers[1]) &&
						renderServerInfo(servers[1], 1)}
					{(isAdmin || server1Visible) &&
						(isLoading || servers[0]) &&
						renderServerInfo(servers[0], 0)}
				</div>
			</div>

			<div className="absolute bottom-0 right-0 z-30 -mr-6 md:-mr-12 -mb-8 pointer-events-none select-none">
				<motion.div
					initial={{ opacity: 0, x: 100 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, delay: 0.5 }}
					className="relative w-125 h-100 md:w-175 md:h-125"
				>
					<div className="absolute top-10 right-0 w-3/5 h-3/5 z-10">
						<Image
							fill
							src="/header/2.png"
							alt="Wither"
							className="object-contain object-bottom"
							priority
						/>
					</div>

					<div className="absolute bottom-0 left-0 w-1/2 h-4/5 z-20">
						<Image
							fill
							src="/header/3.png"
							alt="Golem"
							className="object-contain object-bottom"
							priority
						/>
					</div>

					<div className="absolute bottom-0 left-[30%] w-1/3 h-3/5 z-30">
						<Image
							fill
							src="/header/4.png"
							alt="ImHer0"
							className="object-contain object-bottom"
							priority
						/>
					</div>

					<div className="absolute bottom-0 right-[15%] w-1/3 h-3/5 z-40">
						<Image
							fill
							src="/header/1.png"
							alt="Wolfey"
							className="object-contain object-bottom"
							priority
						/>
					</div>
				</motion.div>
			</div>
		</motion.header>
	)
}
