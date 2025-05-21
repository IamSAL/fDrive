import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { PlusCircle, Settings, Menu, X, ListTree, Radio } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const { baseUrl, setBaseUrl } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { to: '/', label: 'Mock List', icon: <ListTree className="w-4 h-4 mr-2" /> },
    { to: '/create', label: 'Create New', icon: <PlusCircle className="w-4 h-4 mr-2" /> },
    { to: '/live', label: 'Live Mock', icon: <Radio className="w-4 h-4 mr-2" />, highlight: true },
    { to: '/settings', label: '', icon: <Settings className="w-4 h-4 mr-2" /> },
    
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
      <div className="w-screen mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 w-full">
          <Link to={"/"}><div className="flex-shrink-0 mt-4 flex items-center">
            {/* <Server className="h-8 w-8 text-blue-600" /> */}
             🎭 
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Mocker</span>
          </div>
          </Link>

          <div className="flex">
           
            {/* Desktop navigation */}
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${link.highlight
                      ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                      : isActive(link.to)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
            {/* <div className="w-64">
              <div
                onMouseEnter={() => setIsInputHovered(true)}
                onMouseLeave={() => setIsInputHovered(false)}
              >
                <Input
                  placeholder="Base URL"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className={`text-sm transition-all`}
                  leftIcon={<Server className="h-4 w-4 text-gray-400" />}
                />
              </div>
            </div> */}
            <div className="ml-4 flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          
       
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 text-base font-medium ${
                  isActive(link.to)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  {link.icon}
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};