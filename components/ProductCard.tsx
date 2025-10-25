
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-slate-700 p-3 rounded-lg my-2 hover:bg-slate-600 transition-colors duration-200"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-white truncate" title={product.name}>{product.name}</p>
          <p className="text-sm text-slate-400">{product.shop}</p>
        </div>
        <p className="font-bold text-purple-400">{product.price}</p>
      </div>
    </a>
  );
};
