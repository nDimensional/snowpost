import type {
	HandleCache,
	ResolvedHandle,
} from "atproto-oauth-client-cloudflare-workers/handle-resolver";

import { env } from "cloudflare:workers";

const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
const DEFAULT_MAX_SIZE = 1024;

export interface HandleCacheKVOptions {
	ttl?: number;
	maxSize?: number;
}

export class HandleCacheKV implements HandleCache {
	ttl: number;
	maxSize: number;

	constructor(options: HandleCacheKVOptions = {}) {
		this.ttl = options.ttl ?? DEFAULT_TTL;
		this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
	}

	async get(key: string): Promise<ResolvedHandle | undefined> {
		const value = await env.HANDLE_CACHE.get(key);
		if (value === null) {
			return undefined;
		} else {
			return value as ResolvedHandle;
		}
	}

	async set(key: string, value: ResolvedHandle): Promise<void> {
		if (value === null) {
			await env.HANDLE_CACHE.delete(key);
		} else {
			await env.HANDLE_CACHE.put(key, value, {
				expirationTtl: Math.round(this.ttl / 1000),
			});
		}
	}

	async del(key: string): Promise<void> {
		await env.HANDLE_CACHE.delete(key);
	}
}

export const handleCache = new HandleCacheKV();
