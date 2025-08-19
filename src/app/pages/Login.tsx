import { RequestInfo } from "rwsdk/worker";

export function Login({ ctx, request }: RequestInfo) {
	return (
		<div className="content my-16 flex justify-center">
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
						value="syntacrobat.xyz"
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
