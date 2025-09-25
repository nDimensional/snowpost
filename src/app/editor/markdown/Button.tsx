import React, { useCallback, useState } from "react"

export interface ButtonProps {
	text: string
	onClick?: () => void
}

export const Button: React.FC<ButtonProps> = (props) => {
	const [isLoading, setIsLoading] = useState(false)
	const handleClick = useCallback(() => {
		setIsLoading(true)
		props.onClick?.()
	}, [])

	return (
		<button onClick={props.onClick} className="underline cursor-pointer">
			{props.text}
		</button>
	)
}
