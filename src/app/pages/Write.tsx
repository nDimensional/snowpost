import { RequestInfo } from "rwsdk/worker";

import { App } from "@/app/editor/App";

export function Write({ ctx }: RequestInfo) {
	return <App session={ctx.session} />;
}
