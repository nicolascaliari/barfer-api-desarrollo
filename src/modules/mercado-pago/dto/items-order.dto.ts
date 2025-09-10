export class ItemsOrderDto {
  productId: string;
  options: {
    id: string;
    quantity: number;
  }[];
}
