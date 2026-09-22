import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

/**
 * Google's own gtag.js snippet, loaded once for the whole site.
 *
 * No Tag Manager and no wrapper library: this is two script tags and four
 * lines of configuration, and a package to place them would be a dependency
 * standing between the site and something it can state directly.
 *
 * `afterInteractive` is what keeps it out of the way — the tag loads once the
 * page is usable rather than competing with it, which matters on a site whose
 * first impression is a scroll-driven hero.
 *
 * Page views are deliberately left alone. `gtag('config', …)` sends the one
 * for the initial load, and GA4's enhanced measurement raises the rest from
 * browser history events, which is exactly what App Router navigation
 * produces. Adding a route-change listener on top — the usual reflex in a
 * Next app — would send a second page_view for every navigation and quietly
 * double every number on the report.
 */
export default function Analytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
