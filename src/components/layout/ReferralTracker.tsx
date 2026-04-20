"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * ReferralTracker - Silently captures the ?ref= parameter from the URL
 * and persists it in localStorage so it can be used during registration
 * even if the user navigates to other pages first.
 */
function ReferralLogic() {
    const searchParams = useSearchParams();
    
    useEffect(() => {
        try {
            const ref = searchParams.get("ref");
            if (ref) {
                localStorage.setItem("clinkar_ref_code", ref);
                console.log(`[REFERRAL] Code persisted: ${ref}`);
            }
        } catch (e) {
            console.error("[REFERRAL] Error persisting code:", e);
        }
    }, [searchParams]);

    return null;
}

export function ReferralTracker() {
    return (
        <Suspense fallback={null}>
            <ReferralLogic />
        </Suspense>
    );
}
