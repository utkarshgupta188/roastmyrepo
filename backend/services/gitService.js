const simpleGit = require('simple-git');
const fs = require('fs');

async function cloneRepository(url, targetPath) {
    const git = simpleGit();
    try {
        await git.clone(url, targetPath, ['--depth', '1']); // shallow clone for speed
    } catch (error) {
        throw new Error(`Failed to clone repository: ${error.message}`);
    }
}

async function cleanupRepository(targetPath) {
    try {
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
        }
    } catch (error) {
        console.error(`Failed to cleanup ${targetPath}:`, error);
    }
}

module.exports = {
    cloneRepository,
    cleanupRepository
};
