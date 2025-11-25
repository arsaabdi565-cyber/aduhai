
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, UserCircleIcon } from './icons/Icons';

const SideNav: React.FC = () => {
    const navItems = [
        { path: '/', label: 'Beranda', icon: HomeIcon },
        { path: '/reports', label: 'Laporan', icon: ChartBarIcon },
        { path: '/profile', label: 'Profil', icon: UserCircleIcon },
    ];

    const activeLink = "bg-green-800 text-white";
    const inactiveLink = "text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <aside className="hidden md:flex flex-col w-64 bg-gray-800 flex-shrink-0">
            <div className="flex items-center justify-center h-20 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-green-400">Bakul Tani</h1>
            </div>
            <nav className="flex-grow p-4">
                {navItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end
                        className={({ isActive }) => 
                            `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 text-lg ${isActive ? activeLink : inactiveLink}`
                        }
                    >
                        <Icon className="w-6 h-6 mr-4" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default SideNav;
