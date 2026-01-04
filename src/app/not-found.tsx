import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
	return (
		<main className="flex justify-center items-center px-6 py-24 sm:py-32 lg:px-8">
			<div className="text-center">
				<h1 className="text-4xl font-bold font-source tracking-tight text-black dark:text-white sm:text-5xl mb-4">
					Whoops!
				</h1>
				<p className="text-lg leading-7 text-gray-600 dark:text-gray-300 mb-8">
					This page either doesn&apos;t exist or got changed. 🤔
				</p>
				<Button size="lg" asChild>
					<Link href={'/'}>Back to Home</Link>
				</Button>
			</div>
		</main>
	)
}
