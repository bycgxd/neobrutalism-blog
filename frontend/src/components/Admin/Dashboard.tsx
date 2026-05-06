import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, LogOut, Eye, EyeOff, Paperclip, LayoutDashboard, Sprout, CheckSquare, Square, BarChart3, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Analytics from './Analytics';
import BulkImport from './BulkImport';

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

interface GardenNote {
  id: number;
  title: string;
  content: string;
  date: string;
  tags: string;
  isHidden: boolean;
}

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': ['#FF2E00', '#000000', '#ffffff', '#FFD700', '#3b82f6', '#22c55e', '#a855f7'] }], // Custom colors including comic-red
    [{ 'header': [1, 2, 3, false] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ],
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'articles' | 'garden' | 'analytics'>('articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | '资讯' | '政策'>('all');
  const [articleSort, setArticleSort] = useState<'date' | 'createdAt'>('date');
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [gardenNotes, setGardenNotes] = useState<GardenNote[]>([]);

  const [articlePage, setArticlePage] = useState(1);
  const [articleTotalPages, setArticleTotalPages] = useState(1);
  const [gardenPage, setGardenPage] = useState(1);
  const [gardenTotalPages, setGardenTotalPages] = useState(1);
  const [jumpInput, setJumpInput] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({});
  const [currentGardenNote, setCurrentGardenNote] = useState<Partial<GardenNote>>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(-1); // -1: idle, 0-100: uploading

  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkImport, setShowBulkImport] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    if (activeTab === 'articles') {
      fetchArticles();
    } else if (activeTab === 'garden') {
      fetchGardenNotes();
    }
  }, [token, navigate, activeTab, articlePage, gardenPage, searchQuery, categoryFilter, articleSort]);

  const fetchArticles = async () => {
    try {
      const params = new URLSearchParams();
      params.set('admin', 'true');
      params.set('page', String(articlePage));
      params.set('limit', '10');
      params.set('sort', articleSort);
      if (searchQuery) params.set('search', searchQuery);
      if (categoryFilter === '资讯' || categoryFilter === '政策') params.set('category', categoryFilter);
      const res = await axios.get(`/api/articles?${params.toString()}`);
      const data = res.data;
      if (data.articles) {
        setArticles(data.articles);
        setArticleTotalPages(data.totalPages);
      } else {
        setArticles(data);
        setArticleTotalPages(1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGardenNotes = async () => {
    try {
      const res = await axios.get(`/api/garden?admin=true&page=${gardenPage}&limit=10`);
      const data = res.data;
      if (data.notes) {
        setGardenNotes(data.notes);
        setGardenTotalPages(data.totalPages);
      } else {
        setGardenNotes(data);
        setGardenTotalPages(1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentList: any[] = activeTab === 'articles' ? articles : gardenNotes;
  const allIds = currentList.map(item => item.id);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === allIds.length && allIds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const batchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.size} 项吗？此操作不可恢复。`)) return;
    const endpoint = activeTab === 'articles' ? '/api/articles' : '/api/garden';
    for (const id of selectedIds) {
      try {
        await axios.delete(`${endpoint}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) { console.error(`删除 ${id} 失败`, err); }
    }
    setSelectedIds(new Set());
    activeTab === 'articles' ? fetchArticles() : fetchGardenNotes();
  };

  const batchToggleVisibility = async () => {
    if (selectedIds.size === 0) return;
    const endpoint = activeTab === 'articles' ? '/api/articles' : '/api/garden';
    for (const id of selectedIds) {
      try {
        await axios.patch(`${endpoint}/${id}/toggle-visibility`, {}, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) { console.error(`切换 ${id} 失败`, err); }
    }
    setSelectedIds(new Set());
    activeTab === 'articles' ? fetchArticles() : fetchGardenNotes();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handleArticleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let attachmentUrl = currentArticle.attachmentUrl;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      // Determine folder name: use article ID if it exists, otherwise use a temp timestamp
      const folderName = currentArticle.id ? `article_${currentArticle.id}` : `draft_${Date.now()}`;
      
      try {
        // Delete old attachment if uploading a new one
        if (currentArticle.attachmentUrl) {
          try {
            await axios.delete(`/api/upload?url=${encodeURIComponent(currentArticle.attachmentUrl)}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (delErr) {
            console.error('Failed to delete old attachment', delErr);
          }
        }

        setUploadProgress(0);
        const uploadRes = await axios.post(`/api/upload?folder=${folderName}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
          onUploadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
          },
        });
        attachmentUrl = uploadRes.data.url;
      } catch (err) {
        console.error('File upload failed', err);
        setUploadProgress(-1);
        alert('文件上传失败');
        return;
      }
    }

    const payload = { ...currentArticle, attachmentUrl };

    try {
      if (currentArticle.id) {
        await axios.put(`/api/articles/${currentArticle.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/articles', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsEditing(false);
      setFile(null);
      setCurrentArticle({});
      setUploadProgress(-1);
      fetchArticles();
    } catch (err) {
      console.error(err);
      setUploadProgress(-1);
      alert('保存失败');
    }
  };

  const handleGardenSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentGardenNote.id) {
        await axios.put(`/api/garden/${currentGardenNote.id}`, currentGardenNote, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/garden', currentGardenNote, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsEditing(false);
      setCurrentGardenNote({});
      fetchGardenNotes();
    } catch (err) {
      console.error(err);
      alert('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除吗？')) return;
    try {
      if (activeTab === 'articles') {
        await axios.delete(`/api/articles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchArticles();
      } else {
        await axios.delete(`/api/garden/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchGardenNotes();
      }
    } catch (err) {
      console.error(err);
      alert('删除失败');
    }
  };

  const toggleVisibility = async (id: number) => {
    try {
      if (activeTab === 'articles') {
        await axios.patch(`/api/articles/${id}/toggle-visibility`, {}, { headers: { Authorization: `Bearer ${token}` } });
        fetchArticles();
      } else {
        await axios.patch(`/api/garden/${id}/toggle-visibility`, {}, { headers: { Authorization: `Bearer ${token}` } });
        fetchGardenNotes();
      }
    } catch (err) {
      console.error(err);
      alert('操作失败');
    }
  };

  const openEditor = (item?: any) => {
    if (activeTab === 'articles') {
      if (item) {
        setCurrentArticle(item);
      } else {
        setCurrentArticle({
          title: '',
          summary: '',
          content: '',
          date: new Date().toISOString().split('T')[0],
          category: '行业动态',
          sourceUrl: '',
          isHidden: false
        });
      }
      setFile(null);
    } else {
      if (item) {
        setCurrentGardenNote(item);
      } else {
        setCurrentGardenNote({
          title: '',
          content: '',
          date: new Date().toISOString().split('T')[0],
          tags: '随笔,生活',
          isHidden: false
        });
      }
    }
    setIsEditing(true);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let text = event.target?.result as string;
        // 移除可能存在的 BOM 头
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }
        
        let json = JSON.parse(text);
        if (Array.isArray(json)) {
          json = json[0];
        }
        
        console.log("Imported JSON:", json);

        const formatForQuill = (str: string) => {
          if (!str) return '';
          // 将 \n 转换为 <p> 标签以适配 ReactQuill
          return str.split('\n').map(p => p ? `<p>${p}</p>` : '<p><br></p>').join('');
        };
        
        // 提取数据并做兼容性映射
        const mappedData: any = {
          title: json.title || json.name || '',
          summary: json.summary || json.desc || '',
          content: formatForQuill(json.content || json.text || ''),
          date: json.publish_date || json.date || new Date().toISOString().split('T')[0],
          aiAnalysis: formatForQuill(json.ai_analysis || json.aiAnalysis || ''),
          sourceUrl: json.original_url || json.sourceUrl || json.source_url || json.url || '',
          tags: json.tags || json.category || '',
        };

        console.log("Mapped Data:", mappedData);

        if (activeTab === 'articles') {
          setCurrentArticle(prev => ({ 
            ...prev, 
            ...mappedData,
            category: mappedData.tags || prev.category || '行业动态'
          }));
        } else {
          setCurrentGardenNote(prev => ({ 
            ...prev, 
            ...mappedData,
            tags: mappedData.tags || prev.tags || ''
          }));
        }
      } catch (err) {
        console.error("Import error:", err);
        setImportError('文件损坏或格式错误！');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setImportError('无法读取该文件！');
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-paper p-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <h1 className="text-5xl font-comic italic uppercase">
            控制<span className="text-comic-red">面板</span>
          </h1>
          
          <div className="flex gap-4">
            <button 
              onClick={() => { setActiveTab('articles'); setIsEditing(false); setArticlePage(1); }}
              className={cn("comic-button flex items-center gap-2", activeTab === 'articles' ? "bg-comic-yellow text-black" : "bg-white text-black")}
            >
              <LayoutDashboard className="w-5 h-5" /> 行业资讯管理
            </button>
            <button
              onClick={() => { setActiveTab('garden'); setIsEditing(false); setGardenPage(1); }}
              className={cn("comic-button flex items-center gap-2", activeTab === 'garden' ? "bg-zaun-green text-black" : "bg-white text-black")}
            >
              <Sprout className="w-5 h-5" /> 数字花园管理
            </button>
            <button
              onClick={() => { setActiveTab('analytics'); setIsEditing(false); }}
              className={cn("comic-button flex items-center gap-2", activeTab === 'analytics' ? "bg-comic-red text-white" : "bg-white text-black")}
            >
              <BarChart3 className="w-5 h-5" /> 数据统计
            </button>
          </div>

          <button onClick={handleLogout} className="comic-button bg-black text-white flex items-center gap-2">
            <LogOut className="w-5 h-5" /> 退出登录
          </button>
        </div>

        {!isEditing && activeTab === 'articles' && (
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => { setCategoryFilter('all'); setArticlePage(1); }}
                className={cn("px-4 py-2 border-4 border-black font-black uppercase transition-transform", categoryFilter === 'all' ? "bg-comic-blue text-white translate-y-1" : "bg-white text-black hover:-translate-y-1")}
              >
                全部
              </button>
              <button
                onClick={() => { setCategoryFilter('资讯'); setArticlePage(1); }}
                className={cn("px-4 py-2 border-4 border-black font-black uppercase transition-transform", categoryFilter === '资讯' ? "bg-comic-yellow text-black translate-y-1" : "bg-white text-black hover:-translate-y-1")}
              >
                资讯
              </button>
              <button
                onClick={() => { setCategoryFilter('政策'); setArticlePage(1); }}
                className={cn("px-4 py-2 border-4 border-black font-black uppercase transition-transform", categoryFilter === '政策' ? "bg-zaun-green text-black translate-y-1" : "bg-white text-black hover:-translate-y-1")}
              >
                政策
              </button>
            </div>
            <input 
              type="text"
              placeholder="搜索标题或简介..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setArticlePage(1); }}
              className="flex-1 border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-comic-blue"
            />
            <button
              onClick={() => { setArticleSort(s => s === 'date' ? 'createdAt' : 'date'); setArticlePage(1); }}
              className={cn("px-4 py-2 border-4 border-black font-black uppercase transition-transform whitespace-nowrap", articleSort === 'createdAt' ? "bg-black text-white translate-y-1" : "bg-white text-black hover:-translate-y-1")}
            >
              {articleSort === 'date' ? '按发布时间' : '按导入时间'}
            </button>
          </div>
        )}

        {!isEditing && activeTab !== 'analytics' && (
          <div className="comic-panel bg-white p-8">
            <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="p-2 border-2 border-black bg-white transition-transform active:scale-95"
                  title="全选/取消全选"
                >
                  {selectedIds.size === allIds.length && allIds.length > 0
                    ? <CheckSquare className="w-5 h-5" />
                    : <Square className="w-5 h-5" />
                  }
                </button>
                <h2 className="text-3xl font-black">
                  {activeTab === 'articles' ? '行业资讯管理' : '数字花园管理'}
                </h2>
              </div>
              <div className="flex gap-2">
                {activeTab === 'articles' && (
                  <button onClick={() => setShowBulkImport(true)} className="comic-button bg-comic-yellow text-black flex items-center gap-2">
                    <Upload className="w-5 h-5" /> 一键导入
                  </button>
                )}
                <button onClick={() => openEditor()} className="comic-button bg-comic-blue text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" /> 新增{activeTab === 'articles' ? '文章' : '笔记'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 bg-black text-white p-4 border-4 border-black flex items-center justify-between flex-wrap gap-3"
                >
                  <span className="font-black text-lg">已选中 {selectedIds.size} 项</span>
                  <div className="flex gap-3">
                    <button
                      onClick={batchToggleVisibility}
                      className="comic-button bg-comic-yellow text-black text-sm py-2 px-4"
                    >
                      <EyeOff className="w-4 h-4" /> 一键隐藏/显示
                    </button>
                    <button
                      onClick={batchDelete}
                      className="comic-button bg-comic-red text-white text-sm py-2 px-4"
                    >
                      <Trash2 className="w-4 h-4" /> 一键删除
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {currentList.map((item: any) => (
                <div key={item.id} className={cn("border-4 border-black p-4 flex items-center justify-between transition-colors", item.isHidden ? "bg-gray-200" : "bg-white hover:bg-comic-yellow/10")}>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className="p-1 flex-shrink-0 transition-transform active:scale-95"
                    >
                      {selectedIds.has(item.id)
                        ? <CheckSquare className="w-6 h-6" />
                        : <Square className="w-6 h-6" />
                      }
                    </button>
                    <div>
                      <h3 className={cn("text-xl font-bold", item.isHidden && "line-through text-gray-500")}>
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm font-black text-gray-600">
                        <span className={cn("text-white px-2", activeTab === 'articles' && item.category === '政策' ? 'bg-zaun-green' : 'bg-black')}>
                          {activeTab === 'articles' ? item.category : item.tags}
                        </span>
                        <span>{item.date}</span>
                        {activeTab === 'articles' && item.createdAt && (
                          <span className="text-xs text-gray-400">
                            导入: {new Date(item.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => toggleVisibility(item.id)}
                      className={cn("p-2 border-2 border-black transition-transform active:scale-95", item.isHidden ? "bg-comic-yellow" : "bg-white")}
                      title={item.isHidden ? "点击显示" : "点击隐藏"}
                    >
                      {item.isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => openEditor(item)}
                      className="p-2 bg-comic-blue text-white border-2 border-black transition-transform active:scale-95"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-comic-red text-white border-2 border-black transition-transform active:scale-95"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {currentList.length === 0 && (
                <div className="text-center py-10 font-bold text-xl text-gray-500">
                  暂无内容，请点击右上角新增
                </div>
              )}
            </div>

            {(activeTab === 'articles' ? articleTotalPages : gardenTotalPages) > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2 flex-wrap border-t-4 border-black pt-6">
                <button
                  onClick={() => activeTab === 'articles' ? setArticlePage(p => Math.max(1, p - 1)) : setGardenPage(p => Math.max(1, p - 1))}
                  disabled={(activeTab === 'articles' ? articlePage : gardenPage) === 1}
                  className="px-3 py-2 border-2 border-black font-black disabled:opacity-30 disabled:cursor-not-allowed bg-white hover:bg-comic-yellow/20"
                >
                  上一页
                </button>

                {Array.from({ length: activeTab === 'articles' ? articleTotalPages : gardenTotalPages }, (_, i) => i + 1)
                  .filter(p => {
                    const cp = activeTab === 'articles' ? articlePage : gardenPage;
                    const tp = activeTab === 'articles' ? articleTotalPages : gardenTotalPages;
                    return p === 1 || p === tp || Math.abs(p - cp) <= 1;
                  })
                  .reduce<(number | 'e')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('e');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === 'e' ? <span key={`e-${i}`} className="font-black px-1">...</span> : (
                      <button
                        key={item}
                        onClick={() => activeTab === 'articles' ? setArticlePage(item) : setGardenPage(item)}
                        className={cn(
                          "w-10 h-10 border-2 border-black font-black transition-transform",
                          (activeTab === 'articles' ? articlePage : gardenPage) === item
                            ? "bg-black text-white translate-y-1"
                            : "bg-white text-black hover:-translate-y-1"
                        )}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() => activeTab === 'articles' ? setArticlePage(p => Math.min(articleTotalPages, p + 1)) : setGardenPage(p => Math.min(gardenTotalPages, p + 1))}
                  disabled={(activeTab === 'articles' ? articlePage : gardenPage) === (activeTab === 'articles' ? articleTotalPages : gardenTotalPages)}
                  className="px-3 py-2 border-2 border-black font-black disabled:opacity-30 disabled:cursor-not-allowed bg-white hover:bg-comic-yellow/20"
                >
                  下一页
                </button>

                <div className="flex items-center gap-2 ml-2">
                  <input
                    type="number"
                    min={1}
                    max={activeTab === 'articles' ? articleTotalPages : gardenTotalPages}
                    value={jumpInput}
                    onChange={e => setJumpInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const page = parseInt(jumpInput);
                        const tp = activeTab === 'articles' ? articleTotalPages : gardenTotalPages;
                        if (page >= 1 && page <= tp) {
                          activeTab === 'articles' ? setArticlePage(page) : setGardenPage(page);
                          setJumpInput('');
                        }
                      }
                    }}
                    placeholder="页码"
                    className="w-16 border-2 border-black p-1 font-bold text-center text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        {isEditing && (
          <div className="comic-panel bg-white p-8">
            <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
              <h2 className="text-3xl font-black">
                {activeTab === 'articles' 
                  ? (currentArticle.id ? '编辑文章' : '新增文章') 
                  : (currentGardenNote.id ? '编辑笔记' : '新增笔记')}
              </h2>
              <div>
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  onChange={handleImportJson} 
                  className="hidden" 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="comic-button bg-comic-red text-white flex items-center gap-2 hover:animate-pulse active:scale-95 border-black border-4"
                >
                  📦 导入内容包
                </button>
              </div>
            </div>
            
            {activeTab === 'articles' ? (
              <form onSubmit={handleArticleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-black mb-2 uppercase">标题</label>
                    <input 
                      type="text" 
                      value={currentArticle.title || ''}
                      onChange={e => setCurrentArticle({...currentArticle, title: e.target.value})}
                      className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-comic-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-2 uppercase">分类标签</label>
                    <input 
                      type="text" 
                      value={currentArticle.category || ''}
                      onChange={e => setCurrentArticle({...currentArticle, category: e.target.value})}
                      placeholder="例如：资讯、政策"
                      className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-comic-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-2 uppercase">发布时间</label>
                    <input 
                      type="date" 
                      value={currentArticle.date || ''}
                      onChange={e => setCurrentArticle({...currentArticle, date: e.target.value})}
                      className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-comic-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-2 uppercase">文章来源 (URL)</label>
                    <input 
                      type="url" 
                      value={currentArticle.sourceUrl || ''}
                      onChange={e => setCurrentArticle({...currentArticle, sourceUrl: e.target.value})}
                      placeholder="https://..."
                      className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-comic-blue"
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-2 uppercase">附件上传</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file" 
                        onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full border-4 border-black p-2 font-bold focus:outline-none"
                      />
                      {currentArticle.attachmentUrl && !file && (
                        <div className="flex items-center gap-4 bg-gray-100 p-2 border-2 border-black">
                          <span className="text-sm font-bold text-comic-blue truncate flex-1">
                            已有附件: {currentArticle.attachmentUrl.split('/').pop()}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm('确定要删除此附件吗？这会立即从服务器删除该文件。')) {
                                try {
                                  await axios.delete(`/api/upload?url=${encodeURIComponent(currentArticle.attachmentUrl!)}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  setCurrentArticle({ ...currentArticle, attachmentUrl: null });
                                } catch (err) {
                                  console.error(err);
                                  alert('删除附件失败');
                                }
                              }
                            }}
                            className="bg-comic-red text-white px-2 py-1 text-xs font-bold border-2 border-black"
                          >
                            删除附件
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-black mb-2 uppercase">简介</label>
                  <textarea 
                    value={currentArticle.summary || ''}
                    onChange={e => setCurrentArticle({...currentArticle, summary: e.target.value})}
                    className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-comic-blue h-24"
                    required
                  />
                </div>

                <div className="bg-white">
                  <label className="block font-black mb-2 uppercase">正文内容</label>
                  <ReactQuill 
                    theme="snow"
                    modules={quillModules}
                    value={currentArticle.content || ''}
                    onChange={(content) => setCurrentArticle(prev => ({...prev, content}))}
                    className="bg-white border-4 border-black"
                    style={{ height: '300px', marginBottom: '50px' }}
                  />
                </div>

                <div className="bg-white mt-6">
                  <label className="block font-black mb-2 uppercase">AI 解读</label>
                  <ReactQuill 
                    theme="snow"
                    modules={quillModules}
                    value={currentArticle.aiAnalysis || ''}
                    onChange={(content) => setCurrentArticle(prev => ({...prev, aiAnalysis: content}))}
                    className="bg-white border-4 border-black"
                    style={{ height: '350px', marginBottom: '50px' }}
                  />
                </div>

                {uploadProgress >= 0 && (
                  <div className="border-4 border-black p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm uppercase">正在上传附件...</span>
                      <span className="font-comic text-xl">{uploadProgress}%</span>
                    </div>
                    <div className="border-2 border-black h-6 bg-gray-200">
                      <motion.div
                        className="h-full bg-comic-blue"
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.15 }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t-4 border-black">
                  <button type="button" onClick={() => { setIsEditing(false); setUploadProgress(-1); }} className="comic-button bg-gray-300 text-black">
                    取消
                  </button>
                  <button type="submit" className="comic-button bg-comic-green text-black" disabled={uploadProgress >= 0}>
                    保存文章
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleGardenSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block font-black mb-2 uppercase">标题</label>
                    <input 
                      type="text" 
                      value={currentGardenNote.title || ''}
                      onChange={e => setCurrentGardenNote({...currentGardenNote, title: e.target.value})}
                      className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-zaun-green"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-2 uppercase">发布时间</label>
                    <input 
                      type="date" 
                      value={currentGardenNote.date || ''}
                      onChange={e => setCurrentGardenNote({...currentGardenNote, date: e.target.value})}
                      className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-zaun-green"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-2 uppercase">标签 (用逗号分隔)</label>
                    <input 
                      type="text" 
                      value={currentGardenNote.tags || ''}
                      onChange={e => setCurrentGardenNote({...currentGardenNote, tags: e.target.value})}
                      placeholder="例如：设计,生活,思考"
                      className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-zaun-green"
                      required
                    />
                  </div>
                </div>

                <div className="bg-white">
                  <label className="block font-black mb-2 uppercase">正文内容</label>
                  <ReactQuill 
                    theme="snow"
                    modules={quillModules}
                    value={currentGardenNote.content || ''}
                    onChange={(content) => setCurrentGardenNote(prev => ({...prev, content}))}
                    className="bg-white border-4 border-black"
                    style={{ height: '300px', marginBottom: '50px' }}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t-4 border-black">
                  <button type="button" onClick={() => setIsEditing(false)} className="comic-button bg-gray-300 text-black">
                    取消
                  </button>
                  <button type="submit" className="comic-button bg-zaun-green text-black">
                    保存笔记
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="comic-panel bg-white p-8">
            <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
              <h2 className="text-3xl font-black">数据统计</h2>
            </div>
            <Analytics />
          </div>
        )}
      </div>

      <AnimatePresence>
        {importError && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0, x: [-10, 10, -10, 10, 0] }}
              exit={{ scale: 0.9, opacity: 0, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="comic-panel bg-comic-red text-white p-8 max-w-md w-full border-8 border-black text-center shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]"
            >
              <h3 className="text-5xl font-comic italic uppercase mb-4 onomatopoeia">KABOOM!</h3>
              <p className="text-2xl font-black mb-8">{importError}</p>
              <button
                onClick={() => setImportError(null)}
                className="comic-button bg-white text-black text-xl w-full"
              >
                我知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BulkImport
        open={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSaved={() => { fetchArticles(); }}
      />
    </div>
  );
}