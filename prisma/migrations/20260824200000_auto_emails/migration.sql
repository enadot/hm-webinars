-- Automatic registration confirmation + webinar reminders.

-- The live-session link. Kept off Campaign.config on purpose: that JSON is
-- serialised into the public landing page, so a link stored there would be
-- readable without registering.
ALTER TABLE "Campaign" ADD COLUMN "webinarJoinUrl" TEXT;

-- Marks the templates this app schedules on its own, so re-saving a campaign
-- updates the existing reminder instead of queueing a second one. NULL for
-- admin-composed templates; Postgres permits many NULLs in a unique index.
ALTER TABLE "EmailTemplate" ADD COLUMN "autoKind" TEXT;
CREATE UNIQUE INDEX "EmailTemplate_campaignId_autoKind_key"
  ON "EmailTemplate" ("campaignId", "autoKind");
