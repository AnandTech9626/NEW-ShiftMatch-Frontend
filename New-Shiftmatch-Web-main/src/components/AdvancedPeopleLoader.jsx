import React from "react";

const AdvancedPeopleLoader = ({ fullScreen = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen
          ? "fixed inset-0 bg-white/70 backdrop-blur-md z-50"
          : "py-20"
      }`}
    >
      <div className="flex items-end gap-10">

        {/* LEFT */}
        <div className="flex flex-col items-center animate-floatSlow animate-pulseSoft [animation-delay:0.2s]">
          <div className="w-2 h-2 rounded-full bg-[#0F4C5C] shadow-lg shadow-[#0F4C5C]/40"></div>
          <div className="w-20 h-14 bg-[#0F4C5C] rounded-t-full mt-2 shadow-lg shadow-[#0F4C5C]/40"></div>
        </div>

        {/* CENTER */}
        <div className="flex flex-col items-center animate-floatSlow animate-pulseSoft [animation-delay:0.4s]">
          <div className="w-5 h-5 rounded-full bg-[#48A9A6] shadow-xl shadow-[#48A9A6]/50"></div>
          <div className="w-28 h-16 bg-[#48A9A6] rounded-t-full mt-2 shadow-xl shadow-[#48A9A6]/50"></div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-center animate-floatSlow animate-pulseSoft [animation-delay:0.6s]">
          <div className="w-2 h-2 rounded-full bg-[#123C69] shadow-lg shadow-[#123C69]/40"></div>
          <div className="w-20 h-14 bg-[#123C69] rounded-t-full mt-2 shadow-lg shadow-[#123C69]/40"></div>
        </div>

      </div>
    </div>
  );
};

export default AdvancedPeopleLoader;