import React, { useState, useEffect } from 'react';
import { GeneratedImage, FurnitureItem, Product } from '../types';
import { identifyFurniture, findProducts } from '../services/openaiService';
import { ProductCard } from './ProductCard';
import { Spinner } from './Spinner';
import { EditIcon } from './icons/EditIcon';
import { SearchIcon } from './icons/SearchIcon';

interface ShopTheLookProps {
  image: GeneratedImage;
}

type Status = 'idle' | 'identifying' | 'finding' | 'done' | 'error';

export const ShopTheLook: React.FC<ShopTheLookProps> = ({ image }) => {
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product[] | null>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<FurnitureItem | null>(null);
  const [newItemQuery, setNewItemQuery] = useState('');
  const [isSearchingNewItem, setIsSearchingNewItem] = useState(false);

  useEffect(() => {
    const fetchFurnitureAndProducts = async () => {
      setStatus('identifying');
      setError(null);
      setItems([]);
      setProducts({});
      try {
        const identifiedItems = await identifyFurniture(image.base64);
        const itemsWithIds = identifiedItems.map(item => ({ ...item, id: crypto.randomUUID() }));
        setItems(itemsWithIds);

        if (itemsWithIds.length > 0) {
          setStatus('finding');
          // Fetch products sequentially to avoid API rate limiting
          for (const item of itemsWithIds) {
            const productResults = await findProducts(item);
            setProducts(prev => ({...prev, [item.id]: productResults}));
          }
          setStatus('done');
        } else {
            setError("Couldn't identify any items to shop for in this image.");
            setStatus('error');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while shopping the look.');
        setStatus('error');
      }
    };

    fetchFurnitureAndProducts();
  }, [image]);

  const handleStartEdit = (item: FurnitureItem) => {
    setEditingItem({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    
    const originalItem = items.find(i => i.id === editingItem.id);
    if (originalItem && originalItem.description === editingItem.description) {
      setEditingItem(null);
      return;
    }

    setProducts(prev => ({ ...prev, [editingItem.id]: null })); // Show loading for this item
    setEditingItem(null); // Exit editing mode immediately

    const newProducts = await findProducts(editingItem);
    setItems(prevItems => prevItems.map(i => i.id === editingItem.id ? editingItem : i));
    setProducts(prev => ({ ...prev, [editingItem.id]: newProducts }));
  };
  
  const handleNewItemSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemQuery.trim()) return;
    
    setIsSearchingNewItem(true);
    const newItem: FurnitureItem = {
      id: crypto.randomUUID(),
      name: newItemQuery.trim(),
      description: newItemQuery.trim(),
    };
    
    setProducts(prev => ({ ...prev, [newItem.id]: null })); // Show loading
    setItems(prev => [newItem, ...prev]);

    const newProducts = await findProducts(newItem);
    setProducts(prev => ({ ...prev, [newItem.id]: newProducts }));
    setNewItemQuery('');
    setIsSearchingNewItem(false);
  };

  const renderContent = () => {
    if (status === 'identifying') return <Spinner text="Scanning for furniture..." />;
    if (status === 'finding' && items.length > 0 && Object.keys(products).length === 0) return <Spinner text="Finding matching products..." />;
    if (status === 'error') return <p className="text-red-400 text-center">{error}</p>;

    if (status === 'done' || status === 'finding') {
      return items.length > 0 ? (
        items.map(item => (
          <div key={item.id} className="bg-slate-700/50 p-3 rounded-lg">
            {editingItem?.id === item.id ? (
              <div>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-slate-800 text-white placeholder-slate-400 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  rows={2}
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <button onClick={handleCancelEdit} className="px-3 py-1 bg-slate-600 text-slate-300 text-xs rounded-md hover:bg-slate-500">Cancel</button>
                  <button onClick={handleSaveEdit} className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-500">Save</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg text-purple-300">{item.name}</h4>
                <button onClick={() => handleStartEdit(item)} className="text-slate-400 hover:text-white">
                  <EditIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {products[item.id] === null || products[item.id] === undefined ? (
                <Spinner text="Searching..." />
            ) : products[item.id] && products[item.id]!.length > 0 ? (
              products[item.id]!.map((product, idx) => (
                <ProductCard key={`${item.id}-${idx}`} product={product} />
              ))
            ) : (
              <p className="text-sm text-slate-400 mt-2">No specific products found.</p>
            )}
          </div>
        ))
      ) : (
        status !== 'identifying' && <p className="text-center text-slate-400">No items were identified.</p>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4 text-center">Shop the Look</h3>
      
      <form onSubmit={handleNewItemSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItemQuery}
          onChange={(e) => setNewItemQuery(e.target.value)}
          placeholder="Search for an item..."
          className="flex-grow bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          disabled={isSearchingNewItem}
        />
        <button
          type="submit"
          disabled={isSearchingNewItem || !newItemQuery.trim()}
          className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 disabled:bg-slate-500"
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-4 overflow-y-auto flex-grow">
        {isSearchingNewItem && !items.some(item => item.name === newItemQuery) && <Spinner text={`Searching for ${newItemQuery}...`} />}
        {renderContent()}
      </div>
    </div>
  );
};