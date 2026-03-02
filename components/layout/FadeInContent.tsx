"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface FadeInContentProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}

const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: { x: 0, y: 0 },
};

export function FadeInContent({
    children,
    delay = 0,
    direction = "up",
    className = "",
    ...props
}: FadeInContentProps) {
    const initial = {
        opacity: 0,
        ...directions[direction],
    };

    return (
        <motion.div
            initial={initial}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98], // Custom ease for a premium feel
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
