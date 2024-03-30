export class WebResponse<T> {
  data?: T;
  errors?: any;
  paging?: Paging;
}

export class Paging {
  size: number;
  totalPage: number;
  currentPage: number;
}
