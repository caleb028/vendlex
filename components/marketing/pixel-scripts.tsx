"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { ConsentPreferences } from "./consent-banner";

export function MarketingPixelScripts() {
  const [consent, setConsent] = useState<ConsentPreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    // Initial check from localStorage
    try {
      const saved = localStorage.getItem("vendlex_marketing_consent");
      if (saved) {
        setConsent(JSON.parse(saved));
      }
    } catch {}

    // Listen for live updates
    const handleConsentUpdated = (e: Event) => {
      const custom = e as CustomEvent<ConsentPreferences>;
      if (custom.detail) {
        setConsent(custom.detail);
      }
    };

    window.addEventListener("vendlex_consent_updated", handleConsentUpdated);
    return () => {
      window.removeEventListener("vendlex_consent_updated", handleConsentUpdated);
    };
  }, []);

  return (
    <>
      {/* Google Analytics 4 (Only loaded if user gave Analytics consent & ID configured) */}
      {consent.analytics && gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
                send_page_view: true
              });
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel (Only loaded if user gave Marketing consent & ID configured) */}
      {consent.marketing && metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
