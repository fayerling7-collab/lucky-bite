'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, ArrowRight, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DianpingLinkParserProps {
  onParse: (data: DianpingParseResult) => void;
  onCancel: () => void;
}

interface DianpingParseResult {
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

// 菜系关键词映射
const CUISINE_MAP: Record<string, string> = {
  '粤菜': '粤菜', '广州菜': '粤菜', '广式': '粤菜', '港式': '粤菜', '茶点': '粤菜', '早茶': '粤菜',
  '川菜': '川菜', '四川菜': '川菜', '重庆菜': '川菜',
  '火锅': '火锅', '串串': '火锅',
  '日料': '日料', '日式': '日料', '寿司': '日料', '刺身': '日料', '居酒屋': '日料',
  '韩餐': '韩餐', '韩式': '韩餐', '烤肉': '韩餐',
  '西餐': '西餐', '牛排': '西餐', '意面': '西餐', '披萨': '西餐', '意式': '西餐',
  '甜品': '甜品', '奶茶': '甜品', '咖啡': '甜品', '蛋糕': '甜品', '下午茶': '甜品',
  '烧烤': '烧烤', '烤串': '烧烤',
  '江浙菜': '江浙菜', '本帮菜': '本帮菜', '上海菜': '本帮菜', '浙菜': '江浙菜',
  '湘菜': '湘菜', '湖北菜': '鄂菜',
  '东北菜': '东北菜', '西北菜': '西北菜',
  '云南菜': '滇菜', '泰餐': '泰餐', '东南亚': '东南亚',
  '快餐': '快餐', '汉堡': '快餐',
};

// 上海区域关键词
const DISTRICT_MAP: Record<string, string> = {
  '静安': '静安区', '徐汇': '徐汇区', '长宁': '长宁区', '浦东': '浦东新区',
  '黄浦': '黄浦区', '虹口': '虹口区', '杨浦': '杨浦区', '普陀': '普陀区',
  '闵行': '闵行区', '宝山': '宝山区', '嘉定': '嘉定区', '松江': '松江区',
  '青浦': '青浦区', '奉贤': '奉贤区', '金山': '金山区', '崇明': '崇明区',
};

// 从分享文本中直接提取餐厅信息
function parseDianpingShareText(text: string): DianpingParseResult | null {
  const cleanedText = text.replace(/[\n\r]+/g, '\n').trim();

  let name = '';
  let branchName = '';
  let cuisine = '';
  let district = '';
  let address = '';
  let avgPrice = 0;

  // 1. 提取餐厅名称：通常在【】中
  const bracketMatch = cleanedText.match(/【([^】]+)】/);
  if (bracketMatch) {
    const fullName = bracketMatch[1].trim();
    // 分离主名称和分店名：(日月光店) → branchName
    const branchMatch = fullName.match(/^(.+?)[（(]([^）)]+?店?)[）)]$/);
    if (branchMatch) {
      name = branchMatch[1].trim();
      const branch = branchMatch[2].trim();
      branchName = branch.endsWith('店') ? branch : branch + '店';
    } else {
      name = fullName;
    }
  }

  // 2. 提取人均价格：¥98/人 或 人均98 或 98/人
  const priceMatch = cleanedText.match(/[¥￥](\d+)\s*\/?\s*人/) || cleanedText.match(/人均[：:\s]*(\d+)/);
  if (priceMatch) {
    avgPrice = parseInt(priceMatch[1], 10);
  }

  // 3. 提取菜系
  for (const [keyword, value] of Object.entries(CUISINE_MAP)) {
    if (cleanedText.includes(keyword)) {
      cuisine = value;
      break;
    }
  }

  // 4. 提取地址：包含"路"、"号"、"室"等关键词的行
  const lines = cleanedText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // 排除包含链接的行
    if (trimmed.includes('http')) continue;
    // 排除包含评分的行
    if (trimmed.match(/[★☆✰]/) || trimmed.match(/^\d+\.\d+$/)) continue;
    // 排除包含价格的行
    if (trimmed.match(/[¥￥]\d+/) || trimmed.includes('人均')) continue;

