import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function cloneRepository(url: string, repoId: string): Promise<string> {
    const tempDir = os.tmpdir();
    const targetPath = path.join(tempDir, repoId);

    try {
        // Ensure directory is clean
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
        }

        await git.clone({
            fs,
            http,
            dir: targetPath,
            url: url,
            singleBranch: true,
            depth: 1
        });
        return targetPath;
    } catch (error: any) {
        console.error("Isomorphic git error:", error);
        throw new Error(`Failed to clone repository: ${error.message}`);
    }
}

export async function cleanupRepository(targetPath: string) {
    try {
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
        }
    } catch (error) {
        console.error(`Failed to cleanup ${targetPath}:`, error);
    }
}

export async function cleanupOldRepositories() {
    try {
        const tempDir = os.tmpdir();
        const files = fs.readdirSync(tempDir);
        const now = Date.now();

        for (const file of files) {
            if (file.startsWith('roastmyrepo-')) {
                const targetPath = path.join(tempDir, file);
                try {
                    const stats = fs.statSync(targetPath);
                    // Delete if older than 5 minutes (300000 ms) to avoid deleting active clones
                    if (now - stats.mtimeMs > 300000) {
                        fs.rmSync(targetPath, { recursive: true, force: true });
                    }
                } catch (e) {
                    continue; // Ignore individual file errors
                }
            }
        }
    } catch (error) {
        console.error(`Failed to cleanup old repositories:`, error);
    }
}
