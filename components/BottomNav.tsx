
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, UserCircleIcon } from './icons/Icons';

const BottomNav: React.FC = () => {
    const navItems = [
        { path: '/', label: 'Beranda', icon: HomeIcon },
        { path: '/reports', label: 'Laporan', icon: ChartBarIcon },
        { path: '/profile', label: 'Profil', icon: UserCircleIcon },
    ];

    const activeLink = "text-green-600 dark:text-green-400";
    const inactiveLink = "text-gray-400 hover:text-gray-900 dark:hover:text-white";

    return (
        <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-green-700/50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-50 md:hidden transition-colors duration-300">
            <div className="flex justify-around h-16 items-center">
                {navItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end
                        className={({ isActive }) => 
                            `flex flex-col items-center justify-center w-full h-full text-xs transition-colors duration-200 ${isActive ? activeLink : inactiveLink}`
                        }
                    >
                        <Icon className="w-6 h-6 mb-1" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;