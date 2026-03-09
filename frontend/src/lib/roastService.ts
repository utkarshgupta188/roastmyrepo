import { Metrics } from './analysisService';

export function generateRoast(metrics: Metrics): string {
    const roasts: string[] = [];
    const { totalFiles, totalLines, languages, largeFiles, hasReadme, hasGitignore, hasTests } = metrics;

    if (totalFiles === 0) {
        return "Are you sure this isn't an empty folder? Because I found absolutely nothing.";
    } else if (totalFiles < 10) {
        roasts.push("A cute little micro-repo. Don't worry, I'm sure it'll grow up to be a real application someday.");
    } else if (totalFiles > 1000) {
        roasts.push("Over 1000 files? What is this, an enterprise Java Spring Boot monolith from 2008? Are you getting paid per file?");
    } else {
        roasts.push("I see you've managed to write some files. Barely.");
    }

    if (totalLines > 50000) {
        roasts.push(`With ${totalLines.toLocaleString()} lines of code, I'm assuming half of it is commented-out experiments you were too scared to delete.`);
    } else if (totalLines > 10000) {
        roasts.push(`Okay, ${totalLines.toLocaleString()} lines of code. Hopefully you know what half of them do.`);
    } else if (totalLines < 100) {
        roasts.push(`Only ${totalLines} lines? My \`.gitignore\` is more complex than your entire application.`);
    }

    if (!hasReadme) {
        roasts.push("No README.md. Documentation is for the weak, right? Anyone trying to use this has to guess how to run it like an escape room puzzle.");
    }

    if (!hasGitignore) {
        roasts.push("Wait, no .gitignore? Have you been committing node_modules this whole time? Disgusting.");
    }

    if (!hasTests) {
        roasts.push("I didn't find any test files. I guess your testing strategy is 'push to main and see who complains'. Brave, but foolish.");
    } else {
        roasts.push("Oh wow, you actually have tests. Let me guess, they're just \`expect(true).toBe(true)\`?");
    }

    if (largeFiles.length > 0 && largeFiles[0].lines > 1000) {
        roasts.push(`Let's talk about \`${largeFiles[0].file}\` with its ${largeFiles[0].lines} lines. The principle of 'Single Responsibility' must have been taking a sick day when you wrote that abomination.`);
    }

    const langKeys = Object.keys(languages);
    if (langKeys.includes('JavaScript')) {
        roasts.push("Heavy on the JavaScript, I see. Who needs type safety when you have \`undefined is not a function\` keeping you on your toes?");
    }
    if (langKeys.includes('TypeScript')) {
        roasts.push("TypeScript, huh? Congrats on writing \`: any\` everywhere just to satisfy the compiler.");
    }
    if (langKeys.includes('Python')) {
        roasts.push("Python? Let me guess, it's 90% import statements and 10% trying to get environments to work.");
    }
    if (langKeys.includes('C++') || langKeys.includes('C')) {
        roasts.push("Oh look, memory management! Let me guess, 30% of this codebase is just fighting segfaults.");
    }

    roasts.push("Overall verdict: It works (probably), but I would wear protective gloves before doing a code review on this repo.");

    return roasts.join("\n\n");
}
