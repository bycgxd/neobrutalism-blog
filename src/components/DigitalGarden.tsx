import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Tag, ChevronRight, Sprout, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import axios from 'axios';
import { NavbarContext } from '../App';

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
        const res = await axios.get('http://localhost:3001/api/garden');
        const data = res.data.map((item: GardenNote, index: number) => ({
          ...item,
          color: colors[index % colors.length]
        }));
        setNotes(data);
      } catch (err) {
        console.error('Failed to fetch garden notes', err);
      }
    };
    fetchNotes();
  }, []);

  return (
    <section id="garden" className="py-24 px-6 bg-paper relative overflow-hidden min-h-screen">
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

        {notes.length > 0 && (
          <div className="mt-24 text-center">
             <button className="comic-button bg-black text-white text-3xl py-6 px-16 italic font-comic">
               VIEW ALL ARCHIVES!!
             </button>
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
