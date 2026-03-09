"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Flame, ArrowRight } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import RoastResult from '@/components/RoastResult';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleRoast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (!url.includes('github.com') && !url.includes('gitlab.com') && !url.includes('bitbucket.org')) {
      setError('Please enter a valid GitHub, GitLab, or Bitbucket URL.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/roast', { url });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to roast the repository. Is it public?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-16 sm:py-24 px-4 relative overflow-hidden bg-[#050505]">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-900/10 blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!result && (
            <motion.div
              key="header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800 mb-6 backdrop-blur-xl shadow-2xl shadow-black/50">
                <Flame className="w-8 h-8 text-red-500 mr-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                <h1 className="text-4xl font-black tracking-tight text-white">
                  Repo <span className="text-gradient">Roaster</span>
                </h1>
              </div>
              <p className="text-neutral-400 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                Paste your repository URL below and let our highly critical engine tear your code quality and architecture to shreds.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.form
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleRoast}
              className="w-full max-w-2xl"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex flex-col sm:flex-row shadow-2xl shadow-black/50 items-center bg-neutral-900/90 backdrop-blur-xl rounded-2xl border border-neutral-800 p-2 focus-within:border-red-500/50 focus-within:bg-neutral-900 transition-all">
                  <Github className="w-6 h-6 text-neutral-500 ml-4 hidden sm:block" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="flex-1 w-full bg-transparent border-none outline-none text-white px-4 py-4 sm:py-5 text-lg placeholder:text-neutral-600 font-mono"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto mt-2 sm:mt-0 bg-red-500 hover:bg-red-400 text-white px-8 py-4 sm:py-5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                  >
                    Roast Me <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-center mt-6 font-medium bg-red-950/50 py-4 px-6 rounded-xl border border-red-900/50 flex items-center justify-center gap-2 shadow-xl"
                  >
                    <Flame className="w-5 h-5" />
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.form>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/50 p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-2xl"
            >
              <LoadingSpinner />
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <div className="w-full flex flex-col items-center">
            <RoastResult roast={result.roast} metrics={result.metrics} />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => { setResult(null); setUrl(''); setError(''); }}
              className="mt-16 text-neutral-400 hover:text-white font-medium transition-colors border-b-2 border-neutral-800 hover:border-red-500 pb-1 px-2"
            >
              Roast Another Repository
            </motion.button>
          </div>
        )}
      </div>
    </main>
  );
}
