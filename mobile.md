# 《学海灯塔 · 家长移动端》独立需求规格与架构设计说明书

> **文档版本**：v3.2.0-Mobile-Dedicated
>
> **文档定位**：在现有 PC 云端共享版（`v2.md` / `v3.0.0-Cloud-Sync`）基础上的延伸增补规范。供产品审视、技术评审以及作为 Trae / Cursor 编程助手的代码生成与重构基准。
>
> **核心场景**：**家长手机扫码极速拍照录题 ➔ 云端 PostgreSQL 实时同步 ➔ 孩子 PC/平板沉浸自测重做 ➔ 家长手机/电脑查看学情与组卷输出**。

## 一、 系统定位与端间拓扑设计

### 1.1 双端角色职责分离表

| 维度 | 家长移动端（手机专属独立页） | 孩子 PC 端（主站 / 大屏） | 
| ----- | ----- | ----- | 
| **主要使用者** | 家长（日常检查作业、批改试卷后） | 孩子（自主复习、自我突破、测验） | 
| **交互硬件** | 智能手机（支持高清后置拍照、单手触控） | PC 电脑 / 大屏平板（键盘、鼠标/触控） | 
| **核心使用场景** | 检查作业时的**即拍即填极速录题**、学情进度概览、手机无线组卷打印 | 闭卷专注自测（3D 翻转卡片）、沉浸复习、草稿演练、大屏标准双栏打印 | 
| **交互与视觉原则** | **单手操作、大触控区、少手打字、即拍即走** | 视野开阔、信息密度适中、无多余干扰按钮 | 
| **入口逻辑** | **独立轻量页面**（如 `/mobile.html` 或路由 `/mobile`） | 完整单页应用主站根路径 `/` | 
| **连接纽带** | 微信/手机相机扫 PC 端“设置”中的专属二维码 | **在 PC 端【设置】页面内呈现二维码，主导航绝不增添多余按钮** | 

### 1.2 物理系统拓扑与数据流向

```
┌───────────────────────────────────────────────────────────────┐
│                    PC 孩子端 (主站根路径 /)                     │
│  - 纯粹学习工作区：错题库 / 录入错题 / 重练组卷 / 设置             │
│  - 3D 翻转卡片闭卷重测（正面绝对不露出答案与解析）               │
│  - 【设置页面】提供：【家长移动端访问专属二维码】 ────────────┐     │
└──────────────────────────────┬────────────────────────────────┘     │
                               │                                      │ 微信 / 手机
                               │ 统一读写同一个数据表                  │ 原生相机扫码
                               ▼                                      │
               ┌───────────────────────────────┐                      │
               │  腾讯云 CloudBase PostgreSQL  │                      │
               │  (REST API 直连: mistakes 表) │                      │
               └───────────────▲───────────────┘                      │
                               │                                      │
                               │ 实时网络读写同步                      ▼
┌──────────────────────────────┴──────────────────────────────────────┐
│             家长移动端独立页面 (/mobile 或 /mobile.html)               │
│  - 拍照必填：唤起原生后置相机拍摄题干图                             │
│  - 拍照选填：拍解析/批改图（方案 A 物理隔离，防剧透）                 │
│  - 单手胶囊选学科、快捷来源芯片、点选错因标签                        │
│  - 学情大盘：待攻克 / 攻克中 / 已掌握三态进度柱形图                  │
│  - 购物车式手动勾选 ➔ 唤起手机原生无线打印 / 另存为 PDF 转发微信      │
└─────────────────────────────────────────────────────────────────────┘

```

## 二、 移动端功能性需求规格（Functional Requirements）

移动端围绕家长的三大核心诉求构建三大独立视图，采用底部固定导航栏（Tab Bar）进行单手切换：

* **Tab 1: 【极速拍题】（默认首页）**

* **Tab 2: 【学情简报】（进度大盘与紧凑清单）**

* **Tab 3: 【重练组卷】（试卷篮与移动打印）**

### 2.1 模块 M1：即拍即填极速录题（Core Pipeline）

为了彻底杜绝家长在手机上打字的痛苦，录题动线设计为“以拍代打、单手大触控、保存即就绪”。

#### 1. 题干捕获通道（必填）

* **设备调用**：通过 `<input type="file" accept="image/*" capture="environment">` 优先调起手机后置高清摄像头，亦支持从手机相册选取。

* **客户端智能压缩管道（Canvas Pipeline）**：

  * 家长拍出的原图通常为 $3\text{MB}\sim 10\text{MB}$，前端 Canvas 自动执行等比下采样：限制最大宽度 $\le 1000\text{px}$，采用 JPEG 格式，压缩质量固定为 $0.75$。

  * 压缩后体积稳定在 $120\text{KB}\sim 250\text{KB}$，既保证理科小字、图表微距清晰，又确保毫秒级上传至 CloudBase。

