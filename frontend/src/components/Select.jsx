/* eslint-disable react/prop-types */
import { Fragment, useState } from "react";
import { Check, ChevronDown, CircleX, Filter, Info } from "lucide-react";
import { motion } from "framer-motion";

const Select = ({
  label,
  placeholder = "Select Option",
  classLabel = "",
  className = "",
  register,
  name,
  readonly,
  value,
  error,
  disabled,
  id,
  onBlur,
  horizontal,
  validate,
  msgTooltip,
  description,
  onChange,
  options,
  defaultValue = "",
  required,
  size,
  variant = "",
  hasIcon,
  icon,
  ...rest
}) => {
  options = options || Array(3).fill("option");
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1 }}
      className={`${className} ${`mb-6`}`}
      // className={`  ${error ? 'has-error' : ''}  ${
      //   horizontal ? 'flex' : ''
      // }  ${validate ? 'is-valid' : ''} `}
    >
      {label && (
        <label className="block text-label font-[600] text-sec-100 mb-1">
          {label}
          {required && <span className="text-semantic-info-default">*</span>}
        </label>
      )}
      <div className={`relative ${horizontal ? "flex-1" : ""}`}>
        {name && (
          <select
            onChange={onChange}
            {...register(name)}
            {...rest}
            // className={`${
            //   error ? ' has-error pl-3' : 'pl-3 '
            // } form-control py-2  appearance-none ${className}  `}
            className={`w-full px-3 py-[11px] text-primary-500 ${
              variant === "outline" ? "bg-white" : "bg-primary-100"
            }  text-[14px] font-medium placeholder:font-light border ${
              error ? "border-red-500" : " "
            } rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-sec-300`}
            readOnly={readonly}
            // placeholder={placeholder}
            disabled={disabled}
            id={id}
            value={value}
            size={size}
            defaultValue={defaultValue}
          >
            {/* <option value='' disabled className='text-sec-300'>
              <span className='text-[#727A90_!important]'>{placeholder}</span>
            </option> */}
            {options.map((option, i) => (
              <Fragment key={i} className="cursor-pointer">
                {option.value && option.label ? (
                  <option
                    key={i}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </option>
                ) : (
                  <option key={i} value={option} className="cursor-pointer">
                    {option}
                  </option>
                )}
              </Fragment>
            ))}
          </select>
        )}
        {!name && !hasIcon && (
          <select
            onChange={onChange}
            // className={`${
            //   error ? ' has-error pl-3' : 'pl-3'
            // } form-control py-2 appearance-none ${className}  `}
            className={`w-full  px-3 py-3 text-primary-500 ${
              variant === "outline" ? "bg-white" : "bg-primary-100"
            }  text-[14px] bg-primary-100 font-medium placeholder:font-light border ${
              error ? "border-red-500" : ""
            } appearance-none rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500`}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            value={value}
            onBlur={onBlur}
            size={size}
            defaultValue={defaultValue}
          >
            <option value="" disabled className="text-sec-300">
              <span className="text-[#c5cee4]">{placeholder}</span>
            </option>
            {options.map((option, i) => (
              <Fragment key={i} className="cursor-pointer">
                {option.value && option.label ? (
                  <option
                    key={i}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </option>
                ) : (
                  <option key={i} className="cursor-pointer" value={option}>
                    {option}
                  </option>
                )}
              </Fragment>
            ))}
          </select>
        )}
        {!name && hasIcon && (
          <select
            onChange={onChange}
            // className={`${
            //   error ? ' has-error pl-3' : 'pl-3'
            // } form-control py-2 appearance-none ${className}  `}
            className={`w-full relative  pr-6 pl-10 py-3 text-primary-500 ${
              variant === "outline" ? "bg-white" : "bg-primary-100"
            }  text-[14px] bg-primary-100 font-medium placeholder:font-light border ${
              error ? "border-red-500" : ""
            } appearance-none rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500`}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            value={value}
            onBlur={onBlur}
            size={size}
            defaultValue={defaultValue}
          >
            <option value="" disabled className="text-sec-300">
              <span className="text-[#c5cee4]">{placeholder}</span>
            </option>
            {options.map((option, i) => (
              <Fragment key={i} className="cursor-pointer">
                {option.value && option.label ? (
                  <option
                    key={i}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </option>
                ) : (
                  <option key={i} className="cursor-pointer" value={option}>
                    {option}
                  </option>
                )}
              </Fragment>
            ))}
          </select>
        )}
        {icon && (
          <div className="absolute  left-3 top-3 text-slate-600">{icon}</div>
        )}

        {/* icon */}
        <div className="flex text-md absolute right-[4px]   top-1/2 -translate-y-1/2  space-x-1 rtl:space-x-reverse">
          <span className=" relative -right-[2px] inline-block text-slate-900 dark:text-slate-300 pointer-events-none">
            <ChevronDown />
          </span>

          {validate && (
            <span className="text-success-500">
              <Check />
            </span>
          )}
        </div>
      </div>
      {/* error and success message*/}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* validated and success message*/}
      {validate && (
        <div
          className={` mt-2 ${
            msgTooltip
              ? " inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded"
              : " text-success-500 block text-sm"
          }`}
        >
          {validate}
        </div>
      )}
      {/* only description */}
      {description && <span className="input-description">{description}</span>}
    </motion.div>
  );
};

