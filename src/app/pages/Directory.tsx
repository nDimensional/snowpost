import { RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

async function getUserList(): Promise<
	{ did: string; handle: string | null }[]
> {
	const result = await env.DB.prepare(
		"SELECT DISTINCT did, handle FROM posts;",
	).all<{
		did: string;
		handle: string | null;
	}>();
	return result.results;
}

export async function Directory({ ctx }: RequestInfo<{}>) {
	const userList = await getUserList();

	return (
		<div>
			<div className="flex flex-row gap-2 py-2">
				<ul>
					<li>
						<a href="/">/</a>
					</li>
					{userList.map(({ did, handle }) => {
						const user = handle ?? did;
						return (
							<li key={did}>
								<a href={`/${user}`}>{user}</a>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
