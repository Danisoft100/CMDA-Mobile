import { useEffect, useMemo, useState } from "react";
type State = { key: string; pages: Record<number, any[]>; totalPages: number };
export function usePagedResults(data: any, page: number, key = "default") {
  const [state, setState] = useState<State>({ key, pages: {}, totalPages: 0 });
  useEffect(() => {
    if (data)
      setState((previous) => ({
        key,
        pages: {
          ...(previous.key === key ? previous.pages : {}),
          [page]: data.items || [],
        },
        totalPages: data.meta?.totalPages || 0,
      }));
  }, [data, page, key]);
  const snapshot = useMemo(
    () =>
      data
        ? {
            key,
            pages: {
              ...(state.key === key ? state.pages : {}),
              [page]: data.items || [],
            },
            totalPages: data.meta?.totalPages || 0,
          }
        : state,
    [state, data, key, page],
  );
  const items = useMemo(() => {
    if (snapshot.key !== key) return [];
    const unique = new Map();
    Object.keys(snapshot.pages)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((p) =>
        snapshot.pages[Number(p)].forEach((item: any) =>
          unique.set(item._id, item),
        ),
      );
    return [...unique.values()];
  }, [snapshot, key]);
  return { items, totalPages: snapshot.key === key ? snapshot.totalPages : 0 };
}