export const MultiSelect = ({
  label,
  options = [],
  name,
  placeholder = "Select Options",
  register,
  classLabel = "form-label",
  className = "",
  id,
  horizontal,
  error,
  validate,
  msgTooltip,
  description,
  disabled,
  onChange,
  defaultValue = [],
}) => {
  const [selected, setSelected] = useState(defaultValue);

  const toggleOption = (value) => {
    let updated;
    if (selected.includes(value)) {
      updated = selected.filter((item) => item !== value);
    } else {
      updated = [...selected, value];
    }
    setSelected(updated);
    onChange?.(updated);
  };

  const removeOption = (value) => {
    const updated = selected.filter((item) => item !== value);
    setSelected(updated);
    onChange?.(updated);
  };

  return (
    <div
      className={`fromGroup ${error ? "has-error" : ""} ${
        horizontal ? "flex" : ""
      } ${validate ? "is-valid" : ""}`}
    >
      {label && (
        <label
          htmlFor={id}
          className={`block capitalize ${classLabel} ${
            horizontal ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words" : ""
          }`}
        >
          {label}
        </label>
      )}

      <div className={`relative ${horizontal ? "flex-1" : ""}`}>
        <div
          className={`form-control py-2 pl-3 pr-10 flex flex-wrap gap-2 cursor-pointer ${className}`}
          onClick={() => document.getElementById(`${id}-dropdown`)?.focus()}
        >
          {selected.length > 0 ? (
            selected.map((val, i) => (
              <div
                key={i}
                className="bg-primary-100 text-primary-800 text-sm px-2 py-1 rounded flex items-center space-x-1"
              >
                <span>
                  {options.find((o) => o.value === val)?.label || val}
                </span>
                <button type="button" onClick={() => removeOption(val)}>
                  <CircleX className="text-xs" />
                </button>
              </div>
            ))
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>

        <select
          id={`${id}-dropdown`}
          multiple
          className="hidden"
          value={selected}
          onChange={(e) => {
            const values = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            );
            setSelected(values);
            onChange?.(values);
          }}
          {...(register && name ? register(name) : {})}
          disabled={disabled}
        >
          {options.map((option, i) => (
            <option key={i} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>

        {/* Icon Section */}
        <div className="flex text-md absolute right-[14px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse">
          <span className="relative -right-[2px] inline-block text-slate-900 dark:text-slate-300 pointer-events-none">
            <ChevronDown />
          </span>
          {error && (
            <span className="text-danger-500">
              <Info />
            </span>
          )}
          {validate && (
            <span className="text-success-500">
              <Check />
            </span>
          )}
        </div>
      </div>

      {error && (
        <div
          className={`mt-2 ${
            msgTooltip
              ? "inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded"
              : "text-danger-500 block text-[12px]"
          }`}
        >
          {error.message}
        </div>
      )}
      {validate && (
        <div
          className={`mt-2 ${
            msgTooltip
              ? "inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded"
              : "text-success-500 block text-sm"
          }`}
        >
          {validate}
        </div>
      )}
      {description && <span className="input-description">{description}</span>}
    </div>
  );
};

export default Select;
