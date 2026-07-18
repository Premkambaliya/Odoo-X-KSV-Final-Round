/**
 * Client-side list helpers for endpoints without server pagination.
 */
export function filterAndPaginate(items = [], { search = '', searchKeys = [], page = 1, limit = 10, sortBy, order = 'asc' } = {}) {
  let result = [...items];

  const q = search.trim().toLowerCase();
  if (q && searchKeys.length) {
    result = result.filter((item) =>
      searchKeys.some((key) => String(item?.[key] ?? '').toLowerCase().includes(q))
    );
  }

  if (sortBy) {
    result.sort((a, b) => {
      const av = a?.[sortBy];
      const bv = b?.[sortBy];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return order === 'desc' ? bv - av : av - bv;
      }
      return order === 'desc'
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
  }

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;
  const data = result.slice(start, start + limit);

  return {
    data,
    pagination: { total, page: safePage, limit, totalPages },
  };
}

export function toIsoDateTime(dateStr) {
  if (!dateStr) return null;
  // date input yields YYYY-MM-DD — convert to ISO datetime for Zod/backend
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
  }
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function toDateInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
