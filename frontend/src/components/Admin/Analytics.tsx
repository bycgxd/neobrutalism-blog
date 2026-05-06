import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Users, TrendingUp, MapPin, FileText, Globe, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface Summary {
  totalViews: number;
  uniqueVisitors: number;
  todayViews: number;
  todayUniqueVisitors: number;
}

interface PageStat {
  page: string;
  views: number;
  uniqueVisitors: number;
}

interface ArticleStat {
  articleId: number;
  title: string;
  views: number;
}

interface RecentVisitor {
  id: number;
  ip: string;
  country: string;
  city: string;
  page: string;
  articleId: number | null;
  createdAt: string;
}

type SubTab = 'overview' | 'articles' | 'recent';

export default function Analytics() {
  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pages, setPages] = useState<PageStat[]>([]);
  const [articles, setArticles] = useState<ArticleStat[]>([]);
  const [recent, setRecent] = useState<RecentVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotalPages, setRecentTotalPages] = useState(1);
  const [recentJump, setRecentJump] = useState('');

  const token = localStorage.getItem('adminToken');

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [summaryRes, pagesRes, articlesRes] = await Promise.all([
        axios.get('/api/analytics/summary', { headers }),
        axios.get('/api/analytics/pages', { headers }),
        axios.get('/api/analytics/articles', { headers }),
      ]);
      setSummary(summaryRes.data);
      setPages(pagesRes.data);
      setArticles(articlesRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecent = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`/api/analytics/recent?page=${recentPage}&limit=20`, { headers });
      const data = res.data;
      if (data.visitors) {
        setRecent(data.visitors);
        setRecentTotalPages(data.totalPages);
      } else {
        setRecent(data);
        setRecentTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch recent visitors', err);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchRecent(); }, [recentPage]);

  const statCards = summary ? [
    { label: '总访问量', value: summary.totalViews, icon: Eye, color: 'bg-comic-blue' },
    { label: '独立访客', value: summary.uniqueVisitors, icon: Users, color: 'bg-zaun-green' },
    { label: '今日访问', value: summary.todayViews, icon: TrendingUp, color: 'bg-comic-yellow' },
    { label: '今日访客', value: summary.todayUniqueVisitors, icon: MapPin, color: 'bg-comic-red' },
  ] : [];

  const PAGE_LABELS: Record<string, string> = {
    '/': '首页',
    '/about': '关于',
    '/toolbox': '工具箱',
    '/articles': '行业资讯',
    '/garden': '数字花园',
  };

  return (
    <div>
      <div className="flex gap-2 mb-8">
        {([
          ['overview', '概览', Globe],
          ['articles', '文章排行', FileText],
          ['recent', '最近访客', Calendar],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={cn(
              "px-4 py-2 border-4 border-black font-black uppercase transition-transform flex items-center gap-2",
              subTab === key ? "bg-black text-white translate-y-1" : "bg-white text-black hover:-translate-y-1"
            )}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
        <button
          onClick={() => { fetchData(); setRecentPage(1); }}
          className="ml-auto px-4 py-2 border-4 border-black font-black uppercase bg-comic-blue text-white hover:-translate-y-1 transition-transform"
        >
          刷新
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="ml-3 text-xl font-black">加载中...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {subTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map(card => (
                  <div key={card.label} className={cn("comic-panel p-6 text-white", card.color)}>
                    <card.icon className="w-8 h-8 mb-2" />
                    <div className="text-4xl font-comic">{card.value.toLocaleString()}</div>
                    <div className="text-sm font-black uppercase mt-1">{card.label}</div>
                  </div>
                ))}
              </div>

              <div className="comic-panel bg-white p-6">
                <h3 className="text-xl font-black mb-4 uppercase">页面访问排行</h3>
                {pages.length === 0 ? (
                  <p className="text-gray-500 font-bold py-8 text-center">暂无数据</p>
                ) : (
                  <div className="space-y-2">
                    {pages.map((p, i) => (
                      <div key={p.page} className="flex items-center justify-between border-2 border-black p-3">
                        <div className="flex items-center gap-3">
                          <span className="font-comic text-2xl w-8">{i + 1}</span>
                          <span className="font-bold text-lg">{PAGE_LABELS[p.page] || p.page}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold">
                          <span>{p.views} 次浏览</span>
                          <span className="text-gray-500">{p.uniqueVisitors} 独立访客</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {subTab === 'articles' && (
            <motion.div key="articles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="comic-panel bg-white p-6">
                <h3 className="text-xl font-black mb-4 uppercase">文章阅读排行</h3>
                {articles.length === 0 ? (
                  <p className="text-gray-500 font-bold py-8 text-center">暂无数据</p>
                ) : (
                  <div className="space-y-2">
                    {articles.map((a, i) => (
                      <div key={a.articleId} className="flex items-center justify-between border-2 border-black p-3">
                        <div className="flex items-center gap-3">
                          <span className={cn("font-comic text-2xl w-8", i < 3 && "text-comic-red")}>
                            {i + 1}
                          </span>
                          <span className="font-bold text-lg truncate max-w-md">{a.title}</span>
                        </div>
                        <span className="font-bold text-sm flex-shrink-0">{a.views} 次阅读</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {subTab === 'recent' && (
            <motion.div key="recent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="comic-panel bg-white p-6">
                <h3 className="text-xl font-black mb-4 uppercase">最近访问记录</h3>
                {recent.length === 0 ? (
                  <p className="text-gray-500 font-bold py-8 text-center">暂无数据</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-4 border-black text-left">
                          <th className="p-2 font-black uppercase text-sm">时间</th>
                          <th className="p-2 font-black uppercase text-sm">IP</th>
                          <th className="p-2 font-black uppercase text-sm">地区</th>
                          <th className="p-2 font-black uppercase text-sm">页面</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map(v => (
                          <tr key={v.id} className="border-b-2 border-gray-300 hover:bg-comic-yellow/10 font-bold text-sm">
                            <td className="p-2 whitespace-nowrap">
                              {new Date(v.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-2 font-mono">{v.ip}</td>
                            <td className="p-2">{v.country === 'Unknown' ? '-' : `${v.country} ${v.city}`}</td>
                            <td className="p-2">{PAGE_LABELS[v.page] || v.page}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {recentTotalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2 flex-wrap border-t-2 border-black pt-4">
                    <button
                      onClick={() => setRecentPage(p => Math.max(1, p - 1))}
                      disabled={recentPage === 1}
                      className="px-3 py-1 border-2 border-black font-black text-sm disabled:opacity-30 bg-white"
                    >
                      上一页
                    </button>
                    {Array.from({ length: recentTotalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === recentTotalPages || Math.abs(p - recentPage) <= 1)
                      .reduce<(number | 'e')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('e');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, i) =>
                        item === 'e' ? <span key={`e-${i}`} className="font-black px-1">...</span> : (
                          <button
                            key={item}
                            onClick={() => setRecentPage(item)}
                            className={cn(
                              "w-8 h-8 border-2 border-black font-black text-sm transition-transform",
                              recentPage === item ? "bg-black text-white translate-y-1" : "bg-white hover:-translate-y-1"
                            )}
                          >
                            {item}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => setRecentPage(p => Math.min(recentTotalPages, p + 1))}
                      disabled={recentPage === recentTotalPages}
                      className="px-3 py-1 border-2 border-black font-black text-sm disabled:opacity-30 bg-white"
                    >
                      下一页
                    </button>
                    <div className="flex items-center gap-1 ml-2">
                      <input
                        type="number"
                        min={1}
                        max={recentTotalPages}
                        value={recentJump}
                        onChange={e => setRecentJump(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const p = parseInt(recentJump);
                            if (p >= 1 && p <= recentTotalPages) { setRecentPage(p); setRecentJump(''); }
                          }
                        }}
                        placeholder="页码"
                        className="w-12 border-2 border-black p-1 font-bold text-center text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
