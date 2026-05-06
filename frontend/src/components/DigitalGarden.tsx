import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Tag, ChevronRight, Sprout, X, ChevronLeft } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import axios from 'axios';
import { NavbarContext } from '../App';
import { Helmet } from 'react-helmet-async';

interface GardenNote {
  id: number;
  title: string;
  content: string;
  date: string;
  tags: string;
  isHidden: boolean;
}

const colors = ['bg-comic-red', 'bg-comic-blue', 'bg-zaun-purple', 'bg-comic-yellow', 'bg-hextech-gold'];

export default function DigitalGarden() {
  const { setNavbarHidden } = useContext(NavbarContext);
  const [selectedNote, setSelectedNote] = useState<GardenNote & { color?: string } | null>(null);
  const [notes, setNotes] = useState<(GardenNote & { color?: string })[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [jumpInput, setJumpInput] = useState('');

  useEffect(() => {
    if (selectedNote) {
      setNavbarHidden(true);
    } else {
      setNavbarHidden(false);
    }
    return () => setNavbarHidden(false);
  }, [selectedNote, setNavbarHidden]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', '10');

        const res = await axios.get(`/api/garden?${params.toString()}`);
        const { notes: items, total: t, totalPages: tp } = res.data;

        setNotes(items.map((item: GardenNote, index: number) => ({
          ...item,
          color: colors[index % colors.length]
        })));
        setTotal(t);
        setTotalPages(tp);
      } catch (err) {
        console.error('Failed to fetch garden notes', err);
      }
    };
    fetchNotes();
  }, [currentPage]);

  const handleJumpPage = () => {
    const page = parseInt(jumpInput);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setJumpInput('');
    }
  };

  return (
    <section id="garden" className="py-24 px-6 bg-paper relative overflow-hidden min-h-screen">
      <Helmet>
        <title>数字花园 | 柏C的空间站</title>
        <meta name="description" content="数字花园 — 零散的思考和笔记。" />
        <meta property="og:title" content="数字花园 | 柏C的空间站" />
        <meta property="og:description" content="数字花园 — 零散的思考和笔记。" />
      </Helmet>
      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-col md:flex-row items-baseline gap-10 mb-20">
          <h2 className="text-7xl md:text-9xl font-comic italic leading-tight">
            THE<br />
            <span className="text-comic-red onomatopoeia text-8xl md:text-[10rem]">GARDEN</span>
          </h2>
          <div className="bg-white sketched-border px-8 py-3 rotate-2 shadow-comic font-marker text-2xl">
            "Planting ideas in a radioactive soil..."
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {notes.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, type: "spring" }}
              whileHover={{ scale: 1.01 }}
              className="group relative"
              onClick={() => setSelectedNote(note)}
            >
              <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 opacity-10" />
              
              <div className="comic-panel p-0 group flex flex-col md:flex-row cursor-pointer hover:bg-comic-yellow/10">
                <div className={cn("md:w-32 flex flex-col items-center justify-center font-comic border-b-8 md:border-b-0 md:border-r-8 border-black py-6 md:py-0 text-white", note.color)}>
                  <span className="text-lg uppercase opacity-80">{note.date.split('-')[1]}</span>
                  <span className="text-5xl">{note.date.split('-')[2]}</span>
                </div>
                
                <div className="flex-grow p-8 flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="flex-grow">
                    <h3 className="text-3xl font-comic uppercase italic leading-tight mb-4 group-hover:text-comic-red transition-colors">
                      {note.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {note.tags.split(',').map(tag => (
                        <span key={tag.trim()} className="charm-tag">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-2 font-black uppercase text-sm border-2 border-black px-3 py-1 bg-white">
                      <Calendar className="w-4 h-4" />
                      <span>{note.date}</span>
                    </div>
                    <div className="w-16 h-16 bg-comic-red text-white flex items-center justify-center border-4 border-black shadow-comic-sm group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-0">
                      <ChevronRight className="w-10 h-10" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Charm */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-comic-blue border-4 border-black rounded-full flex items-center justify-center rotate-[-15deg] shadow-comic-sm z-20">
                <Sprout className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          ))}
          {notes.length === 0 && (
            <div className="py-20 text-center">
               <div className="text-4xl font-comic text-gray-400 mb-4">花园里暂时没有种植任何想法</div>
               <p className="font-bold text-xl">请前往后台控制面板添加笔记</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="comic-button bg-white text-black py-2 px-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === 'ellipsis' ? (
                  <span key={`e-${i}`} className="font-black text-xl px-1">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={cn(
                      "w-10 h-10 border-4 border-black font-black text-lg transition-transform",
                      currentPage === item
                        ? "bg-black text-white translate-y-1"
                        : "bg-white text-black hover:-translate-y-1"
                    )}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="comic-button bg-white text-black py-2 px-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 ml-4">
              <span className="font-bold text-sm">跳转</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpInput}
                onChange={e => setJumpInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJumpPage()}
                placeholder={`1-${totalPages}`}
                className="w-16 border-4 border-black p-2 font-bold text-center focus:outline-none"
              />
              <button
                onClick={handleJumpPage}
                className="comic-button bg-comic-blue text-white py-2 px-3 text-sm"
              >
                GO
              </button>
            </div>

            <span className="text-sm font-bold text-gray-500 ml-2">
              共 {total} 篇
            </span>
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/60 backdrop-blur-sm mt-[80px] md:mt-0">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="comic-panel bg-paper w-full max-w-4xl max-h-[85vh] flex flex-col relative shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className={cn("p-6 border-b-8 border-black flex items-center justify-between shrink-0", selectedNote.color)}>
                <div className="flex gap-2">
                  {selectedNote.tags.split(',').map(tag => (
                    <span key={tag.trim()} className={cn("font-comic text-xl italic uppercase", selectedNote.color === 'bg-comic-yellow' || selectedNote.color === 'bg-hextech-gold' ? 'text-black' : 'text-white')}>
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => setSelectedNote(null)}
                  className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center hover:bg-comic-red hover:text-white transition-colors shadow-comic-sm rotate-3 hover:rotate-0"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              {/* Modal Content (Scrollable) */}
              <div className="p-8 md:p-12 overflow-y-auto no-scrollbar flex-grow">
                <div className="flex items-center gap-4 mb-6 text-gray-500 font-bold border-2 border-black px-4 py-2 w-max bg-white rotate-[-1deg]">
                  <Calendar className="w-5 h-5" />
                  {selectedNote.date}
                </div>
                
                <h2 className="text-4xl md:text-5xl font-comic italic leading-tight mb-8">
                  {selectedNote.title}
                </h2>
                
                <div className="prose prose-xl prose-black max-w-none font-bold">
                  <div 
                    className="leading-relaxed min-h-[200px]"
                    dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
