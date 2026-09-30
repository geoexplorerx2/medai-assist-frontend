import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MedAI-Assist — سامانه هوش مصنوعی بالینی',
  description: 'دستیار هوشمند اسناد پزشکی، استخراج شواهد بالینی و بازیابی دانش تخصصی RAG',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html id="medai-html-root" lang="fa" dir="rtl">
      <head id="medai-head-root">
        <link id="font-preconnect-google" rel="preconnect" href="https://fonts.googleapis.com" />
        <link id="font-preconnect-gstatic" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          id="font-vazirmatn-link"
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body id="medai-body-root" className="antialiased font-sans bg-slate-950 text-slate-100">
        <div id="medai-app-root">
          {children}
        </div>
      </body>
    </html>
  );
}