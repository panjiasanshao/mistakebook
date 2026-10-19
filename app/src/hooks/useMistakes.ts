// 错题数据 hook：加载/CRUD/组卷篮状态
import { useCallback, useEffect, useState } from 'react';
import { mistakeRepository, newId } from '../db/mistakeRepository';
import type { MistakeItem, MistakeStatus } from '../types/mistake';

export function useMistakes() {
  const [items, setItems] = useState<MistakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        await mistakeRepository.seedIfEmpty();
      } catch (seedErr) {
        console.warn('seedIfEmpty failed (non-blocking):', seedErr);
      }
      const all = await mistakeRepository.getAll();
      setItems(all);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const create = useCallback(async (input: Omit<MistakeItem, 'id' | 'createdAt' | 'reviewCount' | 'status' | 'inBasket'> & Partial<Pick<MistakeItem, 'status'>>) => {
    const item: MistakeItem = {
      id: newId(),
      createdAt: Date.now(),
      reviewCount: 0,
      status: input.status ?? 'PENDING',
      inBasket: false,
      subject: input.subject,
      source: input.source,
      difficulty: input.difficulty,
      reasons: input.reasons,
      questionText: input.questionText,
      reflection: input.reflection,
      analysis: input.analysis,
      imageData: input.imageData,
    };
    await mistakeRepository.save(item);
    await reload();
    return item;
  }, [reload]);

  const update = useCallback(async (id: string, patch: Partial<MistakeItem>) => {
    const cur = await mistakeRepository.getById(id);
    if (!cur) throw new Error('Mistake not found: ' + id);
    await mistakeRepository.save({ ...cur, ...patch });
    await reload();
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    await mistakeRepository.delete(id);
    await reload();
  }, [reload]);

  const setStatus = useCallback(async (id: string, status: MistakeStatus) => {
    const cur = await mistakeRepository.getById(id);
    if (!cur) return;
    await mistakeRepository.save({ ...cur, status, reviewCount: cur.reviewCount + 1 });
    await reload();
  }, [reload]);

  const toggleBasket = useCallback(async (id: string) => {
    const cur = await mistakeRepository.getById(id);
    if (!cur) return;
    await mistakeRepository.save({ ...cur, inBasket: !cur.inBasket });
    await reload();
  }, [reload]);

  const addManyToBasket = useCallback(async (ids: string[]) => {
    const cur = await mistakeRepository.getAll();
    const updated = cur.map((m) => ids.includes(m.id) ? { ...m, inBasket: true } : m);
    await mistakeRepository.bulkPut(updated);
    await reload();
  }, [reload]);

  const clearBasket = useCallback(async () => {
    const cur = await mistakeRepository.getAll();
    const updated = cur.map((m) => m.inBasket ? { ...m, inBasket: false } : m);
    await mistakeRepository.bulkPut(updated);
    await reload();
  }, [reload]);

  const replaceAll = useCallback(async (next: MistakeItem[]) => {
    await mistakeRepository.clear();
    await mistakeRepository.bulkPut(next);
    await reload();
  }, [reload]);

  const mergeImport = useCallback(async (incoming: MistakeItem[]) => {
    const cur = await mistakeRepository.getAll();
    const byId = new Map(cur.map((m) => [m.id, m]));
    for (const it of incoming) byId.set(it.id, { ...byId.get(it.id), ...it });
    await mistakeRepository.bulkPut(Array.from(byId.values()));
    await reload();
  }, [reload]);

  return {
    items, loading, error, reload,
    create, update, remove, setStatus,
    toggleBasket, addManyToBasket, clearBasket,
    replaceAll, mergeImport,
  };
}
