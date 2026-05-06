import { motion } from 'motion/react';
import { ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Hero() {
  return (
    <section id="home" className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-6 overflow-hidden">
      <Helmet>
        <title>柏C的空间站</title>
        <meta name="description" content="Creative Developer — 个人博客，分享技术、设计和思考。" />
        <meta property="og:title" content="柏C的空间站" />
        <meta property="og:description" content="Creative Developer — 个人博客，分享技术、设计和思考。" />
      </Helmet>
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative"
        >
          {/* Decorative Onomatopoeia */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-20 -left-10 text-comic-red onomatopoeia text-6xl rotate-[-15deg] select-none"
          >
            BOOM!
          </motion.div>

          <div className="relative inline-block mb-10">
            <h1 className="text-7xl md:text-9xl font-comic leading-[0.9] uppercase">
              Creative<br />
              <span className="bg-comic-red text-white sketched-border px-4 rotate-2 inline-block">Developer</span>
            </h1>
          </div>
          
          <div className="bg-white sketched-border p-6 shadow-comic mb-10 rotate-[-1deg]">
            <p className="text-2xl font-black leading-tight">
              你好，我是<span className="text-comic-red underline decoration-4">柏C</span>，一个喜欢<span className="text-comic-yellow underline decoration-4">摄影</span>、正在学习<span className="text-comic-yellow underline decoration-4">AI</span>的<span className="text-comic-blue underline decoration-4">医药行业打工人</span>。
            </p>
          </div>
          
          <div className="flex flex-wrap gap-6">
              <button onClick={() => window.location.href = '/articles'} className="comic-button">
                探索更多 <ArrowRight className="inline ml-2" />
              </button>
              <button onClick={() => window.location.href = '/about'} className="comic-button bg-white text-black">
              我的档案
            </button>
          </div>
        </motion.div>

          <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative flex justify-center items-center"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 onomatopoeia text-comic-blue text-4xl rotate-12 z-20">
            ZAP!
          </div>

          <div className="relative group cursor-pointer w-full max-w-[400px] md:max-w-[450px]">
            <div className="absolute inset-0 bg-black rotate-3 transition-transform group-hover:rotate-6 sm:rounded-2xl" />
            <div className="absolute inset-0 bg-comic-yellow sketched-border -rotate-3 transition-transform group-hover:-rotate-6" />
            
            <div className="comic-panel relative">
              <div className="h-full bg-white flex flex-col relative overflow-hidden">
                {/* Comic Header */}
                <div className="bg-black text-white px-4 py-1 font-comic text-xl uppercase italic">
                   Issue #001: The BEGINNING
                </div>
                
                {/* Main Visual */}
                <div className="flex-grow flex items-center justify-center relative overflow-hidden aspect-square">
                   <div className="absolute inset-0 halftone-bg opacity-20 text-comic-red" />
                   
                   <div className="relative z-10 w-full h-full p-4 md:p-6">
                     <div className="w-full h-full sketched-border bg-white flex items-center justify-center rotate-1 hover:rotate-0 transition-transform overflow-hidden">
                       <img src="/avatar.jpg" alt="Avatar" className="w-full h-full object-contain" />
                     </div>
                   </div>
                </div>

                {/* Caption Panel */}
                <div className="bg-comic-red text-white p-4 border-t-4 border-black">
                  <p className="font-marker text-lg">"Stay hungry,stay foolish."</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
