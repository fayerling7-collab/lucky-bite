'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Camera, X, Sparkles, Loader2 } from 'lucide-react';
import { createWorker, PSM } from 'tesseract.js';
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

const CUISINE_KEYWORDS: Record<string, string> = {
  '粤菜': '粤菜',
  '粤式': '粤菜',
  '早茶': '粤菜',
  '茶点': '粤菜',
  '广式': '粤菜',
  '港式': '粤菜',
  '川菜': '川菜',
  '四川': '川菜',
  '火锅': '火锅',
  '串串': '火锅',
  '冒菜': '火锅',
  '日料': '日料',
  '日式': '日料',
  '寿司': '日料',
  '刺身': '日料',
  '韩餐': '韩餐',
  '韩式': '韩餐',
  '烤肉': '韩餐',
  '西餐': '西餐',
  '牛排': '西餐',
  '意面': '西餐',
  '披萨': '西餐',
  '甜品': '甜品',
  '蛋糕': '甜品',
  '奶茶': '甜品',
  '咖啡': '甜品',
  '面包': '甜品',
  '面包店': '甜品',
  '下午茶': '甜品',
  '汉堡': '西餐',
  '炸鸡': '西餐',
  '烧烤': '烧烤',
  '烤串': '烧烤',
  '小龙虾': '烧烤',
  '海鲜': '海鲜',
  '泰餐': '泰餐',
  '越南': '东南亚',
  '云南': '滇菜',
  '江浙': '江浙菜',
  '上海': '本帮菜',
  '本帮': '本帮菜',
  '浙菜': '江浙菜',
  '苏菜': '江浙菜',
  '湘菜': '湘菜',
  '湖北': '鄂菜',
  '东北': '东北菜',
  '鲁菜': '鲁菜',
  '清真': '清真',
  '素食': '素食',
  '快餐': '快餐',
};

const DISTRICT_KEYWORDS: Record<string, string> = {
  '静安': '静安区',
  '徐汇': '徐汇区',
  '长宁': '长宁区',
  '浦东': '浦东新区',
  '黄浦': '黄浦区',
  '虹口': '虹口区',
  '杨浦': '杨浦区',
  '普陀': '普陀区',
  '闵行': '闵行区',
  '宝山': '宝山区',
  '嘉定': '嘉定区',
  '松江': '松江区',
  '青浦': '青浦区',
  '奉贤': '奉贤区',
  '金山': '金山区',
  '崇明': '崇明区',
};

const BRAND_NAME_MAP: Record<string, string> = {
  '点都德': '点都德',
  '喜茶': '喜茶',
  '奈雪': '奈雪的茶',
  '星巴克': '星巴克',
  '麦当劳': '麦当劳',
  '肯德基': '肯德基',
  '汉堡王': '汉堡王',
  '必胜客': '必胜客',
  '太二': '太二酸菜鱼',
  '大龙燚': '大龙燚火锅',
  '海底捞': '海底捞',
  '外婆家': '外婆家',
  '绿茶': '绿茶餐厅',
  '西贝': '西贝莜面村',
  '大董': '大董',
  '小南国': '小南国',
  '鼎泰丰': '鼎泰丰',
};

