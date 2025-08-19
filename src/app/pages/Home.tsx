import { RequestInfo } from "rwsdk/worker";

export function Home({ ctx, request }: RequestInfo) {
	return (
		<div className="content">
			<p>hello world</p>
			<p>
				<a href="/directory">directory</a>
			</p>
			{ctx.session && <p>you are logged in as {ctx.session.did}</p>}
		</div>
	);
}
