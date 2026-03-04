import React from 'react';

const Card = ({ children, title, description, icon: Icon, className = "", footer }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md ${className}`}>
      {(title || Icon) && (
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-bold text-gray-800">{title}</h3>}
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
          </div>
          {Icon && (
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Icon size={20} />
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
