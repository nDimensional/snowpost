// import { env } from "cloudflare:workers";

// const bskyApiUrl =
// 	"https://bsky.social/xrpc/com.atproto.identity.resolveHandle";
// const plcApiUrl = " https://plc.directory";

// export async function resolveUser(
// 	user: string,
// ): Promise<{ did: string; handle: string | null } | null> {
// 	if (user.startsWith("did:")) {
// 		const did = user;
// 		let handle = await env.DID_TO_HANDLE.get(did);
// 		if (handle !== null) {
// 			return { did, handle };
// 		}

// 		if (did.startsWith("did:plc:")) {
// 			try {
// 				const res = await fetch(`${plcApiUrl}/${did}`);
// 				if (res.ok) {
// 					const { alsoKnownAs } = await res.json<{ alsoKnownAs: string[] }>();
// 					const url = new URL(alsoKnownAs[0]);
// 					handle = url.host;
// 				}
// 			} catch (err) {
// 				console.error(err);
// 			}
// 		}

// 		if (handle !== null) {
// 			await env.DID_TO_HANDLE.put(did, handle, { expirationTtl: 60 * 60 * 24 });
// 			await env.HANDLE_TO_DID.put(handle, did, { expirationTtl: 60 * 60 * 24 });
// 		}

// 		return { did, handle };
// 	} else {
// 		const handle = user;
// 		let did = await env.HANDLE_TO_DID.get(handle);
// 		if (did !== null) {
// 			return { did, handle };
// 		}

// 		try {
// 			const res = await fetch(`${bskyApiUrl}?handle=${handle}`);
// 			if (!res.ok) {
// 				return null;
// 			}

// 			const result = await res.json<{ did: string }>();
// 			if (typeof result.did !== "string" || !result.did.startsWith("did:")) {
// 				return null;
// 			}

// 			did = result.did;
// 		} catch (err) {
// 			console.error(err);
// 			return null;
// 		}

// 		await env.HANDLE_TO_DID.put(handle, did, { expirationTtl: 60 * 60 * 24 });
// 		await env.DID_TO_HANDLE.put(did, handle, { expirationTtl: 60 * 60 * 24 });

// 		return { did, handle };
// 	}
// }
