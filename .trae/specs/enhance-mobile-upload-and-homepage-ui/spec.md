# Lucky Bite 移动端上传优化与首页UI增强 Spec

## Why
当前Lucky Bite PWA在移动端存在两个关键问题：1) 图片上传功能在手机端点击后无法正常打开相册选择，用户体验受阻；2) 首页及扭蛋模块视觉效果不够精致，需要提升整体美观度和游戏感，使其更符合"可爱/治愈/柔软/任天堂风"的设计定位。

## What Changes
- **移动端图片上传功能修复**：点击上传按钮后正确唤起系统相册权限提示，支持用户选择全部照片或指定照片
- **扭蛋池模块卡片优化**：替换店铺卡片前置文字为食物类智能标题（如"鱼""酸菜"）搭配对应图标，增大字体
- **首页本月排行模块优化**：提升展示效果，使页面更精致
- **扭蛋机外观重构**：改为金属质感真实扭蛋样式（参考日本官方扭蛋动画）、密集水晶球造型、球身水感光泽、搭配小人物形象
- **背景优化**：小图案分布更均匀、加入梦幻碎花元素（小鹿/小马）、提高饱和度、扭蛋主体颜色更扎实

## Impact
- Affected specs: 移动端兼容性、UI视觉设计、PWA体验
- Affected code:
  - `components/restaurant/ImageUploader.tsx` - 图片上传组件
  - `components/restaurant/RestaurantCard.tsx` - 餐厅卡片组件
  - `components/capsule/CapsuleMachine.tsx` - 扭蛋机组件
  - `components/common/DynamicBackground.tsx` - 动态背景组件
  - `app/page.tsx` - 首页布局
  - `app/globals.css` - 全局样式

## ADDED Requirements

### Requirement: 移动端图片上传权限唤起
The system SHALL 在移动端点击上传按钮时，正确触发系统相册权限请求，允许用户选择"全部照片"或"指定照片"权限，并成功打开相册选择界面。

#### Scenario: 手机端点击上传按钮
- **WHEN** 用户在手机端点击"图片识别添加"的上传区域
- **THEN** 系统弹出相册权限提示，用户授权后可进入相册选择照片

#### Scenario: 权限已授权时
- **WHEN** 用户已授权相册访问权限
- **THEN** 点击上传按钮后直接打开相册选择界面

### Requirement: 餐厅卡片智能标题
The system SHALL 为餐厅卡片生成食物类智能标题（提取餐厅名称关键词如"鱼""酸菜"），搭配对应emoji图标，替代当前的默认前置文字，并增大卡片内字体尺寸。

#### Scenario: 太二酸菜鱼餐厅卡片
- **WHEN** 餐厅名称为"太二酸菜鱼"
- **THEN** 卡片显示"酸菜 🐟"或"鱼 🐟"作为智能标题

### Requirement: 扭蛋机金属质感外观
The system SHALL 将扭蛋机外观改为金属质感的真实日式扭蛋机样式，包括金属底座、密集排列的水晶球造型（而非仅5个球）、球身及周围添加亮晶晶水感光泽效果，可选搭配小人物形象增强游戏感。

#### Scenario: 扭蛋机视觉效果
- **WHEN** 用户查看首页扭蛋机
- **THEN** 显示金属质感底座、密集水晶球、水感光泽，整体视觉效果精致美观

### Requirement: 梦幻碎花背景
The system SHALL 优化动态背景，使小图案分布更均匀（避免集中在画面中间），可选加入小鹿、小马等梦幻碎花元素，整体配色提高饱和度，扭蛋主体颜色更扎实避免单薄。

#### Scenario: 背景视觉效果
- **WHEN** 用户查看首页背景
- **THEN** 小图案均匀分布，色彩饱和度适中，整体画面和谐不寡淡

## MODIFIED Requirements

### Requirement: 餐厅卡片字体大小
餐厅卡片内的餐厅名称、菜系、价格等核心文字 SHALL 使用更大的字体尺寸（建议从当前12px/14px提升至14px/16px），确保移动端阅读清晰。

### Requirement: 本月排行展示效果
首页顶部的本月排行模块 SHALL 优化展示效果，增加视觉精致度，可能包括更精美的卡片样式、渐变背景或动画效果。

## REMOVED Requirements
无移除的需求。