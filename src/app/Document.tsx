import { Header } from "./Header";
import styles from "./styles.css?url";

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
			<script type="module" src="/src/client.tsx"></script>
		</head>
		<body>
			<div id="root" className="py-8 mx-auto flex flex-col">
				{/*<Header title={<span className="text-2xl">❅</span>} />*/}
				<Header
					title={
						<a href="/" id="home">
							❅
						</a>
					}
				/>
				<main className="flex-1">{children}</main>
				{/*<footer className="min-h-8 border-t-4 border-stone-300 mx-6"></footer>*/}
			</div>
		</body>
	</html>
);
