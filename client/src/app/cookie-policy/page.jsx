// src/app/cookie-policy/page.jsx
export const metadata = {
  title: "Cookie Policy",
  description:
    "TalentHQ Cookie Policy — how we use cookies and your consent choices under the NDPA 2023.",
};

const UPDATED = "15 April 2026";
const EMAIL = "privacy@talenthq.buzz";

const H2 = ({ children }) => (
  <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3 pb-2 border-b border-gray-100">
    {children}
  </h2>
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

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#004b23] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-lime-400 text-xs font-bold uppercase tracking-widest mb-3">
            Legal · NDPC GAID Article 19
          </p>
          <h1 className="text-3xl font-black mb-3">Cookie Policy</h1>
          <p className="text-green-200 text-sm">Last updated: {UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-lime-50 border border-lime-200 rounded-2xl p-5 mb-8 text-sm text-lime-900 leading-relaxed">
          Under{" "}
          <strong>
            Article 19 of the NDPC General Application and Implementation
            Directive (GAID) 2025
          </strong>
          , websites must obtain opt-in consent before setting cookies that are
          not strictly necessary. This policy explains what we use and how you
          control it.
        </div>

        <H2>1. What are cookies?</H2>
        <P>
          Cookies are small text files stored on your device when you visit a
          website. They allow the site to remember information about your visit
          such as your login status and preferences.
        </P>

        <H2>2. Cookies we currently use</H2>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 font-bold text-gray-700">Name</th>
                <th className="text-left p-3 font-bold text-gray-700">Type</th>
                <th className="text-left p-3 font-bold text-gray-700">
                  Purpose
                </th>
                <th className="text-left p-3 font-bold text-gray-700">
                  Expiry
                </th>
                <th className="text-left p-3 font-bold text-gray-700">
                  Consent needed?
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "token",
                  "Essential",
                  "Stores your authentication session (httpOnly — not readable by JavaScript)",
                  "7 days",
                  "No",
                ],
                [
                  "_ga, _gid",
                  "Analytics",
                  "Google Analytics — anonymised page view statistics",
                  "2 years / 24hrs",
                  "Yes (not yet active)",
                ],
              ].map(([name, type, purpose, expiry, consent], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3 font-mono text-xs text-gray-700 border-b border-gray-100">
                    {name}
                  </td>
                  <td className="p-3 border-b border-gray-100">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        type === "Essential"
                          ? "bg-lime-100 text-lime-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {type}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 border-b border-gray-100">
                    {purpose}
                  </td>
                  <td className="p-3 text-gray-600 border-b border-gray-100">
                    {expiry}
                  </td>
                  <td className="p-3 border-b border-gray-100">
                    <span
                      className={`text-xs font-bold ${
                        consent === "No" ? "text-lime-700" : "text-amber-700"
                      }`}
                    >
                      {consent}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-900">
          <strong>Currently:</strong> we only set the essential authentication
          cookie. We do not yet use analytics or marketing cookies. If we add
          them in future, we will display a consent banner before setting them
          and update this policy.
        </div>

        <H2>3. Essential cookies — no consent required</H2>
        <P>
          The{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
            token
          </code>{" "}
          cookie is strictly necessary for the platform to function. It keeps
          you logged in between pages. Without it, you would be logged out on
          every page load. Under NDPA and GAID Article 19, strictly necessary
          cookies do not require consent.
        </P>
        <P>
          This cookie is set as <strong>httpOnly</strong> (cannot be read by
          JavaScript), <strong>Secure</strong> (HTTPS only) and{" "}
          <strong>SameSite=None</strong> (required because our frontend and
          backend run on separate domains). It expires automatically after 7
          days.
        </P>

        <H2>4. Analytics cookies — consent required</H2>
        <P>
          We plan to add Google Analytics to understand how the platform is used
          in aggregate. Before we do this, we will display a cookie consent
          banner and only set analytics cookies if you explicitly accept. You
          will be able to change your preference at any time.
        </P>

        <H2>5. How to control cookies</H2>
        <ul className="mb-4 space-y-1">
          <Li>
            <strong>Browser settings:</strong> all modern browsers let you view,
            block and delete cookies. Look in Settings → Privacy → Cookies.
            Note: blocking the essential cookie will log you out.
          </Li>
          <Li>
            <strong>Our cookie banner:</strong> when we add optional cookies, a
            banner will appear and you can accept or decline each category
          </Li>
          <Li>
            <strong>Google Analytics opt-out:</strong> install the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-600 hover:underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
          </Li>
        </ul>

        <H2>6. Third-party cookies</H2>
        <P>
          We embed content from Paystack (payment checkout). Paystack may set
          their own cookies when you make a payment. These are governed by{" "}
          <a
            href="https://paystack.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime-600 hover:underline"
          >
            Paystack's Privacy Policy
          </a>
          .
        </P>

        <H2>7. Contact</H2>
        <div className="bg-gray-100 rounded-2xl p-5 text-sm text-gray-700">
          <p className="font-bold mb-1">Cookie questions?</p>
          <p>
            Email:{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="text-lime-600 hover:underline"
            >
              {EMAIL}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
