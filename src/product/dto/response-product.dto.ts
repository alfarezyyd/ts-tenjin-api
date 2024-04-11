export default class ResponseProductDto {
  id: string;
  name: string;
  condition: string;
  description?: string;
  price: number;
  minimumOrder: number;
  status: string;
  stock: number;
  sku: string;
  weight: number;
  height: number;
  width: number;
}
