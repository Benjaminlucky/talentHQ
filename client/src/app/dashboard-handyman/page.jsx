"use client";
import Intro from "@/components/Intro";
import JobSeekerActivityLog from "@/components/JobSeekerActivityLog";
import Profile from "@/components/Profile";
import React from "react";

function page() {
  return (
    <main className="container w-full">
      <div className="wrapper w-full">
        <div className="profileSection">
          <Profile />
        </div>
        <div className="introSection">
          <Intro />
        </div>
        <div className="activityLog">
          {/* Assuming JobSeekerActivityLog is a component that displays the activity log */}
          <JobSeekerActivityLog />
        </div>
      </div>
    </main>
  );
}

export default page;
