import { RequestInfo } from "rwsdk/worker";

import { Page } from "@/app/pages/Page";

export async function About({ ctx }: RequestInfo) {
	return (
		<Page session={ctx.session}>
			<div className="content mt-16 mb-12 max-w-md">
				<p>
					Snowpost is built on <a href="https://atproto.com/">ATProto</a>, the
					same protocol that powers BlueSky.
				</p>
				<p>
					Your posts are stored as raw markdown on your PDS. This means that you
					always retain access and ownership, even if Snowpost goes down.
				</p>
				<p>
					If you prefer, you can even create and update posts with other ATProto
					tools, not just the Snowpost website.
				</p>
			</div>
		</Page>
	);
}
