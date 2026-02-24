import { useState, useRef, useEffect } from "react";
import { EllipsisVertical } from "lucide-react";

const TableActionMenu = ({ options = [], type }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setOpen((prev) => !prev);

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={toggleMenu} className="text-gray-600 hover:text-black">
        <EllipsisVertical />
      </button>

      {open && (
        <div
          className={`absolute right-0 divide-y-[0.3px] divide-slate-100 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 ${
            type === "large" ? " min-w-44" : " min-w-32"
          }`}
        >
          {options.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => {
                setOpen(false);
                if (opt.onClick) opt.onClick();
              }}
              className={`px-4 py-2 text-sm  cursor-pointer ${
                opt.label.toLowerCase().includes("delete")
                  ? "hover:bg-red-100"
                  : opt.label.toLowerCase().includes("suspend")
                  ? "hover:bg-yellow-100"
                  : "hover:bg-gray-100"
              }`}
            >
              {opt.href ? (
                <a
                  href={opt.href}
                  className={`block w-full h-full ${
                    opt.label.toLowerCase().includes("delete")
                      ? "text-red-500"
                      : opt.label.toLowerCase().includes("suspend")
                      ? "text-yellow-500"
                      : ""
                  }`}
                >
                  {opt.label}
                </a>
              ) : (
                <span
                  className={`block w-full h-full ${
                    opt.label.toLowerCase().includes("delete")
                      ? "text-red-500"
                      : opt.label.toLowerCase().includes("suspend")
                      ? "text-yellow-500"
                      : ""
                  }`}
                >
                  {opt.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableActionMenu;
