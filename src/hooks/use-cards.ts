import { useEffect, useState } from "react";

export function useCards<T>(url: string, limit?: number) {
  const [items, setItems] = useState<T[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCards() {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as T[];
        if (limit && data.length > limit) {
          data.splice(limit);
        }
        if (!cancelled) {
          setItems(data);
        }
      } catch (error) {
        console.error(`Failed to load posts: ${error}`);
        if (!cancelled) {
          setItems([]);
        }
      }
    }

    fetchCards();

    return () => {
      cancelled = true;
    };
  }, [url, limit]);

  return { items, isLoading: items === null };
}