* **即时交互**：拍摄完毕即刻呈现缩略图，并提供一键删除/重拍图标。

#### 2. 解析/批改捕获通道（方案 A 物理隔离，选填）

* **场景设计**：家长检查试卷时，经常需要把试卷背面的参考答案或老师的红笔手写批改记录下来，但绝对不能手打几十个公式。

* **防剧透安全隔离（方案 A）**：

  * 解析图单独存入 `analysis_image_data` 字段。

  * **PC 孩子端自测强约束**：孩子在电脑上闭卷重做时，卡片正面严禁加载此图，只有翻转到卡片背面时才允许加载。

* **灵活性保证**：此项为完全选填，拍了即存，不拍留空，毫无强制感。

#### 3. 极简元数据单手点选区（Zero-Typing Experience）

* **学科单选（大胶囊横滑）**：

  * 提供大触控圆角胶囊按键（数学、物理、化学、英语、语文、生物、历史、地理、道法/政治）。

  * 默认选中数学，支持单手一键切换，高频学科优先展示。

* **错因标签多选（大芯片矩阵）**：

  * 提供大面积多选芯片：`概念不清`、`审题粗心`、`计算失误`、`思路堵塞`、`公式混淆`、`新颖题型`。

  * 点击即可多选选中或取消，视觉高亮反馈鲜明。

* **来源快捷芯片 + 简短手填**：

  * 提供一键芯片：`平时作业`、`单元测验`、`期中模拟卷`、`压轴突破题`。

  * 点选芯片自动填入输入框，亦允许家长补充具体题号（如“第18题”）。

* **难度星级**：

  * 默认设定为 3 星，提供 $1\sim 5$ 颗五角星大触控区，单指轻点即改。

#### 4. 可选文字折叠抽屉（高级补充）

* 采用 `<details>` 折叠手风琴默认收起，不占用小屏垂直空间。

* 内含 3 个可选文本域：题干补充文字（方便未来关键字检索）、家长叮嘱/反思提示、文字版解析步骤。

#### 5. 提交流转与连拍支持

* 点击底部常驻大按键 **“保存并同步到错题库”**。

* 提交触发按钮 Loading 动效，REST 接口写回云端成功后弹出轻量 Toast 提示。

* **自动重置表单**：成功后表单输入自动复位，但保留当前选中的学科，方便家长连续拍摄该学科的下一道错题。

### 2.2 模块 M2：学情简报与错题紧凑管理

家长不需要在手机上看花哨的 3D 翻转动效，核心需求是“了解孩子消灭错题的进度”**与**“快速定位薄弱环节”。

#### 1. 攻克大盘进度条（Visual Dashboard）

* **大盘指标**：实时统计当前云端数据库中该家庭的“总收录题数”、“待攻克数（红）”、“攻克中数（黄）”、“已掌握数（绿）”。

* **三态比例条**：以红、黄、绿三色比例直观展现孩子的攻克达成率。

* **卡片联动过滤**：点击指标直接快速筛选出对应状态的错题清单。

#### 2. 流式紧凑错题管理清单（Compact Feed）

* 放弃大卡片，采用适合手机屏密度的流式卡片设计。

* **卡片内容规范**：

  * 顶部：复选勾选框（用于加入试卷篮）、学科徽章、来源标签、当前掌握状态徽章；

  * 中部：题干图缩略展示（限定最大高度，支持点开预览大图）与简短题干文字；

  * 底部：错因标签列表、状态快速流转按键（一键切换：待攻克 ➔ 攻克中 ➔ 已掌握）、删除按键；

  * 解析抽屉：提供“查看解析与批改底稿”折叠面板，家长可点开核对答案。

### 2.3 模块 M3：移动端重练组卷与无线打印

家长经常需要在客厅、书房用手机快速给孩子组一套纸质重做卷，直接调用家用无线打印机或发到微信。

#### 1. 购物车式自由勾选（Basket Pipeline）

* 错题列表左侧常驻圆形 Checkbox，家长逐题点选。

* 顶部提供“全选当前筛选错题”与“清空组卷篮”快捷操作。

* 底部导航栏上的“重练组卷”图标右上角实时显示角标数字（如 `3`）。

#### 2. 试卷生成与移动端预览

