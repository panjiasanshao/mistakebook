// 错题本 IndexedDB Repository（基于 idb 8）
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { MistakeItem } from '../types/mistake';

interface MistakeDB extends DBSchema {
  mistakes: {
    key: string;
    value: MistakeItem;
    indexes: { 'by-status': string; 'by-createdAt': number };
  };
  meta: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = 'mistakebook-db';
const DB_VERSION = 2;
const SEED_FLAG_KEY = 'seeded-v1';

let dbPromise: Promise<IDBPDatabase<MistakeDB>> | null = null;

function getDB(): Promise<IDBPDatabase<MistakeDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MistakeDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore('mistakes', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
          store.createIndex('by-createdAt', 'createdAt');
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('meta')) {
            db.createObjectStore('meta', { keyPath: 'key' });
          }
        }
      },
    });
  }
  return dbPromise;
}

// 预置 3 道示例错题（数学/语文/英语，与原型预置风格对齐）
const SEED_MISTAKES: MistakeItem[] = [
  {
    id: 'seed-math-001',
    subject: '数学',
    source: '五年级期中模拟卷 · 第 8 题',
    difficulty: 3,
    reasons: ['审题粗心', '计算失误'],
    questionText: '一个长方形游泳池，长 50 米，宽 25 米，深 2 米。\n（1）这个游泳池的占地面积是多少？\n（2）如果在游泳池的底面和四周贴上瓷砖，贴瓷砖的面积是多少？',
    reflection: '漏看了"底面和四周"中的"底面"，只算了四周侧面积。下次要圈出关键条件词。',
    analysis: '（1）占地面积 = 长 × 宽 = 50 × 25 = 1250 平方米\n（2）贴瓷砖面积 = 底面积 + 四周侧面积\n    底面积 = 50 × 25 = 1250 平方米\n    四周侧面积 = (50 + 25) × 2 × 2 = 300 平方米\n    总面积 = 1250 + 300 = 1550 平方米\n\n关键：审题时圈出"底面和四周"这类并列结构词。',
    status: 'PROGRESS',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    reviewCount: 1,
    inBasket: false,
  },
  {
    id: 'seed-chinese-002',
    subject: '语文',
    source: '古诗文默写单元测验',
    difficulty: 2,
    reasons: ['概念不清'],
    questionText: '补写出下列名篇名句中的空缺部分：\n（1）______，天涯若比邻。（王勃《送杜少府之任蜀州》）\n（2）落红不是无情物，______。（龚自珍《己亥杂诗》）',
    reflection: '"海内存知己"写成"海内逢知己"，把"己"和"逢"记混了。',
    analysis: '（1）海内存知己，天涯若比邻。\n（2）落红不是无情物，化作春泥更护花。\n\n易错字：己（jǐ，自己），不是"已"或"巳"。',
    status: 'PENDING',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    reviewCount: 0,
    inBasket: false,
  },
  {
    id: 'seed-english-003',
    subject: '英语',
    source: 'Unit 5 课后练习',
    difficulty: 4,
    reasons: ['思路堵塞', '新颖题型'],
    questionText: 'Choose the correct answer:\nThe teacher asked the students ______ so much noise in class.\nA. don\'t make   B. not to make   C. not make   D. to not make',
    reflection: '看到 ask sb. 想到 ask sb. to do，但不知道否定形式是 not to do 还是 to not do，凭感觉选了 D。',
    analysis: '正确答案：B\n\nask sb. (not) to do sth. 是固定结构，否定词 not 必须放在不定式 to 之前。\n记忆口诀：ask sb. not to do（not 永远在 to 前面）。\n\n类似结构：tell sb. not to do / want sb. not to do。',
    status: 'MASTERED',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    reviewCount: 2,
    inBasket: false,
  },
];

async function seedIfEmpty(): Promise<void> {
  const db = await getDB();
  const flag = await db.get('meta', SEED_FLAG_KEY);
  if (flag?.value === true) return;
  const count = await db.count('mistakes');
  if (count === 0) {
    const tx = db.transaction('mistakes', 'readwrite');
    await Promise.all(SEED_MISTAKES.map((it) => tx.store.put(it)));
    await tx.done;
  }
  await db.put('meta', { key: SEED_FLAG_KEY, value: true });
}

export const mistakeRepository = {
  async getAll(): Promise<MistakeItem[]> {
    const db = await getDB();
    const all = await db.getAll('mistakes');
    return all.sort((a, b) => b.createdAt - a.createdAt);
  },

  async getById(id: string): Promise<MistakeItem | undefined> {
    const db = await getDB();
    return db.get('mistakes', id);
  },

  async save(item: MistakeItem): Promise<void> {
    const db = await getDB();
    await db.put('mistakes', item);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('mistakes', id);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('mistakes');
  },

  async bulkPut(items: MistakeItem[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('mistakes', 'readwrite');
    await Promise.all(items.map((it) => tx.store.put(it)));
    await tx.done;
  },

  async seedIfEmpty(): Promise<void> {
    return seedIfEmpty();
  },

  async resetSeedFlag(): Promise<void> {
    const db = await getDB();
    await db.delete('meta', SEED_FLAG_KEY);
  },
};

export function newId(): string {
  return 'mistake_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}
