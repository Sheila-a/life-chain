import { Outlet } from 'react-router-dom';

function PublicRoute() {
  return (
    <div className='min-h-screen'>
      <Outlet />
    </div>
  );
}

export default PublicRoute;
