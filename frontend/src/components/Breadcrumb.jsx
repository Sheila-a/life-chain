/* eslint-disable react/prop-types */
import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const Breadcrumb = ({ crumbs }) => {
  const { pathname } = useLocation();

  return (
    <div className=' mt-2'>
      <div className='flex items-center gap-1 text-slate-600'>
        <NavLink to='/home' className='text-lg'></NavLink>

        {crumbs?.map((crumb, index) => (
          <React.Fragment key={index}>
            <Link
              to={crumb?.path}
              className={`${
                crumb?.path === pathname ? 'font-medium' : ''
              } whitespace-nowrap font-semibold`}
              style={{
                color: crumb?.path === pathname ? '#727A90' : '#0F9523',
              }}
            >
              {crumb?.label}
            </Link>
            {index < crumbs?.length - 1 && <span className='mx-1'>/</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb;