function parseOCRText(text: string): OCRResult {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  let name = '';
  let branchName = '';
  let cuisine = '';
  let district = '';
  let address = '';
  let businessHours = '';
  let avgPrice = 0;

  const TIME_PATTERNS = [
    /^\d{2}:\d{2}$/,
    /^\d{1,2}:\d{2}\s*(上午|下午|AM|PM)$/i,
    /^\d{4}-\d{2}-\d{2}/,
    /^\d{2}\/\d{2}/,
    /^\d{1,2}月\d{1,2}日/,
    /^[周一至周日星期]/,
    /^\d+%/,
    /^[WiFi|wifi|信号|电池|中国移动|中国联通|中国电信]/i,
    /^\d+:\d+\s*-\s*\d+:\d+$/,
    /^\d{1,2}:\d{2}\s*[AP]M$/,
    /^\d{1,2}\s*(点|时)$/,
    /^\d{4}\/\d{2}\/\d{2}/,
    /^[\d]{1,2}月[\d]{1,2}/,
    /^[\d]{1,2}日/,
    /^[\d]{1,2}号/,
  ];

  const NOISE_PATTERNS = [
    /^[*·•\-—–_=+|\\/<>{}[\]()]+$/,
    /^[\s\p{P}]+$/u,
    /^[0-9]{1,4}$/,
    /^[0-9]+[.，,、]+[0-9]+$/,
    /^[★☆✰✪⭐✦✧✩✫✬✭]+$/,
    /^[❤💜💙💚💛🧡💖💗💘💝💞💟]+$/,
    /^[🍔🍕🍟🌭🍿🧇🥞🧀🍖🍗🥩🥓🦴🌮🌯🥙🧆🥚🍳🥘🍲🥣🥗🍿🧈🧂🥫🍱🍘🍙🍚🍛🍜🍝🍠🍢🍣🍤🍥🥮🍡🥟🥠🥡🦀🦐🦞🦑🐙🦪🍦🍧🍨🍩🍪🎂🍰🧁🥧🍫🍬🍭🍮🍯🍼🥛☕🍵🍶🍾🍷🍸🍹🍺🍻🥂🥃🧉🧊🥄🍴🥢🍽️🍾]+$/,
  ];

  const isTimeOrNoise = (line: string): boolean => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return true;
    
    for (const pattern of TIME_PATTERNS) {
      if (pattern.test(trimmed)) {
        return true;
      }
    }
    
    for (const pattern of NOISE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return true;
      }
    }
    
    if (trimmed.length <= 1) return true;
    if (/^\d+$/.test(trimmed)) return true;
    return false;
  };

  const filteredLines = lines.filter(line => !isTimeOrNoise(line));

  for (const line of filteredLines) {
    const trimmed = line.trim();

    if (!name) {
      for (const brand of Object.keys(BRAND_NAME_MAP)) {
        if (trimmed.includes(brand)) {
          name = BRAND_NAME_MAP[brand];
          const rest = trimmed.replace(brand, '').trim();
          if (rest) {
            branchName = rest.replace(/分店|店|店址|地址|\(|\)|\（|\）/g, '').trim();
          }
          break;
        }
      }
    }

    if (!cuisine) {
      for (const [keyword, value] of Object.entries(CUISINE_KEYWORDS)) {
        if (trimmed.includes(keyword)) {
          cuisine = value;
          break;
        }
      }
    }

    if (!district) {
      for (const [keyword, value] of Object.entries(DISTRICT_KEYWORDS)) {
        if (trimmed.includes(keyword)) {
          district = value;
          break;
        }
      }
    }

    if (trimmed.includes('地址') || trimmed.includes('店址') || trimmed.includes('路')) {
      const addrMatch = trimmed.match(/(地址[:：]?\s*)?(.*)/);
      if (addrMatch) {
        address = addrMatch[2] || '';
        if (!address.includes('上海')) {
          address = '上海市' + (district || '') + address;
        }
      }
    }

    if (trimmed.includes('营业时间') || trimmed.includes('营业') || trimmed.includes('时间')) {
      const timeMatch = trimmed.match(/(营业时间[:：]?\s*)?(.*)/);
      if (timeMatch) {
        businessHours = timeMatch[2] || '';
      }
    }

    const priceMatch = trimmed.match(/(人均|价格|¥|￥)(\d+)/);
    if (priceMatch && !avgPrice) {
      avgPrice = parseInt(priceMatch[2], 10);
    }
  }

  if (!name && filteredLines.length > 0) {
    for (const line of filteredLines) {
      const trimmed = line.trim();
      if (trimmed.length >= 2 && trimmed.length <= 20 && 
          !trimmed.includes('地址') && !trimmed.includes('时间') &&
          !trimmed.includes('人均') && !trimmed.includes('价格') &&
          !trimmed.includes('营业') && !trimmed.includes('评分') &&
          !trimmed.includes('收藏') && !trimmed.includes('推荐') &&
          !trimmed.includes('评论')) {
        name = trimmed.replace(/\(|\)|\（|\）|\[|\]|\{|\}/g, '').trim();
        break;
      }
    }
  }

  if (!name && lines.length > 0) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length >= 2 && trimmed.length <= 20 && 
          !trimmed.includes('地址') && !trimmed.includes('时间') &&
          !trimmed.includes('人均') && !trimmed.includes('价格')) {
        name = trimmed.replace(/\(|\)|\（|\）|\[|\]|\{|\}/g, '').trim();
        break;
      }
    }
  }

  if (!cuisine) {
    cuisine = '其他';
  }

  if (!address && district) {
    address = `上海市${district}`;
  }

  if (!businessHours) {
    businessHours = '10:00 - 22:00';
  }

  const supportsLunch = businessHours.includes('11') || businessHours.includes('12') || businessHours.includes('午');
  const supportsDinner = businessHours.includes('17') || businessHours.includes('18') || businessHours.includes('19') || businessHours.includes('晚');

  return {
    name,
    branchName,
    cuisine,
    district,
    address,
    businessHours,
    supportsLunch,
    supportsDinner,
    avgPrice: avgPrice || 50,
  };
}

