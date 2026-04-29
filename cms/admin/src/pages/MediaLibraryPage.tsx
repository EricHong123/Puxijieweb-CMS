import { useEffect, useState, useRef } from 'react';
import api from '@/api/client';
import { Upload, Trash2, Copy, Search, Image } from 'lucide-react';

interface MediaItem {
  id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  variants: { publicUrl?: string };
  created_at: string;
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    const { data } = await api.get('/media');
    if (data.success) setItems(data.data.items);
    setLoading(false);
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchMedia();
    } catch (err: any) {
      alert('上传失败');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除 "${name}"？`)) return;
    await api.delete(`/media/${id}`);
    fetchMedia();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL 已复制');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">媒体库</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} 个文件</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? '上传中...' : '上传图片'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">加载中...</div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Image className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            暂无图片，点击上传
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                {item.variants?.publicUrl ? (
                  <img src={item.variants.publicUrl} alt={item.original_filename} className="w-full h-full object-cover" />
                ) : (
                  <Image className="h-8 w-8 text-slate-300" />
                )}
              </div>
              <div className="p-2">
                <div className="text-xs font-medium text-slate-700 truncate" title={item.original_filename}>
                  {item.original_filename}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(item.file_size_bytes / 1024).toFixed(0)} KB
                </div>
              </div>
              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {item.variants?.publicUrl && (
                  <button onClick={() => copyUrl(item.variants.publicUrl!)} className="p-2 bg-white rounded-lg hover:bg-slate-100" title="复制 URL">
                    <Copy className="h-4 w-4 text-slate-700" />
                  </button>
                )}
                <button onClick={() => handleDelete(item.id, item.original_filename)} className="p-2 bg-white rounded-lg hover:bg-red-50" title="删除">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
