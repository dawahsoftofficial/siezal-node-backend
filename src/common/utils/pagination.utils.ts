import { IPaginationMetadata } from "../interfaces/app.interface";

export const getPaginationMetadata = (
  totalItems: number,
  page: number,
  limit: number
): IPaginationMetadata => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    currentPage: page,
    itemsPerPage: limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
