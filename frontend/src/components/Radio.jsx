const Radio = ({
  label,
  id,
  name,
  disabled,
  value,
  onChange,
  activeClass = "ring-primary-500  ",
  wrapperClass = " ",
  labelClass = "text-slate-500   text-sm leading-6",
  checked,
  error,
  className = "h-[20px] w-[20px]",
}) => {
  return (
    <div>
      <label
        className={
          `flex items-center ${
            disabled ? " cursor-not-allowed opacity-50" : "cursor-pointer "
          }` +
          "" +
          wrapperClass
        }
        id={id}
      >
        <input
          type="radio"
          className="hidden"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          htmlFor={id}
          disabled={disabled}
        />
        <span
          className={` flex-none rounded-full inline-flex  relative transition-all duration-150
          ${className}
          ${
            checked
              ? activeClass + " ring-[6px] bg-white ring-inset"
              : `  bg-primary-100 ${error ? "border border-red-500" : " "}`
          }
          `}
        ></span>
        {label && <span className={`${labelClass} ml-1`}>{label}</span>}
      </label>
    </div>
  );
};

export default Radio;
