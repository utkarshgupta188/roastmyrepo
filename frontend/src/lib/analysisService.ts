import fs from 'fs';
import path from 'path';

const IGNORED_DIRS = new Set(['node_modules', '.git', 'venv', '__pycache__', 'dist', 'build', '.next']);

const EXTENSION_MAP: Record<string, string> = {
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.jsx': 'React (JSX)',
    '.tsx': 'React (TSX)',
    '.py': 'Python',
    '.java': 'Java',
    '.go': 'Go',
    '.rs': 'Rust',
    '.c': 'C',
    '.cpp': 'C++',
    '.cs': 'C#',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.html': 'HTML',
    '.css': 'CSS',
    '.md': 'Markdown',
    '.json': 'JSON'
};

function readDirRecursive(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        if (IGNORED_DIRS.has(file)) continue;

        if (fs.statSync(filePath).isDirectory()) {
            readDirRecursive(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    }
    return fileList;
}

export interface Metrics {
    totalFiles: number;
    languages: Record<string, number>;
    totalLines: number;
    largeFiles: { file: string; lines: number }[];
    hasReadme: boolean;
    hasGitignore: boolean;
    hasTests: boolean;
    codeContext?: string; // Content of README, package files, and a few small files
}

export async function analyzeRepository(repoPath: string): Promise<Metrics> {
    const files = readDirRecursive(repoPath);

    const metrics: Metrics = {
        totalFiles: 0,
        languages: {},
        totalLines: 0,
        largeFiles: [],
        hasReadme: false,
        hasGitignore: false,
        hasTests: false,
    };

    const fileStats: { file: string; lines: number; content: string }[] = [];
    let readmeContent = '';
    let packageContent = '';

    for (const filePath of files) {
        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).toLowerCase();

        if (fileName.toLowerCase() === 'readme.md') {
            metrics.hasReadme = true;
            try { readmeContent = fs.readFileSync(filePath, 'utf-8'); } catch (e) { }
        }
        if (fileName === '.gitignore') metrics.hasGitignore = true;
        if (fileName === 'package.json') {
            try { packageContent = fs.readFileSync(filePath, 'utf-8'); } catch (e) { }
        }
        if (fileName.includes('test') || fileName.includes('spec')) metrics.hasTests = true;

        if (EXTENSION_MAP[ext]) {
            const lang = EXTENSION_MAP[ext];
            metrics.languages[lang] = (metrics.languages[lang] || 0) + 1;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n').length;
            metrics.totalLines += lines;

            // Only store small-ish files for AI context (e.g., < 200 lines)
            if (lines < 200 && Object.values(EXTENSION_MAP).includes(EXTENSION_MAP[ext])) {
                fileStats.push({ file: path.relative(repoPath, filePath), lines, content });
            } else {
                fileStats.push({ file: path.relative(repoPath, filePath), lines, content: '' });
            }
        } catch (e) {
            // Ignore binary files
        }
    }

    fileStats.sort((a, b) => b.lines - a.lines);
    metrics.largeFiles = fileStats.slice(0, 5);
    metrics.totalFiles = fileStats.length;

    // Build concise code context for AI (up to ~3-4 small files max, plus readme/package)
    let aiContextStr = '';
    if (readmeContent) aiContextStr += `\n--- README.md ---\n${readmeContent.substring(0, 1500)}\n`;
    if (packageContent) aiContextStr += `\n--- package.json ---\n${packageContent.substring(0, 1000)}\n`;

    // Get up to 3 small source files to show coding style
    const smallCodeFiles = fileStats.filter(f => f.content && !f.file.includes('package.json') && !f.file.toLowerCase().includes('readme')).slice(0, 3);
    for (const f of smallCodeFiles) {
        aiContextStr += `\n--- ${f.file} ---\n${f.content.substring(0, 1500)}\n`;
    }

    // Ensure we don't blow up token limits, cap at ~10000 chars
    metrics.codeContext = aiContextStr.substring(0, 10000);

    return metrics;
}
