
import React, { useCallback, useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog';
import { cn } from '@/shared/lib/utils';
import { getImageHeight, getImageSrc, getImageSrcSet, getImageWidth } from '@/shared/lib/resolveImage.js';

function ProductGallery({ images, productName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const galleryImages = Array.isArray(images) ? images : [images];
  const count = galleryImages.length;
  const modelCode = String(productName || '').split(/\s+/)[0];

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? count - 1 : prev - 1));
  }, [count]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === count - 1 ? 0 : prev + 1));
  }, [count]);

  useEffect(() => {
    if (!lightboxOpen || count <= 1) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, count, handlePrevious, handleNext]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-[#ebe8df] shadow-sm group/main">
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-gray-900/25 via-transparent to-transparent" />
        <AnimatePresence mode="wait">
          <m.img
            key={selectedIndex}
            src={getImageSrc(galleryImages[selectedIndex])}
            srcSet={getImageSrcSet(galleryImages[selectedIndex])}
            sizes="(max-width: 1024px) 100vw, min(900px, min(55vw, 480px))"
            alt={`${modelCode} waterproof Bluetooth speaker — product photo ${selectedIndex + 1}`}
            width={getImageWidth(galleryImages[selectedIndex], 900)}
            height={getImageHeight(galleryImages[selectedIndex], 900)}
            decoding="async"
            className="relative z-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 z-[2] cursor-zoom-in border-0 bg-transparent p-0"
          aria-label={`放大查看 ${productName}`}
        />

        <div className="pointer-events-none absolute bottom-3 right-3 z-[3] flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 text-xs text-white/90 opacity-0 backdrop-blur-sm transition-opacity group-hover/main:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden />
          <span>点击放大</span>
        </div>

        {count > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto absolute left-4 top-1/2 z-[3] -translate-y-1/2 rounded-md bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto absolute right-4 top-1/2 z-[3] -translate-y-1/2 rounded-md bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className={cn(
            'left-0 top-0 z-[100] flex h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none translate-x-0 translate-y-0 gap-0 border-0 bg-zinc-950/98 p-0 shadow-none sm:rounded-none',
            '[&>button]:right-4 [&>button]:top-4 [&>button]:z-[110] [&>button]:text-white [&>button]:hover:bg-white/15 [&>button]:hover:opacity-100'
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            {productName} — 大图预览
          </DialogTitle>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 pt-14">
            <img
              src={getImageSrc(galleryImages[selectedIndex])}
              srcSet={getImageSrcSet(galleryImages[selectedIndex])}
              sizes="100vw"
              alt={`${modelCode} waterproof Bluetooth speaker — large image ${selectedIndex + 1} of ${count}`}
              width={getImageWidth(galleryImages[selectedIndex], 1200)}
              height={getImageHeight(galleryImages[selectedIndex], 1200)}
              className="max-h-[min(85dvh,900px)] max-w-full object-contain select-none"
              draggable={false}
              decoding="async"
            />
            {count > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 z-[3] h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 sm:left-6"
                  onClick={handlePrevious}
                  aria-label="上一张"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 z-[3] h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 sm:right-6"
                  onClick={handleNext}
                  aria-label="下一张"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <p className="pointer-events-none absolute bottom-4 left-1/2 z-[3] -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/90">
                  {selectedIndex + 1} / {count}
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {count > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`group aspect-square overflow-hidden rounded-md border-2 transition-all duration-200 ${
                index === selectedIndex
                  ? 'border-primary'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <img
                src={getImageSrc(image)}
                srcSet={getImageSrcSet(image)}
                sizes="80px"
                alt={`${modelCode} waterproof Bluetooth speaker — thumbnail ${index + 1}`}
                width={getImageWidth(image, 300)}
                height={getImageHeight(image, 300)}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
