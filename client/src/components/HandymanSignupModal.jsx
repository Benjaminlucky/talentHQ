import React from "react";

import HandySignup from "./HandymanSignup";

export default function HandySignupModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className=" min-h-auto inset-0 z-50 flex items-center justify-center ">
      <div className="bg-white w-full max-w-3xl mx-auto rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold"
        >
          &times;
        </button>
        <HandySignup />
      </div>
    </div>
  );
}
