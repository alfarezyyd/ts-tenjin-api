export class Paging {
  size: number;
  totalPage: number;
  currentPage: number;

  constructor() {
    this.size = null;
    this.totalPage = null;
    this.currentPage = null;
  }
}

export class WebResponse<T> {
  result?: {
    data?: T | null;
    message?: string | null;
  };
  errors?: {
    code?: string;
    message?: T | null;
  };
  paging?: Paging | null;

  constructor() {
    this.result = {
      data: null,
      message: null,
    };
    this.errors = {
      code: null,
      message: null,
    };
    this.paging = new Paging();
  }
}
