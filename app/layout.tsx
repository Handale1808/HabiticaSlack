import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "react-day-picker/style.css";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { Nav } from "@/components/Nav";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HabiticaSlack",
  description: "Upload your done list",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
  className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}
>
        <UserProvider>
          <Nav />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
