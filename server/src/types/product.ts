

export type Product = {
  id: string;
  business_id: string;
  name: string;
  image_url: string | null;
  unit_id: string;
  quantity: number;
  low_stock_threshold: number;
  created_at: Date;
};

export type CreateProduct = Omit<
  Product,
  "id" | "created_at"
>;

export type UpdateProduct = Partial<
  Omit<CreateProduct, "business_id">
>;
