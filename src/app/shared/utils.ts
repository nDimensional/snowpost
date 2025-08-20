/** copied from https://atproto.com/specs/handle */
export const handlePattern =
	/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

export const bareHandlePattern = /^[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

const B32_CHARS = "234567abcdefghijklmnopqrstuvwxyz";

export function getClock(): [clock: string, date: Date] {
	const now = new Date();
	// js only gives us millisecond precision, so we'll randomise the last 3 microsecond digits
	const unix_micros = Math.floor((now.getTime() + Math.random()) * 1000);
	let tid = "";
	for (var i = 0; i < 11; i++) {
		// js bitshifts truncate to 32 bits because js is an amazing language, so we use Math instead
		tid += B32_CHARS[Math.floor(unix_micros * Math.pow(0.5, 50 - i * 5)) % 32];
	}
	return [tid, now];
}