* 切换至“重练组卷”Tab，系统自动组装出规范试卷：

  * **试卷头**：标题（默认《错题查漏补缺 · 自我突破重练卷》）、姓名、日期、得分栏；

  * **试卷正文**：仅包含题目序号、学科、来源、题干文字及题干原图。下方自动生成规范的**虚线草稿答题留白区**；

  * **文末独立附录**：在末尾生成【家长批改参考答案】，包含解析文字及解析图（`analysis_image_data`）。

#### 3. 移动端原生打印与 PDF 导出生态

* 顶部提供显眼的 **“无线打印 / 存为 PDF”** 按钮，点击调用原生 `window.print()`。

* **深度适配移动端打印环境**：

  * **iOS（AirPrint 生态）**：直接唤起 iOS 系统打印对话框。用户可直连局域网内的隔空打印机，或在打印预览界面**双指做放大手势**，iOS 会自动将试卷转换为高清 PDF 文件，可直接点击分享发送至微信或保存到“文件”。

  * **Android（系统打印服务）**：直接唤起系统打印管理，下拉菜单可选择“保存为 PDF”或连接到局域网打印机。

## 三、 PC 孩子端改动设计（设置页收纳入口）

为了维持 PC 端作为孩子沉浸自测、高效学习的纯净工作区，**主界面顶部导航栏坚决不新增任何按钮**。移动端入口完全收敛在“设置”内。

### 3.1 PC 端设置页 UI 布局（`SettingsView.tsx`）

在设置页现有“主题配色”与“换机备份”区块下方，新增一个独立的精致卡片：

```
┌────────────────────────────────────────────────────────────────────────┐
│  📱 家长移动端专属入口                                                   │
│                                                                        │
│  ┌──────────────────┐   【手机扫码，即拍即录】                           │
│  │                  │                                                  │
│  │   [ 二维码 ]     │   使用微信或手机浏览器扫描左侧二维码，               │
│  │   (动态生成)     │   即可在手机上拍照录入错题，并实时同步到本电脑。       │
│  │                  │                                                  │
│  └──────────────────┘   移动端链接：https://<当前域名>/mobile.html       │
│                         [ 复制移动端访问链接 ]  [ 在新窗口中预览打开 ]    │
└────────────────────────────────────────────────────────────────────────┘

```

### 3.2 技术实现要求

1. **动态地址拼接**：二维码内容与链接根据浏览器运行时环境动态生成：`${window.location.origin}/mobile.html`（或 `${window.location.origin}/mobile`），避免因域名更换导致硬编码失效。

2. **轻量生成库**：PC 端引入成熟轻量的二维码组件（如 `qrcode.react`），无需后端服务参与。

3. **友好兜底**：提供“复制链接”按钮，写入剪贴板并弹出 Toast，方便在没有摄像头时手动发送链接。

## 四、 数据库层与双向映射规范（CloudBase PostgreSQL）

为了支持移动端方案 A（题干图与解析图分离存储），数据库表结构与 TypeScript 实体接口做最小增量扩展。

### 4.1 数据库表增量 DDL

在 CloudBase 控制台或数据库迁移脚本中执行如下 SQL（无破坏性增量）：

```
-- 支持移动端拍照解析/批改图单独存储 (方案 A)
ALTER TABLE mistakes ADD COLUMN IF NOT EXISTS analysis_image_data TEXT;

-- 标记错题创建渠道 (PC 端或家长手机端)
ALTER TABLE mistakes ADD COLUMN IF NOT EXISTS creator_role TEXT DEFAULT 'PARENT';

```

### 4.2 前端 TypeScript 实体定义扩展（`src/types.ts`）

保持完全向下兼容，新增两项可选字段：

```
export type MistakeStatus = 'PENDING' | 'PROGRESS' | 'MASTERED';

export interface MistakeItem {
  id: string;                         // 唯一标识: mistake_<timestamp>_<random>
  subject: string;                    // 所属学科 (数学、物理、化学等)
  source: string;                     // 来源出处
  difficulty: number;                 // 难度星级 (1 - 5)
  reasons: string[];                  // 错因分类标签数组
  questionText: string;               // 题干纯文本 / LaTeX
  reflection: string;                 // 孩子反思 / 错误说明
  analysis: string;                   // 标准答案与文字解析
  status: MistakeStatus;              // 攻克状态
  createdAt: number;                  // 创建时间戳 (ms)
  reviewCount: number;                // 复习次数
  imageData?: string;                 // 题干图 Base64 (可空)

  /* --- v3.2.0 家长移动端专属扩展字段 --- */
  analysisImageData?: string;         // ★ 解析/批改图 Base64 (方案 A 物理隔离)
  creatorRole?: 'PARENT' | 'CHILD';   // 录入角色 ('PARENT' 表示手机端录入)
}

```

### 4.3 REST 数据访问层双向映射（`src/lib/cloud.ts`）

