import { useState } from "react";

const usePagination = ({ itemsPerPage = 10 } = {}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const getPaginationData = (data) => {
    const totalItemsCount = data.length;
    const totalPagesCount = Math.ceil(totalItemsCount / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = data.slice(startIndex, endIndex);

    const hasNextPage = currentPage < totalPagesCount;
    const hasPreviousPage = currentPage > 1;

    return {
      currentItems,
      totalPages: totalPagesCount,
      totalItems: totalItemsCount,
      hasNextPage,
      hasPreviousPage,
    };
  };

  const handlePageChange = (page, data) => {
    const totalPagesCount = Math.ceil(data.length / itemsPerPage);
    setCurrentPage(Math.max(1, Math.min(page, totalPagesCount)));
  };

  const handleNextPage = (data) => {
    const totalPagesCount = Math.ceil(data.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, totalPagesCount));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = (data) => {
    const totalPagesCount = Math.ceil(data.length / itemsPerPage);
    setCurrentPage(totalPagesCount);
  };

  return {
    currentPage,
    getPaginationData,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleFirstPage,
    handleLastPage,
  };
};

export default usePagination;
