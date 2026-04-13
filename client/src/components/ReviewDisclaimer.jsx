"use client";

import { useState } from "react";
import { Shield, ChevronDown } from "lucide-react";

/**
 * ReviewDisclaimer — safe harbour legal copy for user-generated reviews.
 * Drop this below any ReviewSection component.
 *
 * Props:
 *   compact?:  boolean — show a shorter single-line version
 */
export default function ReviewDisclaimer({ compact = false }) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1">
        <Shield size={10} className="flex-shrink-0" />
        Reviews are user opinions. TalentHQ is not liable for review content.{" "}
        <span
          className="underline cursor-pointer hover:text-gray-600"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Less" : "More"}
        </span>
        {expanded && (
          <span className="block mt-1 text-[10px] leading-relaxed">
            TalentHQ does not verify the accuracy of reviews and accepts no
            liability for loss arising from reliance on review content. If you
            believe a review is false or defamatory, use the Report button to
            alert our moderation team. Reviews may be removed at our discretion.
          </span>
        )}
      </p>
    );
  }

  return (
    <div className="mt-4 px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-start gap-2.5">
        <Shield size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-0.5">
            Review Disclaimer
          </p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Reviews on TalentHQ are user-generated opinions and do not represent
            the views of TalentHQ. We do not verify the accuracy of any review
            and accept no liability for decisions made based on review content.
            If you believe a review is false, misleading, or defamatory, please
            use the <strong className="text-gray-700">Report</strong> button to
            notify our moderation team. Reviews may be investigated and removed
            at TalentHQ's sole discretion.
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition mt-1.5"
          >
            <ChevronDown
              size={11}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? "Hide" : "View full disclaimer"}
          </button>
          {expanded && (
            <div className="mt-2 text-[11px] text-gray-500 leading-relaxed space-y-1.5 pt-2 border-t border-gray-200">
              <p>
                <strong className="text-gray-700">Safe harbour:</strong>{" "}
                TalentHQ operates as an intermediary marketplace under Section
                15 of the Nigerian Cybercrimes Act 2015 and analogous safe
                harbour provisions. We are not the publisher of user-generated
                content and our liability for such content is expressly excluded
                to the fullest extent permitted by applicable law.
              </p>
              <p>
                <strong className="text-gray-700">Moderation:</strong> Flagged
                reviews are assessed by our team within 7 business days. We
                reserve the right to hide, edit, or remove any review that
                violates our Community Guidelines without prior notice.
              </p>
              <p>
                <strong className="text-gray-700">Legal notices:</strong>{" "}
                Defamation or takedown requests must be sent to{" "}
                <span className="text-primary-600">legal@talenthq.ng</span> with
                supporting documentation. We do not accept legal notices through
                in-app reporting tools.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
