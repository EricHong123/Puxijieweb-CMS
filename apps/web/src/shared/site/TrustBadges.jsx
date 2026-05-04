import React from 'react';
import { Shield, Factory, Globe, Award, CheckCircle2 } from 'lucide-react';

const TRUST_BADGES = [
  {
    icon: Shield,
    label: 'ISO Certified',
    detail: '9001 / 14001 / BSCI',
  },
  {
    icon: Factory,
    label: 'Since 2013',
    detail: '12+ years manufacturing',
  },
  {
    icon: Award,
    label: 'Six Sigma',
    detail: '<0.3% field returns',
  },
  {
    icon: Globe,
    label: '45+ Countries',
    detail: '6 continents served',
  },
  {
    icon: CheckCircle2,
    label: '320+ Employees',
    detail: '5,200 sqm facility',
  },
];

export default function TrustBadges({ className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4 ${className}`}>
      {TRUST_BADGES.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left shadow-sm sm:flex-col sm:items-center sm:gap-1.5 sm:px-4 sm:py-3 sm:text-center"
        >
          <badge.icon className="h-5 w-5 flex-shrink-0 text-green-600 sm:h-6 sm:w-6" />
          <div>
            <div className="text-xs font-semibold text-gray-900 sm:text-sm">{badge.label}</div>
            <div className="text-[10px] text-gray-500 sm:text-xs">{badge.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
