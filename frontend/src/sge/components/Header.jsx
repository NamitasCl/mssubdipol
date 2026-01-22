import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

const Header = ({ onMenuClick }) => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
                <button 
                    onClick={onMenuClick}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
                >
                    <Menu size={24} />
                </button>
                {/* Placeholder for Breadcrumbs or Title could go here */}
                <h2 className="ml-4 text-lg font-semibold text-gray-800 hidden sm:block">Panel de Control</h2>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-gray-900">Usuario Admin</p>
                        <p className="text-xs text-gray-500">Administrador</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 border border-primary-200">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
