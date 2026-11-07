import Script from "next/script";

/**
 * Google Analytics 4 — ativo automaticamente quando a variável
 * NEXT_PUBLIC_GA_MEASUREMENT_ID (ex.: G-XXXXXXXXXX) está definida no .env.
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            anonymize_ip: true,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Microsoft Clarity — ativo automaticamente quando a variável
 * NEXT_PUBLIC_CLARITY_ID (encontrada em clarity.microsoft.com) está definida no .env.
 */
export function MicrosoftClarity() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  if (!clarityId) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script","${clarityId}");
      `}
    </Script>
  );
}
