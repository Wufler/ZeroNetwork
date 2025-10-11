'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import {
	AlertCircle,
	Clipboard,
	User,
	Check,
	X,
	Eye,
	EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Editable from '@/components/ui/editable'
import { updateServerIps, updateVisibility } from '@/actions/data'
import { updateAlert } from '@/actions/alert'
import { authClient } from '@/lib/auth-client'
import Poll from './Poll'

export default function Header({ data }: ComponentProps) {
	const [isLoading, setIsLoading] = useState(true)
	const [servers, setServers] = useState<ServerInfo[]>([])
	const [serverVisibility, setServerVisibility] = useState(data.visible)
	const [alertText, setAlertText] = useState(data.alert)
	const { data: session } = authClient.useSession()
	const isAdmin = session?.user?.role === 'admin'

	useEffect(() => {
		const fetchServers = async () => {
			setIsLoading(true)
			try {
				const api = await Promise.all(
					data.ips.map(ip =>
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
	}, [data.ips])

	const handleIpChange = useCallback(
		async (index: number, newIp: string) => {
			try {
				const updated = await updateServerIps(
					Number(data.id),
					index.toString(),
					newIp
				)
				const response = await fetch(
					`https://api.mcsrvstat.us/3/${updated.ips[index]}`
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

	const handleToggleVisibility = useCallback(
		async (serverIndex: number) => {
			const newVisibility = [...serverVisibility]
			newVisibility[serverIndex] = !newVisibility[serverIndex]

			try {
				await updateVisibility(Number(data.id), newVisibility)
				setServerVisibility(newVisibility)
				toast.success('Visibility updated successfully!')
			} catch (error) {
				console.error('Failed to update visibility:', error)
				toast.error('Failed to update visibility')
			}
		},
		[data.id, serverVisibility]
	)

	const handleAlertChange = useCallback(
		async (newAlert: string) => {
			try {
				await updateAlert(Number(data.id), newAlert)
				setAlertText(newAlert)
				toast.success('Alert message updated successfully!')
			} catch (error) {
				console.error('Failed to update alert:', error)
				toast.error('Failed to update alert message')
				setAlertText(data.alert)
			}
		},
		[data.id, data.alert]
	)

	const getFullServerIp = (server: ServerInfo) => {
		if (!server.hostname) return 'Missing IP'
		const port = server.port || 25565
		return port === 25565 ? server.hostname : `${server.hostname}:${port}`
	}

	const StatusIndicator = ({ server }: { server: ServerInfo }) => (
		<div className="relative mt-2">
			<div
				className={`size-3 rounded-full ring-2 ring-opacity-30 ${
					server.online ? 'bg-green-500 ring-green-500' : 'bg-red-500 ring-red-500'
				}`}
			/>
			{server.online && (
				<div className="absolute inset-0 rounded-full bg-green-500/50 animate-ping" />
			)}
		</div>
	)

	const renderServerCard = (server: ServerInfo | undefined, index: number) => {
		if (isLoading) {
			return (
				<Card className="bg-background/50 backdrop-blur-sm border shadow-lg max-w-3xl mx-auto w-full">
					<CardHeader className="p-4">
						<CardTitle className="flex justify-between">
							<Skeleton className="h-7 w-48" />
						</CardTitle>
					</CardHeader>
					<CardContent className="p-4 pt-0">
						<Skeleton className="h-5 w-32 mt-2" />
					</CardContent>
				</Card>
			)
		}

		if (!server) return null

		return (
			<Card className="bg-background/50 border shadow-lg transition-all max-w-3xl mx-auto w-full">
				<CardHeader className="p-4 py-3">
					<CardTitle className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							{server.icon && (
								<Image
									src={server.icon}
									alt={`${server.hostname} icon`}
									height={32}
									width={32}
									className="size-8 rounded-md"
								/>
							)}
							<div className="flex flex-col items-start">
								<div className="group relative">
									{isAdmin ? (
										<Editable.Root
											defaultValue={getFullServerIp(server)}
											placeholder="Missing IP"
											triggerMode="dblclick"
											dismissible={false}
											onSubmit={newIp => handleIpChange(index, newIp)}
											className="font-syne font-bold gap-0"
										>
											<div className="flex items-center gap-2">
												<Editable.Area>
													<Editable.Preview />
													<Editable.Input />
												</Editable.Area>
												<Editable.Toolbar className="flex gap-2">
													<Editable.Cancel asChild>
														<Button variant="outline" size="sm" className="h-7 w-7 p-0">
															<X className="size-4" />
														</Button>
													</Editable.Cancel>
													<Editable.Submit asChild>
														<Button size="sm" className="h-7 w-7 p-0">
															<Check className="size-4" />
														</Button>
													</Editable.Submit>
												</Editable.Toolbar>
											</div>
										</Editable.Root>
									) : (
										<Button
											variant="link"
											className="font-syne h-auto p-0 font-bold"
											onClick={() => handleCopyIp(getFullServerIp(server))}
										>
											{getFullServerIp(server)}
											<Clipboard className="ml-2 size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
										</Button>
									)}
								</div>
								{server.online && (
									<span className="text-xs text-muted-foreground">
										Version: {server.version}
									</span>
								)}
							</div>
						</div>
						<StatusIndicator server={server} />
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0">
					{server.online ? (
						<div className="space-y-2">
							{server.players && (
								<div className="flex items-center gap-2">
									<div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
										<div
											className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
											style={{
												width: `${(server.players.online / server.players.max) * 100}%`,
											}}
										/>
									</div>
									<span className="text-sm font-medium flex items-center gap-2">
										<User className="size-4" /> {server.players.online}/
										{server.players.max}
									</span>
								</div>
							)}
							{server.motd && (
								<div className="dark:invert-0 invert text-sm text-muted-foreground border-l-2 dark:border-primary/20 border-muted-foreground pl-2">
									{server.motd.html.map((line: string, index: number) => (
										<p key={index} dangerouslySetInnerHTML={{ __html: line }} />
									))}
								</div>
							)}
						</div>
					) : (
						<div className="text-sm">Server is currently offline.</div>
					)}
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			<header className="relative px-0 sm:px-6 lg:px-8 py-6 sm:py-24">
				<div className="relative max-w-7xl mx-auto">
					<div className="flex flex-col gap-8">
						<div className="relative mx-auto w-full">
							<div className="relative flex items-center">
								<div className="absolute inset-0">
									<div className="relative h-full flex items-center justify-between max-w-[100vw]">
										<div className="relative size-72 sm:size-96 2xl:-translate-x-32 mt-52 2xl:mt-0 animate-float">
											<Image
												fill
												src="https://wolfey.s-ul.eu/L2c6zc9c"
												alt="Wolfey"
												className="object-contain"
												priority
												sizes="(max-width: 768px) 100vw, 33vw"
											/>
										</div>
										<div className="relative size-72 sm:size-96 2xl:translate-x-32 mt-52 2xl:mt-0 animate-float-delayed">
											<Image
												fill
												src="https://wolfey.s-ul.eu/V8AxRMcD"
												alt="ImHer0"
												className="object-contain"
												priority
												sizes="(max-width: 768px) 100vw, 33vw"
											/>
										</div>
									</div>
								</div>
								<div className="text-center relative z-10 w-full">
									{isAdmin && (
										<div className="flex justify-center gap-2 mb-2">
											<Button
												onClick={() => handleToggleVisibility(0)}
												variant="outline"
												size="sm"
											>
												{serverVisibility[0] ? (
													<>
														<EyeOff className="size-4" /> Hide Alert
													</>
												) : (
													<>
														<Eye className="size-4" /> Show Alert
													</>
												)}
											</Button>
										</div>
									)}
									{(isAdmin || serverVisibility[0]) && (
										<Alert className="mb-2 bg-transparent border-none p-0 py-2">
											<AlertDescription className="flex flex-col md:flex-row justify-center items-center gap-2">
												<AlertCircle className="size-4" />
												{isAdmin ? (
													<Editable.Root
														defaultValue={alertText}
														placeholder="Enter alert message"
														triggerMode="dblclick"
														dismissible={false}
														onSubmit={handleAlertChange}
														className="text-center"
													>
														<div className="flex items-center gap-2">
															<Editable.Area>
																<Editable.Preview />
																<Editable.Input />
															</Editable.Area>
															<Editable.Toolbar className="flex gap-2">
																<Editable.Cancel asChild>
																	<Button variant="outline" size="sm" className="h-7 w-7 p-0">
																		<X className="size-4" />
																	</Button>
																</Editable.Cancel>
																<Editable.Submit asChild>
																	<Button size="sm" className="h-7 w-7 p-0">
																		<Check className="size-4" />
																	</Button>
																</Editable.Submit>
															</Editable.Toolbar>
														</div>
													</Editable.Root>
												) : (
													alertText
												)}
											</AlertDescription>
										</Alert>
									)}
									<h1 className="font-syne text-4xl sm:text-4xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-sky-400 via-violet-500 to-rose-400 bg-clip-text text-transparent">
										The Im Her Zero Network
									</h1>
									<p className="mt-2 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
										Join our incredible Minecraft community and experience unique gameplay
										with friends.
									</p>
									<Poll />
								</div>
							</div>
						</div>
						<div className="z-50 mx-auto w-full">
							{isAdmin && (
								<div className="flex gap-2 flex-wrap justify-center mb-4">
									<Button
										onClick={() => handleToggleVisibility(1)}
										variant="outline"
										size="sm"
									>
										{serverVisibility[1] ? (
											<>
												<EyeOff className="size-4" /> Hide Server 1
											</>
										) : (
											<>
												<Eye className="size-4" /> Show Server 1
											</>
										)}
									</Button>
									<Button
										onClick={() => handleToggleVisibility(2)}
										variant="outline"
										size="sm"
									>
										{serverVisibility[2] ? (
											<>
												<EyeOff className="size-4" /> Hide Server 2
											</>
										) : (
											<>
												<Eye className="size-4" /> Show Server 2
											</>
										)}
									</Button>
								</div>
							)}
							<div
								className={`grid gap-4 ${
									isAdmin || (serverVisibility[1] && serverVisibility[2])
										? 'grid-cols-1 md:grid-cols-2'
										: 'grid-cols-1'
								}`}
							>
								{(isAdmin || serverVisibility[1]) &&
									(isLoading || servers[0]) &&
									renderServerCard(servers[0], 0)}
								{(isAdmin || serverVisibility[2]) &&
									(isLoading || servers[1]) &&
									renderServerCard(servers[1], 1)}
							</div>
						</div>
					</div>
				</div>
			</header>
		</>
	)
}
