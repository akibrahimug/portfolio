/**
 * Data for the dark-mode hero globe: major tech hubs (plotted as points) and a
 * rotating set of interesting facts about the tech industry.
 *
 * Figures are approximate / representative — they're meant to be interesting,
 * not a live data source.
 */

export interface TechHub {
  city: string
  lat: number
  lng: number
  note: string
}

export const TECH_HUBS: TechHub[] = [
  { city: 'San Francisco', lat: 37.77, lng: -122.42, note: 'Silicon Valley — the densest startup ecosystem on Earth.' },
  { city: 'New York', lat: 40.71, lng: -74.0, note: 'A fast-growing hub for fintech and media tech.' },
  { city: 'Toronto', lat: 43.65, lng: -79.38, note: 'North America’s 3rd-largest tech talent market.' },
  { city: 'London', lat: 51.5, lng: -0.12, note: 'Europe’s largest tech ecosystem by funding.' },
  { city: 'Berlin', lat: 52.52, lng: 13.4, note: 'A magnet for startups and open-source work.' },
  { city: 'Stockholm', lat: 59.33, lng: 18.07, note: 'More unicorns per capita than almost anywhere.' },
  { city: 'Tel Aviv', lat: 32.08, lng: 34.78, note: 'The “Startup Nation” — huge R&D density.' },
  { city: 'Bangalore', lat: 12.97, lng: 77.59, note: 'India’s tech capital; 1.5M+ engineers.' },
  { city: 'Shenzhen', lat: 22.54, lng: 114.06, note: 'The hardware capital of the world.' },
  { city: 'Tokyo', lat: 35.68, lng: 139.69, note: 'Deep robotics and consumer-tech roots.' },
  { city: 'Singapore', lat: 1.35, lng: 103.82, note: 'Asia’s gateway for global tech HQs.' },
  { city: 'São Paulo', lat: -23.55, lng: -46.63, note: 'Latin America’s biggest tech market.' },
  { city: 'Lagos', lat: 6.52, lng: 3.37, note: 'The heart of Africa’s startup boom.' },
  { city: 'Nairobi', lat: -1.29, lng: 36.82, note: '“Silicon Savannah” — mobile-money pioneer.' },
]

export const TECH_FACTS: string[] = [
  'GitHub now hosts over 100 million developers worldwide.',
  'JavaScript has topped the most-used language survey for a decade running.',
  'India is on track to host the world’s largest developer community.',
  'The global software market is worth north of $700 billion — and growing.',
  'An estimated 75% of developers now use AI-assisted coding tools.',
  'Open-source software underpins roughly 90% of modern applications.',
  'Stack Overflow serves over 100 million developers every month.',
  'TypeScript adoption has overtaken plain JavaScript in new projects.',
  'Most production outages trace back to config and deploys, not code.',
  'The average web page has tripled in size over the last decade.',
]
