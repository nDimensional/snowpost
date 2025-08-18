import { RequestInfo } from "rwsdk/worker";

import { App } from "@/app/editor/App";

export function NewPost({ ctx }: RequestInfo) {
	return <App />;
}