    // 匹配地址行：包含路、号、室、街、弄、幢等
    if (trimmed.match(/[路号室街弄幢道]|广场|中心|大厦|商场|对面|楼上|楼下/)) {
      // 清理地址中的多余信息
      address = trimmed.replace(/^[地址：:、\s]+/, '').trim();
      break;
    }
  }

  // 5. 提取区域
  for (const [keyword, value] of Object.entries(DISTRICT_MAP)) {
    if (cleanedText.includes(keyword)) {
      district = value;
      break;
    }
  }

  // 6. 如果没有提取到名称，尝试从第一行提取
  if (!name && lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine && !firstLine.includes('http') && !firstLine.match(/[¥￥★☆]/)) {
      const cleanName = firstLine.replace(/[【】《》「」"'']/g, '').trim();
      if (cleanName.length >= 2 && cleanName.length <= 30) {
        const branchMatch = cleanName.match(/^(.+?)[（(]([^）)]+?店?)[）)]$/);
        if (branchMatch) {
          name = branchMatch[1].trim();
          const branch = branchMatch[2].trim();
          branchName = branch.endsWith('店') ? branch : branch + '店';
        } else {
          name = cleanName;
        }
      }
    }
  }

  // 如果还是没提取到名称，返回 null
  if (!name) return null;

  // 补全地址
  if (address && !address.includes('上海')) {
    address = `上海市${district || ''}${address}`;
  }
  if (!address && district) {
    address = `上海市${district}`;
  }

  // 补全菜系
  if (!cuisine) {
    cuisine = '其他';
  }

  // 补全营业时间
  const supportsLunch = true;
  const supportsDinner = true;

  return {
    name,
    branchName,
    cuisine,
    district,
    address,
    businessHours: '10:00 - 22:00',
    supportsLunch,
    supportsDinner,
    avgPrice: avgPrice || 80,
  };
}

// 检测是否包含大众点评链接
function hasDianpingContent(text: string): boolean {
  const cleanedText = text.replace(/[\n\r]/g, ' ');
  const urlPatterns = [
    /https?:\/\/[^\s]*dianping[^\s]*/gi,
    /https?:\/\/[^\s]*dpurl[^\s]*/gi,
    /https?:\/\/[^\s]*m\.dp[^\s]*/gi,
  ];
  for (const pattern of urlPatterns) {
    if (pattern.test(cleanedText)) return true;
  }
  // 也检测是否包含【】格式的餐厅名称
  if (/【[^】]+】/.test(text)) return true;
  // 检测是否包含人均价格
  if (/[¥￥]\d+\s*\/?\s*人/.test(text) || /人均[：:\s]*\d+/.test(text)) return true;
  return false;
}

