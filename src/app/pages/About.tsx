import { RequestInfo } from "rwsdk/worker";

import { Page } from "@/app/pages/Page";

export function About({ ctx, request }: RequestInfo) {
	return (
		<Page session={ctx.session}>
			<div className="content mt-16">
				<p>about snowpost</p>
			</div>
		</Page>
	);
}
