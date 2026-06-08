import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Elysian Fabrics',
    short_name: 'Elysian',
    description: 'Premium Traditional Indian Fashion & Tailoring Services',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fdfbf7',
    theme_color: '#b76e79',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
