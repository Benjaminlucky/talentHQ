// src/app/privacy-policy/page.jsx
export const metadata = {
  title: "Privacy Policy",
  description:
    "TalentHQ Privacy Policy — how we collect, use and protect your personal data under the Nigeria Data Protection Act 2023.",
};

const UPDATED = "15 April 2026";
const EMAIL = "privacy@talenthq.buzz";

const H2 = ({ children }) => (
  <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3 pb-2 border-b border-gray-100">
    {children}
  </h2>
);
const H3 = ({ children }) => (
  <h3 className="text-base font-bold text-gray-800 mt-6 mb-2">{children}</h3>
);
const P = ({ children }) => (
  <p className="text-gray-600 text-sm leading-7 mb-4">{children}</p>
);
const Li = ({ children }) => (
  <li className="text-gray-600 text-sm leading-7 mb-1 flex items-start gap-2">
    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-lime-500 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#004b23] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-lime-400 text-xs font-bold uppercase tracking-widest mb-3">
            Legal · NDPA 2023 Compliant
          </p>
          <h1 className="text-3xl font-black mb-3">Privacy Policy</h1>
          <p className="text-green-200 text-sm">
            Last updated: {UPDATED} · Effective: 12 June 2023
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Intro */}
        <div className="bg-lime-50 border border-lime-200 rounded-2xl p-5 mb-8 text-sm text-lime-900 leading-relaxed">
          TalentHQ ("we", "our", "us") operates Nigeria's talent marketplace at{" "}
          <strong>talenthq.buzz</strong>. This policy explains how we collect,
          use, store and protect your personal data in compliance with the{" "}
          <strong>Nigeria Data Protection Act 2023 (NDPA)</strong> and the NDPC
          General Application and Implementation Directive (GAID) 2025.
        </div>

        <H2>1. Who we are</H2>
        <P>
          TalentHQ is the data controller for personal data processed on this
          platform. We connect employers, jobseekers and skilled tradespeople
          (handymen) across Nigeria. Our registered contact for data protection
          matters is <strong>{EMAIL}</strong>.
        </P>

        <H2>2. What personal data we collect</H2>
        <H3>Account and identity data</H3>
        <ul className="mb-4 space-y-1">
          <Li>Full name, email address and password (hashed)</Li>
          <Li>Phone number and WhatsApp number</Li>
          <Li>Profile photo (avatar)</Li>
          <Li>Location: state, city, LGA, address</Li>
          <Li>Role: jobseeker, handyman or employer</Li>
        </ul>

        <H3>Professional and employment data</H3>
        <ul className="mb-4 space-y-1">
          <Li>CV / resume file</Li>
          <Li>Work experience, education, skills, certifications, projects</Li>
          <Li>Job applications and their status</Li>
          <Li>Interview invitations and responses</Li>
        </ul>

        <H3>Employer and company data</H3>
        <ul className="mb-4 space-y-1">
          <Li>Company name, website, industry, size</Li>
          <Li>CAC registration number (for verification badge)</Li>
          <Li>Job postings created on the platform</Li>
        </ul>

        <H3>Usage and technical data</H3>
        <ul className="mb-4 space-y-1">
          <Li>IP address at time of contact form submission</Li>
          <Li>Browser type and device information (via standard web logs)</Li>
          <Li>Pages visited and time spent (aggregated analytics only)</Li>
        </ul>

        <H3>Payment data</H3>
        <ul className="mb-4 space-y-1">
          <Li>
            Subscription plan, payment reference and transaction status — we do
            not store card details; all payment processing is handled by
            Paystack under their own privacy policy
          </Li>
        </ul>

        <H3>Communications</H3>
        <ul className="mb-4 space-y-1">
          <Li>Messages sent between users on the platform</Li>
          <Li>Contact form submissions (name, email, subject, message)</Li>
          <Li>Review and rating content you submit</Li>
        </ul>

        <H2>3. Lawful basis for processing (NDPA Section 25)</H2>
        <P>
          The NDPA requires us to identify a lawful basis for each category of
          processing. We rely on the following:
        </P>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 font-bold text-gray-700 rounded-tl-lg">
                  Purpose
                </th>
                <th className="text-left p-3 font-bold text-gray-700 rounded-tr-lg">
                  Lawful basis
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Creating and managing your account", "Contract performance"],
                ["Matching jobseekers with employers", "Contract performance"],
                [
                  "Sending transactional emails (password reset, application updates)",
                  "Contract performance",
                ],
                [
                  "Payment processing and subscription management",
                  "Contract performance",
                ],
                [
                  "Platform security and fraud prevention",
                  "Legitimate interests",
                ],
                ["Analytics to improve the platform", "Legitimate interests"],
                ["Marketing emails (if you opt in)", "Consent"],
                ["Cookie analytics (if you accept)", "Consent"],
                [
                  "Compliance with Nigerian law and NDPC orders",
                  "Legal obligation",
                ],
              ].map(([purpose, basis], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3 text-gray-600 border-b border-gray-100">
                    {purpose}
                  </td>
                  <td className="p-3 text-gray-700 font-medium border-b border-gray-100">
                    {basis}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <H2>4. How we use your data</H2>
        <ul className="mb-4 space-y-1">
          <Li>Operate and maintain your account and dashboard</Li>
          <Li>Display your profile to relevant employers or candidates</Li>
          <Li>
            Send you application updates, interview invitations and messages
          </Li>
          <Li>Process subscription payments and send receipts</Li>
          <Li>Show relevant job listings and candidate recommendations</Li>
          <Li>Prevent fraud, spam and abuse on the platform</Li>
          <Li>Comply with legal obligations and NDPC directives</Li>
          <Li>Respond to your contact form enquiries</Li>
        </ul>

        <H2>5. Who we share your data with</H2>
        <P>We do not sell your personal data. We share data only with:</P>
        <ul className="mb-4 space-y-1">
          <Li>
            <strong>Other users:</strong> your public profile is visible to
            employers/candidates as applicable to your role
          </Li>
          <Li>
            <strong>Paystack:</strong> payment processing — governed by
            Paystack's own privacy policy
          </Li>
          <Li>
            <strong>Resend:</strong> transactional email delivery
          </Li>
          <Li>
            <strong>Cloudinary:</strong> secure cloud storage for resumes and
            images
          </Li>
          <Li>
            <strong>MongoDB Atlas:</strong> our database provider (data stored
            in cloud infrastructure with encryption at rest)
          </Li>
          <Li>
            <strong>NDPC and law enforcement:</strong> where required by a
            lawful order, court order or to prevent a serious crime
          </Li>
        </ul>
        <P>
          All third-party processors are bound by data processing agreements
          that require them to protect your data to at least the standard set by
          the NDPA.
        </P>

        <H2>6. Your rights under the NDPA 2023</H2>
        <P>
          As a data subject under the NDPA, you have the following rights. To
          exercise any of them, email us at <strong>{EMAIL}</strong> — we will
          respond within <strong>30 days</strong>.
        </P>
        <ul className="mb-4 space-y-1">
          <Li>
            <strong>Right to access:</strong> request a copy of all personal
            data we hold about you
          </Li>
          <Li>
            <strong>Right to rectification:</strong> correct inaccurate or
            incomplete data
          </Li>
          <Li>
            <strong>Right to erasure:</strong> request deletion of your data
            where no legal basis exists to retain it
          </Li>
          <Li>
            <strong>Right to restriction:</strong> ask us to pause processing
            while a dispute is resolved
          </Li>
          <Li>
            <strong>Right to data portability:</strong> receive your data in a
            machine-readable format
          </Li>
          <Li>
            <strong>Right to object:</strong> object to processing based on
            legitimate interests
          </Li>
          <Li>
            <strong>Right to withdraw consent:</strong> where processing is
            based on consent, you may withdraw at any time without affecting
            past lawful processing
          </Li>
          <Li>
            <strong>Right to lodge a complaint:</strong> you may complain to the
            Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng
          </Li>
        </ul>

        <H2>7. Data retention</H2>
        <ul className="mb-4 space-y-1">
          <Li>
            Active account data: retained for the duration of your account
          </Li>
          <Li>
            Account data after deletion: anonymised within 30 days of verified
            deletion request
          </Li>
          <Li>
            Job applications: retained for 12 months after the position closes
          </Li>
          <Li>
            Payment records: 7 years (required by Nigerian financial
            regulations)
          </Li>
          <Li>Contact form messages: 2 years</Li>
          <Li>Security logs (IP addresses): 90 days</Li>
          <Li>Notification records: 60 days (automatic TTL deletion)</Li>
        </ul>

        <H2>8. International data transfers</H2>
        <P>
          Your data is stored on servers operated by MongoDB Atlas and may be
          processed in data centres outside Nigeria. Where this occurs, we
          ensure adequate safeguards are in place through standard contractual
          clauses and processor agreements that meet the requirements of NDPA
          Section 43. We document all cross-border transfers as required by the
          NDPC GAID 2025.
        </P>

        <H2>9. Cookies</H2>
        <P>
          We use only essential cookies required for authentication and
          security. If we add analytics or marketing cookies in future, we will
          update our Cookie Policy and obtain your explicit consent before
          setting them, in compliance with NDPC GAID Article 19.
        </P>
        <P>
          Read our full{" "}
          <a
            href="/cookie-policy"
            className="text-lime-600 font-semibold hover:underline"
          >
            Cookie Policy →
          </a>
        </P>

        <H2>10. Children's data</H2>
        <P>
          TalentHQ is not intended for persons under 18. We do not knowingly
          collect data from minors. If you believe a child has registered, email
          us at {EMAIL} and we will delete the account immediately.
        </P>

        <H2>11. Security measures</H2>
        <ul className="mb-4 space-y-1">
          <Li>Passwords hashed with bcrypt (12 salt rounds)</Li>
          <Li>
            Authentication via httpOnly, secure, sameSite cookies — not
            localStorage
          </Li>
          <Li>HTTPS enforced on all connections</Li>
          <Li>JWT tokens with 7-day expiry</Li>
          <Li>MongoDB Atlas encryption at rest and in transit</Li>
          <Li>CORS restricted to authorised origins only</Li>
          <Li>Rate limiting on authentication and contact endpoints</Li>
        </ul>

        <H2>12. Data breach notification</H2>
        <P>
          In the event of a data breach that poses a risk to your rights and
          freedoms, we will notify the NDPC within 72 hours of becoming aware of
          the breach, and notify affected users without undue delay, as required
          by NDPA Section 40.
        </P>

        <H2>13. Changes to this policy</H2>
        <P>
          We may update this policy to reflect changes in law or our practices.
          We will notify registered users by email at least 14 days before
          material changes take effect. Continued use of the platform after that
          date constitutes acceptance.
        </P>

        <H2>14. Contact us</H2>
        <div className="bg-gray-100 rounded-2xl p-5 text-sm text-gray-700">
          <p className="font-bold mb-2">TalentHQ — Data Protection Contact</p>
          <p>
            Email:{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="text-lime-600 hover:underline"
            >
              {EMAIL}
            </a>
          </p>
          <p>
            Website:{" "}
            <a
              href="https://talenthq.buzz"
              className="text-lime-600 hover:underline"
            >
              talenthq.buzz
            </a>
          </p>
          <p className="mt-3 text-xs text-gray-500">
            To exercise your NDPA rights or lodge a complaint about our data
            practices, email the above address with "Data Rights Request" in the
            subject line.
          </p>
        </div>
      </div>
    </div>
  );
}
