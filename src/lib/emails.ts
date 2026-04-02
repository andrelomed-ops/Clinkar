

import { Logger } from "@/lib/logger";

/**
 * Service to handle transactional communications.
 * Initial implementation uses Console Logging to simulate real email triggers.
 * Ready for Resend / SendGrid integration.
 */
class EmailService {
    private async send({ to, subject, templateId, data }: { to: string, subject: string, templateId: string, data: any }) {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));

        Logger.info(`📧 EMAIL TRIGGERED: ${subject}`, {
            to,
            templateId,
            data
        });

        return { success: true, messageId: `msg_${Math.random().toString(36).substr(2, 9)}` };
    }

    async sendWelcome(email: string, name: string) {
        return this.send({
            to: email,
            subject: "¡Bienvenido a la comunidad StarterKar! 🚗",
            templateId: "welcome-v1",
            data: { name }
        });
    }

    async sendOfferReceived(sellerEmail: string, carModel: string, offerAmount: number) {
        return this.send({
            to: sellerEmail,
            subject: `Has recibido una oferta por tu ${carModel} 💰`,
            templateId: "offer-received-v1",
            data: { carModel, offerAmount: offerAmount.toLocaleString() }
        });
    }

    async sendPaymentConfirmed(buyerEmail: string, carModel: string, amount: number) {
        return this.send({
            to: buyerEmail,
            subject: "¡Pago confirmado! Tu auto está en camino 🏁",
            templateId: "payment-confirmed-v1",
            data: { carModel, amount: amount.toLocaleString() }
        });
    }

    async sendVaultUpdate(email: string, transactionId: string, status: string) {
        return this.send({
            to: email,
            subject: `Actualización de Bóveda: ${status}`,
            templateId: "vault-update-v1",
            data: { transactionId, status }
        });
    }
}

export const emails = new EmailService();
