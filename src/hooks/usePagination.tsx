import { useState, useMemo } from "react";

export function usePagination<T>(items: T[], pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = useMemo(
    () => items.slice(0, currentPage * pageSize),
    [items, currentPage, pageSize]
  );
  const hasMore = currentPage * pageSize < items.length;

  const showMore = () => setCurrentPage((p) => p + 1);
  const reset = () => setCurrentPage(1);

  return { paginatedItems, hasMore, showMore, reset, totalPages, currentPage };
}
