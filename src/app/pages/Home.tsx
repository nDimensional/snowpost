import { RequestInfo } from "rwsdk/worker";

import { Page } from "@/app/pages/Page";

export async function Home({ ctx, request }: RequestInfo) {
	return (
		<Page session={ctx.session}>
			<div className="content mt-16 mb-12">
				<p>hello world</p>
				{ctx.session && (
					<p>you are logged in as {ctx.session.handle ?? ctx.session.did}</p>
				)}
			</div>
		</Page>
	);
}
