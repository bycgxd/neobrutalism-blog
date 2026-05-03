import { motion, AnimatePresence } from 'motion/react';
import { Home, User, Briefcase, Gamepad2, Sprout, Mail, Cat, Newspaper } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: '首页', icon: Home, color: 'bg-neo-pink' },
  { path: '/toolbox', label: '工具箱', icon: Briefcase, color: 'bg-neo-blue' },
  { path: '/minigames', label: '行业资讯', icon: Newspaper, color: 'bg-neo-green' },
  { path: '/garden', label: '数字花园', icon: Sprout, color: 'bg-neo-orange' },
  { path: '/about', label: '关于我', icon: User, color: 'bg-neo-yellow' },
];

export default function Navbar({ isHidden = false }: { isHidden?: boolean }) {
  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-white sketched-border flex items-center gap-2 md:gap-4 overflow-x-auto max-w-[95vw] shadow-comic no-scrollbar"
        >
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-10 h-10 bg-comic-red flex items-center justify-center shrink-0 border-4 border-black rotate-[-3deg] hover:rotate-0 transition-transform">
            <Cat className="text-white w-6 h-6" />
          </button>
          
          <div className="h-8 w-[4px] bg-black shrink-0" />
          
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-4 py-2 font-black text-sm uppercase transition-all whitespace-nowrap border-4 border-transparent hover:border-black hover:bg-comic-yellow hover:scale-105",
                  isActive ? "border-black bg-comic-blue text-white rotate-1" : ""
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-black")} />
                    <span className="hidden md:inline">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="h-8 w-[4px] bg-black shrink-0" />

          <button onClick={() => window.location.href = 'mailto:bycgxd@gmail.com'} className="p-2 bg-comic-red text-white border-4 border-black shadow-comic-sm transition-transform active:scale-95 rotate-3 hover:rotate-0">
            <Mail className="w-5 h-5" />
          </button>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