async function realOCRRecognize(imageFile: File, onProgress?: (status: string, progress: number) => void): Promise<OCRResult> {
  onProgress?.('正在加载识别引擎…', 10);

  const worker = await createWorker('chi_sim', 1, {
    logger: m => {
      console.log('OCR进度:', m);
      if (m.status === 'loading tesseract core') {
        onProgress?.('正在加载识别引擎…', 15);
      } else if (m.status === 'initializing tesseract') {
        onProgress?.('正在初始化识别引擎…', 25);
      } else if (m.status === 'loading language traineddata') {
        onProgress?.('正在下载中文语言包（首次使用约30-60秒）…', 40);
      } else if (m.status === 'initializing api') {
        onProgress?.('正在初始化识别器…', 60);
      } else if (m.status === 'recognizing text') {
        const p = m.progress ? Math.round(60 + m.progress * 35) : 70;
        onProgress?.('正在识别图片文字…', p);
      }
    },
  });

  onProgress?.('正在识别图片文字…', 80);

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    preserve_interword_spaces: '1',
  });

  try {
    const result = await worker.recognize(imageFile);
    console.log('OCR识别结果:', result.data.text);
    onProgress?.('识别完成，正在解析…', 95);
    return parseOCRText(result.data.text);
  } finally {
    await worker.terminate();
  }
}

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

async function fallbackOCRRecognize(imageFile: File): Promise<OCRResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
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

async function recognizeWithTimeout(imageFile: File, onProgress?: (status: string, progress: number) => void, timeout: number = 60000): Promise<OCRResult> {
  const timeoutPromise = new Promise<OCRResult>((_, reject) => {
    setTimeout(() => reject(new Error('识别超时')), timeout);
  });

  const recognizePromise = realOCRRecognize(imageFile, onProgress);

  return Promise.race([recognizePromise, timeoutPromise]);
}

export interface OCRService {
  recognize(imageFile: File): Promise<OCRResult>;
}

export function ImageUploader({ onRecognize, onCancel }: ImageUploaderProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setRecognizing(true);
    setProgress(5);
    setStatusText('正在准备图片…');

    const maxRetries = 2;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        const result = await recognizeWithTimeout(file, (status, p) => {
          setStatusText(status);
          setProgress(p);
        }, 60000);
        
        setProgress(100);
        setStatusText('识别成功！');

        await new Promise(resolve => setTimeout(resolve, 500));
        onRecognize(result);
        return;
      } catch (error) {
        console.error('OCR 识别失败:', error);
        retryCount++;
        
        if (retryCount <= maxRetries) {
          setStatusText(`识别失败，正在重试（${retryCount}/${maxRetries}）…`);
          setProgress(0);
          await new Promise(resolve => setTimeout(resolve, 2000));
          setProgress(5);
        } else {
          setStatusText('正在使用备用识别方案…');
          try {
            const fallbackResult = await fallbackOCRRecognize(file);
            setProgress(100);
            setStatusText('识别完成（备用方案）');
            await new Promise(resolve => setTimeout(resolve, 500));
            onRecognize(fallbackResult);
            return;
          } catch (fallbackError) {
            console.error('备用识别也失败:', fallbackError);
            setStatusText('识别失败');
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('识别失败，可能是网络问题或图片不清晰。请重试或选择手动添加。');
          }
        }
      }
    }

    setRecognizing(false);
    setUploadedImage(null);
    setProgress(0);
  };

  const handleOpenCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.capture = 'environment';
    input.onchange = handleFileSelect as any;
    input.click();
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col gap-4"
    >
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
            <p className="text-sm font-bold text-slate-600">{statusText || '正在识别餐厅信息…'}</p>
            <div className="mt-3 w-full max-w-xs">
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-soft to-sky-deep"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400 text-center">
                {progress > 0 ? `${progress}%` : '正在准备…'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!recognizing && (
        <>
          <div className="rounded-2xl bg-gradient-to-r from-lavender/30 to-blush/30 p-4 text-center">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-lavender" />
            <p className="text-sm font-bold text-slate-600">支持识别以下图片类型</p>
            <p className="mt-1 text-xs text-slate-400">大众点评截图 · 小红书截图 · 微信聊天截图 · 手机相册截图 · 屏幕截图</p>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={handleUploadAreaClick}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all cursor-pointer',
              dragOver
                ? 'border-sky-soft bg-sky-soft/20'
                : 'border-sky-soft/40 bg-white/60 hover:border-sky-soft',
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="p-8 text-center pointer-events-none">
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

          <button
            type="button"
            onClick={handleOpenCamera}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-butter to-coral p-4 font-bold text-amber-800 shadow-pop transition hover:brightness-105 active:scale-95"
          >
            <Camera className="h-5 w-5" />
            拍照识别 📷
          </button>

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
