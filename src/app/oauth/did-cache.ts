import type { Did, DidDocument } from "@atproto/did";

import { DidCache } from "atproto-oauth-client-cloudflare-workers/did-resolver";

import { env } from "cloudflare:workers";

const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // ~50MB

export interface DidCacheKVOptions {
	ttl?: number;
	maxSize?: number;
}

export class DidCacheKV implements DidCache {
	ttl: number;
	maxSize: number;

	constructor(options: DidCacheKVOptions = {}) {
		this.ttl = options.ttl ?? DEFAULT_TTL;
		this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
	}

	async get(key: Did): Promise<DidDocument | undefined> {
		const value = await env.DID_CACHE.get(key);
		if (value === null) {
			return undefined;
		} else {
			return JSON.parse(value);
		}
	}

	async set(key: Did, value: DidDocument): Promise<void> {
		await env.DID_CACHE.put(key, JSON.stringify(value), {
			expirationTtl: Math.round(this.ttl / 1000),
		});
	}

	async del(key: Did): Promise<void> {
		await env.DID_CACHE.delete(key);
	}
}

export const didCache = new DidCacheKV();
