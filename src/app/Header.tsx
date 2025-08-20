import React from "react";

export interface HeaderProps {
	title: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
	return (
		<header className="py-3 px-5 bg-stone-300 flex flex-row justify-between items-center text-sm">
			<span>{title}</span>
			<span className="inline-flex gap-2">
				<a href="/write">write</a>
				<span className="text-stone-400">∣</span>
				<a href="/about">about</a>
				<span className="text-stone-400">∣</span>
				{/*<button className="cursor-pointer underline">sign in</button>*/}
				<a className="cursor-pointer underline" href="/login">
					sign in
				</a>
			</span>
		</header>
	);
};
