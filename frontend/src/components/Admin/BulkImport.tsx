import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, X, CheckCircle, XCircle, FileJson, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImportResult {
  filename: string;
  success: boolean;
  title?: string;
  id?: number;
  error?: string;
}

export default function BulkImport({ open, onClose, onSaved }: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem('adminToken');

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const jsonFiles = Array.from(newFiles).filter(f => f.name.endsWith('.json'));
    setFiles(prev => [...prev, ...jsonFiles]);
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const startImport = async () => {
    if (files.length === 0) return;
    setImporting(true);
    setResults([]);
    setProgress(0);

    const allResults: ImportResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('files', files[i]);

      try {
        const res = await axios.post('/api/articles/bulk-import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        allResults.push(...res.data.results);
      } catch (err: any) {
        allResults.push({
          filename: files[i].name,
          success: false,
          error: err.response?.data?.message || '上传失败',
        });
      }
      setResults([...allResults]);
      setProgress(((i + 1) / files.length) * 100);
    }

    setImporting(false);
    onSaved();
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const done = results.length > 0 && !importing;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="comic-panel bg-white w-full max-w-lg border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="bg-black text-white p-4 flex items-center justify-between">
          <h3 className="text-xl font-comic uppercase">一键导入文章</h3>
          <button onClick={onClose} disabled={importing} className="w-8 h-8 bg-white text-black border-2 border-white flex items-center justify-center hover:bg-comic-red hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!importing && results.length === 0 && (
            <>
              <div
                className="border-4 border-dashed border-black p-8 text-center mb-4 cursor-pointer hover:bg-comic-yellow/10 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={e => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
              >
                <Upload className="w-10 h-10 mx-auto mb-2" />
                <p className="font-black text-lg">拖拽 JSON 文件到这里</p>
                <p className="font-bold text-sm text-gray-500">或点击选择文件（支持多选）</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                multiple
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />

              {files.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1 mb-4">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between border-2 border-black p-2 text-sm font-bold">
                      <div className="flex items-center gap-2 truncate">
                        <FileJson className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{f.name}</span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-comic-red ml-2 flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={startImport}
                disabled={files.length === 0}
                className="comic-button bg-comic-blue text-white w-full text-center disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" /> 开始导入 ({files.length} 个文件)
              </button>
            </>
          )}

          {importing && (
            <div className="py-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-black text-lg">正在导入...</span>
              </div>
              <div className="border-4 border-black h-8 bg-gray-200">
                <motion.div
                  className="h-full bg-comic-blue"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="text-center font-bold text-sm mt-2">{Math.round(progress)}%</p>
            </div>
          )}

          {done && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 justify-center mb-2">
                {successCount > 0 && (
                  <span className="font-black text-zaun-green flex items-center gap-1">
                    <CheckCircle className="w-5 h-5" /> {successCount} 成功
                  </span>
                )}
                {failCount > 0 && (
                  <span className="font-black text-comic-red flex items-center gap-1">
                    <XCircle className="w-5 h-5" /> {failCount} 失败
                  </span>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1">
                {results.map((r, i) => (
                  <div key={i} className={`border-2 border-black p-2 text-sm font-bold flex items-center gap-2 ${r.success ? 'bg-zaun-green/10' : 'bg-comic-red/10'}`}>
                    {r.success ? (
                      <CheckCircle className="w-4 h-4 text-zaun-green flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-comic-red flex-shrink-0" />
                    )}
                    <span className="truncate">{r.filename}</span>
                    {r.success && <span className="text-gray-500 text-xs flex-shrink-0">ID:{r.id}</span>}
                    {!r.success && <span className="text-comic-red text-xs flex-shrink-0">{r.error}</span>}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t-4 border-black">
                <button
                  onClick={() => { setFiles([]); setResults([]); setProgress(0); }}
                  className="comic-button bg-comic-yellow text-black flex-1"
                >
                  继续导入
                </button>
                <button onClick={onClose} className="comic-button bg-black text-white flex-1">
                  完成
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
