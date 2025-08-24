import styles from "./styles.css?url";
import fonts from "./fonts.css?url";

export const Document: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<link rel="icon" href="/favicon.ico" type="image/x-icon" />
			<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
			<title>Snowpost</title>

			<link rel="stylesheet" href={styles} />
			<link rel="stylesheet" href={fonts} />
			<script type="module" src="/src/client.tsx"></script>
		</head>
		<body>
			<div id="root" className="flex flex-col">
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
						<a href="/profile">profile</a>
					</span>
				</header>
				<main className="flex-1">{children}</main>
			</div>
		</body>
	</html>
);
