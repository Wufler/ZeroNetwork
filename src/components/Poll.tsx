'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authClient } from '@/lib/auth-client'
import {
	vote,
	hasVoted,
	getAllPolls,
	createNewPoll,
	togglePollVisibility,
	deletePoll,
	endPoll,
} from '@/app/actions/poll'
import {
	ArrowLeft,
	ArrowRight,
	X,
	BarChart2,
	Clock,
	CheckCircle2,
	Eye,
	EyeOff,
	Plus,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getVisitorId } from '@/lib/fingerprint'
import { isPast, format, isBefore } from 'date-fns'
import { motion, AnimatePresence } from 'motion/react'

export default function Poll() {
	const local_storage_key = 'poll_votes'
	const max_questions = 250
	const max_answers = 10
	const { data: session } = authClient.useSession()
	const [selectedOption, setSelectedOption] = useState<number | null>(null)
	const [hasUserVoted, setHasUserVoted] = useState<Record<number, boolean>>({})
	const [polls, setPolls] = useState<Polls[]>([])
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
	const [selectedTime, setSelectedTime] = useState<string>('00:00')
	const [showVoteText, setShowVoteText] = useState<Record<number, boolean>>({})
	const [newPoll, setNewPoll] = useState({
		question: '',
		answers: ['', ''],
		timed: false,
		until: null as Date | null,
	})
	const [isVoting, setIsVoting] = useState<Record<number, boolean>>({})
	const [isDeleting, setIsDeleting] = useState<Record<number, boolean>>({})
	const [isToggling, setIsToggling] = useState<Record<number, boolean>>({})
	const [isEnding, setIsEnding] = useState<Record<number, boolean>>({})
	const [activeTab, setActiveTab] = useState('0')
	const [isLoading, setIsLoading] = useState(true)
	const [isCreating, setIsCreating] = useState(false)
	const [fingerprint, setFingerprint] = useState<string>('')
	const isAdmin = session?.user?.role === 'admin'

	const handleDateSelect = (date: Date | undefined) => {
		setSelectedDate(date)
		if (date) {
			const [hours, minutes] = selectedTime.split(':')
			const newDate = new Date(date)
			newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10))
			setNewPoll(prev => ({ ...prev, until: newDate }))
		} else {
			setNewPoll(prev => ({ ...prev, until: null }))
		}
	}

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTime = e.target.value
		setSelectedTime(newTime)
		if (selectedDate) {
			const [hours, minutes] = newTime.split(':')
			const newDate = new Date(selectedDate)
			newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10))
			setNewPoll(prev => ({ ...prev, until: newDate }))
		}
	}

	const handleNavigation = (direction: 'next' | 'prev') => {
		const currentIndex = parseInt(activeTab)
		const visiblePolls = isAdmin ? polls : polls.filter(p => p.visible)

		if (direction === 'next' && currentIndex < visiblePolls.length - 1) {
			const newIndex = (currentIndex + 1).toString()
			setActiveTab(newIndex)
			setSelectedOption(null)
		} else if (direction === 'prev' && currentIndex > 0) {
			const newIndex = (currentIndex - 1).toString()
			setActiveTab(newIndex)
			setSelectedOption(null)
		}
	}

	useEffect(() => {
		getVisitorId().then(setFingerprint)
	}, [])

	useEffect(() => {
		if (!fingerprint) return

		const initPolls = async () => {
			setIsLoading(true)
			try {
				const fetchedPolls = await getAllPolls()
				if (fetchedPolls) {
					setPolls(fetchedPolls)
					const votingStatus: Record<number, boolean> = {}
					for (const poll of fetchedPolls) {
						votingStatus[poll.id] = await hasVoted(poll.id, fingerprint)
					}
					setHasUserVoted(votingStatus)
				}
			} catch (error) {
				console.error('Failed to fetch polls:', error)
			} finally {
				setIsLoading(false)
			}
		}
		initPolls()
	}, [fingerprint])

	const recordLocalVote = (pollId: number) => {
		try {
			const votes = JSON.parse(localStorage.getItem(local_storage_key) || '{}')
			votes[pollId] = true
			localStorage.setItem(local_storage_key, JSON.stringify(votes))
		} catch (error) {
			console.error('Failed to save vote to local storage:', error)
		}
	}

	const getTotalVotes = (poll: Polls) => {
		return poll.votes.reduce((sum: number, current: number) => sum + current, 0)
	}

	const getVotePercentage = (votes: number, totalVotes: number) => {
		if (totalVotes === 0) return 0
		return (votes / totalVotes) * 100
	}
	const handleVote = async (pollId: number) => {
		if (selectedOption === null || hasUserVoted[pollId] || !fingerprint) return

		try {
			setIsVoting(prev => ({ ...prev, [pollId]: true }))
			const updatedPoll = await vote(pollId, selectedOption, fingerprint)
			setPolls(polls.map(p => (p.id === pollId ? updatedPoll : p)))
			setSelectedOption(null)
			setHasUserVoted(prev => ({ ...prev, [pollId]: true }))
			setShowVoteText(prev => ({ ...prev, [pollId]: true }))
			recordLocalVote(pollId)

			setTimeout(() => {
				setShowVoteText(prev => ({ ...prev, [pollId]: false }))
			}, 3000)
		} catch (error) {
			console.error('Failed to submit vote:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to submit vote')
		} finally {
			setIsVoting(prev => ({ ...prev, [pollId]: false }))
		}
	}

	const PollAdminActions = ({ poll }: { poll: Polls }) => {
		const handleDeletePoll = async () => {
			try {
				setIsDeleting(prev => ({ ...prev, [poll.id]: true }))
				await deletePoll(poll.id)
				setPolls(polls.filter(p => p.id !== poll.id))
				toast.success('Poll deleted successfully')
				if (
					activeTab === polls.findIndex(p => p.id === poll.id).toString() &&
					polls.length > 1
				) {
					setActiveTab('0')
				}
			} catch (error) {
				console.error('Failed to delete poll:', error)
				toast.error('Failed to delete poll')
			} finally {
				setIsDeleting(prev => ({ ...prev, [poll.id]: false }))
			}
		}

		return (
			<div className="border-t border-border pt-4 mt-4">
				<div className="flex justify-center items-center">
					<div className="flex flex-col sm:flex-row gap-2 w-full">
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="destructive"
									size="sm"
									className="w-full"
									disabled={isDeleting[poll.id]}
								>
									{isDeleting[poll.id] ? 'Deleting...' : 'Delete Poll'}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent className="bg-popover backdrop-blur-xl border-border">
								<AlertDialogHeader>
									<AlertDialogTitle>Remove Poll</AlertDialogTitle>
									<AlertDialogDescription>
										It is not recommended to remove polls as it will not save the votes.
										Try to hide it instead.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<Button
										variant="destructive"
										disabled={isDeleting[poll.id]}
										onClick={handleDeletePoll}
									>
										{isDeleting[poll.id] ? 'Deleting...' : 'Delete'}
									</Button>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<Button
							variant="outline"
							size="sm"
							disabled={isToggling[poll.id]}
							onClick={() => handleToggleVisibility(poll.id, !poll.visible)}
							className="w-full"
						>
							{isToggling[poll.id]
								? 'Updating...'
								: poll.visible
									? 'Hide Poll'
									: 'Show Poll'}
						</Button>
						{!poll.endedAt && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="secondary"
										size="sm"
										className="w-full"
										disabled={isEnding[poll.id]}
									>
										{isEnding[poll.id] ? 'Ending...' : 'End Poll'}
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent className="bg-popover backdrop-blur-xl border-border">
									<AlertDialogHeader>
										<AlertDialogTitle>End Poll</AlertDialogTitle>
										<AlertDialogDescription>
											Are you sure you want to end this poll? This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<Button
											variant="destructive"
											disabled={isEnding[poll.id]}
											onClick={() => handleEndPoll(poll.id)}
										>
											{isEnding[poll.id] ? 'Ending...' : 'End Poll'}
										</Button>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				</div>
			</div>
		)
	}

	const handleCreatePoll = async () => {
		if (!isAdmin || !newPoll.question || newPoll.answers.some(a => !a)) return

		setIsCreating(true)
		try {
			const poll = await createNewPoll(
				newPoll.question,
				newPoll.answers.filter(Boolean),
				newPoll.timed && newPoll.until ? newPoll.until : undefined,
			)
			await handleToggleVisibility(poll.id, true)
			const updatedPolls = await getAllPolls()
			setPolls(updatedPolls)
			setNewPoll({
				question: '',
				answers: ['', ''],
				timed: false,
				until: null,
			})

			const visiblePolls = updatedPolls.filter(p => p.visible)
			const newPollIndex = visiblePolls.findIndex(p => p.id === poll.id)
			setActiveTab(newPollIndex.toString())
			toast.success('Poll created successfully!')
		} catch (error) {
			console.error('Failed to create poll:', error)
			toast.error('Failed to create poll. Please try again.')
		} finally {
			setIsCreating(false)
		}
	}

	const handleEndPoll = async (pollId: number) => {
		if (!isAdmin) return

		try {
			setIsEnding(prev => ({ ...prev, [pollId]: true }))
			await endPoll(pollId)
			const updatedPolls = await getAllPolls()
			setPolls(updatedPolls)
			toast.success('Poll ended successfully')
		} catch (error) {
			console.error('Failed to end poll:', error)
			toast.error('Failed to end poll')
		} finally {
			setIsEnding(prev => ({ ...prev, [pollId]: false }))
		}
	}

	const handleToggleVisibility = async (pollId: number, visible: boolean) => {
		if (!isAdmin) return

		try {
			setIsToggling(prev => ({ ...prev, [pollId]: true }))
			const updatedPoll = await togglePollVisibility(pollId, visible)
			setPolls(prev => prev.map(p => (p.id === pollId ? updatedPoll : p)))
			toast.success(visible ? 'Poll is now visible' : 'Poll is now hidden')
		} catch (error) {
			console.error('Failed to toggle poll visibility:', error)
			toast.error('Failed to update poll visibility')
		} finally {
			setIsToggling(prev => ({ ...prev, [pollId]: false }))
		}
	}

	if (!isAdmin && (!polls.length || !polls.some(p => p.visible))) {
		return null
	}

	const displayedPolls = isAdmin ? polls : polls.filter(p => p.visible)

	return (
		<div className="mt-4">
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant="ghost"
						className="relative overflow-hidden group bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-full px-6"
					>
						<span className="relative z-10">Community Polls</span>
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-4xl p-0 bg-popover backdrop-blur-xl border-border shadow-2xl overflow-hidden">
					<AlertDialogTitle className="hidden" />
					<div className="flex h-[90vh] sm:h-150 relative z-10">
						<div className="hidden md:flex w-64 border-r border-border bg-muted/50 flex-col">
							<div className="p-4 border-b border-border flex items-center justify-between">
								<h3 className="font-syne font-bold text-foreground flex items-center gap-2">
									<BarChart2 className="size-4 text-primary" />
									Polls
								</h3>
								<div className="flex gap-1">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleNavigation('prev')}
										disabled={parseInt(activeTab) === 0}
										className="h-8 w-8"
									>
										<ArrowLeft className="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleNavigation('next')}
										disabled={parseInt(activeTab) === displayedPolls.length - 1}
										className="h-8 w-8"
									>
										<ArrowRight className="size-4" />
									</Button>
								</div>
							</div>

							<ScrollArea className="flex-1 h-full min-h-0">
								<Tabs
									value={activeTab}
									onValueChange={setActiveTab}
									orientation="vertical"
									className="w-full"
								>
									<TabsList className="flex-col h-auto bg-transparent p-0 w-full space-y-0">
										{isLoading ? (
											<div className="p-4 space-y-2">
												{[1, 2, 3].map(i => (
													<Skeleton key={i} className="h-10 w-full" />
												))}
											</div>
										) : (
											displayedPolls.map((poll, index) => (
												<TabsTrigger
													key={poll.id}
													value={index.toString()}
													className="w-full justify-start px-4 py-3 rounded-none border-l-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-secondary text-muted-foreground data-[state=active]:text-foreground transition-all text-left h-auto group relative pr-10"
												>
													<div className="flex flex-col gap-1 w-full overflow-hidden">
														<span className="truncate font-medium text-sm max-w-48">
															{poll.question}
														</span>
														<div className="flex items-center gap-2 text-xs opacity-60">
															{isAdmin ? (
																poll.visible ? (
																	<span className="text-green-400 flex items-center gap-1">
																		Visible
																	</span>
																) : (
																	<span className="text-red-400 flex items-center gap-1">
																		Hidden
																	</span>
																)
															) : (
																!hasUserVoted[poll.id] &&
																!poll.endedAt &&
																(!poll.until || !isPast(poll.until)) && (
																	<span className="text-blue-400 flex items-center gap-1">
																		Open
																	</span>
																)
															)}
															{poll.endedAt && <span className="text-yellow-400">Ended</span>}
														</div>
													</div>
													{isAdmin && (
														<div
															className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 shrink-0 flex items-center justify-center rounded-md hover:bg-muted opacity-60 hover:opacity-100 group-hover:opacity-100 transition-opacity cursor-pointer disabled:pointer-events-none disabled:opacity-50"
															onClick={e => {
																e.stopPropagation()
																if (!isToggling[poll.id]) {
																	handleToggleVisibility(poll.id, !poll.visible)
																}
															}}
															title={poll.visible ? 'Hide Poll' : 'Show Poll'}
															role="button"
															tabIndex={0}
															onKeyDown={e => {
																if (
																	(e.key === 'Enter' || e.key === ' ') &&
																	!isToggling[poll.id]
																) {
																	e.preventDefault()
																	e.stopPropagation()
																	handleToggleVisibility(poll.id, !poll.visible)
																}
															}}
														>
															{isToggling[poll.id] ? (
																<Clock className="size-4 animate-spin" />
															) : poll.visible ? (
																<Eye className="size-4" />
															) : (
																<EyeOff className="size-4" />
															)}
														</div>
													)}
												</TabsTrigger>
											))
										)}
									</TabsList>
								</Tabs>
							</ScrollArea>

							{isAdmin && (
								<div className="p-4 border-t border-border hidden md:block">
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button className="w-full">Create New Poll</Button>
										</AlertDialogTrigger>
										<AlertDialogContent className="bg-popover backdrop-blur-xl border-border">
											<AlertDialogHeader>
												<AlertDialogTitle>Create New Poll</AlertDialogTitle>
											</AlertDialogHeader>
											<ScrollArea className="max-h-[60vh] pr-4">
												<div className="space-y-4 py-4">
													<div className="space-y-2">
														<label className="text-sm font-medium text-foreground">
															Question
														</label>
														<Input
															type="text"
															value={newPoll.question}
															onChange={e => {
																const value = e.target.value.slice(0, max_questions)
																setNewPoll(prev => ({ ...prev, question: value }))
															}}
															placeholder="Enter your question"
															maxLength={max_questions}
														/>
													</div>
													<div className="space-y-2">
														<label className="text-sm font-medium text-foreground">
															Answers
														</label>
														{newPoll.answers.map((answer, i) => (
															<div key={i} className="flex gap-2">
																<Input
																	type="text"
																	value={answer}
																	onChange={e =>
																		setNewPoll(prev => ({
																			...prev,
																			answers: prev.answers.map((a, index) =>
																				index === i ? e.target.value : a,
																			),
																		}))
																	}
																	placeholder={`Answer ${i + 1}`}
																	maxLength={max_questions}
																/>
																{newPoll.answers.length > 2 && (
																	<Button
																		variant="destructive"
																		size="icon"
																		onClick={() =>
																			setNewPoll(prev => ({
																				...prev,
																				answers: prev.answers.filter((_, index) => index !== i),
																			}))
																		}
																	>
																		<X className="size-4" />
																	</Button>
																)}
															</div>
														))}
														<Button
															onClick={() =>
																setNewPoll(prev => ({
																	...prev,
																	answers: [...prev.answers, ''],
																}))
															}
															variant="outline"
															className="w-full"
															disabled={newPoll.answers.length >= max_answers}
														>
															Add Answer Option ({newPoll.answers.length}/{max_answers})
														</Button>
													</div>
													<div className="space-y-4 pt-4 border-t border-border">
														<div className="flex items-center justify-between">
															<label className="text-sm font-medium text-foreground">
																Set poll end time
															</label>
															<Switch
																checked={newPoll.timed}
																onCheckedChange={checked =>
																	setNewPoll(prev => ({ ...prev, timed: checked }))
																}
															/>
														</div>
														{newPoll.timed && (
															<div className="space-y-4">
																<Calendar
																	mode="single"
																	selected={selectedDate}
																	onSelect={handleDateSelect}
																	disabled={date => isBefore(date, new Date())}
																	className="rounded-md border border-border bg-card w-full flex justify-center"
																/>
																<div>
																	<label className="text-sm font-medium text-foreground">
																		Time
																	</label>
																	<Input
																		type="time"
																		value={selectedTime}
																		onChange={handleTimeChange}
																		className="mt-1"
																	/>
																</div>
															</div>
														)}
													</div>
												</div>
											</ScrollArea>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<Button
													onClick={handleCreatePoll}
													disabled={
														!newPoll.question ||
														newPoll.answers.some(a => !a) ||
														isCreating ||
														(newPoll.timed && !newPoll.until)
													}
													className="bg-primary hover:bg-primary/90 text-primary-foreground"
												>
													{isCreating ? 'Creating...' : 'Create Poll'}
												</Button>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							)}
						</div>

						<div className="flex-1 flex flex-col relative">
							<div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-muted/50">
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<BarChart2 className="size-4 text-primary shrink-0" />
									<span className="font-syne font-bold text-foreground text-sm">
										Poll {parseInt(activeTab) + 1} of {displayedPolls.length}
									</span>
								</div>
								<div className="flex items-center gap-1 shrink-0">
									{isAdmin && (
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													title="Create New Poll"
												>
													<Plus className="size-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent className="bg-popover backdrop-blur-xl border-border">
												<AlertDialogHeader>
													<AlertDialogTitle>Create New Poll</AlertDialogTitle>
												</AlertDialogHeader>
												<ScrollArea className="max-h-[60vh] pr-4">
													<div className="space-y-4 py-4">
														<div className="space-y-2">
															<label className="text-sm font-medium text-foreground">
																Question
															</label>
															<Input
																type="text"
																value={newPoll.question}
																onChange={e => {
																	const value = e.target.value.slice(0, max_questions)
																	setNewPoll(prev => ({ ...prev, question: value }))
																}}
																placeholder="Enter your question"
																maxLength={max_questions}
															/>
														</div>
														<div className="space-y-2">
															<label className="text-sm font-medium text-foreground">
																Answers
															</label>
															{newPoll.answers.map((answer, i) => (
																<div key={i} className="flex gap-2">
																	<Input
																		type="text"
																		value={answer}
																		onChange={e =>
																			setNewPoll(prev => ({
																				...prev,
																				answers: prev.answers.map((a, index) =>
																					index === i ? e.target.value : a,
																				),
																			}))
																		}
																		placeholder={`Answer ${i + 1}`}
																		maxLength={max_questions}
																	/>
																	{newPoll.answers.length > 2 && (
																		<Button
																			variant="destructive"
																			size="icon"
																			onClick={() =>
																				setNewPoll(prev => ({
																					...prev,
																					answers: prev.answers.filter((_, index) => index !== i),
																				}))
																			}
																		>
																			<X className="size-4" />
																		</Button>
																	)}
																</div>
															))}
															<Button
																onClick={() =>
																	setNewPoll(prev => ({
																		...prev,
																		answers: [...prev.answers, ''],
																	}))
																}
																variant="outline"
																className="w-full"
																disabled={newPoll.answers.length >= max_answers}
															>
																Add Answer Option ({newPoll.answers.length}/{max_answers})
															</Button>
														</div>
														<div className="space-y-4 pt-4 border-t border-border">
															<div className="flex items-center justify-between">
																<label className="text-sm font-medium text-foreground">
																	Set poll end time
																</label>
																<Switch
																	checked={newPoll.timed}
																	onCheckedChange={checked =>
																		setNewPoll(prev => ({ ...prev, timed: checked }))
																	}
																/>
															</div>
															{newPoll.timed && (
																<div className="space-y-4">
																	<Calendar
																		mode="single"
																		selected={selectedDate}
																		onSelect={handleDateSelect}
																		disabled={date => isBefore(date, new Date())}
																		className="rounded-md border border-border bg-card w-full flex justify-center"
																	/>
																	<div>
																		<label className="text-sm font-medium text-foreground">
																			Time
																		</label>
																		<Input
																			type="time"
																			value={selectedTime}
																			onChange={handleTimeChange}
																			className="mt-1"
																		/>
																	</div>
																</div>
															)}
														</div>
													</div>
												</ScrollArea>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<Button
														onClick={handleCreatePoll}
														disabled={
															!newPoll.question ||
															newPoll.answers.some(a => !a) ||
															isCreating ||
															(newPoll.timed && !newPoll.until)
														}
														className="bg-primary hover:bg-primary/90 text-primary-foreground"
													>
														{isCreating ? 'Creating...' : 'Create Poll'}
													</Button>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									)}
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleNavigation('prev')}
										disabled={parseInt(activeTab) === 0}
										className="h-8 w-8"
									>
										<ArrowLeft className="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleNavigation('next')}
										disabled={parseInt(activeTab) === displayedPolls.length - 1}
										className="h-8 w-8"
									>
										<ArrowRight className="size-4" />
									</Button>
									<AlertDialogCancel
										className="h-8 w-8 p-0 border-0 bg-transparent hover:bg-accent hover:text-accent-foreground text-foreground shadow-none rounded-md flex items-center justify-center"
										title="Close"
									>
										<X className="size-4" />
									</AlertDialogCancel>
								</div>
							</div>

							<AlertDialogCancel className="hidden md:flex absolute top-2 right-2 sm:top-4 sm:right-4 z-50 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors backdrop-blur-md border border-border h-auto w-auto has-[>svg]:px-2">
								<X className="size-4 sm:size-5" />
							</AlertDialogCancel>

							<ScrollArea className="flex-1 h-full min-h-0 p-4 sm:p-6 md:p-8">
								{isLoading ? (
									<div className="space-y-6">
										<Skeleton className="h-12 w-3/4" />
										<div className="space-y-4">
											{[1, 2, 3].map((_, i) => (
												<Skeleton key={i} className="h-16 w-full" />
											))}
										</div>
									</div>
								) : (
									displayedPolls.map((poll, index) => (
										<div
											key={poll.id}
											className={activeTab === index.toString() ? 'block' : 'hidden'}
										>
											<div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
												<div className="space-y-2">
													<h2 className="text-xl sm:text-2xl font-bold font-syne text-foreground leading-tight wrap-anywhere">
														{poll.question}
													</h2>
													<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
														<span className="flex items-center gap-1">
															<BarChart2 className="size-3" />
															{getTotalVotes(poll)} votes
														</span>
														{(poll.until || poll.endedAt) && (
															<span className="flex items-center gap-1">
																<Clock className="size-3" />
																{poll.endedAt
																	? `Ended ${format(poll.endedAt, 'MMM d, yyyy')}`
																	: `Ends ${format(poll.until!, 'MMM d, yyyy')}`}
															</span>
														)}
													</div>
												</div>

												{(poll.endedAt ||
													(!poll.endedAt && poll.until && isPast(poll.until))) && (
													<div className="bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/20 dark:border-yellow-500/30 rounded-lg p-3 sm:p-4 text-yellow-700 dark:text-yellow-200 text-xs sm:text-sm flex items-center gap-2">
														<Clock className="size-4 shrink-0" />
														<span>This poll has ended. Voting is closed.</span>
													</div>
												)}

												<div className="space-y-3">
													{poll.answers.map((answer: string, answerIndex: number) => (
														<div key={answerIndex} className="relative">
															{!hasUserVoted[poll.id] &&
															!poll.endedAt &&
															(!poll.until || !isPast(poll.until)) ? (
																<RadioGroup
																	value={selectedOption?.toString()}
																	onValueChange={value => setSelectedOption(Number(value))}
																>
																	<div
																		className={`
																			relative flex items-center p-3 sm:p-4 rounded-xl border transition-all cursor-pointer
																			${
																				selectedOption === answerIndex
																					? 'bg-primary/10 border-primary/50 ring-1 ring-primary/50'
																					: 'bg-muted border-border hover:bg-muted/80 hover:border-border'
																			}
																		`}
																		onClick={() => setSelectedOption(answerIndex)}
																	>
																		<RadioGroupItem
																			value={answerIndex.toString()}
																			id={`option-${poll.id}-${answerIndex}`}
																			className="mr-3 sm:mr-4"
																		/>
																		<span className="text-foreground font-medium text-sm sm:text-base wrap-anywhere">
																			{answer}
																		</span>
																	</div>
																</RadioGroup>
															) : (
																<div className="relative overflow-hidden rounded-xl bg-muted border border-border">
																	<div
																		className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-1000 ease-out"
																		style={{
																			width: `${getVotePercentage(
																				poll.votes[answerIndex],
																				getTotalVotes(poll),
																			)}%`,
																		}}
																	/>
																	<div className="relative p-3 sm:p-4 flex justify-between items-center z-10 gap-2">
																		<span className="font-medium text-foreground text-sm sm:text-base flex-1 min-w-0 truncate">
																			{answer}
																		</span>
																		<div className="flex items-center gap-2 sm:gap-3 shrink-0">
																			<span className="text-xs sm:text-sm text-muted-foreground">
																				{poll.votes[answerIndex]}{' '}
																				{poll.votes[answerIndex] === 1 ? 'vote' : 'votes'}
																			</span>
																			<span className="font-bold text-primary text-sm sm:text-base">
																				{Math.round(
																					getVotePercentage(
																						poll.votes[answerIndex],
																						getTotalVotes(poll),
																					),
																				)}
																				%
																			</span>
																		</div>
																	</div>
																</div>
															)}
														</div>
													))}
												</div>

												<div>
													{!hasUserVoted[poll.id]
														? !poll.endedAt &&
															(!poll.until || new Date() <= new Date(poll.until)) && (
																<Button
																	size="lg"
																	onClick={() => handleVote(poll.id)}
																	disabled={selectedOption === null || isVoting[poll.id]}
																	className="w-full font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 text-sm sm:text-base py-5 sm:py-6"
																>
																	{isVoting[poll.id] ? 'Submitting Vote...' : 'Submit Vote'}
																</Button>
															)
														: showVoteText[poll.id] && (
																<motion.div
																	initial={{ opacity: 0, y: 10 }}
																	animate={{ opacity: 1, y: 0 }}
																	className="flex items-center justify-center gap-2 text-green-400 font-medium p-3 sm:p-4 bg-green-500/10 rounded-xl border border-green-500/20 text-sm sm:text-base"
																>
																	<CheckCircle2 className="size-4 sm:size-5" />
																	Thank you for voting!
																</motion.div>
															)}
												</div>

												{isAdmin && <PollAdminActions poll={poll} />}
											</div>
										</div>
									))
								)}
							</ScrollArea>
						</div>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
