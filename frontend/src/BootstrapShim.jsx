import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, MoreHorizontal, AlertCircle, CheckCircle, Info } from 'lucide-react';

// ==========================================
// UTILS & TOKENS
// ==========================================
const SHADOW_SM = "shadow-sm hover:shadow-md transition-shadow duration-200";
const SHADOW_MD = "shadow-md hover:shadow-lg transition-shadow duration-200";
const ROUNDED = "rounded-xl"; // More modern than rounded-lg
const INPUT_BASE = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200";

// ==========================================
// LAYOUT
// ==========================================
export const Container = ({ fluid, className, children, ...props }) => (
  <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${fluid ? 'w-full' : 'max-w-7xl'} ${className || ''}`} {...props}>
    {children}
  </div>
);

export const Row = ({ className, children, ...props }) => (
  <div className={`flex flex-wrap -mx-3 ${className || ''}`} {...props}>
    {children}
  </div>
);

export const Col = ({ md, xs, sm, lg, xl, xxl, className, children, ...props }) => {
    const getWidthClass = (size, prefix = '') => {
        if (!size) return '';
        const map = {
            12: 'w-full',
            6: 'w-1/2',
            4: 'w-1/3',
            3: 'w-1/4',
            8: 'w-2/3',
            9: 'w-3/4',
            2: 'w-1/6',
            1: 'w-1/12'
        };
        // fallback to full if no match, though bootstrap supports all 1-12
        const width = map[size] || 'w-full'; 
        return prefix ? `${prefix}:${width}` : width;
    };

    const classes = [
        className,
        xs ? getWidthClass(xs) : (className?.includes('col-') ? '' : 'w-full'), // Default to w-full if no xs/col class
        getWidthClass(sm, 'sm'),
        getWidthClass(md, 'md'),
        getWidthClass(lg, 'lg'),
        getWidthClass(xl, 'xl'),
        getWidthClass(xxl, '2xl'),
    ].filter(Boolean).join(' ');

  return (
    <div className={`px-3 ${classes}`} {...props}>
      {children}
    </div>
  );
};

export const Stack = ({ direction = 'vertical', gap = 0, className, children, ...props }) => (
  <div 
    className={`flex ${direction === 'horizontal' ? 'flex-row items-center' : 'flex-col'} ${className || ''}`} 
    style={{ gap: `${gap * 0.25}rem` }}
    {...props}
  >
    {children}
  </div>
);

// ==========================================
// COMPONENTS
// ==========================================

export const Button = ({ variant = 'primary', className, children, size, ...props }) => {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-5 py-2.5 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-xl'
  }[size || 'md'];

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30 hover:shadow-blue-500/40 shadow-lg border-transparent",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm",
    success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30 shadow-lg",
    danger: "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-rose-500/30 shadow-lg",
    warning: "bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-amber-500/30 shadow-lg",
    info: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 shadow-cyan-500/30 shadow-lg",
    light: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent",
    dark: "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-500/30 shadow-lg",
    link: "text-blue-600 hover:text-blue-800 hover:underline bg-transparent px-0 shadow-none ring-0",
    "outline-primary": "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    "outline-secondary": "border-2 border-gray-400 text-gray-600 hover:bg-gray-50",
    "outline-danger": "border-2 border-rose-500 text-rose-600 hover:bg-rose-50",
  };
  
  return (
    <button className={`${base} ${sizeClasses} ${variants[variant] || variants.primary} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

export const ButtonGroup = ({ className, children, ...props }) => (
  <div className={`inline-flex rounded-xl shadow-sm ${className || ''}`} role="group" {...props}>{children}</div>
);

export const Card = ({ className, children, bg, text, border, ...props }) => (
  <div className={`bg-white ${ROUNDED} border border-gray-100 ${SHADOW_SM} overflow-hidden ${className || ''} ${bg ? `bg-${bg}` : ''} ${text ? `text-${text}` : ''}`} {...props}>
    {children}
  </div>
);
Card.Body = ({ className, children, ...props }) => <div className={`p-6 ${className || ''}`} {...props}>{children}</div>;
Card.Title = ({ className, children, ...props }) => <h3 className={`text-lg font-bold text-gray-900 mb-2 leading-tight ${className || ''}`} {...props}>{children}</h3>;
Card.Subtitle = ({ className, children, ...props }) => <h6 className={`text-sm font-medium text-gray-500 mb-3 ${className || ''}`} {...props}>{children}</h6>;
Card.Text = ({ className, children, ...props }) => <div className={`text-gray-600 text-sm leading-relaxed ${className || ''}`} {...props}>{children}</div>;
Card.Header = ({ className, children, ...props }) => <div className={`px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-700 uppercase tracking-wider ${className || ''}`} {...props}>{children}</div>;
Card.Footer = ({ className, children, ...props }) => <div className={`px-6 py-4 bg-gray-50/30 border-t border-gray-100 text-sm text-gray-500 ${className || ''}`} {...props}>{children}</div>;
Card.Img = ({ variant, className, ...props }) => <img className={`w-full object-cover ${className || ''}`} {...props} />;

export const Alert = ({ variant = 'primary', className, children, onClose, dismissible, ...props }) => {
  const variants = {
    primary: 'bg-blue-50 border-blue-100 text-blue-800',
    secondary: 'bg-gray-50 border-gray-200 text-gray-800',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    danger: 'bg-rose-50 border-rose-100 text-rose-800',
    warning: 'bg-amber-50 border-amber-100 text-amber-800',
    info: 'bg-cyan-50 border-cyan-100 text-cyan-800',
  };
  
  return (
    <div className={`p-4 rounded-xl border flex gap-3 ${variants[variant] || variants.primary} ${className || ''}`} role="alert" {...props}>
      <Info size={20} className="shrink-0 mt-0.5 opacity-70"/>
      <div className="flex-1 text-sm font-medium">{children}</div>
      {dismissible && onClose && (
        <button onClick={onClose} className="shrink-0 text-current opacity-40 hover:opacity-100 transition-opacity">
            <X size={18} />
        </button>
      )}
    </div>
  );
};

export const Badge = ({ bg, className, children, pill, ...props }) => {
  const bgClasses = {
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-rose-100 text-rose-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-cyan-100 text-cyan-700',
    dark: 'bg-slate-800 text-slate-100'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold ${pill ? 'rounded-full' : 'rounded-md'} ${bgClasses[bg] || bgClasses.primary} ${className || ''}`} {...props}>
      {children}
    </span>
  );
};

// ==========================================
// FORMS
// ==========================================

export const Form = ({ className, children, ...props }) => (
  <form className={`${className || ''}`} {...props}>{children}</form>
);
Form.Group = ({ className, children, controlId, ...props }) => <div className={`mb-5 space-y-1.5 ${className || ''}`} {...props}>{children}</div>;
Form.Label = ({ className, children, ...props }) => <label className={`block text-sm font-medium text-gray-700 ml-1 ${className || ''}`} {...props}>{children}</label>;
Form.Control = ({ type = 'text', className, isValid, isInvalid, as: Component = 'input', ...props }) => {
    let borderClass = "";
    if (isValid) borderClass = "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20";
    if (isInvalid) borderClass = "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20";

    return (
      <Component 
        type={Component === 'input' ? type : undefined} 
        className={`${INPUT_BASE} ${borderClass} ${className || ''}`} 
        {...props} 
      />
    );
};
Form.Select = ({ className, children, ...props }) => (
  <div className="relative">
      <select className={`${INPUT_BASE} appearance-none pr-10 ${className || ''}`} {...props}>
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
  </div>
);
Form.Check = ({ type = 'checkbox', label, className, id, ...props }) => (
  <div className={`flex items-start gap-3 py-1 ${className || ''}`}>
    <div className="flex h-6 items-center">
        <input 
            type={type} 
            id={id} 
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
            {...props} 
        />
    </div>
    <div className="text-sm leading-6">
        {label && <label htmlFor={id} className="font-medium text-gray-700 select-none">{label}</label>}
    </div>
  </div>
);
Form.Text = ({ className, children, muted, ...props }) => <p className={`text-xs text-gray-500 mt-1 ml-1 ${className || ''}`} {...props}>{children}</p>;

export const InputGroup = ({ className, children, ...props }) => (
  <div className={`flex rounded-lg shadow-sm ${className || ''}`} {...props}>{children}</div>
);
InputGroup.Text = ({ className, children, ...props }) => (
  <span className={`inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm ${className || ''}`} {...props}>{children}</span>
);

// ==========================================
// NAVIGATION
// ==========================================

export const Navbar = ({ bg, variant, expand, className, children, fixed, ...props }) => (
  <nav className={`bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 py-3 ${className || ''}`} {...props}>
    {children}
  </nav>
);
Navbar.Brand = ({ className, children, ...props }) => <span className={`text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent mr-8 ${className || ''}`} {...props}>{children}</span>;
Navbar.Toggle = ({ children, ...props }) => <button className="md:hidden text-gray-500" {...props}>{children || <MoreHorizontal />}</button>;
Navbar.Collapse = ({ className, children, ...props }) => <div className={`hidden md:flex items-center w-full justify-between ${className || ''}`} {...props}>{children}</div>;

export const Nav = ({ className, children, ...props }) => (
  <ul className={`flex gap-1 ${className || ''}`} {...props}>{children}</ul>
);
Nav.Link = ({ className, children, as: Component = 'a', active, ...props }) => {
    const activeClass = active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
    const base = "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer decoration-0";

  if (Component !== 'a') {
    return <Component className={`${base} ${activeClass} ${className || ''}`} {...props}>{children}</Component>;
  }
  return <a className={`${base} ${activeClass} ${className || ''}`} {...props}>{children}</a>;
};
Nav.Item = ({ className, children, ...props }) => <li className={`${className || ''}`} {...props}>{children}</li>;

// ==========================================
// OVERLAYS
// ==========================================

export const Modal = ({ show, onHide, size, centered, className, children, ...props }) => {
  if (!show) return null;
  const sizeClass = size === 'lg' ? 'max-w-4xl' : size === 'sm' ? 'max-w-sm' : size === 'xl' ? 'max-w-6xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onHide} />
      {/* Content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClass} flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 ${className || ''}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
Modal.Header = ({ closeButton, onHide, className, children, ...props }) => (
  <div className={`px-6 py-5 border-b border-gray-100 flex justify-between items-center ${className || ''}`} {...props}>
    {children}
    {closeButton && <button onClick={onHide} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"><X size={20} /></button>}
  </div>
);
Modal.Title = ({ className, children, ...props }) => <h3 className={`text-xl font-bold text-gray-900 ${className || ''}`} {...props}>{children}</h3>;
Modal.Body = ({ className, children, ...props }) => <div className={`p-6 overflow-y-auto ${className || ''}`} {...props}>{children}</div>;
Modal.Footer = ({ className, children, ...props }) => <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3 ${className || ''}`} {...props}>{children}</div>;

export const Offcanvas = ({ show, onHide, placement = 'start', className, children, ...props }) => {
  if (!show) return null;
  const placementClasses = {
    start: 'left-0 top-0 h-full border-r',
    end: 'right-0 top-0 h-full border-l',
    top: 'top-0 left-0 w-full border-b',
    bottom: 'bottom-0 left-0 w-full border-t',
  };
  return (
    <div className="relative z-[60]">
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onHide} />
      <div className={`fixed bg-white shadow-2xl ${placementClasses[placement]} ${className || ''}`} 
           style={{ width: placement === 'start' || placement === 'end' ? '24rem' : '100%' }} {...props}>
        {children}
      </div>
    </div>
  );
};
Offcanvas.Header = Modal.Header;
Offcanvas.Title = Modal.Title;
Offcanvas.Body = ({ className, children, ...props }) => <div className={`p-6 overflow-y-auto h-full ${className || ''}`} {...props}>{children}</div>;

// ==========================================
// DATA DISPLAY
// ==========================================

export const Table = ({ striped, bordered, hover, responsive, className, children, ...props }) => (
  <div className={`overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white ${responsive ? "overflow-x-auto" : ""} ${className || ''}`}>
    <table className="w-full text-left text-sm text-gray-600">
      {children}
    </table>
  </div>
);

export const ListGroup = ({ className, children, ...props }) => <ul className={`bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm overflow-hidden ${className || ''}`} {...props}>{children}</ul>;
ListGroup.Item = ({ className, children, action, active, ...props }) => (
    <li className={`px-5 py-3 text-sm ${action ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''} ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'} ${className || ''}`} {...props}>{children}</li>
);

export const ProgressBar = ({ now = 0, label, variant, striped, animated, className, ...props }) => (
  <div className={`w-full bg-gray-100 rounded-full h-3 overflow-hidden ${className || ''}`} {...props}>
    <div 
      className={`bg-blue-600 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center text-[10px] font-bold text-white ${animated ? 'animate-[shimmer_2s_linear_infinite] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]' : ''}`} 
      style={{ width: `${now}%` }}
    >
      {label}
    </div>
  </div>
);

// ==========================================
// MISC
// ==========================================

export const Spinner = ({ animation, size, variant, className, ...props }) => (
    <div className={`inline-block animate-spin rounded-full border-[3px] border-current border-t-transparent ${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} opacity-75 ${className || ''}`} role="status" {...props}>
        <span className="sr-only">Loading...</span>
    </div>
);

export const Image = ({ fluid, rounded, roundedCircle, thumbnail, className, ...props }) => (
  <img 
    className={`
      ${fluid ? 'max-w-full h-auto' : ''} 
      ${rounded ? 'rounded-xl' : ''} 
      ${roundedCircle ? 'rounded-full' : ''} 
      ${thumbnail ? 'p-1 bg-white border border-gray-200 rounded-lg shadow-sm' : ''}
      ${className || ''}
    `} 
    {...props} 
  />
);

export const Pagination = ({ className, children, ...props }) => (
  <nav className={`flex justify-center ${className || ''}`} {...props}>
    <ul className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200">{children}</ul>
  </nav>
);
const PageBtn = ({ children, active, disabled, className, ...props }) => (
    <li>
        <button 
            className={`px-3 py-1.5 min-w-[36px] text-sm font-medium rounded-lg transition-colors ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    </li>
);
Pagination.First = (props) => <PageBtn {...props}>«</PageBtn>;
Pagination.Prev = (props) => <PageBtn {...props}>‹</PageBtn>;
Pagination.Next = (props) => <PageBtn {...props}>›</PageBtn>;
Pagination.Last = (props) => <PageBtn {...props}>»</PageBtn>;
Pagination.Item = PageBtn;
Pagination.Ellipsis = () => <li><span className="px-2 text-gray-400">…</span></li>;

export const Dropdown = ({ className, children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`relative inline-block ${className || ''}`} {...props}>
      {React.Children.map(children, child => {
        if (child?.type === Dropdown.Toggle) {
          return React.cloneElement(child, { onClick: () => setIsOpen(!isOpen) });
        }
        if (child?.type === Dropdown.Menu) {
          return isOpen ? React.cloneElement(child, { onClose: () => setIsOpen(false) }) : null;
        }
        return child;
      })}
    </div>
  );
};
Dropdown.Toggle = ({ className, children, variant, ...props }) => (
  <Button variant={variant} className={`gap-2 ${className || ''}`} {...props}>{children} <ChevronDown size={16}/></Button>
);
Dropdown.Menu = ({ className, children, onClose, ...props }) => (
  <div className={`absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 min-w-[200px] py-1 animate-in fade-in slide-in-from-top-2 duration-200 ${className || ''}`} {...props}>
    {children}
  </div>
);
Dropdown.Item = ({ className, children, ...props }) => (
  <button className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors ${className || ''}`} {...props}>{children}</button>
);
Dropdown.Divider = () => <hr className="my-1 border-gray-100" />;

// Helpers (empty/basic for now)
export const Tooltip = ({ children, ...props }) => <span {...props}>{children}</span>;
export const OverlayTrigger = ({ overlay, children }) => <>{children}</>; 
export const CloseButton = ({ className, ...props }) => <button className={`text-gray-400 hover:text-gray-600 ${className || ''}`} {...props}><X size={20}/></button>;
export const Accordion = ({ className, children }) => <div className={`space-y-2 ${className || ''}`}>{children}</div>;
Accordion.Item = ({ className, children }) => <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white ${className || ''}`}>{children}</div>;
Accordion.Header = ({ className, children, onClick }) => (
    <button onClick={onClick} className={`w-full flex justify-between items-center px-5 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 transition-colors ${className || ''}`}>
        {children} <ChevronDown size={18} className="text-gray-400"/>
    </button>
);
Accordion.Body = ({ className, children }) => <div className={`px-5 py-4 border-t border-gray-100 text-gray-600 text-sm ${className || ''}`}>{children}</div>;

export const Tabs = ({ activeKey, defaultActiveKey, onSelect, className, children }) => {
    const [active, setActive] = useState(activeKey || defaultActiveKey);
    return (
        <div className={className}>
            <div className="flex border-b border-gray-200 gap-6">
                {React.Children.map(children, child => {
                    if (!child) return null;
                    const isActive = active === child.props.eventKey;
                    return (
                        <button 
                            className={`pb-3 pt-1 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            onClick={() => { setActive(child.props.eventKey); onSelect?.(child.props.eventKey); }}
                        >
                            {child.props.title}
                        </button>
                    )
                })}
            </div>
            <div className="py-6">
                 {React.Children.map(children, child => {
                    if (!child) return null;
                     if (active === child.props.eventKey) return child.props.children;
                     return null;
                 })}
            </div>
        </div>
    )
}
export const Tab = () => null;
export const Toast = ({children, className}) => <div className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>{children}</div>;
export const ToastContainer = ({children, className}) => <div className={`fixed bottom-4 right-4 z-50 flex flex-col gap-2 ${className}`}>{children}</div>;
Toast.Header = ({children}) => <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-sm font-medium">{children}</div>;
Toast.Body = ({children}) => <div className="p-4 text-sm text-gray-600">{children}</div>;


export default {
  Container, Row, Col, Stack,
  Button, ButtonGroup, Image, Card, Alert, Badge, Spinner, ProgressBar,
  Form, InputGroup,
  Navbar, Nav, Dropdown, Tabs, Tab,
  Modal, Offcanvas, Toast, ToastContainer, Tooltip, OverlayTrigger, CloseButton, Accordion,
  Table, ListGroup, Pagination
};
