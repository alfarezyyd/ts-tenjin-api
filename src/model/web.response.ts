export class WebResponse<T> {
  result?: {
    data?: T | null;
    message?: string | null;
  };
  errors?: {
    code?: string;
    message?: string;
  };
  paging?: Paging | null;

  constructor() {
    this.result = {
      data: null,
      message: null,
    };
    this.errors = null;
    this.paging = null;
  }
}

export class Paging {
  size: number;
  totalPage: number;
  currentPage: number;
}
