import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Toolbox from './components/Toolbox';
import ArticlesView from './components/ArticlesView';
import DigitalGarden from './components/DigitalGarden';
import Login from './components/Admin/Login';
import Dashboard from './components/Admin/Dashboard';
import { motion, AnimatePresence } from 'motion/react';
import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { Newspaper, FileText } from 'lucide-react';

export const NavbarContext = createContext({
  isNavbarHidden: false,
  setNavbarHidden: (hidden: boolean) => {},
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-3xl font-black mb-2">柏C的博客</h2>
          <p className="text-gray-400 font-bold">Built with Neobrutalism, React & Passion.</p>
        </div>
      </div>
      
      <div className="mt-12 overflow-hidden whitespace-nowrap border-t border-white/20 pt-8">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 text-4xl font-black uppercase opacity-20"
        >
          <span>Stay Hungry</span>
          <span>STAY UNKNOWLEDGEABLE</span>
          <span>STAY CURIOUS</span>
          <span>Build the Future</span>
          <span>Stay Hungry</span>
          <span>STAY UNKNOWLEDGEABLE</span>
          <span>STAY CURIOUS</span>
          <span>Build the Future</span>
          <span>Stay Hungry</span>
          <span>STAY UNKNOWLEDGEABLE</span>
          <span>STAY CURIOUS</span>
          <span>Build the Future</span>
        </motion.div>
      </div>
    </footer>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Hero />} />
          <Route path="/about" element={<About />} />
          <Route path="/toolbox" element={<Toolbox />} />
          <Route path="/news" element={<ArticlesView category="资讯" titleEn="INDUSTRYNEWS" titleZh="行业资讯" subtitle="前沿动态、行业趋势" icon={Newspaper} />} />
          <Route path="/policies" element={<ArticlesView category="政策" titleEn="PUBLICPOLICY" titleZh="政策解读" subtitle="政策法规、权威解读" icon={FileText} />} />
          <Route path="/garden" element={<DigitalGarden />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function MainLayout() {
  const [isNavbarHidden, setNavbarHidden] = useState(false);

  return (
    <NavbarContext.Provider value={{ isNavbarHidden, setNavbarHidden }}>
      <ScrollToTop />
      <div className="relative selection:bg-comic-red selection:text-white min-h-screen flex flex-col paper-texture">
        {/* Gritty Paper Overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-10 paper-texture" />
        
        <Navbar isHidden={isNavbarHidden} />
        <main className="flex-grow relative z-10">
          <AnimatedRoutes />
        </main>
        <Footer />
        
        {/* Halftone Dot patterns */}
        <div className="fixed inset-0 pointer-events-none -z-10 opacity-5 halftone-bg text-black" />
      </div>
    </NavbarContext.Provider>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}
