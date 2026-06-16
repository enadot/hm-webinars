import { getSendmsgPublicStatus } from "@/lib/app-settings";
import { SettingsForm } from "./_settings-form";

export const metadata = { title: "הגדרות אינטגרציות" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sendmsg = await getSendmsgPublicStatus();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">הגדרות אינטגרציות</h1>
        <p className="text-slate-600">
          חיבור למערכות חיצוניות. הסיסמה נשמרת בבסיס הנתונים בצורה גלויה (read-only-admin) — אל
          תזינו כאן אישורים שאינם של חשבון השירות הזה.
        </p>
      </div>

      <SettingsForm sendmsg={sendmsg} />
    </div>
  );
}
