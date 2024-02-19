import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

export class PaginatePipe implements PipeTransform<Record<string, any>> {
  private readonly DEFAULT_LIMIT = 10;
  private readonly MAX_LIMIT = 20;
  private readonly DEFAULT_CURRENT_PAGE = 1;

  transform(value: Record<string, any>, metadata: ArgumentMetadata) {
    const { limit, currentPage } = value;
    value.limit = this.setLimit(parseInt(limit));
    value.currentPage = this.setCurrentPage(parseInt(currentPage));
    return value;
  }

  private setLimit(limit: number): number {
    if (!limit) {
      return this.DEFAULT_LIMIT;
    }
    if (limit > this.MAX_LIMIT) {
      return this.MAX_LIMIT;
    }
    return limit;
  }

  private setCurrentPage(currentPage: number): number {
    if (!currentPage) {
      return this.DEFAULT_CURRENT_PAGE;
    }
    return currentPage;
  }
}
