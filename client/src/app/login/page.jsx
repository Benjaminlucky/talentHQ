"use client";

import React, { useState } from "react";

import JobSeekerLoginModal from "@/components/JobSeekerLoginModal";
import HandymanLoginModal from "@/components/HandymanLoginModal";
import EmployerLoginModal from "@/components/EmployerLoginModal";

export default function Page() {
  const [activeModal, setActiveModal] = useState(null); // 'jobseeker' | 'handyman' | null

  return (
    <main className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-primary-200 rounded-md shadow-md">
          <div className="flex flex-col justify-center text-center md:text-left px-6 sm:px-10 md:px-16 py-16 sm:py-20">
            <h2 className="text-4xl mx-auto sm:text-5xl md:text-6xl font-bold">
              Sign in to Access your Dashboard
            </h2>
            {/* <p className="text-gray-600 mx-auto text-xl sm:text-2xl mt-6">
              See where you left off!
            </p> */}

            <div className="mt-8 w-full md:w-7/12 flex flex-col mx-auto md:flex-row gap-4 justify-center md:justify-start items-center">
              <button
                onClick={() => setActiveModal("jobseeker")}
                className="bg-white w-full text-lg font-semibold px-5 py-3 rounded-md text-primary-500 hover:bg-lime-200 transition-all duration-300"
              >
                Job Seeker
              </button>

              <button
                onClick={() => setActiveModal("handyman")}
                className="bg-white w-full text-lg font-semibold px-5 py-3 rounded-md text-primary-500 hover:bg-lime-200 transition-all duration-300"
              >
                Handyman
              </button>

              <button
                onClick={() => setActiveModal("employer")}
                className="bg-white w-full text-lg font-semibold px-5 py-3 rounded-md text-primary-500 hover:bg-lime-200 transition-all duration-300"
              >
                Employer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <JobSeekerLoginModal
        isOpen={activeModal === "jobseeker"}
        onClose={() => setActiveModal(null)}
      />

      <HandymanLoginModal
        isOpen={activeModal === "handyman"}
        onClose={() => setActiveModal(null)}
      />
      <EmployerLoginModal
        isOpen={activeModal === "employer"}
        onClose={() => setActiveModal(null)}
      />
    </main>
  );
}
