import { NextResponse } from 'next/server';
import { cloneRepository, cleanupRepository, cleanupOldRepositories } from '@/lib/gitService';
import { analyzeRepository } from '@/lib/analysisService';
import { generateRoast } from '@/lib/roastService';
import { checkRateLimit } from '@/lib/rateLimiter';

// Allowed origins — add localhost for dev, production domain for prod
const ALLOWED_ORIGINS = [
    'https://roastmyrepo.vercel.app',
];

function getClientIp(request: Request): string {
    // Vercel forwards the real IP via x-forwarded-for
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return 'unknown';
}

export async function POST(request: Request) {
    // ── Origin check ──────────────────────────────────────────────────────────
    const origin = request.headers.get('origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin)) {
        console.warn(`Blocked request from disallowed origin: ${origin}`);
        return NextResponse.json(
            { error: 'Forbidden: requests must originate from the Repo Roaster site.' },
            { status: 403 }
        );
    }

    // ── Rate limiting ─────────────────────────────────────────────────────────
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(ip);

    if (!allowed) {
        console.warn(`Rate limit exceeded for IP: ${ip}`);
        return NextResponse.json(
            { error: `Too many requests. Please wait ${retryAfterSeconds} seconds before trying again.` },
            {
                status: 429,
                headers: {
                    'Retry-After': String(retryAfterSeconds),
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Window': '60s',
                },
            }
        );
    }

    // ── Core logic ────────────────────────────────────────────────────────────
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
        }

        // Fire and forget old repo cleanup
        cleanupOldRepositories().catch(console.error);

        const repoId = `roastmyrepo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        let repoPath: string | null = null;

        try {
            console.log(`Cloning ${url}...`);
            repoPath = await cloneRepository(url, repoId);

            console.log(`Analyzing ${url}...`);
            const metrics = await analyzeRepository(repoPath);

            console.log(`Generating roast...`);
            const roastContent = await generateRoast(metrics);

            if (repoPath) {
                await cleanupRepository(repoPath);
                repoPath = null;
            }

            return NextResponse.json({ metrics, roast: roastContent });
        } catch (innerError: unknown) {
            console.error('Core error roasting repository:', innerError);

            if (repoPath) {
                await cleanupRepository(repoPath);
                repoPath = null;
            }

            return NextResponse.json(
                { error: 'Failed to roast repository. Make sure the URL is a public git repo.' },
                { status: 500 }
            );
        } finally {
            if (repoPath) {
                await cleanupRepository(repoPath);
            }
        }
    } catch (error: unknown) {
        console.error('Request parsing error:', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
