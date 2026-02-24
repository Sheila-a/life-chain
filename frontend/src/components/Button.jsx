import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
// import { motion } from 'framer-motion';

const Button = ({
  variant = "color",
  icon,
  loading = false,
  loadingText = "Loading...",
  href,
  className,
  children,
  iconPosBack,
  innnerClassName,
  disabled,
  onClick,
  ...props
}) => {
  const baseClasses = `inline-flex items-center gap-2 px-5 py-[11px] rounded-xl cursor-pointer font-medium border transition-all duration-200 ${
    disabled &&
    "opacity-40 border-gray-300 cursor-not-allowed pointer-events-none"
  }`;

  const variantClasses = {
    outline: `bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-100`,
    dark: "bg-black text-white border border-black hover:bg-gray-800",
    green: "bg-green-600 text-white border border-green-600 hover:bg-green-800",
    red: "bg-red-600 text-white border border-red-600 hover:bg-red-800",
    gray: "bg-gray-200 hover:bg-gray-300",
    light: "bg-white text-primary-500 border border-gray-300 hover:bg-gray-100",
    color: `bg-primary-500 text-white border border-primary-500 hover:bg-primary-100 hover:text-primary-500 ${
      disabled && "opacity-40 border-gray-300 pointer-events-none"
    }`,
  };

  const content = (
    <>
      {loading ? (
        <>
          <Loader2 className="animate-spin w-4 h-4 border-[#d2f5f1//]" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon && !iconPosBack && <span className="wf-4 hf-4">{icon}</span>}
          <span className={`font-semibold ${innnerClassName}`}>{children}</span>
          {icon && iconPosBack && <span className="wf-4 hf-4">{icon}</span>}
        </>
      )}
    </>
  );

  const fullClass = clsx(baseClasses, variantClasses[variant], className);

  if (href) {
    return (
      <Link to={href} className={fullClass}>
        {content}
      </Link>
    );
  }

  return (
    <button
      // initial={{ opacity: 0, y: 50 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ delay: 0.5, duration: 1 }}
      className={fullClass}
      onClick={onClick}
      disabled={loading || disabled}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
