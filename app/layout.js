import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./Component/SessionWrapper";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Walbo - Connect with the Decentralised",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <SessionWrapper>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        </body>
        </SessionWrapper>
    </html>
  );
}
