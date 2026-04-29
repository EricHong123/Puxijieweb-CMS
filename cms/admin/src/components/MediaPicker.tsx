import { useEffect, useState } from 'react';
import api from '@/api/client';
import { X, Upload, Search, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  variants: { publicUrl?: string };
  file_size_bytes: number;
}

interface MediaPickerProps {
  selected: string[]; // media IDs
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
      {/* Trigger area */}
      <div className="space-y-2">
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const item = items.find((i) => i.id === id);
              return (
                <div key={id} className="relative w-20 h-20 rounded-lg border overflow-hidden bg-slate-100">
                  {item?.variants?.publicUrl ? (
                    <img src={item.variants.publicUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 m-auto mt-6 text-slate-300" />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelect(selected.filter((s) => s !== id))}
                    className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full hover:bg-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-lg text-sm text-slate-500 hover:border-primary hover:text-primary transition-colors"
        >
          <Upload className="h-4 w-4" />
          {selected.length > 0 ? '更换图片' : '添加图片'}
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-slate-900">选择图片</h3>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:opacity-90">
                <Upload className="h-4 w-4" />
                {uploading ? '上传中...' : '上传新图片'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">加载中...</div>
              ) : items.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">暂无图片</div>
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
                          'relative aspect-square rounded-lg border-2 overflow-hidden bg-slate-100 transition-all',
                          isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-slate-300'
                        )}
                      >
                        {item.variants?.publicUrl ? (
                          <img src={item.variants.publicUrl} alt={item.original_filename} className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-8 h-8 m-auto mt-[calc(50%-16px)] text-slate-300" />
                        )}
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                          <div className="text-[10px] text-white truncate">{item.original_filename}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-sm text-muted-foreground">
                {selected.length} 张已选
              </span>
              <button
                onClick={() => setOpen(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
