import React from 'react';

const PageHeader = ({ title, subtitle, icon: Icon, actions }) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-blue-600">
            <Icon size={28} />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase">{title}</h1>
          {subtitle && <p className="text-gray-500 font-medium mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;