在已有的 `rowToItem` 与 `itemToRow` 转换函数中补全映射，确保网络通信对业务代码完全透明：

```
// 数据库行记录 (snake_case) 映射为前端模型 (camelCase)
export function rowToItem(row: any): MistakeItem {
  return {
    id: row.id,
    subject: row.subject,
    source: row.source || '',
    difficulty: Number(row.difficulty || 3),
    reasons: Array.isArray(row.reasons) ? row.reasons : [],
    questionText: row.question_text || '',
    reflection: row.reflection || '',
    analysis: row.analysis || '',
    status: row.status || 'PENDING',
    createdAt: Number(row.created_at || Date.now()),
    reviewCount: Number(row.review_count || 0),
    imageData: row.image_data || '',
    /* --- v3.2 映射增量 --- */
    analysisImageData: row.analysis_image_data || '',
    creatorRole: row.creator_role || 'PARENT'
  };
}

// 前端模型 (camelCase) 映射为数据库行记录 (snake_case)
export function itemToRow(item: MistakeItem): Record<string, any> {
  return {
    id: item.id,
    subject: item.subject,
    source: item.source,
    difficulty: item.difficulty,
    reasons: item.reasons,
    question_text: item.questionText,
    reflection: item.reflection,
    analysis: item.analysis,
    status: item.status,
    created_at: item.createdAt,
    review_count: item.reviewCount,
    image_data: item.imageData || null,
    /* --- v3.2 映射增量 --- */
    analysis_image_data: item.analysisImageData || null,
    creator_role: item.creatorRole || 'PARENT'
  };
}

```

## 五、 PC 端 3D 翻转卡片防剧透安全防线（`FlipCard.tsx` 调整）

引入 `analysisImageData` 后，PC 端的翻转卡片必须严格执行如下渲染规则：

1. **卡片正面（题目面）**：

   * 仅渲染 `imageData`（题干图）与 `questionText`。

   * **绝对禁止渲染 `analysisImageData`**，确保闭卷自测有效性。

2. **卡片背面（答案面）**：

   * 优先展示 `analysisImageData`（若有老师红笔手写批改或标准答案切图）。

   * 紧随其后展示 `analysis` 文字解析。

## 六、 Trae / Cursor 代码生成分步实施指令（Prompt Guide）

后续导入 Trae 时，请按照以下 4 个阶段按序下发 Prompt，确保代码稳步生长：

### 阶段 1：数据模型与 CloudBase REST 映射升级

> **Prompt for Trae**：
> “请阅读 `mobile_requirement_and_design_spec_v3.2.md` 第四节。在 `src/types.ts` 中更新 `MistakeItem` 接口，补充 `analysisImageData?: string` 与 `creatorRole?: 'PARENT' | 'CHILD'` 两个可选字段。接着在 `src/lib/cloud.ts` 的 `rowToItem` 和 `itemToRow` 函数中完成 `analysis_image_data` 与 `creator_role` 字段的双向转换映射，保证与腾讯云 PostgreSQL 字段一致。”

### 阶段 2：PC 端设置页增加入口二维码卡片

> **Prompt for Trae**：
> “请查阅设计规范第三节。保持 PC 端的顶部主导航栏（`App.tsx`）完全不变。在 `src/views/SettingsView.tsx` 页面内新增‘家长移动端专属入口’卡片。使用 `qrcode.react` 组件根据 `window.location.origin + '/mobile'` 动态生成二维码，并提供‘复制移动端链接’按钮与 Toast 提示。”

### 阶段 3：PC 端 3D 翻转卡片防剧透适配

> **Prompt for Trae**：
> “请查阅设计规范第五节。修改 `src/components/FlipCard.tsx`：确保正面只显示题干图 `imageData`；在卡片背面正确答案解析区域，如果存在 `analysisImageData`，则在文字解析上方将解析图片显示出来。”

### 阶段 4：构建独立家长移动端视图与路由

> **Prompt for Trae**：
“请依据设计规范第二节的所有功能规格，新建 `src/views/MobileView.tsx`（并在路由中配置 `/mobile` 入口，支持在 `index.html` 独立引入或页面直达）：
>
> 1. 采用移动端底部 Tab 栏：极速拍题、学情简报、重练组卷；
>
> 2. 拍题 Tab：原生调起相机、Canvas 双图独立压缩、大胶囊选学科、大芯片选错因，提交直存云端；
>
> 3. 简报 Tab：攻克进度三态条，紧凑列表，支持状态调整与删除；
>
> 4. 组卷 Tab：购物车勾选，调用系统 `window.print()` 实现 iOS AirPrint / 另存为 PDF。”