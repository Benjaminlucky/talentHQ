import React from "react";
import { IoIosSearch } from "react-icons/io";
import { MdNotificationsActive } from "react-icons/md";

export default function Profile() {
  return (
    <section className="w-full bg-white px-4 pt-3 pb-5 border-gray-200 border-b">
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex flex-1 max-w-xl items-center bg-lime-50 rounded-md px-3 py-2 shadow-sm">
          <IoIosSearch className="text-xl text-lime-500" />
          <input
            type="text"
            placeholder="Search anything..."
            className="ml-2 w-full bg-transparent outline-none placeholder:text-sm placeholder:text-lime-500 text-sm"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <button
            className="relative text-lime-700 hover:text-lime-600"
            aria-label="Notifications"
          >
            <MdNotificationsActive className="text-2xl" />
            {/* Badge (optional) */}
            <span className="absolute -top-1 -right-1 inline-block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img
                src="/assets/adebayo.avif"
                alt="User Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm font-medium text-gray-700 hidden sm:block">
              Alina Kimberly
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
