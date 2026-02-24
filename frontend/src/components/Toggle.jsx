import React from "react";

const Toggle = ({
  checked = false,
  onChange = () => {},
  disabled = false,
  size = "md",
  label = "",
}) => {
  const sizes = {
    sm: { w: 32, h: 18, dot: 14 },
    md: { w: 44, h: 24, dot: 20 },
    lg: { w: 52, h: 30, dot: 26 },
  };

  const { w, h, dot } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {label && (
        <label
          className={`block md:text-label md:text-[16px] text-[10px]  text-sec-300`}
        >
          {label}
        </label>
      )}
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: w,
          height: h,
          backgroundColor: checked ? "#272756" : "#253af20d",
          borderRadius: h,
          padding: 2,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.25s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: checked ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            width: dot,
            height: dot,
            background: "#fff",
            borderRadius: "50%",
            transition: "all 0.25s ease",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </div>
    </div>
  );
};

export default Toggle;
