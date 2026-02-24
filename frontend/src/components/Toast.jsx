import { toast, Toaster } from 'sonner';

const CustomToastContainer = ({ ...props }) => (
  <Toaster
    richColors
    expand={false}
    {...props}
    position='top-right'
    className='class text-body-text '
  />
);

export const SuccessToast = ({ text }) => {
  return toast.success(text, {
    style: {
      background: 'white',
    },
  });
};

export default CustomToastContainer;
