import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AssignmentWriters.com | Feedback Reward",
  description: "Redeem your AssignmentWriters.com feedback reward."
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}