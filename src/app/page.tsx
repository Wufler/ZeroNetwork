export const dynamic = "force-dynamic";

import Dev from "@/components/Dev";
import Home from "@/components/Home";
import { fetchData } from "./actions/data";

export default async function Page() {
  const data = await fetchData();

  if (!data) {
    return <Dev h1={"Something went wrong! Check back later."} />;
  }

  return <Home data={data} />;
}
