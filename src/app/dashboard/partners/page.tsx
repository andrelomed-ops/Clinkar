import { PartnerService } from "@/services/PartnerService";
import { PartnersView } from "@/components/dashboard/partners/PartnersView";
import { MOCK_FEE_CONFIG } from "@/data/serviceTickets";
import { createClient } from "@/lib/supabase/server";

export default async function PartnerDashboardPage() {
    const supabase = await createClient();
    const tickets = await PartnerService.getTicketsByPartner(supabase);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <PartnersView initialTickets={tickets} feeConfig={MOCK_FEE_CONFIG} />
        </div>
    );
}
