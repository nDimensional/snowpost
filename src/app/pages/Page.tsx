export const Page: React.FC<{
	session: { did: string; handle: string | null } | null;
	children: React.ReactNode;
}> = (props) => {
	return (
		<div id="root" className="py-8 mx-auto flex flex-col">
			<header className="py-3 px-5 bg-stone-300 flex flex-row justify-between items-center text-sm">
				<span>
					<a href="/" className="icon">
						❅
					</a>
				</span>
				<span className="inline-flex gap-2">
					<a href="/write">write</a>
					<span className="text-stone-400">∣</span>
					<a href="/about">about</a>
					<span className="text-stone-400">∣</span>
					{/*<button className="cursor-pointer underline">sign in</button>*/}
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
