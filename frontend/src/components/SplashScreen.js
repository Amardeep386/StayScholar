import React from 'react';
import { motion } from 'framer-motion';
import './SplashScreen.css';

const SplashScreen = () => {
    const springTransition = {
        type: "spring",
        stiffness: 100,
        damping: 22,
        mass: 1
    };

    return (
        <motion.div
            className="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            <div className="splash-content">
                <motion.img
                    src="/logo.png"
                    alt="StayScholar Logo"
                    className="splash-logo"
                    layoutId="main-logo"
                    transition={springTransition}
                />
                <motion.h1
                    className="splash-text"
                    layoutId="main-brand-text"
                    transition={springTransition}
                >
                    StayScholars
                </motion.h1>
            </div>
        </motion.div>
    );
};

export default SplashScreen;
