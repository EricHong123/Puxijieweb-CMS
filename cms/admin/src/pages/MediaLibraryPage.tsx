import { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/api/client';
import { useToast } from '@/lib/toast';
import { Upload, Trash2, Copy, Image, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SkeletonMediaGrid } from '@/components/SkeletonCard';

interface MediaItem {
  id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  variants: { publicUrl?: string };
  created_at: string;
}

const PAGE_SIZE = 20;

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/media', {
      params: { page, limit: PAGE_SIZE, search: search || undefined },
    });
    if (data.success) {
      setItems(data.data.items);
      setTotal(data.data.total || 0);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

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
      setPage(1);
      fetchMedia();
    } catch (err: any) {
      toast.error('上传失败');
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
    toast.success('URL 已复制');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-charcoal">媒体库</h1>
          <p className="text-sm text-warm-charcoal-muted mt-1">{total} 个文件</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-charcoal-muted/60" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="搜索文件名..."
              className="pl-9 w-56"
            />
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4" />
            {uploading ? '上传中...' : '上传图片'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {loading ? (
          <SkeletonMediaGrid count={10} />
        ) : items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-warm-charcoal-muted">
            <Image className="h-10 w-10 mx-auto mb-2 text-warm-charcoal-muted/30" />
            暂无图片，点击上传
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} padding="none" className="group relative overflow-hidden">
              <div className="aspect-square bg-[hsl(var(--secondary))] flex items-center justify-center overflow-hidden">
                {item.variants?.publicUrl ? (
                  <img src={item.variants.publicUrl} alt={item.original_filename} className="w-full h-full object-cover" />
                ) : (
                  <Image className="h-8 w-8 text-warm-charcoal-muted/30" />
                )}
              </div>
              <div className="p-2">
                <div className="text-xs font-medium text-warm-charcoal truncate" title={item.original_filename}>
                  {item.original_filename}
                </div>
                <div className="text-xs text-warm-charcoal-muted">{(item.file_size_bytes / 1024).toFixed(0)} KB</div>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-paper flex items-center justify-center gap-2">
                {item.variants?.publicUrl && (
                  <button onClick={() => copyUrl(item.variants.publicUrl!)} className="p-2 bg-[hsl(var(--card))] rounded-lg hover:bg-[hsl(var(--secondary))]" title="复制 URL">
                    <Copy className="h-4 w-4 text-warm-charcoal" />
                  </button>
                )}
                <button onClick={() => handleDelete(item.id, item.original_filename)} className="p-2 bg-[hsl(var(--card))] rounded-lg hover:bg-pastel-rose/8" title="删除">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <span className="text-sm text-warm-charcoal-muted">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
