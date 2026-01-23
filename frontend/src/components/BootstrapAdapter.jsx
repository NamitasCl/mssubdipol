import React from 'react';

export const Row = ({ children, className = "", style, ...props }) => (
  <div className={`flex flex-wrap -mx-2 ${className}`} style={style} {...props}>{children}</div>
);

export const Col = ({ children, xs, sm, md, lg, xl, className = "", style, ...props }) => {
  // Simplified columns assuming 12-grid system mapping to width percentages roughly
  let widthClass = "w-full"; // Default xs=12
  if (md) widthClass = `md:w-${Math.floor(md/12*100) < 30 ? '1/4' : md > 6 ? 'full' : '1/2'}`; // Rough approximation
  // Better approach: just use flex grow or specific classes if needed, for now standard widths:
  // Since original code uses specific col sizes, we can map common ones:
  if (md === 6) widthClass = "md:w-1/2";
  if (md === 4) widthClass = "md:w-1/3";
  if (md === 3) widthClass = "md:w-1/4";
  if (md === 5) widthClass = "md:w-5/12";
  
  if (lg === 3) widthClass = "lg:w-1/4";
  if (xl === 2) widthClass = "xl:w-1/6";

  return <div className={`px-2 ${widthClass} ${className}`} style={style} {...props}>{children}</div>
};

// Form as a component with sub-components attached
const FormComponent = ({ children, onSubmit, className = "", ...props }) => (
  <form onSubmit={onSubmit} className={className} {...props}>{children}</form>
);

FormComponent.Label = ({ children, htmlFor, className = "" }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>{children}</label>
);

FormComponent.Control = ({ type = "text", value, onChange, disabled, className = "", as, children, ...props }) => {
  const inputClass = `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 ${className}`;
  
  if (as === "select") {
    return (
      <select 
        value={value} 
        onChange={onChange} 
        disabled={disabled} 
        className={inputClass}
        {...props}
      >
        {children}
      </select>
    );
  }
  
  return (
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      disabled={disabled} 
      className={inputClass}
      {...props}
    />
  );
};

FormComponent.Select = ({ children, value, onChange, disabled, className = "", ...props }) => (
  <select 
    value={value} 
    onChange={onChange} 
    disabled={disabled} 
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 ${className}`}
    {...props}
  >
    {children}
  </select>
);

FormComponent.Group = ({ children, className = "", style }) => (
  <div className={`mb-3 ${className}`} style={style}>{children}</div>
);

FormComponent.Check = ({ type = "checkbox", id, label, checked, onChange, disabled, className = "", ...props }) => (
  <div className={`flex items-center ${className}`}>
    <input 
      type={type} 
      id={id} 
      checked={checked} 
      onChange={onChange} 
      disabled={disabled}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      {...props}
    />
    {label && <label htmlFor={id} className="ml-2 block text-sm text-gray-900 select-none">{label}</label>}
  </div>
);

export const Form = FormComponent;

export const Button = ({ children, variant = "primary", size, onClick, disabled, className = "", title, ...props }) => {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500",
    info: "bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    "outline-secondary": "border border-gray-300 text-gray-700 hover:bg-gray-50",
    "outline-primary": "border border-blue-600 text-blue-600 hover:bg-blue-50",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };
  const cls = `${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  return <button onClick={onClick} disabled={disabled} className={cls} title={title} {...props}>{children}</button>;
};

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
);
Card.Header = ({ children, className = "" }) => <div className={`px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl ${className}`}>{children}</div>;
Card.Body = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

export const Spinner = ({ animation, size, className = "" }) => (
  <div className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-white ${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} ${className}`} role="status" />
);

export const Modal = ({ show, onHide, centered, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onHide}></div>
      <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${centered ? 'my-auto' : 'mt-10'}`}>
        {children}
      </div>
    </div>
  );
};
Modal.Header = ({ closeButton, children }) => (
  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
    <div className="text-lg font-bold text-gray-800">{children}</div>
    {/* Close button handled mostly by logic or custom implement */}
  </div>
);
Modal.Title = ({ children }) => <span>{children}</span>;
Modal.Body = ({ children }) => <div className="p-6 text-gray-600">{children}</div>;
Modal.Footer = ({ children }) => <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">{children}</div>;

export const Alert = ({ variant = "primary", className = "", children }) => {
  const colors = {
    danger: "bg-red-50 text-red-700 border-red-100",
    success: "bg-green-50 text-green-700 border-green-100",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    primary: "bg-blue-50 text-blue-700 border-blue-100",
  };
  return <div className={`p-4 rounded-lg border ${colors[variant]} ${className}`}>{children}</div>;
};

export const ListGroup = ({ children, className = "" }) => <div className={`border rounded-xl overflow-hidden ${className}`}>{children}</div>;
ListGroup.Item = ({ children, className = "", ...props }) => <div className={`p-3 border-b last:border-b-0 bg-white ${className}`} {...props}>{children}</div>;

export const Accordion = ({ defaultActiveKey, activeKey, children, className = "" }) => (
  <div className={`space-y-2 ${className}`}>{children}</div>
);
Accordion.Item = ({ eventKey, children }) => <div className="border rounded-xl overflow-hidden">{children}</div>;
Accordion.Header = ({ children, onClick }) => (
  <button type="button" onClick={onClick} className="w-full text-left px-4 py-3 bg-gray-50 font-medium hover:bg-gray-100 transition-colors flex justify-between items-center">
    {children}
  </button>
);
Accordion.Body = ({ children }) => <div className="p-4 bg-white border-t">{children}</div>;

export const Table = ({ children, striped, bordered, hover, className = "" }) => (
  <div className="overflow-x-auto"><table className={`w-full text-sm text-left ${className}`}>{children}</table></div>
);

export const OverlayTrigger = ({ overlay, children }) => (
  <div className="relative group inline-block">
    {children}
    {/* Simple tooltip shim */}
     <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded z-50 whitespace-nowrap">
       {overlay.props && overlay.props.children}
     </div>
  </div>
);

export const Tooltip = ({ children, id }) => <span id={id}>{children}</span>;
