
////////////product//////////////

export type Product = {
  id: string;
  business_id: string;
  name: string;
  image_url: string;
  unit_id: string;
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
};


///// cards ////////////////////

export type ProductCardProps = {
  product: Product;
};

////////////summaryCards/////////////
export type SummaryCardsProps = {
  title: string;
  value: number;
  icon?: React.ReactNode;
};
