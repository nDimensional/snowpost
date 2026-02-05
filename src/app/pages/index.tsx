import { RequestInfo } from "rwsdk/worker"

const blizzardHeader = `
❆                          ❅                            ❅     ❆                          ❅
          ❅         ❆                   ❅                               ❅         ❆                   ❅   ❆
                          ❅                     ❆                                 ❅                     ❆
    ❅                                      ❅        ❅             ❆                          ❅
`.trim()

export async function Home({}: RequestInfo) {
	return (
		<>
			<div className="whitespace-pre overflow-clip tracking-widest my-12 select-none">{blizzardHeader}</div>
			<div className="content mt-16 mb-12 max-w-md">
				<p>Hello world!</p>
				<p>Snowpost is a simple, minimalist writing platform.</p>

				<p>
					You can log in with your <a href="https://bsky.app/">Bluesky</a> account and publish beautiful static pages to
					share with the world. That's it!
				</p>
				<p>
					Read more about Snowpost <a href="/about">here</a>, read{" "}
					<a href="/syntacrobat.xyz/3lwyhoxv2g7">an example post</a>, or get started{" "}
					<a href="/write">writing a new post</a>.
				</p>
			</div>
		</>
	)
}
