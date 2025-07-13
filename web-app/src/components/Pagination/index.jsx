import PropTypes from "prop-types";
import styles from "./Pagination.module.css";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onFirstPage,
  onLastPage,
  hasNextPage,
  hasPreviousPage,
  itemsPerPage = 10,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter(
      (item, index, arr) => arr.indexOf(item) === index
    );
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={styles.paginationContainer}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      <div
        className={styles.paginationInfo}
        style={{
          marginBottom: 0,
          textAlign: "center",
          fontSize: "1rem",
          color: "#555",
        }}
      >
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>

      <div className={styles.paginationControls} style={{ marginTop: 0 }}>
        <button
          className={`${styles.pageButton} ${styles.controlButton}`}
          onClick={onFirstPage}
          disabled={!hasPreviousPage}
          title="First page"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7M21 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          className={`${styles.pageButton} ${styles.controlButton}`}
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          title="Previous page"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className={styles.pageNumbers}>
          {getPageNumbers().map((pageNumber, index) =>
            pageNumber === "..." ? (
              <span key={`dots-${index}`} className={styles.dots}>
                ...
              </span>
            ) : (
              <button
                key={pageNumber}
                className={`${styles.pageButton} ${
                  pageNumber === currentPage ? styles.activePage : ""
                }`}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            )
          )}
        </div>

        <button
          className={`${styles.pageButton} ${styles.controlButton}`}
          onClick={onNextPage}
          disabled={!hasNextPage}
          title="Next page"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <button
          className={`${styles.pageButton} ${styles.controlButton}`}
          onClick={onLastPage}
          disabled={!hasNextPage}
          title="Last page"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5l7 7-7 7M13 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  onPreviousPage: PropTypes.func,
  onNextPage: PropTypes.func,
  onFirstPage: PropTypes.func,
  onLastPage: PropTypes.func,
  hasNextPage: PropTypes.bool,
  hasPreviousPage: PropTypes.bool,
  itemsPerPage: PropTypes.number,
};

export default Pagination;
