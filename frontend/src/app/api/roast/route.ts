import { NextResponse } from 'next/server';
import { cloneRepository, cleanupRepository } from '@/lib/gitService';
import { analyzeRepository } from '@/lib/analysisService';
import { generateRoast } from '@/lib/roastService';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
        }

        // Attempting to clone and analyze
        const repoId = Date.now().toString(); // unique ID for concurrent requests

        let repoPath: string | null = null;

        try {
            console.log(`Cloning ${url}...`);
            repoPath = await cloneRepository(url, repoId);

            console.log(`Analyzing ${url}...`);
            const metrics = await analyzeRepository(repoPath);

            console.log(`Generating roast...`);
            const roastContent = generateRoast(metrics);

            return NextResponse.json({
                metrics,
                roast: roastContent,
            });
        } catch (innerError: any) {
            console.error('Core error roasting repository:', innerError);
            return NextResponse.json(
                { error: 'Failed to roast repository. Make sure the URL is a public git repo.' },
                { status: 500 }
            );
        } finally {
            if (repoPath) {
                await cleanupRepository(repoPath);
            }
        }
    } catch (error: any) {
        console.error('Request parsing error:', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
