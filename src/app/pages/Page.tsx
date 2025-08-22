export const Page: React.FC<{
	session: { did: string; handle: string | null } | null;
	children: React.ReactNode;
}> = (props) => {
	return (
		<div id="root" className="mx-auto flex flex-col">
			<header className="py-3 bg-stone-300 flex flex-row justify-between items-center">
				<span className="inline-flex gap-2">
					<a href="/" className="icon">
						<img src="/icon-96x96.png" width={24} height={24} />
					</a>
				</span>
				<span className="inline-flex gap-2">
					<a href="/write">write</a>
					<span className="text-stone-400">∣</span>
					<a href="/recent">recent</a>
					<span className="text-stone-400">∣</span>
					<a href="/about">about</a>
					<span className="text-stone-400">∣</span>
					{/*<button className="cursor-pointer underline">sign in</button>*/}
					{/*<a href="/profile">profile</a>*/}
					{props.session === null ? (
						<a className="cursor-pointer underline" href="/login">
							sign in
						</a>
					) : (
						<a className="cursor-pointer underline" href="/logout">
							sign out
						</a>
					)}
				</span>
			</header>
			<main className="flex-1">{props.children}</main>
			{/*<footer className="min-h-8 border-t-4 border-stone-300 mx-6"></footer>*/}
		</div>
	);
};
