const AFF_CODE_KEY = 'zaam_aff_code';
const AFF_TRACK_KEY = 'zaam_aff_track';
const AFF_SESSION_KEY = 'zaam_aff_session';
const AFF_CLICK_KEY = 'zaam_aff_click';

function marketingApiBase(): string {
  const b2b = process.env.NEXT_PUBLIC_ZAAM_API_URL || 'http://localhost:4000/api/b2b';
  return b2b.replace(/\/api\/b2b\/?$/, '/api/marketing');
}

export function getAffiliateAttribution(): {
  affiliateCode?: string;
  affiliateTrackingCode?: string;
  affiliateSessionId?: string;
  affiliateClickId?: string;
} {
  if (typeof window === 'undefined') return {};
  return {
    affiliateCode: localStorage.getItem(AFF_CODE_KEY) || undefined,
    affiliateTrackingCode: localStorage.getItem(AFF_TRACK_KEY) || undefined,
    affiliateSessionId: localStorage.getItem(AFF_SESSION_KEY) || undefined,
    affiliateClickId: localStorage.getItem(AFF_CLICK_KEY) || undefined
  };
}

export async function captureAffiliateFromUrl(): Promise<void> {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const aff = params.get('aff') || params.get('affiliate');
  const tracking = params.get('t') || params.get('tracking') || params.get('aff_t');
  if (!aff && !tracking) return;

  let sessionId = localStorage.getItem(AFF_SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(AFF_SESSION_KEY, sessionId);
  }
  if (aff) localStorage.setItem(AFF_CODE_KEY, aff.toUpperCase());
  if (tracking) localStorage.setItem(AFF_TRACK_KEY, tracking);

  try {
    const res = await fetch(`${marketingApiBase()}/affiliates/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliateCode: aff || undefined,
        trackingCode: tracking || undefined,
        sessionId,
        landingPage: window.location.href,
        referrer: document.referrer || undefined
      })
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.clickId) localStorage.setItem(AFF_CLICK_KEY, String(json.data.clickId));
      if (json?.data?.trackingCode) localStorage.setItem(AFF_TRACK_KEY, String(json.data.trackingCode));
      if (json?.data?.affiliateCode) localStorage.setItem(AFF_CODE_KEY, String(json.data.affiliateCode));
    }
  } catch {
    // Attribution is best-effort; checkout still sends stored codes
  }
}
