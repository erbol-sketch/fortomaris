import './globals.css';
import { CONFIG } from '../config';

export const metadata = {
  title: CONFIG.siteTitle,
  description: 'Маленький сюрприз 💌',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ff5c8a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;600;700&family=Pacifico&display=swap&subset=cyrillic"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
