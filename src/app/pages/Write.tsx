import { RequestInfo } from "rwsdk/worker";

import { Page } from "@/app/pages/Page";
import { App } from "@/app/editor/App";

export function Write({ ctx }: RequestInfo) {
	return (
		<Page session={ctx.session}>
			<App session={ctx.session} />
		</Page>
	);
}
