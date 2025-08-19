import React from "react";

export interface HeaderProps {
	title: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
	return (
		<header className="p-4 bg-stone-300 flex flex-row justify-between">
			<span>{title}</span>
			<span className="inline-flex gap-2">
				<a href="/about">about</a>
				<span>|</span>
				<button className="cursor-pointer underline">sign in</button>
			</span>
		</header>
	);
};
