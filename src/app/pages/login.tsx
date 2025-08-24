import { RequestInfo } from "rwsdk/worker";

export function Login({ ctx }: RequestInfo) {
	if (ctx.session !== null) {
		return new Response(null, {
			status: 302,
			headers: { Location: "/profile" },
		});
	}

	return (
		<div className="content flex justify-center mt-16 mb-12">
			<form
				className="flex flex-col align-end"
				method="get"
				action="/oauth/login"
				noValidate
			>
				<label className="my-2 flex items-center">
					<span className="mr-3">handle</span>
					<input
						name="handle"
						className="border border-stone-400 px-1"
						placeholder="my-handle.bsky.social"
					/>
				</label>
				<input
					type="submit"
					value="Login"
					className="my-2 border border-stone-400 cursor-pointer"
				/>
			</form>
		</div>
	);
}
