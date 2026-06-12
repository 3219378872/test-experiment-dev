type PagerProps = {
  page: number;
  pages: number;
  onPage: (page: number) => void;
};

function visiblePages(page: number, pages: number): number[] {
  if (pages <= 3) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }

  if (page <= 2) {
    return [1, 2, 3];
  }

  if (page >= pages - 1) {
    return [pages - 2, pages - 1, pages];
  }

  return [page - 1, page, page + 1];
}

export function Pager({ page, pages, onPage }: PagerProps) {
  if (pages <= 1) {
    return null;
  }

  const safePage = Math.min(Math.max(page, 1), pages);

  return (
    <nav className="pager" aria-label="分页">
      <button type="button" className="pager-btn" aria-label="上一页" disabled={safePage === 1} onClick={() => onPage(safePage - 1)}>
        ‹
      </button>
      {visiblePages(safePage, pages).map((item) => (
        <button
          type="button"
          className={`pager-page${item === safePage ? ' is-active' : ''}`}
          aria-current={item === safePage ? 'page' : undefined}
          key={item}
          onClick={() => onPage(item)}
        >
          {item}
        </button>
      ))}
      <button type="button" className="pager-btn" aria-label="下一页" disabled={safePage === pages} onClick={() => onPage(safePage + 1)}>
        ›
      </button>
    </nav>
  );
}
