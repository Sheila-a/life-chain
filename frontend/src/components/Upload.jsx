/* eslint-disable react/prop-types */
import { CircleX, SidebarCloseIcon } from "lucide-react";
import { toast } from "sonner";
import { Upload } from "../assets";
import { useState } from "react";

const CustomUploadButton = ({
  accept,
  file,
  onFileSelect,
  label,
  error,
  onBlur,
  className,
  labelClass,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const processFile = (newFile) => {
    if (!newFile) return;

    const maxSize = 2 * 1024 * 1024;

    if (newFile.size > maxSize) {
      toast.error(
        "File size exceeds the 2MB limit. Please upload a smaller file."
      );
      return;
    }

    onFileSelect(newFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    // e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    // e.stopPropagation();
    setIsDragging(true);

    const droppedFile = e.dataTransfer.files?.[0];
    processFile(droppedFile);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    processFile(newFile);

    // if (newFile) {
    //   const maxSize = 2 * 1024 * 1024;

    //   if (newFile.size > maxSize) {
    //     toast.error(
    //       "File size exceeds the 2MB limit. Please upload a smaller file."
    //     );
    //     return;
    //   }

    //   onFileSelect(newFile);
    // }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
  };

  const formatFileSize = (size) => (size / 1024).toFixed(2) + " KB";

  return (
    <div className="m-0 mb-[10px] text-center mt-3">
      <label
        className={`${labelClass} text-left block text-label font-[600] text-sec-100 mb-1`}
      >
        {label}
      </label>
      <label
        onBlur={onBlur}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`text-center flex items-center flex-col py-[60px] px-[12px] cursor-pointer border-[3px] border-dashed mb-2  w-full rounded-[8px] text-[14px] ${
          isDragging ? "border-primary-500 bg-primary-50" : ""
        } ${className} ${error ? "border-red-500" : ""}`}
      >
        <img src={Upload} className="mb-[10px] object-cover inline-block" />
        <span className="ml-[8px]m text-center text-[15px] text-sec-100">
          <span className="text-primary-500">Click to upload</span> or drag and
          drop
        </span>
        <span className="ml-[8px]m text-center text-[15px] text-sec-100">
          SVG, PNG, JPG, PDF or GIF
        </span>
        <span className="ml-[8px]m text-sec-300 text-center text-[15px]">
          (Max, 2MB)
        </span>

        <input
          type="file"
          accept={accept}
          className="top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={!!file.file}
        />
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {file && file.file != null && (
        <div className="mb-[10px] flex flex-col border border-[#e7e7e7] p-[10px] rounded-[8px] items-start ">
          <div className="flex justify-between w-full text-left items-center">
            <div className="flex items-center gap-[12px]">
              <img
                src={URL.createObjectURL(file.file)}
                className="w-10 h-10 rounded-lg"
              />
              <div className="flex flex-col">
                <span className="font-bold text-left mr-[10px] text-[14px]">
                  {file.file?.name}
                </span>
                <span className="text-[10px] text-[#6d6d6d] ">
                  {formatFileSize(file.file?.size)}
                </span>
              </div>
            </div>
            <CircleX
              className="w-[20px] h-[20px] cursor-pointer "
              onClick={handleRemoveFile}
            />
          </div>
          {file.file != null && file.progress !== 100 && (
            <div className="flex w-full items-center">
              <div className="w-[95%] bg-[#fafafa] h-[8px] mr-[10px] relative rounded-[50px] ">
                <div
                  className="h-full bg-[#000073] rounded-[50px] relative transition-all duration-300 ease-linear"
                  style={{ width: `${file.progress}%` }}
                ></div>
              </div>
              <span className="font-bold">{file.progress}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default CustomUploadButton;
