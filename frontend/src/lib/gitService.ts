import simpleGit from 'simple-git';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function cloneRepository(url: string, repoId: string): Promise<string> {
    const git = simpleGit();
    const tempDir = os.tmpdir();
    const targetPath = path.join(tempDir, repoId);

    try {
        await git.clone(url, targetPath, ['--depth', '1']); // shallow clone for speed
        return targetPath;
    } catch (error: any) {
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
