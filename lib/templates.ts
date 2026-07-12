import type { ReactNode } from "react";
import { BoldHeroTemplate } from "@/templates/bold-hero";
import { EditorialTemplate } from "@/templates/editorial";
import { EnergeticTemplate } from "@/templates/energetic";
import { WealthTemplate } from "@/templates/wealth";
import type { CampaignConfig } from "@/lib/campaign-schema";

export type TemplateId = "bold-hero" | "editorial" | "energetic" | "wealth";

export type TemplateProps = { config: CampaignConfig; slug?: string };
export type TemplateComponent = (props: TemplateProps) => ReactNode;

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  description: string;
  preview: string; // path to a preview image (optional, can be empty)
  Component: TemplateComponent;
};

export const TEMPLATES: Record<TemplateId, TemplateMeta> = {
  "bold-hero": {
    id: "bold-hero",
    name: "Bold Hero",
    description:
      "רקע כהה עם מש-גרדיאנט, טיפוגרפיה דרמטית, דגשי זהב-סגול. מתאים לפרימיום B2C ולקמפיינים עוצמתיים.",
    preview: "/templates/bold-hero.png",
    Component: BoldHeroTemplate,
  },
  editorial: {
    id: "editorial",
    name: "Editorial",
    description:
      "סגנון מגזיני - רקע בהיר, פונט עדין, תמונות מרצים גדולות, חלוקה ברורה. מתאים למיתוג שמרני / יוקרתי.",
    preview: "/templates/editorial.png",
    Component: EditorialTemplate,
  },
  energetic: {
    id: "energetic",
    name: "Energetic",
    description:
      "צבעים תוססים, בלוקים מודולריים, פטרני רקע ואנימציות. מתאים לצעירים, סטארטאפים וקמפיינים אנרגטיים.",
    preview: "/templates/energetic.png",
    Component: EnergeticTemplate,
  },
  wealth: {
    id: "wealth",
    name: "Wealth",
    description:
      "ירוק אמרלד עמוק עם גרף צמיחה, זכוכית וטיפוגרפיה יוקרתית. מתאים לוובינרים בתחום ההשקעות, פיננסים וצמיחה כלכלית.",
    preview: "/templates/wealth.png",
    Component: WealthTemplate,
  },
};

export function getTemplate(id: string): TemplateMeta | null {
  return TEMPLATES[id as TemplateId] ?? null;
}

export function listTemplates(): TemplateMeta[] {
  return Object.values(TEMPLATES);
}
