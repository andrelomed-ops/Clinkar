import { Outfit } from "next/font/google"; // Using only one font to minimize variables
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata = {
    title: "Clinkar Enterprise Debug",
    description: "Debug mode",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${outfit.variable} antialiased`}>
                <div style={{ padding: 20, border: '5px solid red' }}>
                    <h1>Global Debug Layout: Active</h1>
                    {children}
                </div>
            </body>
        </html>
    );
}
