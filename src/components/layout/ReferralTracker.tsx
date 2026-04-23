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
            const urlRef = searchParams.get('ref');
            if (urlRef) {
                localStorage.setItem('starterkar_ref_code', urlRef);
                console.log(`[REFERRAL] Code persisted: ${urlRef}`);
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
