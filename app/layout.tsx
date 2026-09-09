import "./globals.css";

export const metadata = {
  title: "Business Discovery",
  description: "Operations discovery and workflow assessment",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}