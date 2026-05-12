import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { APP_NAME, APP_TITLE } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_TITLE}`,
  description: `How ${APP_NAME} collects, uses, and protects your data, including sign-in and notifications.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="May 8, 2026">
      <p>
        This Privacy Policy describes how {APP_NAME} (“we”, “us”) handles information when you use our
        website and services. If you do not agree, please do not use the service.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account details</strong> you provide (for example display name, email, and profile fields
          you choose during onboarding).
        </li>
        <li>
          <strong>Authentication</strong> data when you sign in with email and password, or when you use
          Google sign-in (we may receive your Google account email and basic profile identifiers as
          permitted by Google&apos;s OAuth consent screen).
        </li>
        <li>
          <strong>Gameplay and content</strong> you create in lobbies (for example prompts, chat, and
          generated game metadata) as needed to run the product.
        </li>
        <li>
          <strong>Technical data</strong> typical of web apps: IP address and browser signals processed by
          our hosting provider, basic logs for security and reliability, and cookies used to keep you
          signed in.
        </li>
      </ul>

      <h2 id="notifications">Push notifications</h2>
      <p>
        If you enable notifications (for example from the bell on the home screen after you sign in), your
        browser may register a <strong>push subscription</strong>. We store the subscription endpoint and
        related keys our server needs to deliver messages to your device. We use this only to send
        notifications you opt into in the product; you can withdraw permission at any time in your browser
        or OS settings, and you can stop new deliveries from {APP_NAME} by removing notification permission
        for this site.
      </p>
      <p>
        Push relies on your browser and platform vendors (for example Apple, Google, or Mozilla) and may be
        unavailable in some browsers or private modes.
      </p>

      <h2>How we use information</h2>
      <ul>
        <li>To create and maintain your account and session.</li>
        <li>To provide multiplayer features, matchmaking, and generated games.</li>
        <li>To send optional push notifications when you have enabled them.</li>
        <li>To secure the service, prevent abuse, and troubleshoot issues.</li>
        <li>To comply with law where required.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We use infrastructure providers (for example database and hosting) that process data on our behalf
        under contractual protections. If you use Google sign-in, Google processes authentication according
        to its policies. We do not sell your personal information.
      </p>

      <h2>Retention</h2>
      <p>
        We keep information for as long as your account exists and as needed for the purposes above. Push
        subscription records may be removed when expired, replaced, or when you delete your account (when
        account deletion is available).
      </p>

      <h2>Security</h2>
      <p>
        We use industry-standard measures appropriate to the service, but no method of transmission or
        storage is completely secure.
      </p>

      <h2>Children</h2>
      <p>
        {APP_NAME} is not directed at children under 13. If you believe we have collected a child&apos;s
        information, contact us so we can delete it.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. The “Last updated” date above will change when we do.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to the operator of {APP_NAME} at the support channel listed
        in the product or on your deployment&apos;s official site.
      </p>
    </LegalPageLayout>
  );
}
