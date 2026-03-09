"use client";

import { motion } from 'framer-motion';
import { Flame, FileCode, FileType, CheckCircle, XCircle } from 'lucide-react';

interface Metrics {
    totalFiles: number;
    languages: Record<string, number>;
    totalLines: number;
    largeFiles: { file: string; lines: number }[];
    hasReadme: boolean;
    hasGitignore: boolean;
    hasTests: boolean;
}

interface RoastResultProps {
    roast: string;
    metrics: Metrics;
}

export default function RoastResult({ roast, metrics }: RoastResultProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto space-y-8"
        >
            <div className="p-8 rounded-2xl bg-neutral-900 border border-red-900/30 glow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <Flame className="text-red-500 w-8 h-8 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                    The Verdict
                </h2>

                <div className="space-y-4 text-neutral-300 leading-relaxed text-lg whitespace-pre-wrap">
                    {roast}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Files"
                    value={metrics.totalFiles.toLocaleString()}
                    icon={<FileCode className="text-blue-400" />}
                />
                <StatCard
                    title="Lines of Code"
                    value={metrics.totalLines.toLocaleString()}
                    icon={<FileType className="text-purple-400" />}
                />
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2 col-span-1 md:col-span-2 shadow-xl shadow-black/50">
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">File Diagnostics</h3>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <DiagnosticItem label="README" ok={metrics.hasReadme} />
                        <DiagnosticItem label=".gitignore" ok={metrics.hasGitignore} />
                        <DiagnosticItem label="Tests" ok={metrics.hasTests} />
                    </div>
                </div>
            </div>

            {metrics.largeFiles.length > 0 && (
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl shadow-black/50">
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">Wall of Shame (Largest Files)</h3>
                    <div className="space-y-3">
                        {metrics.largeFiles.map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-neutral-950 p-3 rounded-lg border border-neutral-800/50">
                                <span className="font-mono text-sm text-neutral-400 truncate mr-4">{file.file}</span>
                                <span className="text-red-400 font-bold whitespace-nowrap">{file.lines} lines</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2 shadow-xl shadow-black/50 hover:border-neutral-700 transition-colors">
            <div className="bg-neutral-800/50 w-10 h-10 rounded-lg flex items-center justify-center mb-2 shadow-inner shadow-black/20">
                {icon}
            </div>
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">{title}</h3>
            <p className="text-2xl font-bold flex-1 flex items-end">{value}</p>
        </div>
    );
}

function DiagnosticItem({ label, ok }: { label: string, ok: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center bg-neutral-800/30 rounded-lg p-3 gap-2 border border-neutral-800/50">
            {ok ? <CheckCircle className="text-green-500 w-5 h-5 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> : <XCircle className="text-red-500 w-5 h-5 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
            <span className="text-xs font-semibold text-neutral-400">{label}</span>
        </div>
    );
}
