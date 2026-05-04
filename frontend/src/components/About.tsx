import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Briefcase, GraduationCap, Baby, Rocket, Award, FlaskConical, Sparkles, Star, Zap, Lock, KeyRound } from 'lucide-react';

const timelineEvents = [
  {
    year: '2002-04',
    title: '起源',
    description: '故事的开始。',
    icon: Baby,
    color: 'bg-comic-red',
    align: 'left'
  },
  {
    year: '2020-09',
    title: '初入药大',
    description: '进入中国药科大学，开始药物化学专业的学习之旅。同时担任校友工作志愿者协会主席，负责校友会与基金会校内工作。',
    icon: GraduationCap,
    color: 'bg-comic-blue',
    align: 'right'
  },
  {
    year: '2024-02',
    title: '科研实验',
    description: '进行抗癌化合物（选择性醛酮还原酶AKR1C3抑制剂）的设计与合成。在实验室进行有机合成、细菌培养、蛋白提取等操作。',
    icon: FlaskConical,
    color: 'bg-zaun-purple',
    align: 'left'
  },
  {
    year: '2024-06 至 2025-12',
    title: '职场启航：商务实战与渠道管理',
    description: '本科毕业加入江西济民可信医药集团。统筹安徽省20+核心商业，主导年度商业协议谈判并监管产品流向。负责账款跟进，实现回款率稳定超95%。',
    icon: Award,
    color: 'bg-comic-yellow',
    align: 'right'
  },
  {
    year: '2026-05',
    title: 'AI赋能与未来',
    description: '持续学习前沿AI工具，擅长将自动化融入日常业务，大幅提升数据分析能力与渠道运营效率。',
    icon: Rocket,
    color: 'bg-zaun-green',
    align: 'left'
  }
];

