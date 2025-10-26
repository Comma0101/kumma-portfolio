'use client';

import React from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/posts';
import styles from '@/styles/LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  availableLocales: Locale[];
  slug: string;
}

const localeLabels: Record<Locale, string> = {
  en: 'EN',
  zh: '中文',
};

export default function LanguageSwitcher({ 
  currentLocale, 
  availableLocales, 
  slug 
}: LanguageSwitcherProps) {
  if (availableLocales.length <= 1) {
    return null; // Don't show switcher if only one language available
  }

  return (
    <div className={styles.languageSwitcher}>
      {availableLocales.map((locale) => {
        const isActive = locale === currentLocale;
        return (
          <Link
            key={locale}
            href={`/blog/${locale}/${slug}`}
            className={`${styles.languageButton} ${isActive ? styles.active : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </div>
  );
}
