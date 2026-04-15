// src/app/terms-of-service/page.jsx
export const metadata = {
  title: "Terms of Service",
  description:
    "TalentHQ Terms of Service — the rules governing your use of Nigeria's talent marketplace.",
};

const UPDATED = "15 April 2026";
const EMAIL = "legal@talenthq.buzz";

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

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#004b23] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-lime-400 text-xs font-bold uppercase tracking-widest mb-3">
            Legal · Governed by Nigerian Law
          </p>
          <h1 className="text-3xl font-black mb-3">Terms of Service</h1>
          <p className="text-green-200 text-sm">Last updated: {UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-sm text-amber-900 leading-relaxed">
          Please read these terms carefully before using TalentHQ. By creating
          an account or using any part of the platform, you agree to be bound by
          these terms. If you disagree with any part, do not use the platform.
        </div>

        <H2>1. About TalentHQ</H2>
        <P>
          TalentHQ ("we", "our", "the platform") is a Nigerian talent
          marketplace operating at talenthq.buzz that connects employers,
          jobseekers and skilled tradespeople (handymen). We are an intermediary
          platform — we do not employ anyone and are not a party to any
          employment contract formed through the platform.
        </P>

        <H2>2. Eligibility</H2>
        <ul className="mb-4 space-y-1">
          <Li>You must be at least 18 years old to create an account</Li>
          <Li>
            You must provide accurate, complete and current information during
            registration
          </Li>
          <Li>One person may not maintain more than one account per role</Li>
          <Li>Accounts are personal and may not be transferred or sold</Li>
          <Li>
            Companies registering as employers warrant that the person signing
            up has authority to bind the company
          </Li>
        </ul>

        <H2>3. User accounts and security</H2>
        <P>
          You are responsible for maintaining the confidentiality of your login
          credentials and for all activity under your account. Notify us
          immediately at {EMAIL} if you suspect unauthorised access. We will
          never ask for your password by email or phone.
        </P>

        <H2>4. Acceptable use</H2>
        <H3>You agree not to:</H3>
        <ul className="mb-4 space-y-1">
          <Li>Post false, misleading or fraudulent job listings or profiles</Li>
          <Li>
            Collect or harvest other users' contact information without consent
          </Li>
          <Li>
            Use the platform to send spam, unsolicited messages or chain letters
          </Li>
          <Li>Impersonate any person, company or TalentHQ staff</Li>
          <Li>
            Post content that is defamatory, discriminatory, obscene or violates
            any Nigerian law
          </Li>
          <Li>
            Discriminate in job listings based on gender, religion, ethnicity,
            disability or other protected characteristics
          </Li>
          <Li>Attempt to reverse-engineer, scrape or disrupt the platform</Li>
          <Li>
            Use automated bots to interact with the platform without our written
            consent
          </Li>
          <Li>
            Circumvent payment obligations by taking transactions off-platform
            to avoid fees
          </Li>
        </ul>

        <H2>5. Employer obligations</H2>
        <ul className="mb-4 space-y-1">
          <Li>Job listings must be for genuine, available positions</Li>
          <Li>Salary ranges, if stated, must be accurate</Li>
          <Li>
            Employers must not request payment from candidates as a condition of
            employment
          </Li>
          <Li>
            Employers are responsible for complying with all applicable Nigerian
            employment and labour laws
          </Li>
          <Li>
            Any personal data of candidates accessed through the platform must
            be handled in accordance with the NDPA 2023
          </Li>
          <Li>
            Employers must not contact candidates for purposes unrelated to the
            listed position
          </Li>
        </ul>

        <H2>6. Jobseeker and handyman obligations</H2>
        <ul className="mb-4 space-y-1">
          <Li>
            Profile information, CVs and skill descriptions must be truthful
          </Li>
          <Li>
            You must not misrepresent qualifications, certifications or
            experience
          </Li>
          <Li>
            Once an application is submitted, you are responsible for responding
            to employer communications
          </Li>
          <Li>
            You accept that TalentHQ does not guarantee job placement or
            interview outcomes
          </Li>
        </ul>

        <H2>7. Content and intellectual property</H2>
        <P>
          You retain ownership of content you post (profiles, CVs, job
          listings). By posting on TalentHQ, you grant us a non-exclusive,
          royalty-free, worldwide licence to display, reproduce and distribute
          that content on the platform and in our marketing materials, to the
          extent necessary to operate the service.
        </P>
        <P>
          TalentHQ's name, logo, design and platform code are our intellectual
          property. You may not use them without our written permission.
        </P>

        <H2>8. Payments, subscriptions and refunds</H2>
        <ul className="mb-4 space-y-1">
          <Li>
            Subscription plans are billed monthly or yearly in Nigerian Naira
            (NGN)
          </Li>
          <Li>
            Payments are processed by Paystack — by paying you also agree to
            Paystack's terms
          </Li>
          <Li>
            Subscription fees are non-refundable except where required by
            Nigerian consumer protection law
          </Li>
          <Li>
            We reserve the right to change pricing with 30 days' notice to
            active subscribers
          </Li>
          <Li>
            Job boost and ad placement fees are non-refundable once the boost or
            ad goes live
          </Li>
          <Li>
            Failed payments will result in downgrade to the free plan at the end
            of the current billing period
          </Li>
        </ul>

        <H2>9. Reviews and ratings</H2>
        <P>
          Reviews submitted on TalentHQ must be based on genuine experiences.
          Fake, paid-for or malicious reviews violate these terms and may result
          in account suspension. We reserve the right to remove reviews that
          violate our community standards. We are not liable for the content of
          user reviews but we will act on valid complaints.
        </P>

        <H2>10. Moderation and account termination</H2>
        <P>
          We reserve the right to suspend or terminate any account that violates
          these terms, without prior notice in serious cases. Grounds include
          fraud, abuse, harassment, persistent spam, or posting illegal content.
          Suspended users may appeal by emailing {EMAIL}.
        </P>
        <P>
          You may delete your own account at any time from your dashboard
          settings. Upon deletion, your public profile is removed. Residual data
          is handled per our Privacy Policy retention schedule.
        </P>

        <H2>11. Disclaimers</H2>
        <ul className="mb-4 space-y-1">
          <Li>
            TalentHQ does not verify the identity of all users or the accuracy
            of all profiles — exercise your own due diligence
          </Li>
          <Li>
            We do not guarantee that use of the platform will result in
            employment, hiring or business outcomes
          </Li>
          <Li>
            The platform is provided "as is" — we do not warrant uninterrupted,
            error-free operation
          </Li>
          <Li>
            We are not responsible for the conduct of any user on or off the
            platform
          </Li>
        </ul>

        <H2>12. Limitation of liability</H2>
        <P>
          To the maximum extent permitted by Nigerian law, TalentHQ's total
          liability to you for any claim arising from use of the platform shall
          not exceed the amount you paid to us in the 3 months preceding the
          claim, or ₦50,000 — whichever is greater. We are not liable for
          indirect, consequential, or loss-of-profit damages.
        </P>

        <H2>13. Governing law and disputes</H2>
        <P>
          These terms are governed by the laws of the Federal Republic of
          Nigeria. Any dispute shall first be referred to mediation. If
          unresolved within 30 days, disputes shall be submitted to the
          jurisdiction of the Federal High Court of Nigeria.
        </P>

        <H2>14. Changes to these terms</H2>
        <P>
          We may update these terms from time to time. Material changes will be
          communicated by email at least 14 days before they take effect.
          Continued use after that date constitutes acceptance.
        </P>

        <H2>15. Contact</H2>
        <div className="bg-gray-100 rounded-2xl p-5 text-sm text-gray-700">
          <p className="font-bold mb-2">TalentHQ Legal</p>
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
        </div>
      </div>
    </div>
  );
}
