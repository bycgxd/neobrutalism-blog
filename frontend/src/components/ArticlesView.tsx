import { useState, useMemo, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Search, ArrowRight, X, Calendar, ArrowUpDown, Download, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import axios from 'axios';
import { NavbarContext } from '../App';
import { trackPageView } from '@/src/lib/tracker';

interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  aiAnalysis: string | null;
  date: string;
  category: string;
  sourceUrl: string | null;
  attachmentUrl: string | null;
  isHidden: boolean;
}

const colors = ['bg-comic-blue', 'bg-comic-red', 'bg-comic-yellow', 'bg-zaun-green', 'bg-zaun-purple'];

export default function ArticlesView() {
  const { setNavbarHidden } = useContext(NavbarContext);
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'policies'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedArticle, setSelectedArticle] = useState<Article & { color?: string } | null>(null);
  const [articles, setArticles] = useState<(Article & { color?: string })[]>([]);

  useEffect(() => {
    if (selectedArticle) {
      setNavbarHidden(true);
      trackPageView('/articles', selectedArticle.id);
    } else {
      setNavbarHidden(false);
    }
    return () => setNavbarHidden(false);
  }, [selectedArticle, setNavbarHidden]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        const res = await axios.get(`/api/articles?${searchParam}`);
        
        const data = res.data.map((item: Article, index: number) => ({
          ...item,
          color: colors[index % colors.length]
        }));
        setArticles(data);
      } catch (err) {
        console.error('Failed to fetch articles', err);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Sorting logic (filtering is now done on frontend for tabs)
  const filteredAndSortedArticles = useMemo(() => {
    let result = articles;
    
    if (activeTab === 'news') {
      result = result.filter(a => a.category?.includes('资讯'));
    } else if (activeTab === 'policies') {
      result = result.filter(a => a.category?.includes('政策'));
    }

    result = [...result];
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [articles, sortOrder, activeTab]);

  return (
    <section id="articles" className="py-24 px-6 bg-paper border-y-8 border-black relative overflow-hidden min-h-screen">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 pointer-events-none">
        <Newspaper className="w-64 h-64" />
      </div>
      <div className="absolute bottom-20 left-10 onomatopoeia text-comic-blue text-6xl -rotate-12 opacity-30 select-none z-0">
        READ!
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div>
            <motion.h2 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-7xl md:text-9xl font-comic mb-4 uppercase italic flex flex-wrap"
            >
              INDUSTRY<span className="text-comic-red">NEWS</span>
            </motion.h2>
            <div className="bg-black text-white px-4 py-1 inline-block rotate-[-1deg] font-marker text-xl">
              "前沿动态、政策法规"
            </div>
          </div>

          {/* Search & Sort Controls */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
          >
            <div className="flex gap-2 mr-4">
              <button 
                onClick={() => setActiveTab('all')}
                className={cn("px-4 py-2 border-4 border-black font-black uppercase transition-transform", activeTab === 'all' ? "bg-comic-blue text-white translate-y-1" : "bg-white text-black hover:-translate-y-1")}
              >
                全部
              </button>
              <button 
                onClick={() => setActiveTab('news')}
                className={cn("px-4 py-2 border-4 border-black font-black uppercase transition-transform", activeTab === 'news' ? "bg-comic-yellow text-black translate-y-1" : "bg-white text-black hover:-translate-y-1")}
              >
                资讯
              </button>
              <button 
                onClick={() => setActiveTab('policies')}
                className={cn("px-4 py-2 border-4 border-black font-black uppercase transition-transform", activeTab === 'policies' ? "bg-zaun-green text-black translate-y-1" : "bg-white text-black hover:-translate-y-1")}
              >
                政策
              </button>
            </div>

            <div className="relative group w-full sm:w-[270px]">
              <div className="relative flex items-center bg-white border-4 border-black p-[10px] group-focus-within:bg-comic-yellow/20 transition-colors h-full">
                <Search className="w-5 h-5 mr-2 text-black flex-shrink-0" />
                <input
                  type="text"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full font-bold focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="comic-button bg-white text-black flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <ArrowUpDown className="w-5 h-5" />
              {sortOrder === 'desc' ? '最新优先' : '最早优先'}
            </button>
          </motion.div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedArticle(article)}
                className="group cursor-pointer h-full"
              >
                <div className="relative h-full">
                  <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 opacity-20" />
                  <div className="comic-panel bg-white p-6 h-full flex flex-col group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <span className={cn("px-3 py-1 font-black text-sm uppercase border-2 border-black", article.color, article.color === 'bg-comic-yellow' ? 'text-black' : 'text-white')}>
                        {article.category}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 border-2 border-black rotate-2">
                        <Calendar className="w-4 h-4" />
                        {article.date}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-comic italic leading-tight mb-4 group-hover:text-comic-red transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-lg font-bold text-gray-700 flex-grow line-clamp-2">
                      {article.summary}
                    </p>

                    <div className="mt-6 pt-4 border-t-4 border-black flex items-center justify-between">
                      <span className="font-marker text-lg opacity-50 group-hover:opacity-100 transition-opacity">Read More</span>
                      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredAndSortedArticles.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-20 text-center">
               <div className="text-4xl font-comic text-gray-400 mb-4">暂无相关资讯</div>
               <p className="font-bold text-xl">换个搜索词试试看？</p>
            </div>
          )}
        </div>
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/60 backdrop-blur-sm mt-[80px] md:mt-0">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="comic-panel bg-paper w-full max-w-4xl max-h-[85vh] flex flex-col relative shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className={cn("p-6 border-b-8 border-black flex items-center justify-between shrink-0", selectedArticle.color)}>
                <span className={cn("font-comic text-xl italic uppercase", selectedArticle.color === 'bg-comic-yellow' ? 'text-black' : 'text-white')}>
                  {selectedArticle.category} // {selectedArticle.date}
                </span>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center hover:bg-comic-red hover:text-white transition-colors shadow-comic-sm rotate-3 hover:rotate-0"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              {/* Modal Content (Scrollable) */}
              <div className="p-8 md:p-12 overflow-y-auto no-scrollbar flex-grow">
                <h2 className="text-4xl md:text-5xl font-comic italic leading-tight mb-8">
                  {selectedArticle.title}
                </h2>
                
                <div className="prose prose-xl prose-black max-w-none font-bold">
                  <p className="text-2xl leading-relaxed mb-6 p-6 border-l-8 border-black bg-white shadow-comic-sm rotate-[-1deg]">
                    {selectedArticle.summary}
                  </p>

                  {selectedArticle.sourceUrl && (
                    <div className="mb-8 font-black text-lg flex items-center gap-2">
                      <span className="bg-black text-white px-2 py-1 rotate-2">文章来源</span>
                      <a 
                        href={selectedArticle.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-comic-blue underline decoration-4 underline-offset-4 hover:text-comic-red transition-colors break-all"
                      >
                        {selectedArticle.sourceUrl}
                      </a>
                    </div>
                  )}
                  
                  <div 
                    className="leading-relaxed min-h-[200px]"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                  />

                  {selectedArticle.aiAnalysis && (
                    <div className="mt-12 p-8 border-4 border-black bg-zaun-purple/10 relative">
                      <div className="absolute -top-6 -left-4 bg-zaun-purple text-white px-4 py-2 border-4 border-black font-comic text-2xl rotate-[-2deg] shadow-comic-sm flex items-center gap-2">
                        <Sparkles className="w-6 h-6" />
                        AI 解读
                      </div>
                      <div 
                        className="leading-relaxed mt-4"
                        dangerouslySetInnerHTML={{ __html: selectedArticle.aiAnalysis }}
                      />
                    </div>
                  )}
                  
                  {selectedArticle.attachmentUrl && (
                    <div className="mt-10 p-6 border-4 border-black bg-comic-yellow/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-black text-white rotate-3">
                          <Download className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-xl uppercase">附件资源</h4>
                          <p className="text-sm font-bold text-gray-600">点击下载相关文件</p>
                        </div>
                      </div>
                      <a 
                        href={selectedArticle.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="comic-button bg-comic-blue text-white whitespace-nowrap"
                      >
                        立即下载
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
