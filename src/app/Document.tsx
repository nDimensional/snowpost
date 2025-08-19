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
			<div id="root" className="my-8 max-w-3xl mx-auto">
				{/*<Header title={<span className="text-2xl">❅</span>} />*/}
				<Header
					title={
						<a href="/" id="home">
							❅
						</a>
					}
				/>
				<main>{children}</main>
			</div>
		</body>
	</html>
);
