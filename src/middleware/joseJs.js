import { createRemoteJWKSet } from 'jose';

const authUrl = process.env.BETTER_AUTH_URL;

if (!authUrl) {
    throw new Error('auth url is missing');
}

export const JWKS = createRemoteJWKSet(
    new URL(`${authUrl}/api/auth/jwks`)
);