import { Roboto_Mono } from "next/font/google";
import '../styles/index.css';
import '../styles/app.css';

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={robotoMono.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
