import { Check } from "lucide-react";
const Checkbox = ({
  id,
  disabled,
  label,
  value,
  name,
  error,
  onChange,
  checked,
  activeClass = "ring-primary-500  bg-primary-500",
  classLabel = "text-sec-100",
}) => {
  return (
    <label
      className={`flex gap-3 ${
        disabled ? " cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
      id={id}
    >
      <input
        type="checkbox"
        className="hidden"
        name={name}
        checked={checked}
        onChange={onChange}
        htmlFor={id}
        disabled={disabled}
      />
      <span
        className={`h-5 mt-1 w-5 p-[2px] border flex-none rounded 
        flex items-center ltr:mr-3 rtl:ml-3 relative transition-all duration-150
        ${
          checked
            ? activeClass + " ring-2ring-offset-2 ring-offset-primary-500 "
            : `bg-slate-100 ${error ? "border-red-500" : " border-primary-500"}`
        }
        `}
      >
        {checked && <Check color="#fff" />}
      </span>
      <span className={`${classLabel} `}>{label}</span>
    </label>
  );
};

export default Checkbox;
