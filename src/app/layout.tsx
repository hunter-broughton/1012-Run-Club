import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Hill Street Run Club | Ann Arbor's Premier Running Community",
  description:
    "Join Hill Street Run Club - Ann Arbor's community of passionate runners. University of Michigan area. All levels welcome! Go Blue!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
