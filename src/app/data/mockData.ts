import { Product, RentalTool, Review } from '../types';

export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'INGCO Angle Grinder 900W',
    brand: 'INGCO',
    category: 'Power Tools',
    price: 3500,
    wholesalePrice: 3200,
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=500&fit=crop',
    stock: 15,
    inStock: true,
    description: 'Heavy-duty angle grinder with 900W motor'
  },
  {
    id: '2',
    name: 'INGCO Cordless Drill 20V',
    brand: 'INGCO',
    category: 'Power Tools',
    price: 5500,
    wholesalePrice: 5000,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop',
    stock: 10,
    inStock: true,
    description: 'Cordless drill with lithium battery'
  },
  {
    id: '3',
    name: 'INGCO Impact Wrench',
    brand: 'INGCO',
    category: 'Power Tools',
    price: 4200,
    wholesalePrice: 3800,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&h=500&fit=crop',
    stock: 8,
    inStock: true,
    description: 'High torque impact wrench'
  },
  {
    id: '4',
    name: 'INGCO Tool Kit 142 PCS',
    brand: 'INGCO',
    category: 'Hand Tools',
    price: 8500,
    wholesalePrice: 7800,
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=500&h=500&fit=crop',
    stock: 5,
    inStock: true,
    description: 'Complete tool kit with 142 pieces'
  },
  {
    id: '5',
    name: 'INGCO Welding Machine',
    brand: 'INGCO',
    category: 'Construction Tools',
    price: 12000,
    wholesalePrice: 11000,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&h=500&fit=crop',
    stock: 6,
    inStock: true,
    description: 'Inverter welding machine 200A'
  },
  {
    id: '6',
    name: 'INGCO Circular Saw',
    brand: 'INGCO',
    category: 'Power Tools',
    price: 4800,
    wholesalePrice: 4400,
    image: 'https://images.unsplash.com/photo-1551431009-a802eeec77b1?w=500&h=500&fit=crop',
    stock: 12,
    inStock: true,
    description: '1200W circular saw for wood cutting'
  },
  {
    id: '7',
    name: 'INGCO Air Compressor',
    brand: 'INGCO',
    category: 'Construction Tools',
    price: 15000,
    wholesalePrice: 13800,
    image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=500&h=500&fit=crop',
    stock: 4,
    inStock: true,
    description: '50L air compressor with oil'
  },
  {
    id: '8',
    name: 'INGCO Screwdriver Set',
    brand: 'INGCO',
    category: 'Hand Tools',
    price: 850,
    wholesalePrice: 750,
    image: 'https://images.unsplash.com/photo-1605098293544-25f4c32344c8?w=500&h=500&fit=crop',
    stock: 25,
    inStock: true,
    description: 'Professional screwdriver set 6 pieces'
  },
  {
    id: '9',
    name: 'INGCO Digital Multimeter',
    brand: 'INGCO',
    category: 'Electrical Tools',
    price: 1200,
    wholesalePrice: 1000,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    stock: 18,
    inStock: true,
    description: 'Auto-ranging digital multimeter'
  },
  {
    id: '10',
    name: 'INGCO Soldering Iron Kit',
    brand: 'INGCO',
    category: 'Electrical Tools',
    price: 950,
    wholesalePrice: 850,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop',
    stock: 20,
    inStock: true,
    description: '60W soldering iron with accessories'
  }
];

export const initialRentalTools: RentalTool[] = [
  {
    id: 'r1',
    name: 'INGCO Demolition Hammer',
    brand: 'INGCO',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop',
    rentPerDay: 500,
    rentPerHour: 100,
    deposit: 2000,
    available: true,
    description: '1500W heavy duty demolition hammer'
  },
  {
    id: 'r2',
    name: 'INGCO Concrete Mixer',
    brand: 'INGCO',
    image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=500&h=500&fit=crop',
    rentPerDay: 800,
    deposit: 3000,
    available: true,
    description: '140L concrete mixer machine'
  },
  {
    id: 'r3',
    name: 'INGCO Plate Compactor',
    brand: 'INGCO',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    rentPerDay: 600,
    deposit: 2500,
    available: true,
    description: 'Vibratory plate compactor for soil'
  },
  {
    id: 'r4',
    name: 'INGCO Cut-off Machine',
    brand: 'INGCO',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=500&fit=crop',
    rentPerDay: 400,
    rentPerHour: 80,
    deposit: 1500,
    available: true,
    description: '14" cut-off saw for metal and concrete'
  },
  {
    id: 'r5',
    name: 'INGCO Pressure Washer',
    brand: 'INGCO',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop',
    rentPerDay: 450,
    deposit: 2000,
    available: false,
    description: 'High pressure washer 1800W'
  },
  {
    id: 'r6',
    name: 'INGCO Scaffold Tower',
    brand: 'INGCO',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&h=500&fit=crop',
    rentPerDay: 700,
    deposit: 5000,
    available: true,
    description: 'Aluminum scaffold tower 4m height'
  }
];

export const customerReviews: Review[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    rating: 5,
    comment: 'Excellent service! Got the best quality INGCO tools at wholesale rates. Highly recommended for contractors.',
    date: '2026-02-05'
  },
  {
    id: '2',
    name: 'Murugan S',
    rating: 5,
    comment: 'Very helpful staff. They explained all the tool features. Rental service is also very affordable.',
    date: '2026-02-01'
  },
  {
    id: '3',
    name: 'Priya Devi',
    rating: 5,
    comment: 'Great shop in Palani! Genuine INGCO products with warranty. Saved lot of money on bulk order.',
    date: '2026-01-28'
  },
  {
    id: '4',
    name: 'Anand M',
    rating: 4,
    comment: 'Good collection of tools. Fair pricing. Tool rental was very helpful for my construction project.',
    date: '2026-01-25'
  },
  {
    id: '5',
    name: 'Senthil Kumar',
    rating: 5,
    comment: 'Best tools dealer in Palani area. Quick service and genuine products. Very satisfied!',
    date: '2026-01-20'
  }
];
