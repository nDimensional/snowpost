import { RequestInfo } from "rwsdk/worker";

export function Profile({ ctx }: RequestInfo) {
	if (ctx.session === null) {
		return new Response(null, {
			status: 302,
			headers: { Location: "/login" },
		});
	}

	return (
		<div className="content flex justify-center mt-16 mb-12">
			<p>You are logged in as {ctx.session.handle ?? ctx.session.did}</p>
		</div>
	);
}
