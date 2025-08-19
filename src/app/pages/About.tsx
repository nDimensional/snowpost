import { RequestInfo } from "rwsdk/worker";

export function About({ ctx, request }: RequestInfo) {
	return (
		<div className="content">
			<p>about snowpost</p>
		</div>
	);
}
