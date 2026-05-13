import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Helmet } from 'react-helmet-async';
import { 
  Terminal, 
  Figma, 
  Pocket, 
  Layers, 
  Cpu, 
  Smartphone,
  Layout,
  Code2,
  Calculator,
  X
} from 'lucide-react';

const tools = [];

function NumberConverter() {
  const [num, setNum] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const convertCurrency = (money: string) => {
    let n = parseFloat(money);
    if (isNaN(n)) return '';
    if (n === 0) return '零圆整';
    
    const fraction = ['角', '分'];
    const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const unit = [['圆', '万', '亿'], ['', '拾', '佰', '仟']];
    
    let head = n < 0 ? '欠' : '';
    n = Math.abs(n);
    let s = '';
    
    for (let i = 0; i < fraction.length; i++) {
      s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
    }
    s = s || '整';
    n = Math.floor(n);
    for (let i = 0; i < unit[0].length && n > 0; i++) {
      let p = '';
      for (let j = 0; j < unit[1].length && n > 0; j++) {
        p = digit[n % 10] + unit[1][j] + p;
        n = Math.floor(n / 10);
      }
      s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }
    
    return head + s.replace(/(零.)*零圆/, '圆').replace(/(零.)+/g, '零').replace(/^整$/, '零圆整');
  };

  return (
    <>
      <div className="relative h-full group cursor-pointer" onClick={() => setIsOpen(true)}>
        <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 opacity-20" />
        <div className="comic-panel p-8 bg-white h-full flex flex-col group-hover:bg-comic-yellow/10 transition-colors">
          <div className="inline-flex p-4 border-4 border-black mb-8 rotate-[-3deg] transition-transform group-hover:rotate-0 shadow-comic-sm bg-comic-blue w-max">
            <Calculator className="w-10 h-10 text-black" />
          </div>
          
          <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-2">
            <h3 className="text-3xl font-comic uppercase italic">金额大写转换</h3>
            <span className="charm-tag bg-comic-red text-white">Tool</span>
          </div>
          
          <p className="text-lg font-black leading-tight italic grayscale group-hover:grayscale-0 transition-all">
            阿拉伯数字转财务大写金额
          </p>
          
          <div className="mt-auto pt-10 flex items-center justify-between">
            <div className="h-2 flex-grow bg-black/10 mr-4 rotate-1" />
            <div className="onomatopoeia text-comic-blue text-xl opacity-0 group-hover:opacity-100 transition-opacity">
              CLICK!
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotate: 2 }}
              className="comic-panel bg-white w-full max-w-2xl p-8 relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-12 h-12 bg-comic-red border-4 border-black flex items-center justify-center text-white hover:bg-black transition-colors shadow-comic-sm rotate-3 hover:rotate-0"
              >
                <X className="w-8 h-8" />
              </button>
              
              <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
                <div className="p-3 border-4 border-black bg-comic-yellow rotate-[-2deg]">
                  <Calculator className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl md:text-4xl font-comic italic uppercase">金额大写转换器</h3>
              </div>
              
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-xl font-black mb-2 uppercase">输入阿拉伯数字 (¥)</label>
                  <input 
                    type="number" 
                    value={num}
                    onChange={(e) => setNum(e.target.value)}
                    placeholder="例如: 1234.56"
                    className="w-full border-4 border-black p-4 font-black text-2xl focus:outline-none focus:ring-4 focus:ring-comic-blue transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xl font-black mb-2 uppercase">财务大写金额</label>
                  <div className="w-full border-4 border-black p-4 min-h-[120px] bg-paper font-black text-3xl break-all flex items-center shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] text-comic-red">
                    {num ? convertCurrency(num) : <span className="text-gray-400 text-2xl">此处显示转换结果...</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Toolbox() {
  return (
    <section id="toolbox" className="py-24 px-6 relative overflow-hidden">
      <Helmet>
        <title>工具箱 | 柏青树</title>
        <meta name="description" content="实用在线工具集合。" />
        <meta property="og:title" content="工具箱 | 柏青树" />
        <meta property="og:description" content="实用在线工具集合。" />
      </Helmet>
       {/* Background Halftone Overlay */}
      <div className="absolute inset-0 halftone-bg opacity-5 text-comic-blue pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="mb-20">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-end gap-6"
          >
            <h2 className="text-7xl md:text-9xl font-comic leading-none italic">
              TOOL<span className="text-comic-red">KIT</span>
            </h2>
            <div className="bg-comic-blue text-white px-6 py-2 border-4 border-black rotate-[2deg] shadow-comic onomatopoeia text-2xl">
              ARMORY LOADED
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0, type: "spring" }}
            className="group"
          >
            <NumberConverter />
          </motion.div>

          {tools.map((tool, idx) => (
            <motion.div
              key={tool.name}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (idx + 1) * 0.05, type: "spring" }}
            whileHover={{ rotate: (idx + 1) % 2 === 0 ? 1 : -1, scale: 1.02 }}
              className="group"
            >
              <div className="relative">
                {/* Panel Background Layer */}
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 opacity-20" />
                
                <div className="comic-panel p-8 group-hover:bg-comic-yellow/10 transition-colors">
                  <div className={cn("inline-flex p-4 border-4 border-black mb-8 rotate-[-3deg] transition-transform group-hover:rotate-0 shadow-comic-sm", tool.color)}>
                    <tool.icon className="w-10 h-10 text-black" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-2">
                    <h3 className="text-3xl font-comic uppercase italic">{tool.name}</h3>
                    <span className="charm-tag bg-comic-red text-white">
                      {tool.category}
                    </span>
                  </div>
                  
                  <p className="text-lg font-black leading-tight italic grayscale group-hover:grayscale-0 transition-all">
                    {tool.desc}
                  </p>
                  
                  <div className="mt-10 flex items-center justify-between">
                    <div className="h-2 flex-grow bg-black/10 mr-4 rotate-1" />
                    <div className="onomatopoeia text-comic-blue text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      CLICK!
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