export default function About() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '王旭东') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <section id="about" className="min-h-screen pt-40 pb-24 px-6 bg-paper border-y-8 border-black relative overflow-hidden flex items-center justify-center">
        {/* Decorative elements for auth screen */}
        <div className="absolute top-20 right-10 opacity-30 rotate-12 select-none z-0">
          <Lock className="w-32 h-32 text-comic-red" />
        </div>
        <div className="absolute bottom-20 left-10 opacity-20 -rotate-12 select-none z-0">
          <KeyRound className="w-48 h-48 text-comic-blue" />
        </div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          className="comic-panel bg-white p-8 md:p-12 max-w-lg w-full relative z-10 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="text-center mb-8 border-b-4 border-black pb-6">
            <div className="inline-block p-4 bg-comic-yellow border-4 border-black rotate-3 mb-4">
              <Lock className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-4xl font-comic italic uppercase">
              访问<span className="text-comic-red">受限</span>
            </h2>
            <p className="mt-4 font-bold text-gray-600 text-lg">
              此区域包含敏感的个人档案信息。
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block font-black text-xl mb-2 uppercase">请输入通行口令</label>
              <input 
                type="text" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="提示：我的真实姓名..."
                className={cn(
                  "w-full border-4 p-4 font-black text-xl focus:outline-none transition-all shadow-inner",
                  error ? "border-comic-red bg-comic-red/10 focus:ring-4 focus:ring-comic-red" : "border-black focus:ring-4 focus:ring-comic-blue"
                )}
              />
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-comic-red font-bold mt-2 flex items-center gap-2"
                  >
                    <span className="inline-block w-2 h-2 bg-comic-red rounded-full animate-pulse" /> 
                    口令错误，请重试
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              type="submit" 
              className="comic-button w-full bg-black text-white text-xl py-4 flex items-center justify-center gap-3"
            >
              解锁档案 <KeyRound className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="about" className="pt-40 pb-24 px-6 bg-paper border-y-8 border-black relative overflow-hidden">
      {/* Decorative Onomatopoeia */}
      <div className="absolute top-20 right-10 onomatopoeia text-comic-blue text-5xl rotate-12 opacity-50 select-none z-0">
        TIME!
      </div>
      <div className="absolute bottom-40 left-10 onomatopoeia text-comic-yellow text-6xl -rotate-12 opacity-50 select-none z-0">
        WOOSH!
      </div>
      
        {/* Additional Decorative Elements */}
        <div className="absolute top-1/4 left-10 opacity-30 rotate-45 select-none z-0 hidden md:block">
          <Sparkles className="w-16 h-16 text-comic-red" />
        </div>
      <div className="absolute top-1/2 right-20 opacity-20 -rotate-12 select-none z-0">
        <Star className="w-24 h-24 text-comic-blue" fill="currentColor" />
      </div>
      <div className="absolute bottom-1/4 right-10 onomatopoeia text-zaun-green text-4xl rotate-12 opacity-40 select-none z-0">
        LEVEL UP!
      </div>
      <div className="absolute top-3/4 left-20 opacity-30 rotate-[30deg] select-none z-0">
        <Zap className="w-20 h-20 text-comic-yellow" fill="currentColor" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Floating Avatar (Top Left) */}
        <div className="hidden md:block absolute top-0 left-0 z-30">
          <motion.div
            initial={{ y: -50, opacity: 0, rotate: -15 }}
            animate={{ y: 0, opacity: 1, rotate: -15 }}
            transition={{ type: "spring", bounce: 0.5 }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
              transition: { type: "spring", stiffness: 300 }
            }}
            className="relative cursor-pointer group"
          >
            <div className="absolute inset-0 bg-comic-red translate-x-2 translate-y-2 border-4 border-black" />
            <div className="w-32 h-32 border-4 border-black bg-white relative z-10 overflow-hidden">
              <img src="/avatar.jpg" alt="Avatar" className="w-full h-full object-contain p-1" />
            </div>
            {/* Interactive speech bubble on hover */}
            <div className="absolute -right-28 -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-white border-4 border-black px-3 py-2 font-comic text-sm font-black whitespace-nowrap rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                你好！ 👋
              </div>
              {/* Bubble tail */}
              <div className="absolute bottom-[-8px] left-4 w-4 h-4 bg-white border-r-4 border-b-4 border-black rotate-45" />
            </div>
          </motion.div>
        </div>

        {/* Top Centered Quote */}
        <div className="text-center mb-16 relative z-10 pt-8 md:pt-0">
           <motion.div
             initial={{ y: -20, opacity: 0 }}
             whileInView={{ y: 0, opacity: 1 }}
             viewport={{ once: true }}
             className="inline-block bg-black text-white px-6 py-2 font-comic text-2xl uppercase italic rotate-[-1deg] shadow-comic"
           >
              "柏C的进化之路"
           </motion.div>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto pt-8">
          {/* Central Line - starts from the first node */}
          <div className="absolute left-1/2 top-12 bottom-0 w-2 bg-black -translate-x-1/2 hidden md:block" />
          
          <div className="space-y-16 md:space-y-24">
            {timelineEvents.map((event, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1, type: "spring" }}
                className={cn(
                  "relative flex flex-col md:flex-row items-center",
                  event.align === 'left' ? "md:flex-row-reverse" : ""
                )}
              >
                {/* Content Panel */}
                <div className="w-full md:w-[45%] flex justify-center z-10">
                  <div className={cn(
                    "comic-panel bg-white p-6 w-full relative group hover:scale-[1.02] transition-transform",
                    idx % 2 === 0 ? "rotate-1 hover:rotate-0" : "-rotate-1 hover:rotate-0"
                  )}>
                    <div className={cn("absolute -top-4 -right-4 w-12 h-12 border-4 border-black flex items-center justify-center shadow-comic-sm z-20 rotate-12", event.color)}>
                      <event.icon className={cn("w-6 h-6", event.color === 'bg-comic-yellow' || event.color === 'bg-zaun-green' ? 'text-black' : 'text-white')} />
                    </div>
                    
                    <div className="border-b-4 border-black pb-3 mb-4">
                      <span className={cn("inline-block px-3 py-1 font-black text-sm uppercase border-2 border-black mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", event.color, event.color === 'bg-comic-yellow' || event.color === 'bg-zaun-green' ? 'text-black' : 'text-white')}>
                        {event.year}
                      </span>
                      <h3 className="text-2xl font-comic uppercase italic leading-tight">{event.title}</h3>
                    </div>
                    <p className="text-lg font-bold leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Center Node (Desktop only) */}
                <div className="hidden md:flex w-[10%] justify-center relative z-20">
                  <div className={cn(
                    "w-8 h-8 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    event.color
                  )} />
                </div>

                {/* Empty Space for layout (Desktop only) */}
                <div className="hidden md:block w-[45%]" />
                
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
