import { RequestInfo } from "rwsdk/worker";

export function Profile({ ctx }: RequestInfo) {
	if (ctx.session === null) {
		return new Response(null, {
			status: 302,
			headers: { Location: "/login" },
		});
	}

	const user = ctx.session.handle ?? ctx.session.did;
	const profileURL = `https://bsky.app/profile/${user}`;

	return (
		<div className="content flex justify-start mt-16 mb-12">
			<p>
				You are logged in as{" "}
				<a target="_blank" href={profileURL}>
					{user}
				</a>
				.
			</p>
			<p>
				<a href="/logout">Log out</a>
			</p>
		</div>
	);
}
