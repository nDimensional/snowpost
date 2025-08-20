import { RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

import { Page } from "@/app/pages/Page";

async function getUserList(): Promise<
	{ did: string; handle: string | null }[]
> {
	const sql = `
		SELECT did, handle
      FROM (
        SELECT did, handle,
          ROW_NUMBER() OVER (PARTITION BY did ORDER BY id DESC) as rn
        FROM posts
      )
      WHERE rn = 1;
  `;

	const result = await env.DB.prepare(sql).all<{
		did: string;
		handle: string | null;
	}>();

	return result.results;
}

export async function Directory({ ctx }: RequestInfo<{}>) {
	const userList = await getUserList();

	return (
		<Page session={ctx.session}>
			<div className="flex flex-row gap-2 mt-16 mb-12">
				<ul>
					{userList.map(({ did, handle }) => {
						const user = handle ?? did;
						return (
							<li className="flex flex-row gap-1" key={did}>
								<span className="text-stone-400">/</span>
								<a href={`/${user}`}>{user}</a>
							</li>
						);
					})}
				</ul>
			</div>
		</Page>
	);
}
