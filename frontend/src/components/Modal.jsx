import { X } from 'lucide-react';
import { useEffect } from 'react';

const CustomModal = ({
  open,
  handleClose,
  children,
  className = '',
  style,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center bg-black/30'
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white relative rounded-xl shadow-xl p-6 max-w-lgw-full ${className}`}
        style={style}
      >
        <X
          className='text-sec-300 right-6 absolute cursor-pointer'
          onClick={handleClose}
        />

        {children}
      </div>
    </div>
  );
};

export default CustomModal;
