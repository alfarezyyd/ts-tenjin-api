export class WebResponse<T> {
  result?: {
    data?: T;
    message?: string;
  };
  errors?: any;
  paging?: Paging;
}

export class Paging {
  size: number;
  totalPage: number;
  currentPage: number;
}
