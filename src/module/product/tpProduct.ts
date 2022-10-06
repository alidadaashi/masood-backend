export type TProductAddRequest = {
  title: string,
  titleLangId: string
  description: string,
  descriptionLangId: string,
  price: number,
};

export type TProduct = { productId: string, title: string, description: string, price: number };
