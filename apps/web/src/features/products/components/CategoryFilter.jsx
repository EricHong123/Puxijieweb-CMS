
import React, { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { DEFAULT_LOCALE, isSupportedLocale, t } from '@/shared/lib/i18n.js';

function CategoryFilter({ activeCategory, onCategoryChange, variant = 'top', counts = {}, locale = DEFAULT_LOCALE }) {
  const loc = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const categories = ['All', 'Waterproof Bluetooth Speaker', 'Normal Bluetooth Speaker', 'Specialty Speaker', 'Bluetooth Earbuds'];

  const labelFor = useMemo(() => {
    return (category) => {
      if (category === 'All') return t(loc, 'categories.all');
      if (category === 'Waterproof Bluetooth Speaker') return t(loc, 'categories.waterproofBt');
      if (category === 'Normal Bluetooth Speaker') return t(loc, 'categories.normalBt');
      if (category === 'Specialty Speaker') return t(loc, 'categories.specialty');
      if (category === 'Bluetooth Earbuds') return t(loc, 'categories.earbuds');
      return category;
    };
  }, [loc]);

  const tabShort = useMemo(() => {
    return (category) => {
      if (category === 'All') return t(loc, 'categories.tabAll');
      if (category === 'Waterproof Bluetooth Speaker') return t(loc, 'categories.tabWaterproof');
      if (category === 'Normal Bluetooth Speaker') return t(loc, 'categories.tabNormal');
      if (category === 'Specialty Speaker') return t(loc, 'categories.tabSpecialty');
      if (category === 'Bluetooth Earbuds') return t(loc, 'categories.tabEarbuds');
      return category;
    };
  }, [loc]);

  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="w-full">
      <TabsList
        className={
          variant === 'sidebar'
            ? 'flex h-auto w-full flex-col items-stretch justify-start gap-1 bg-transparent p-0'
            : 'relative mx-auto flex w-full max-w-full items-center gap-2 overflow-x-auto rounded-2xl bg-secondary/60 p-1.5 shadow-sm ring-1 ring-gray-200/70 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        }
      >
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            className={
              variant === 'sidebar'
                ? 'h-auto w-full justify-start whitespace-normal rounded-lg border border-transparent bg-transparent px-2 py-2 text-xs font-medium text-gray-700 hover:border-gray-200 hover:bg-gray-50 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all duration-200 group'
                : 'shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors duration-200 hover:bg-white/70 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm'
            }
          >
            {variant === 'sidebar' ? (
              <span className="flex min-h-[2rem] w-full items-start justify-between gap-2">
                <span className="flex min-w-0 flex-1 items-start gap-2">
                  <div className="flex-shrink-0">
                    {category === 'All' && (
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    )}
                    {category === 'Waterproof Bluetooth Speaker' && (
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                    {category === 'Normal Bluetooth Speaker' && (
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    )}
                    {category === 'Specialty Speaker' && (
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {category === 'Bluetooth Earbuds' && (
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 9a3 3 0 013-3h1a3 3 0 013 3v8a3 3 0 01-3 3h-1a3 3 0 01-3-3V9zm10 2a3 3 0 00-3-3h-1m4 3v6m0-6a3 3 0 013-3h0v12h0a3 3 0 01-3-3v-6z"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="min-w-0 whitespace-normal break-words text-left text-xs font-medium leading-tight text-gray-700 transition-colors group-hover:text-gray-900">
                    {labelFor(category)}
                  </span>
                </span>
                <span
                  className={
                    activeCategory === category
                      ? 'mt-0.5 inline-flex h-4 min-w-[1.25rem] flex-shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 px-1 text-xs font-semibold text-blue-700'
                      : 'mt-0.5 inline-flex h-4 min-w-[1.25rem] flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-1 text-xs font-semibold text-gray-600'
                  }
                >
                  {typeof counts?.[category] === 'number' ? counts[category] : ''}
                </span>
              </span>
            ) : (
              <span className="whitespace-nowrap">
                {tabShort(category)}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default CategoryFilter;
