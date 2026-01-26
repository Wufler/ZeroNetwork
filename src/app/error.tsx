'use client'
import { Button } from '@/components/ui/button'

export default function Error({ reset }: { reset: () => void }) {
	return (
		<main className="flex justify-center items-center px-6 py-24 sm:py-32 lg:px-8">
			<div className="text-center">
				<h1 className="text-4xl font-bold font-source tracking-tight text-black dark:text-white sm:text-5xl mb-4">
					uuh...
				</h1>
				<p className="text-lg leading-7 text-gray-600 dark:text-gray-300 mb-8">
					We encountered an unexpected error.
					<br />
					Check back later, we may be already working on it.
				</p>
				<Button size="lg" onClick={() => reset()}>
					Try Again
				</Button>
			</div>
		</main>
	)
}
