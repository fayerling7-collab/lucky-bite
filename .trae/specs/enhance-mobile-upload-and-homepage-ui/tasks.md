# Tasks

## 电脑端修改任务（优先完成）

- [x] Task 1: 修复移动端图片上传组件 - 正确唤起相册权限
  - [x] SubTask 1.1: 修改 ImageUploader.tsx，使用正确的 input 元素方式（不使用 pointer-events-none）
  - [x] SubTask 1.2: 添加明确的点击区域和按钮样式，确保移动端触摸事件正常触发
  - [x] SubTask 1.3: 设置正确的 accept 属性（image/jpeg,image/png,image/webp）和 capture 属性
  - [x] SubTask 1.4: 测试移动端点击上传功能，验证相册权限弹窗和照片选择流程

- [x] Task 2: 优化餐厅卡片智能标题和字体大小
  - [x] SubTask 2.1: 创建智能标题提取函数（从餐厅名称提取关键词如"鱼""酸菜""火锅"等）
  - [x] SubTask 2.2: 定义食物关键词与emoji映射表（鱼→🐟, 酸菜→🥬, 火锅→🍲 等）
  - [x] SubTask 2.3: 修改 RestaurantCard.tsx，应用智能标题和增大字体（14px→16px）
  - [x] SubTask 2.4: 优化卡片布局和视觉层次

- [x] Task 3: 优化首页本月排行模块展示效果
  - [x] SubTask 3.1: 重新设计排行卡片样式（渐变背景、玻璃拟态效果）
  - [x] SubTask 3.2: 添加精致的动画效果（微光、呼吸动画）
  - [x] SubTask 3.3: 优化排版和间距，提升精致度

- [x] Task 4: 重构扭蛋机外观 - 金属质感与密集水晶球
  - [x] SubTask 4.1: 设计金属质感底座（渐变色、阴影、光泽效果）
  - [x] SubTask 4.2: 增加扭蛋球数量至15-20个密集排列
  - [x] SubTask 4.3: 添加水晶球造型（透明感、折射光泽）
  - [x] SubTask 4.4: 添加水感光泽效果（闪光、光晕）
  - [x] SubTask 4.5: 可选添加小人物形象装饰

- [x] Task 5: 优化动态背景 - 梦幻碎花与均匀分布
  - [x] SubTask 5.1: 重新设计背景图案分布算法（均匀分布，避免中心聚集）
  - [x] SubTask 5.2: 添加梦幻碎花元素（小鹿🦌、小马🐴、星星✨、花朵🌸）
  - [x] SubTask 5.3: 提高整体配色饱和度，使扭蛋主体颜色更扎实
  - [x] SubTask 5.4: 优化背景与扭蛋机的视觉层次关系

## 小程序端修改任务（电脑端完成后执行）

- [ ] Task 6: 验证小程序端图片上传兼容性
  - [ ] SubTask 6.1: 在微信小程序环境中测试图片上传功能
  - [ ] SubTask 6.2: 处理小程序特有的API调用方式（wx.chooseImage）
  - [ ] SubTask 6.3: 确保跨平台兼容性

- [ ] Task 7: 小程序端UI适配验证
  - [ ] SubTask 7.1: 验证扭蛋机在小程序中的渲染效果
  - [ ] SubTask 7.2: 验证餐厅卡片在小程序中的显示效果
  - [ ] SubTask 7.3: 验证背景动画在小程序中的性能

# Task Dependencies
- Task 6 depends on Task 1
- Task 7 depends on Task 2, Task 4, Task 5