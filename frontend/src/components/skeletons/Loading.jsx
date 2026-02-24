import { LoadSpinner } from '../../assets';

const Loading = () => {
  return (
    <div className='flex min-h-[100vh] items-center justify-center bg-white'>
      <img src={LoadSpinner} alt='loading...' />
      <h1 className='font-sansfont-boldantialiased'></h1>
    </div>
  );
};

export default Loading;