export function DianpingLinkParser({ onParse, onCancel }: DianpingLinkParserProps) {
  const [url, setUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<DianpingParseResult | null>(null);

  const handleParse = async () => {
    if (!url.trim()) {
      setError('请粘贴大众点评分享内容');
      return;
    }

    const inputText = url.trim();

    if (!hasDianpingContent(inputText)) {
      setError('未识别到大众点评分享内容，请检查粘贴的内容是否完整');
      return;
    }

    setError('');
    setParsing(true);
    setPreview(null);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = parseDianpingShareText(inputText);

    if (result) {
      setPreview(result);
    } else {
      setError('无法从分享内容中提取餐厅信息，请尝试手动添加');
    }

    setParsing(false);
  };

  const handleConfirm = () => {
    if (preview) {
      onParse(preview);
    }
  };

  const handleCopyExample = () => {
    const example = `【陆小苑·啫煲·炒菜·糖水(日月光店)】
★★★★☆ 4.2
¥98/人
日月光中心广场 广州菜
徐家汇路618号2F-XJH17-A室（裕兴记对面）
https://m.dianping.com/shopinfo/xxx?msource=Appshare2021`;
    navigator.clipboard.writeText(example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col gap-4"
    >
      <div className="rounded-2xl bg-gradient-to-r from-coral/30 to-blush/30 p-4 text-center">
        <Link2 className="mx-auto mb-2 h-6 w-6 text-coral" />
        <p className="text-sm font-bold text-slate-600">大众点评分享导入</p>
        <p className="mt-1 text-xs text-slate-400">直接粘贴大众点评分享内容，自动提取餐厅信息</p>
      </div>

      <div className="rounded-3xl bg-white/80 p-6 backdrop-blur shadow-soft">
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            粘贴大众点评分享内容
          </label>
          <textarea
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
              setPreview(null);
            }}
            placeholder={'【餐厅名称(分店名)】\n★★★★☆ 4.2\n¥98/人\nXX路XX号\nhttps://m.dianping.com/...'}
            rows={5}
            className={cn(
              'w-full rounded-2xl border-2 border-sky-soft/40 bg-white/70 p-4 text-sm',
              'focus:outline-none focus:border-sky-soft',
              error && 'border-red-300 bg-red-50/50'
            )}
          />
          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyExample}
          className="mb-4 flex items-center gap-1 text-xs text-slate-400 hover:text-sky-deep transition"
        >
          <Copy className="h-3 w-3" />
          {copied ? '已复制示例格式' : '查看示例格式'}
        </button>

        {!preview ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleParse}
            disabled={parsing}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-3xl p-4 font-bold text-white shadow-pop transition',
              parsing
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-coral to-blush hover:brightness-105'
            )}
          >
            {parsing ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                正在解析…
              </>
            ) : (
              <>
                <Link2 className="h-5 w-5" />
                解析分享内容
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="rounded-2xl bg-gradient-to-br from-sky-soft/20 to-mint/20 p-4">
              <p className="mb-3 text-sm font-bold text-slate-600">📋 识别结果预览</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">餐厅名称</span>
                  <span className="font-bold text-slate-700">{preview.name}</span>
                </div>
                {preview.branchName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">分店</span>
                    <span className="font-medium text-slate-700">{preview.branchName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">菜系</span>
                  <span className="font-medium text-slate-700">{preview.cuisine}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">人均</span>
                  <span className="font-bold text-coral">¥{preview.avgPrice}</span>
                </div>
                {preview.district && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">区域</span>
                    <span className="font-medium text-slate-700">{preview.district}</span>
                  </div>
                )}
                {preview.address && (
                  <div className="flex justify-between gap-4">
                    <span className="shrink-0 text-slate-400">地址</span>
                    <span className="text-right text-xs text-slate-600">{preview.address}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 rounded-2xl bg-white/60 p-3 font-medium text-slate-500 transition hover:bg-white/80"
              >
                重新解析
              </button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-mint to-emerald-400 p-3 font-bold text-white shadow-pop transition hover:brightness-105"
              >
                <Check className="h-5 w-5" />
                确认导入
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="rounded-2xl bg-white/50 p-4">
        <p className="mb-3 text-sm font-bold text-slate-600">📱 使用步骤</p>
        <ol className="space-y-2 text-xs text-slate-500">
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-soft/30 text-xs font-bold text-sky-deep">1</span>
            <span>打开大众点评，找到你收藏的餐厅</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-soft/30 text-xs font-bold text-sky-deep">2</span>
            <span>点击右上角「分享」按钮</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-soft/30 text-xs font-bold text-sky-deep">3</span>
            <span>选择「复制链接」或「分享到微信」</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-soft/30 text-xs font-bold text-sky-deep">4</span>
            <span>回到本页面，粘贴完整内容并点击解析</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral/30 text-xs font-bold text-coral">5</span>
            <span>确认识别结果无误后，点击「确认导入」</span>
          </li>
        </ol>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/50 p-3 font-medium text-slate-500 transition hover:bg-white/80"
      >
        <Check className="h-4 w-4" />
        返回选择
      </button>
    </motion.div>
  );
}