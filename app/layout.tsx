import { Roboto_Mono } from "next/font/google";
import '../styles/index.css';
import '../styles/app.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SmoothScrollProvider from '../components/SmoothScrollProvider';

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={robotoMono.className} suppressHydrationWarning>
        <SmoothScrollProvider>
          <Navigation />
          {children}
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
