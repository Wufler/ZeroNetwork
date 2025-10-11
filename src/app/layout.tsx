import type { Metadata } from 'next'
import { Inter, Syne } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const syne = Syne({ variable: '--font-syne', subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Im Her Zero Network',
	description: "ImHer0's Minecraft Server",
	openGraph: {
		title: 'Im Her Zero Network',
		description: 'Check the status of our servers!',
		url: 'https://zeronetwork.vercel.app/',
		images: [
			{
				url: 'https://wolfey.s-ul.eu/oTDF5P9b',
				width: 1280,
				height: 720,
				alt: 'Thumbnail',
			},
		],
		locale: 'en_US',
		type: 'website',
	},
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.className} ${syne.variable}`}>
				<ThemeProvider
					defaultTheme="system"
					attribute="class"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster position="bottom-center" />
					<Analytics />
					<SpeedInsights />
				</ThemeProvider>
			</body>
		</html>
	)
}
