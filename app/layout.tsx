import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageScrollbar from "@/components/PageScrollbar";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { site } from "@/lib/site";
import "./globals.css";

// PP Neue Montreal is licensed; Inter is the open stand-in with the same
// grotesk proportions and is declared first in the Tailwind font stack.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://riemlabs.com"),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: "website",
    locale: "en_GB",
    siteName: site.name,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

/**
 * Marks the document as JS-capable before first paint so the reveal
 * pre-hidden states apply — and so a no-JS visitor still sees everything.
 */
const JS_FLAG = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: JS_FLAG adds the `js` class to <html> before
    // React hydrates, so the client className never matches the server's.
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body>
        <a
          href="#main"
          className="meta sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-accent focus:px-4 focus:py-3 focus:text-canvas"
        >
          Skip to content
        </a>

        <SmoothScrollProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <PageScrollbar />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
