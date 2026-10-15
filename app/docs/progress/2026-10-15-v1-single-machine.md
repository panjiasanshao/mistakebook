# 第一轮：单机错题本 V1（基于 v1.md 需求 + v1.html 原型）

日期：2026-10-15

## 本轮目标

按已确认材料 `docs/design/v1.md`（需求 v2.1.0）与 `docs/design/v1.html`（原型）实现单机版四大功能：
错题录入（截图粘贴+压缩）、3D 翻转卡片自测与状态流转、A4 双栏重练组卷打印、设置中心（主题+备份）。

## 实现内容

- 技术栈：React 18 + TypeScript + Tailwind CSS 3 + idb（IndexedDB），沿用课程模板默认配置。
- 数据层：`src/lib/db.ts`（IndexedDB 封装）、`src/lib/image.ts`（Canvas 压缩 1000px/0.75）、`src/lib/backup.ts`（JSON 备份导出/导入）、`src/types.ts`（与 v1.md 数据结构一致的核心字段）。
- 视图：`LibraryView`（统计/筛选/翻转卡片）、`CreateView`（Ctrl+V 粘贴、拖拽上传、错因标签、星级）、`PaperView`（组卷篮、双栏预览、打印层）、`SettingsView`（5 主题、备份、存储概览）。
- 主题：CSS 变量注入 + localStorage 持久化（`child_mistake_theme`）。
- 预置 3 道示范错题（数学/物理/英语，离线 SVG 题图），首次打开自动写入。
- 项目标识更新：名称“学海灯塔 · 错题本”，identityStatus=confirmed-design；README、index.html 标题、Capacitor appName 同步。

## 测试与验收记录

- `npm run build`（tsc --noEmit + vite build）通过，产物约 193KB JS / 26KB CSS。
- 浏览器验收（Trae BrowserUse，http://localhost:5189）：
  - 首轮：首页、录入页、设置页（主题切换）通过；发现阻断缺陷——卡片固定 400px 高度导致底部按钮被裁剪不可点击（翻转/组卷失效）。
  - 修复：`style.css` 翻转卡片改为正面文档流定位（高度自适应）+ inner min-height 380px 兜底；重建通过。
  - 复测：4/4 通过（按钮行完整、3D 翻转背面、组卷勾选与角标、试卷预览）。
- 模拟/编译结果与浏览器实测均已记录；打印为浏览器原生对话框，本轮未连接实体打印机验证（未验证项）。

## 未验证项 / 待完成

- 实体打印机 A4 双栏打印效果（需用户用“立即打印 / 存为PDF”实际验证）。
- 备份导出文件在另一台电脑/浏览器的导入恢复（逻辑已实现，跨机场景待用户实测）。
- 后续轮次候选：云端同步（CloudBase）、安卓端、AI 单步辅导、举一反三变式题（见 v1.md 演进路线）。
