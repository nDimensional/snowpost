import { RequestInfo } from "rwsdk/worker";

import { client } from "@/app/oauth/oauth-client";

export async function Home({ ctx, request }: RequestInfo) {
	let user: string | null = null;
	if (ctx.session !== null) {
		try {
			const identity = await client.identityResolver.resolve(ctx.session.did);
			if (identity.handle === "handle.invalid") {
				user = identity.did;
			} else {
				user = identity.handle;
			}
		} catch (err) {
			console.error(err);
		}
	}

	return (
		<div className="content">
			<p>hello world</p>
			<p>
				<a href="/directory">directory</a>
			</p>
			{user && <p>you are logged in as {user}</p>}
		</div>
	);
}
