import type { CampaignConfig } from "@/lib/campaign-schema";

export function defaultCampaignConfig(): CampaignConfig {
  return {
    meta: { title: "וובינר חדש", description: "" },
    brand: { logoUrl: "", name: "", tagline: "" },
    hero: {
      eyebrow: "וובינר חינמי",
      eyebrowLogoUrl: "",
      headline: "",
      headlineAccent: "",
      subheadline: "",
      description: "",
      ctaText: "אני רוצה להבטיח מקום",
    },
    webinar: {
      dateISO: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      dateLabel: "",
      dayShort: "",
      dateShort: "",
      time: "20:00",
      venue: "אונליין · מהבית",
      venueShort: "אונליין",
      spotsLimited: true,
    },
    intro: { eyebrow: "", title: "", titleAccent: "", body: "", highlights: [] },
    speakers: { eyebrow: "המרצים", title: "המרצים", titleAccent: "", intro: "", list: [] },
    bullets: { eyebrow: "מה תקבלו בהרצאה", title: "", titleAccent: "", intro: "", items: [] },
    commitments: { enabled: false, eyebrow: "", title: "", titleAccent: "", body: "", imageUrl: "" },
    form: {
      eyebrow: "הרשמה לוובינר",
      title: "הבטיחו לכם מקום",
      titleAccent: "",
      description: "",
      bullets: [],
      cardTitle: "שמרו לי מקום בוובינר!",
      cardDescription: "",
      buttonText: "הבטיחו לי מקום עכשיו ←",
    },
    footer: { phone: "", email: "", legal: "" },
    theme: {
      primary: "#0B1437",
      primary2: "#1B2762",
      accent: "#F5B500",
      accentLight: "#FFCB3D",
      purple: "#7C3AED",
      coral: "#FB7185",
      dark: "#0A0E27",
    },
  };
}
