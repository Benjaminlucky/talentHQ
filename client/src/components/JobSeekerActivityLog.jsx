import React from "react";
import { MdMarkEmailRead } from "react-icons/md";
import { MdVideoCall } from "react-icons/md";

export default function JobSeekerActivityLog() {
  return (
    <section className="activityLog w-full py-8">
      <div className="content w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-start gap-4">
        <div className="snapshot flex bg-gray-100 py-8 px-12 rounded-md  flex items-center justify-between">
          <div className="left flex flex-col items-center">
            <div className="icon text-5xl bg-white p-6 rounded-full text-lime-700 mb-2">
              <MdMarkEmailRead />
            </div>
            <div className="totalJobApplied text-center text-4xl font-semibold text-lime-700 py-2">
              <h3>37</h3>
            </div>
            <div className="totalJobAppliedText py-4 text-center text-gray-600">
              <h4>Total Job Applied</h4>
            </div>
          </div>
          <div className="right flex flex-col items-center">
            <div className="icon text-5xl bg-white p-6 rounded-full text-primary-500 mb-2">
              <MdVideoCall />
            </div>
            <div className="totalInterview text-center text-4xl font-semibold text-lime-700 py-2">
              <h3>12</h3>
            </div>
            <div className="totalInterviewText py-4 text-center text-gray-600">
              <h4>interviewed</h4>
            </div>
          </div>
        </div>
        <div className="jobApplied"></div>
        <div className="upcomingInterviews"></div>
      </div>
    </section>
  );
}
