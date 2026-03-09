"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

const MESSAGES = [
    "Cloning your spaghetti code...",
    "Judging your variable naming choices...",
    "Searching for test cases... (Still searching...)",
    "Calculating technical debt...",
    "Looking for comments that aren't just 'FIXME'...",
    "Wondering why you committed node_modules...",
    "Almost done roasting...",
];

export default function LoadingSpinner() {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-12">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5
                }}
            >
                <Flame className="w-20 h-20 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
            </motion.div>

            <div className="h-8 overflow-hidden relative w-full max-w-xl mx-auto text-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-neutral-400 font-mono text-sm sm:text-base absolute w-full font-medium"
                    >
                        {MESSAGES[messageIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
}
