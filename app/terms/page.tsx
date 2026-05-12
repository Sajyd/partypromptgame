import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { APP_NAME, APP_TITLE } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_TITLE}`,
  description: `Terms that apply when you use ${APP_NAME}.`,
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="May 8, 2026">
      <p>
        These Terms of Service (“Terms”) govern your use of {APP_NAME} and related services (“Service”).
        By accessing or using the Service, you agree to these Terms.
      </p>

      <h2>Who may use the Service</h2>
      <p>
        You must be able to form a binding contract and meet any minimum age shown in the app (for example,
        13+ where applicable). You are responsible for your account and for activity under it.
      </p>

      <h2>The Service</h2>
      <p>
        {APP_NAME} lets you collaborate in real time on prompts and AI-assisted mini-games. Features may
        change, and we do not guarantee uninterrupted or error-free operation. The Service may use third
        parties (for example AI, hosting, or sign-in providers).
      </p>

      <h2>Your content</h2>
      <p>
        You retain rights to content you submit. You grant us a non-exclusive license to host, process,
        display, and distribute your content solely to operate and improve the Service (including
        multiplayer sessions and community features you use). Do not submit content you do not have rights
        to share.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>No unlawful, harmful, harassing, hateful, or exploitative behavior.</li>
        <li>No attempts to break, overload, scrape, or reverse engineer the Service beyond permitted use.</li>
        <li>No impersonation of others or misrepresentation of affiliation.</li>
        <li>Respect intellectual property and privacy of other users.</li>
      </ul>
      <p>We may suspend or terminate access for violations or risk to the Service or users.</p>

      <h2>Accounts and sign-in</h2>
      <p>
        You may sign in with email/password or Google OAuth where enabled. You must provide accurate
        information and keep credentials confidential. See our{" "}
        <Link href="/privacy">Privacy Policy</Link> for how we handle data, including optional push
        notifications described under <Link href="/privacy#notifications">Push notifications</Link>.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The Service is provided “as is” and “as available” without warranties of any kind, to the fullest
        extent permitted by law. AI-generated games and text may be incorrect, inconsistent, or unsuitable
        for minors; you use generated output at your own discretion.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for indirect, incidental, special,
        consequential, or punitive damages, or for loss of profits, data, or goodwill. Our aggregate
        liability arising out of these Terms or the Service is limited to the greater of fifty dollars
        (USD $50) or the amounts you paid us for the Service in the twelve months before the claim (if
        any).
      </p>

      <h2>Indemnity</h2>
      <p>
        You will defend and indemnify us against claims arising from your content, your misuse of the
        Service, or your violation of these Terms, to the extent permitted by law.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws applicable to the operator of your deployment, excluding
        conflict-of-law rules. Courts in that jurisdiction have exclusive venue unless mandatory law says
        otherwise.
      </p>

      <h2>Changes</h2>
      <p>
        We may modify these Terms. If changes are material, we will provide notice as appropriate (for
        example by posting an updated date). Continued use after changes means you accept the updated Terms.
      </p>

      <h2>Contact</h2>
      <p>
        For legal or abuse reports, use the support or contact method published for your {APP_NAME}{" "}
        deployment.
      </p>
    </LegalPageLayout>
  );
}
