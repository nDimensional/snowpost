import { Header } from "./Header";
import styles from "./styles.css?url";

export const Document: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Snowpost</title>

			<link rel="stylesheet" href={styles} />
			<script type="module" src="/src/client.tsx"></script>
		</head>
		<body>
			<div id="root" className="py-8 max-w-3xl mx-auto flex flex-col">
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
