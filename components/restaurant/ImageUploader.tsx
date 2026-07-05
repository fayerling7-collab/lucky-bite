'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Camera, X, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OCRResult {
  name: string;
  branchName: string;
  cuisine: string;
  district: string;
  address: string;
  businessHours: string;
  supportsLunch: boolean;
  supportsDinner: boolean;
  avgPrice: number;
}

interface ImageUploaderProps {
  onRecognize: (result: OCRResult) => void;
  onCancel: () => void;
}

// 模拟 OCR 识别结果（用于 V1 演示）
const MOCK_OCR_RESULTS: Record<string, OCRResult> = {
  'dianping': {
    name: '点都德',
    branchName: '静安寺店',
    cuisine: '粤菜',
    district: '静安区',
    address: '上海市静安区南京西路1601号越洋广场L3层',
    businessHours: '10:00 - 22:00',
    supportsLunch: true,
    supportsDinner: true,
    avgPrice: 85,
  },
  'xiaohongshu': {
    name: '山缓缓',
    branchName: '徐汇店',
    cuisine: '西餐',
    district: '徐汇区',
    address: '上海市徐汇区衡山路888号',
    businessHours: '11:00 - 21:30',
    supportsLunch: true,
    supportsDinner: true,
    avgPrice: 180,
  },
  'wechat': {
    name: '大龙燚火锅',
    branchName: '长宁店',
    cuisine: '火锅',
    district: '长宁区',
    address: '上海市长宁区定西路1288号',
    businessHours: '11:00 - 02:00',
    supportsLunch: true,
    supportsDinner: true,
    avgPrice: 150,
  },
  'default': {
    name: '喜茶',
    branchName: '陆家嘴店',
    cuisine: '甜品',
    district: '浦东新区',
    address: '上海市浦东新区世纪大道8号国金中心B1层',
    businessHours: '10:00 - 22:00',
    supportsLunch: false,
    supportsDinner: false,
    avgPrice: 25,
  },
};

// 预留的真实 OCR 接口类型（V2 可实现）
export interface OCRService {
  recognize(imageFile: File): Promise<OCRResult>;
}

/**
 * 模拟 OCR 识别（V1 演示用）
 * V2 可替换为真实的 OCR 服务如百度云、阿里云、腾讯云等
 */
async function mockOCRRecognize(imageFile: File): Promise<OCRResult> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // 根据文件名或大小模拟不同的识别结果
  const name = imageFile.name.toLowerCase();
  if (name.includes('点评') || name.includes('dianping')) {
    return MOCK_OCR_RESULTS['dianping'];
  }
  if (name.includes('小红') || name.includes('xiaohongshu')) {
    return MOCK_OCR_RESULTS['xiaohongshu'];
  }
  if (name.includes('微信') || name.includes('wechat')) {
    return MOCK_OCR_RESULTS['wechat'];
  }
  return MOCK_OCR_RESULTS['default'];
}

/** 图片上传 + OCR 识别组件 */
export function ImageUploader({ onRecognize, onCancel }: ImageUploaderProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await processFile(file);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  const processFile = async (file: File) => {
    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 开始识别
    setRecognizing(true);
    try {
      const result = await mockOCRRecognize(file);
      onRecognize(result);
    } catch (error) {
      console.error('OCR 识别失败:', error);
      alert('识别失败，请重试或手动添加');
    } finally {
      setRecognizing(false);
      setUploadedImage(null);
    }
  };

  const handleOpenCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = handleFileSelect as any;
    input.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col gap-4"
    >
      {/* 识别中状态 */}
      <AnimatePresence>
        {recognizing && uploadedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center rounded-3xl bg-white/80 p-8 backdrop-blur shadow-soft"
          >
            <div className="mb-4 h-48 w-48 rounded-2xl overflow-hidden">
              <img src={uploadedImage} alt="上传的图片" className="h-full w-full object-cover" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="mb-4"
            >
              <Loader2 className="h-8 w-8 text-sky-deep" />
            </motion.div>
            <p className="text-sm font-bold text-slate-600">正在识别餐厅信息…</p>
            <p className="mt-1 text-xs text-slate-400">✨ AI 正在分析图片内容</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!recognizing && (
        <>
          {/* 提示文字 */}
          <div className="rounded-2xl bg-gradient-to-r from-lavender/30 to-blush/30 p-4 text-center">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-lavender" />
            <p className="text-sm font-bold text-slate-600">支持识别以下图片类型</p>
            <p className="mt-1 text-xs text-slate-400">大众点评截图 · 小红书截图 · 微信聊天截图 · 手机相册截图 · 屏幕截图</p>
          </div>

          {/* 上传区域 */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all',
              dragOver
                ? 'border-sky-soft bg-sky-soft/20'
                : 'border-sky-soft/40 bg-white/60 hover:border-sky-soft',
            )}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
            />
            <div className="p-8 text-center">
              <div className={cn(
                'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br transition',
                dragOver ? 'from-sky-soft to-sky-deep' : 'from-sky-soft/60 to-sky-deep/40',
              )}>
                <ImagePlus className="h-10 w-10 text-white" />
              </div>
              <p className="text-base font-bold text-slate-600">
                {dragOver ? '松开上传图片' : '点击或拖拽上传图片'}
              </p>
              <p className="mt-1 text-xs text-slate-400">支持 JPG、PNG、WebP 格式</p>
            </div>
          </div>

          {/* 相机按钮 */}
          <button
            type="button"
            onClick={handleOpenCamera}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-butter to-coral p-4 font-bold text-amber-800 shadow-pop transition hover:brightness-105 active:scale-95"
          >
            <Camera className="h-5 w-5" />
            拍照识别 📷
          </button>

          {/* 返回按钮 */}
          <button
            type="button"
            onClick={onCancel}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/50 p-3 font-medium text-slate-500 transition hover:bg-white/80"
          >
            <X className="h-4 w-4" />
            返回选择
          </button>
        </>
      )}
    </motion.div>
  );
}
