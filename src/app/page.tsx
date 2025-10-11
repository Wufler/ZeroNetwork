export const dynamic = 'force-dynamic'
import { fetchData } from '@/actions/data'
import Home from '@/components/Home'
import Dev from '@/components/Dev'

export default async function Page() {
	const data = await fetchData()

	if (!data) {
		return <Dev h1={'Something went wrong! Check back later.'} />
	}

	return <Home data={data} />
}
