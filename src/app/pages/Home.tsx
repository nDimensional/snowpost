import { RequestInfo } from "rwsdk/worker";

export function Home({ ctx, request }: RequestInfo) {
	return (
		<div className="content">
			<p>Hello world</p>
		</div>
	);
}
