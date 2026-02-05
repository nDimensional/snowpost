import { RequestInfo } from "rwsdk/worker"

const blizzardHeader = `
❅                       ❆                    ❅                          ❆                     ❅
  ❆                   ❅                               ❆                   ❅                       ❆
           ❅                     ❆                           ❅                     ❆
   ❆                      ❅        ❆                   ❅                      ❆        ❅
`.trim()

export async function About({}: RequestInfo) {
	return (
		<>
			<div className="whitespace-pre overflow-clip tracking-widest my-12 select-none">{blizzardHeader}</div>
			<div className="content mt-16 mb-12 max-w-md">
				<p>
					Snowpost is built on <a href="https://atproto.com/">ATProto</a>, the same protocol that powers Bluesky.
				</p>
				<p>
					Your posts are stored as raw markdown on your PDS. This means that you always retain access and ownership,
					even if Snowpost goes down.
				</p>
				<p>
					If you prefer, you can even create and update posts with other ATProto tools, not just the Snowpost website.
				</p>
			</div>
		</>
	)
}
