'use client';

import React from 'react';

export default function MetricsBar() {
  const metrics = [
    { value: 'R$ 37', label: 'taxa única • sem mensalidade' },
    { value: '100% online', label: 'diagnóstico e ativação assistida' },
    { value: 'A6 300 DPI', label: 'plaquinha pronta para impressão' },
    { value: '7 dias', label: 'de garantia incondicional (CDC)' },
  ];

  return (
    <section className="border-y border-[#3D3C3A] bg-[#242422]/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#3D3C3A] sm:grid-cols-4 sm:divide-y-0">
        {metrics.map((item, index) => (
          <div key={index} className="px-4 py-6 sm:py-8 text-center space-y-1">
            <strong className="block text-xl sm:text-2xl font-black text-white tracking-tight">
              {item.value}
            </strong>
            <span className="block text-xs font-medium text-[#A1A1AA]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
