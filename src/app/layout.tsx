import type { Metadata } from "next";
import { Open_Sans, Roboto } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// const inter = Open_Sans({ weight: ["400", "300", "700"], subsets: ["latin"] });
// const inter = Montserrat({ weight: ["400", "300", "700"], subsets: ["latin"] });
const inter = Roboto({ weight: ["400", "300", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VY Trade Pro",
  description: "VY Stroks One click trading app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
