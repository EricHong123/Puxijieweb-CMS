import { useEffect, useState } from 'react';
import api from '@/api/client';
import { X, Upload, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MediaItem {
  id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  variants: { publicUrl?: string };
  file_size_bytes: number;
}

interface MediaPickerProps {
  selected: string[];
  onSelect: (ids: string[]) => void;
  multiple?: boolean;
}

export default function MediaPicker({ selected, onSelect, multiple = true }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    const { data } = await api.get('/media', { params: { limit: '50' } });
    if (data.success) setItems(data.data.items);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchMedia();
  }, [open]);

  const toggleItem = (id: string) => {
    if (multiple) {
      onSelect(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    } else {
      onSelect(selected.includes(id) ? [] : [id]);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setItems((prev) => [data.data, ...prev]);
        if (!multiple) onSelect([data.data.id]);
      }
    } catch {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const item = items.find((i) => i.id === id);
              return (
                <div key={id} className="relative w-20 h-20 rounded-lg border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--secondary))] shadow-paper-xs">
                  {item?.variants?.publicUrl ? (
                    <img src={item.variants.publicUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 m-auto mt-6 text-warm-charcoal-muted/40" />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelect(selected.filter((s) => s !== id))}
                    className="absolute top-1 right-1 p-0.5 bg-warm-charcoal/50 text-white rounded-full hover:bg-pastel-rose"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <Button variant="outline" type="button" onClick={() => setOpen(true)} className="border-dashed border-2">
          <Upload className="h-4 w-4" />
          {selected.length > 0 ? '更换图片' : '添加图片'}
        </Button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-warm-charcoal/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-[hsl(var(--card))] rounded-xl shadow-paper-lg w-full max-w-2xl max-h-[80vh] flex flex-col m-4 animate-paper-in">
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
              <h3 className="font-semibold text-warm-charcoal">选择图片</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 border-b border-[hsl(var(--border))]">
              <label className="inline-flex">
                <Button as-child>
                  <span>
                    <Upload className="h-4 w-4" />
                    {uploading ? '上传中...' : '上传新图片'}
                  </span>
                </Button>
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="py-12 text-center text-warm-charcoal-muted text-sm">加载中...</div>
              ) : items.length === 0 ? (
                <div className="py-12 text-center text-warm-charcoal-muted text-sm">暂无图片</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {items.map((item) => {
                    const isSelected = selected.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          'relative aspect-square rounded-lg border-2 overflow-hidden bg-[hsl(var(--secondary))] transition-all duration-paper',
                          isSelected ? 'border-pastel-blue ring-2 ring-pastel-blue/20 shadow-paper-sm' : 'border-transparent hover:border-[hsl(var(--border))]'
                        )}
                      >
                        {item.variants?.publicUrl ? (
                          <img src={item.variants.publicUrl} alt={item.original_filename} className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-8 h-8 m-auto mt-[calc(50%-16px)] text-warm-charcoal-muted/30" />
                        )}
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-pastel-blue rounded-full flex items-center justify-center shadow-paper-xs">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-warm-charcoal/60 to-transparent p-1.5">
                          <div className="text-[10px] text-white truncate">{item.original_filename}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-[hsl(var(--border))]">
              <span className="text-sm text-warm-charcoal-muted">{selected.length} 张已选</span>
              <Button onClick={() => setOpen(false)}>确定</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
