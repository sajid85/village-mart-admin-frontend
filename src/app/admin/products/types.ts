export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  sku: string;
  isActive: boolean;
  brand?: string;
  weight?: number;
  dimensions?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: string;
  sku: string;
  isActive?: boolean;
  brand?: string;
  weight?: number;
  dimensions?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {} 