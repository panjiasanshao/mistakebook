import type { MistakeItem } from '../types';

const mathSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" height="100%">
        <rect width="400" height="200" fill="#f8fafc" rx="8"/>
        <line x1="30" y1="130" x2="370" y2="130" stroke="#334155" stroke-width="2"/>
        <polygon points="365,126 375,130 365,134" fill="#334155"/>
        <text x="365" y="148" font-size="12" font-family="serif" font-weight="bold" fill="#334155">x</text>
        <line x1="160" y1="185" x2="160" y2="20" stroke="#334155" stroke-width="2"/>
        <polygon points="156,26 160,16 164,26" fill="#334155"/>
        <text x="145" y="26" font-size="12" font-family="serif" font-weight="bold" fill="#334155">y</text>
        <text x="146" y="144" font-size="11" font-family="serif" fill="#64748b">O</text>
        <path d="M 50 35 Q 115 175 180 130 T 310 25" fill="none" stroke="#4f46e5" stroke-width="2.5"/>
        <circle cx="78" cy="130" r="4" fill="#e11d48"/>
        <text x="70" y="148" font-size="11" font-family="serif" font-weight="bold" fill="#e11d48">x₁</text>
        <circle cx="180" cy="130" r="4" fill="#e11d48"/>
        <text x="186" y="148" font-size="11" font-family="serif" font-weight="bold" fill="#e11d48">x₂</text>
        <rect x="180" y="40" width="185" height="26" fill="#eef2ff" stroke="#c7d2fe" rx="4"/>
        <text x="190" y="58" font-size="11" font-family="serif" font-weight="bold" fill="#4338ca">y = (a-1)x² + 2x + 1 (两个交点)</text>
      </svg>
    `);

const physicsSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" height="100%">
        <rect width="400" height="200" fill="#f8fafc" rx="8"/>
        <path d="M 110 30 L 110 165 Q 110 175 120 175 L 260 175 Q 270 175 270 165 L 270 30" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 112 85 Q 150 82 190 85 T 268 85 L 268 172 Q 268 174 260 174 L 120 174 Q 112 174 112 172 Z" fill="#bae6fd" opacity="0.65"/>
        <rect x="160" y="65" width="60" height="48" fill="#fed7aa" stroke="#c2410c" stroke-width="2" rx="2"/>
        <text x="190" y="94" font-size="12" font-family="sans-serif" font-weight="bold" fill="#9a3412" text-anchor="middle">木块 100cm³</text>
        <line x1="190" y1="65" x2="190" y2="30" stroke="#0284c7" stroke-width="2.5"/>
        <polygon points="186,34 190,26 194,34" fill="#0284c7"/>
        <text x="202" y="44" font-size="11" font-family="sans-serif" font-weight="bold" fill="#0284c7">F浮 = ?</text>
        <line x1="190" y1="113" x2="190" y2="150" stroke="#e11d48" stroke-width="2.5"/>
        <polygon points="186,146 190,154 194,146" fill="#e11d48"/>
        <text x="202" y="144" font-size="11" font-family="sans-serif" font-weight="bold" fill="#e11d48">G = 0.8N</text>
        <path d="M 270 50 L 305 75 L 305 80 L 270 60" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/>
        <path d="M 300 80 Q 310 110 310 140 L 340 140 Q 340 110 330 80" fill="none" stroke="#64748b" stroke-width="2"/>
        <text x="320" y="160" font-size="11" font-family="sans-serif" fill="#64748b" text-anchor="middle">量筒 / 溢水</text>
      </svg>
    `);

const englishSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160" width="100%" height="100%">
        <rect width="400" height="160" fill="#f8fafc" rx="8"/>
        <rect x="20" y="15" width="360" height="130" fill="#ffffff" stroke="#cbd5e1" rx="8" stroke-width="1.5"/>
        <rect x="20" y="15" width="360" height="30" fill="#e0e7ff" rx="8"/>
        <text x="35" y="35" font-size="12" font-family="sans-serif" font-weight="bold" fill="#3730a3">【语法考点】主谓一致之"就近原则"图解</text>
        <text x="35" y="75" font-size="14" font-family="sans-serif" fill="#1e293b">Neither Tom nor <tspan fill="#0284c7" font-weight="bold">his parents</tspan> [ <tspan fill="#e11d48" font-weight="bold">were</tspan> ] at home.</text>
        <path d="M 235 115 L 235 90" fill="none" stroke="#e11d48" stroke-width="2"/>
        <polygon points="231,94 235,84 239,94" fill="#e11d48"/>
        <text x="235" y="132" font-size="11" font-family="sans-serif" fill="#e11d48" font-weight="bold" text-anchor="middle">动词时态与单复数取决于紧靠的"his parents"</text>
      </svg>
    `);

export const sampleMistakes: MistakeItem[] = [
  {
    id: 'sample-math-1',
    subject: '数学',
    source: '期中冲刺模拟卷第18题',
    difficulty: 4,
    reasons: ['审题粗心', '概念不清'],
    imageData: mathSvg,
    questionText: '已知关于 x 的一元二次方程 (a-1)x² + 2x + 1 = 0 有两个不相等的实数根，求实数 a 的取值范围。',
    reflection: '遗漏了"一元二次方程"的二次项系数不能为 0 这一隐含前提条件！只算了判别式 Δ > 0，导致多包含了 a = 1。',
    analysis: '【正解分析与关键步骤】\n1. 因为原方程为一元二次方程，二次项系数必须满足 a - 1 ≠ 0，即 a ≠ 1。\n2. 方程有两个不相等的实数根，判别式 Δ = b² - 4ac > 0。\n   Δ = 2² - 4(a-1)(1) = 4 - 4a + 4 = 8 - 4a > 0 => a < 2。\n3. 综合两者条件：a < 2 且 a ≠ 1。',
    status: 'PENDING',
    createdAt: Date.now() - 86400000 * 2,
    reviewCount: 1,
  },
  {
    id: 'sample-physics-2',
    subject: '物理',
    source: '第十章浮力单元测验',
    difficulty: 3,
    reasons: ['公式混淆', '思路堵塞'],
    imageData: physicsSvg,
    questionText: '将一个体积为 100cm³、重为 0.8N 的木块轻放入盛满水的大烧杯中，待木块静止时，溢出水的重力为多少 N？木块受到的浮力为多少 N？',
    reflection: '误以为木块会全部浸没去用 F浮 = ρ水gV排 计算，没先判断漂浮还是沉底状态。',
    analysis: '【正解分析与关键步骤】\n1. 木块完全浸没时的浮力 F满 = ρ水gV木 = 1.0×10³ × 10 × 100×10⁻⁶ = 1.0N。\n2. 实际木块重力 G = 0.8N < 1.0N，因此木块最终处于漂浮状态。\n3. 漂浮时：F浮 = G = 0.8N。\n4. 依据阿基米德原理，溢出水重 G排 = F浮 = 0.8N。',
    status: 'PROGRESS',
    createdAt: Date.now() - 86400000 * 4,
    reviewCount: 2,
  },
  {
    id: 'sample-english-3',
    subject: '英语',
    source: '完形填空与语法专项',
    difficulty: 2,
    reasons: ['审题粗心'],
    imageData: englishSvg,
    questionText: 'Neither Tom nor his parents ______ (be) at home yesterday evening.',
    reflection: '"neither...nor..."遵循就近原则，看错了主语的位置，错写成了 was。',
    analysis: '【正解分析与关键考点】\n【考点】：主谓一致之"就近原则"。\n在 neither A nor B 句型中，谓语动词的单复数取决于紧靠它的主语 B。\n本句中离动词最近的主语是 his parents（复数），且由 yesterday evening 可知为一般过去时，因此填 were。',
    status: 'MASTERED',
    createdAt: Date.now() - 86400000 * 7,
    reviewCount: 3,
  },
];
