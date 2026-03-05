import { getPlaiceholder } from "plaiceholder";
import { unstable_cache } from "next/cache";

export const getBase64 = unstable_cache(async (imageURL: string) => {
    try {
        const res = await fetch(imageURL);

        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
        }

        const buffer = await res.arrayBuffer();

        const { base64 } = await getPlaiceholder(Buffer.from(buffer));

        return base64;
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.stack);
        }
        return undefined;
    }
}, ["base64-cache"]);