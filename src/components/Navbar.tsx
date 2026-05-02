'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-white font-bold text-lg group-hover:text-purple-300 transition-colors">
              Mentor24h
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
              Recursos
            </a>
            <a href="#sobre" className="text-gray-400 hover:text-white transition-colors text-sm">
              Sobre
            </a>
            <a href="#precos" className="text-gray-400 hover:text-white transition-colors text-sm">
              Preços
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/auth/login'
                  ? 'text-purple-400 border border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
