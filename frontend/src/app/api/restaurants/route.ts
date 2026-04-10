import { NextResponse } from 'next/server';

const restaurants = [
  {
    id: '1',
    name: 'Burger King',
    tags: ['Burger', 'Fast Food'],
    rating: 4.5,
    time: '25-30 min',
    price: '$$',
    img: '/burger.png',
    cuisine: 'Fast Food'
  },
  {
    id: '2',
    name: 'Pizza Hut',
    tags: ['Pizza', 'Italian'],
    rating: 4.2,
    time: '30-45 min',
    price: '$$',
    img: '/pizza.png',
    cuisine: 'Italian'
  },
  {
    id: '3',
    name: 'Sushi Samurai',
    tags: ['Sushi', 'Japanese', 'Seafood'],
    rating: 4.8,
    time: '40-50 min',
    price: '$$$',
    img: '/sushi.png',
    cuisine: 'Japanese'
  },
  {
    id: '4',
    name: 'Green Bowl',
    tags: ['Salad', 'Healthy', 'Vegan'],
    rating: 4.6,
    time: '20-30 min',
    price: '$$',
    img: '/hero-bg.png',
    cuisine: 'Healthy'
  },
  {
    id: '5',
    name: 'Taco Bell',
    tags: ['Mexican', 'Fast Food'],
    rating: 4.0,
    time: '15-25 min',
    price: '$',
    img: '/burger.png',
    cuisine: 'Mexican'
  },
  {
    id: '6',
    name: 'Pasta Palace',
    tags: ['Pasta', 'Italian'],
    rating: 4.4,
    time: '35-45 min',
    price: '$$',
    img: '/pizza.png',
    cuisine: 'Italian'
  }
];

export async function GET() {
  return NextResponse.json(restaurants);
}
