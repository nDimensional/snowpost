export function assert(condition: unknown, message?: string): asserts condition {
	if (!condition) {
		throw new Error(message ?? "assert failed")
	}
}

/** copied from https://atproto.com/specs/handle */
export const handlePattern =
	/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/

export const bareHandlePattern = /^[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/

export const tidPattern = /^[234567abcdefghijklmnopqrstuvwxyz]{11}$/

const B32_CHARS = "234567abcdefghijklmnopqrstuvwxyz"

export function getTID(date: Date): string {
	// js only gives us millisecond precision, so we'll randomise the last 3 microsecond digits
	const unix_micros = Math.floor((date.getTime() + Math.random()) * 1000)
	let tid = ""
	for (var i = 0; i < 11; i++) {
		// js bitshifts truncate to 32 bits because js is an amazing language, so we use Math instead
		tid += B32_CHARS[Math.floor(unix_micros * Math.pow(0.5, 50 - i * 5)) % 32]
	}
	return tid
}

export function parseTID(tid: string): Date {
	if (tid.length !== 11) {
		throw new Error("Invalid TID length: expected 11 characters")
	}

	let unix_micros = 0
	for (let i = 0; i < 11; i++) {
		const char = tid[i]
		const charIndex = B32_CHARS.indexOf(char)
		if (charIndex === -1) {
			throw new Error(`Invalid character in TID: ${char}`)
		}
		// Reverse the encoding: multiply by 2^(50-i*5) and add to result
		unix_micros += charIndex * Math.pow(2, 50 - i * 5)
	}

	// Convert microseconds back to milliseconds for Date constructor
	return new Date(unix_micros / 1000)
}
