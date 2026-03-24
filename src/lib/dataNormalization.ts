export function normalizeItem(item: any) {
  if (!item) return null;
  return {
    ...item,
    id: item.id || '',
    type: item.type || 'product',
    category: item.category || 'general',
    name: item.name || item.title || 'Unnamed Item',
    title: item.title || item.name || 'Unnamed Item',
    price: typeof item.price === 'number' ? item.price : 0,
    image: item.image || item.image_url || '',
    description: item.description || '',
    is_active: item.is_active !== undefined ? item.is_active : true,
    is_featured: item.is_featured !== undefined ? item.is_featured : false,
  };
}
