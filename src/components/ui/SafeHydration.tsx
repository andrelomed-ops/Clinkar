"use client";

import React, { useEffect, useState, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * SafeHydration component prevents hydration mismatch errors by ensuring
 * that the children are only rendered on the client after the initial hydration.
 * This is crucial for a "fail-safe" application using Next.js 16/React 19.
 */
export function SafeHydration({ children, fallback = null }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
