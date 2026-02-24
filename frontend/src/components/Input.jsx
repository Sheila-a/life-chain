// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Eye, EyeClosed } from 'lucide-react';
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, EyeClosed } from "lucide-react";
export const Input2 = ({
  label,
  type = "text",
  disabled,
  name,
  value,
  onChange,
  onBlur,
  error,
  min,
  max,
  required,
  maxLength,
  placeholder,
  autoFocus,
  labelClass,
  className,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1 }}
      className={` ${className} mb-4 relative`}
    >
      <label
        className={`${labelClass} block text-label font-[600] text-sec-100 mb-1`}
      >
        {label}
        {required && <span className="text-semantic-info-default">*</span>}
      </label>
      <div className="relative">
        <input
          type={type === "password" && isPasswordVisible ? "text" : type}
          name={name}
          min={min}
          max={max}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onBlur={onBlur}
          onChange={onChange}
          className={`w-full px-3 py-[11px] text-primary-500 text-[14px] font-medium placeholder:font-light border ${
            disabled ? "bg-gray-300" : "bg-primary-100 "
          } ${
            error ? "border-red-500" : ""
          } rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500`}
        />
        {type === "password" && (
          <span
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
          >
            {isPasswordVisible ? <Eye /> : <EyeClosed />}
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </motion.div>
  );
};

// export default Input;

const Input = ({
  type = "text",
  disabled,
  name,
  value,
  onChange,
  onBlur,
  error,
  required,
  maxLength,
  placeholder,
  autoFocus,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef(null);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    if (inputRef.current) inputRef.current.focus();
  };

  const showFloating = isFocused || value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1 }}
      className={` ${className} mb-4 relative`}
    >
      <div className="relative w-full">
        {" "}
        <label
          className={`absolute left-5 text-sec-300 text-sm font-medium transition-all duration-300
            ${
              showFloating
                ? "text-[14px] -top-[15px] bg-white p-1 block"
                : "text-base top-4 text-gray-400 hidden"
            }
            ${error ? "text-red-500" : ""}`}
        >
          {placeholder} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={inputRef}
          type={type === "password" && isPasswordVisible ? "text" : type}
          name={name}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          onChange={onChange}
          placeholder={showFloating ? "" : placeholder}
          className={`peer w-full px-3 py-3 text-[#1F2A40]   text-base font-medium border rounded-lg focus:outline-none focus:ring-1 transition-all duration-500
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-[#1F2A4026] focus:ring-primary-500"
            }`}
        />
        {type === "password" && (
          <span
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
          >
            {isPasswordVisible ? <Eye /> : <EyeClosed />}
          </span>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </motion.div>
  );
};

export default Input;
