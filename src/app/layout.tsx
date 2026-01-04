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
	description: 'Take a look at our Minecraft history and current server status!',
	metadataBase: new URL('https://zeronetwork.vercel.app/'),
	openGraph: {
		title: 'Im Her Zero Network',
		description:
			'Take a look at our Minecraft history and current server status!',
		url: 'https://zeronetwork.vercel.app/',
		images: [
			{
				url: '/cover.png',
				width: 1280,
				height: 720,
				alt: 'Thumbnail',
			},
		],
		locale: 'en_US',
		type: 'website',
	},
}

export default function RootLayout({
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
