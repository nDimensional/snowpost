import { RequestInfo } from "rwsdk/worker";

import { Page } from "@/app/pages/Page";

const blizzardHeader = `
❆                          ❅                            ❅     ❆                          ❅
          ❅         ❆                   ❅                               ❅         ❆                   ❅   ❆
                          ❅                     ❆                                 ❅                     ❆
    ❅                                      ❅        ❅             ❆                          ❅
`.trim();

export async function Home({ ctx }: RequestInfo) {
	return (
		<Page session={ctx.session}>
			<div className="whitespace-pre overflow-clip tracking-widest my-12">
				{blizzardHeader}
			</div>
			<div className="content mt-16 mb-12 max-w-md">
				<p>Hello world!</p>
				<p>Snowpost is a simple, minimalist writing platform.</p>

				<p>
					You can log in with your <a href="https://bsky.app/">BlueSky</a>{" "}
					account and publish beautiful static pages to share with the world.
					That's it!
				</p>
				<p>
					Read more about Snowpost <a href="/about">here</a>, check out some{" "}
					<a href="/recent">recent posts</a>, or get started{" "}
					<a href="/write">writing a new post</a>.
				</p>
			</div>
		</Page>
	);
}
