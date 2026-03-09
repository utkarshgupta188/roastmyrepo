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

    const fileStats: { file: string; lines: number }[] = [];

    for (const filePath of files) {
        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).toLowerCase();

        if (fileName.toLowerCase() === 'readme.md') metrics.hasReadme = true;
        if (fileName === '.gitignore') metrics.hasGitignore = true;
        if (fileName.includes('test') || fileName.includes('spec')) metrics.hasTests = true;

        if (EXTENSION_MAP[ext]) {
            const lang = EXTENSION_MAP[ext];
            metrics.languages[lang] = (metrics.languages[lang] || 0) + 1;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n').length;
            metrics.totalLines += lines;

            fileStats.push({ file: path.relative(repoPath, filePath), lines });
        } catch (e) {
            // Ignore binary files
        }
    }

    fileStats.sort((a, b) => b.lines - a.lines);
    metrics.largeFiles = fileStats.slice(0, 5);
    metrics.totalFiles = fileStats.length;

    return metrics;
}
