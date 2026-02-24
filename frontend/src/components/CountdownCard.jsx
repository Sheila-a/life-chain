import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatReadableDate } from "../helpers/others";

const CountdownCard = ({ dueDate, handleOpen, type, name, form }) => {
  const getTimeDiff = (targetDate, mode) => {
    const now = Date.now();
    const target = new Date(targetDate).getTime();

    const diff = mode === "red" ? now - target : target - now;

    const safeDiff = Math.max(diff, 0);

    return {
      days: Math.floor(safeDiff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((safeDiff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((safeDiff / (1000 * 60)) % 60),
      seconds: Math.floor((safeDiff / 1000) % 60),
    };
  };

  const time = getTimeDiff(dueDate?.dueDate, form);
  // console.log(dueDate);

  const isFutureOrToday = new Date(dueDate?.dueDate).getTime() >= Date.now();
  // console.log(isFutureOrToday);

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 1 }}
      className={`${
        form === "red" ? "bg-red-600" : "bg-primary-500"
      } mt-5 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-40 -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-40 -ml-32 -mb-32"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 mb-6 border border-white/10">
          <Clock className="w-4 h-4 text-blue-200" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
            {form === "red" ? "Overdue" : "Next"} {type} Deadline:{" "}
            {formatReadableDate(dueDate?.dueDate)}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-blue-50">
          {name}
        </h2>
        <span className="text-[11px] mb-3 font-bold uppercase tracking-[0.2em]">
          {form === "red" ? "Overdue by" : "Time left"}
        </span>
        {/* Countdown Timer */}
        <div className="flex gap-3 md:gap-6 mb-10">
          {[
            { label: "Days", value: time.days },
            { label: "Hours", value: time.hours },
            { label: "Mins", value: time.minutes },
            { label: "Secs", value: time.seconds },
          ].map((unit, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-18 md:w-24 md:h-24 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl flex flex-col items-center justify-center mb-2 shadow-xl">
                <span className="text-3xl md:text-5xl font-mono font-black tracking-tighter">
                  {String(unit.value).padStart(2, "0")}
                </span>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-blue-200/70">
                  {unit.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => handleOpen(dueDate)}
          disabled={isFutureOrToday}
          className={`bg-white ${
            form === "red" ? "text-red-700" : "text-blue-700"
          } ${isFutureOrToday ? "opacity-50 cursor-not-allowed" : "opacity-100"} px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group`}
        >
          Remit Payment Now
          <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </motion.section>
  );
};

export default CountdownCard;
