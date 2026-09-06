-- Reminders are scheduled per registrant through Resend at signup time.
-- Keeping their ids makes them cancellable if the webinar date moves.
ALTER TABLE "Lead" ADD COLUMN "reminderEmailIds" TEXT;
