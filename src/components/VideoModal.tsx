"use client";

import { Dialog, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoModalProps {
  videoSrc: string;
  thumbnailSrc?: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  showThumbnailPreview?: boolean;
}

export function VideoModal({
  videoSrc,
  thumbnailSrc,
  title,
  children,
  className,
  showThumbnailPreview = false,
}: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  // Auto-play when modal opens
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
    }
  }, [isOpen]);

  const VideoThumbnail = () => (
    <div className="aspect-video bg-gray-800 border border-gray-700 rounded-lg relative overflow-hidden cursor-pointer hover:border-green-500/50 transition-colors group">
      <video className="w-full h-full object-cover" muted preload="metadata">
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
        <div className="bg-green-500/20 rounded-full p-6 group-hover:bg-green-500/30 transition-colors">
          <div className="bg-green-500 rounded-full p-4 group-hover:bg-green-400 transition-colors">
            <Play className="h-8 w-8 text-black ml-1" />
          </div>
        </div>
      </div>
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-white text-sm font-medium">{title}</p>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={cn("cursor-pointer", className)}>
          {showThumbnailPreview ? <VideoThumbnail /> : children}
        </div>
      </DialogTrigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] max-w-7xl w-[95vw] h-[90vh] p-0 border-0 bg-black rounded-lg shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>
              {title || "Video Player"}
            </DialogPrimitive.Title>
          </VisuallyHidden.Root>
          <div className="relative w-full h-full flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 rounded-full p-3 transition-colors"
              aria-label="Close video"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Video container */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-5xl aspect-video relative rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={thumbnailSrc}
                  preload="metadata"
                  controls
                  autoPlay
                  controlsList="nodownload"
                >
                  <source src={videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Title */}
            {title && (
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white text-xl font-semibold bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                  {title}
                </h3>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
