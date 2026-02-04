import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { ClinkarSeal } from "../market/ClinkarSeal";

export function Footer() {
    return (
        <footer className="border-t border-border bg-background pt-16 pb-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
                    {/* Brand Column */}
                    <div className="md:col-span-1 space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <ClinkarSeal variant="compact" className="scale-125 mr-1" />
                            <span className="text-2xl font-black tracking-tighter">Clinkar</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            La bóveda digital más segura para la compraventa de autos seminuevos. Tu dinero protegido hasta la entrega.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={<Facebook className="h-5 w-5" />} label="Facebook" />
                            <SocialLink href="#" icon={<Twitter className="h-5 w-5" />} label="Twitter" />
                            <SocialLink href="#" icon={<Instagram className="h-5 w-5" />} label="Instagram" />
                            <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="grid grid-cols-2 gap-8 md:col-span-3 md:grid-cols-3">
                        <div>
                            <h3 className="text-xs font-black text-foreground tracking-widest uppercase mb-6">Plataforma</h3>
                            <ul role="list" className="space-y-4">
                                <FooterLink href="/buy">Comprar Auto</FooterLink>
                                <FooterLink href="/sell">Vender Auto</FooterLink>
                                <FooterLink href="/#how-it-works">Cómo Funciona</FooterLink>
                                <FooterLink href="/dashboard">Mi Cuenta</FooterLink>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-foreground tracking-widest uppercase mb-6">Soporte</h3>
                            <ul role="list" className="space-y-4">
                                <FooterLink href="/faq">Preguntas Frecuentes</FooterLink>
                                <FooterLink href="/contact">Contacto</FooterLink>
                                <FooterLink href="/help">Centro de Ayuda</FooterLink>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-foreground tracking-widest uppercase mb-6">Legal</h3>
                            <ul role="list" className="space-y-4">
                                <FooterLink href="/privacy">Privacidad</FooterLink>
                                <FooterLink href="/terms">Términos y Condiciones</FooterLink>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-16 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} Clinkar Inc. • Tecnología para la Confianza.
                    </p>
                    <div className="flex gap-6 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        <span>Hecho con ❤️ en México</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {children}
            </Link>
        </li>
    );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a
            href={href}
            aria-label={label}
            className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
        >
            {icon}
        </a>
    );
}
