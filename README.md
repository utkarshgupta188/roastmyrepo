# Repo Roaster 🔥

A full-stack web application to analyze Git repositories and generate humorous but technically accurate "roasts" about their code quality. 

**🔴 LIVE DEMO: [Repo Roaster](https://roastmyrepo.vercel.app/)**

Built with **Next.js**, **TailwindCSS**, and **Framer Motion**.

![Repo Roaster Preview](https://raw.githubusercontent.com/utkarshgupta188/roastmyrepo/main/frontend/public/preview.png)

## Features
- **Sleek Aesthetic Design**: Dark mode by default, gorgeous Framer Motion entrance animations, glowing button hovers, and animated gradients.
- **Micro-Animations**: The Loading spinner features a bouncing Flame icon while cycling through randomly funny loading quotes (*"Judging your variable naming choices..."*).
- **Stat Cards**: Beautifully laid-out metric cards showcasing the codebase structure accurately before delivering the final comedic blow.
- **Deep Code Analysis**: Serverless functions that clone your public repo and scan for File Counts, Lines of Code (LOC), programming languages, abnormally large files, and standard practices (Tests, `.gitignore`, etc).

## How to Run Locally

### Next.js App (Frontend + API Routes)

This project has been migrated to use Next.js App Router API Routes (`/api/roast`) to support Serverless deployment, so you only need to run the `frontend` folder.

```bash
cd frontend
npm install
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000) and drop in any public git repository URL!

## Deploying to Vercel

The application has been explicitly optimized for **single-click Vercel deployment**:
1. Fork or push this repository to your GitHub.
2. Import the repository into your Vercel Dashboard.
3. **Important:** Set the **Root Directory** to `frontend`.
4. The Next.js framework will be automatically detected.
5. No environment variables are required. The API routes will automatically deploy as serverless functions capable of cloning repositories to the Vercel ephemeral `/tmp` directory.

## Architecture & History
Initially designed with a separate Express backend, the project was migrated to Next.js API routes for easier Serverless deployment on platforms like Vercel. The `backend` directory is kept for historical/reference purposes but is not required to run the main application.
