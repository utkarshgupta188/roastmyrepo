import { NextResponse } from 'next/server';
import { cloneRepository, cleanupRepository, cleanupOldRepositories } from '@/lib/gitService';
import { analyzeRepository } from '@/lib/analysisService';
import { generateRoast } from '@/lib/roastService';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
        }

        // Fire and forget old repo cleanup (don't specifically wait for it to slow down the request)
        cleanupOldRepositories().catch(console.error);

        // Attempting to clone and analyze
        const repoId = `roastmyrepo-${Date.now().toString()}-` + Math.floor(Math.random() * 1000); // unique ID

        let repoPath: string | null = null;

        try {
            console.log(`Cloning ${url}...`);
            repoPath = await cloneRepository(url, repoId);

            console.log(`Analyzing ${url}...`);
            const metrics = await analyzeRepository(repoPath);

            console.log(`Generating roast...`);
            const roastContent = await generateRoast(metrics);

            // Delete instantly before sending a successful response
            if (repoPath) {
                await cleanupRepository(repoPath);
                repoPath = null;
            }

            return NextResponse.json({
                metrics,
                roast: roastContent,
            });
        } catch (innerError: any) {
            console.error('Core error roasting repository:', innerError);

            // Delete instantly before sending an error response
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
    } catch (error: any) {
        console.error('Request parsing error:', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
