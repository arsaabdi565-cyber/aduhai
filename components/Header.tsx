
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from './icons/Icons';

interface HeaderProps {
    title: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
    const navigate = useNavigate();

    return (
        <header className="p-4 flex items-center justify-between sticky top-0 bg-green-900/80 backdrop-blur-sm z-10">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-white absolute left-1/2 -translate-x-1/2">{title}</h1>
            <div>{children}</div>
        </header>
    );
};

export default Header;
