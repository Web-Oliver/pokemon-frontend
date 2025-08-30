/**
 * ItemDetailSection Component
 *
 * Extracted from CollectionItemDetail.tsx to eliminate DRY violations
 * Provides generic detail section with consistent styling
 * Following CLAUDE.md principles: DRY elimination, reusable UI patterns
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface DetailItem {
  label: string;
  value: string | number;
  valueColor?: string;
}

export interface ItemDetailSectionProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  details: DetailItem[];
  className?: string;
  children?: React.ReactNode; // For additional custom content
}

export const ItemDetailSection: React.FC<ItemDetailSectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-[var(--theme-accent-primary)]',
  details,
  className = '',
  children,
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-accent-primary)]/5 via-transparent to-[var(--theme-accent-secondary)]/5" />

      {/* Main container */}
      <div className="relative bg-[var(--theme-surface)] backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-[var(--theme-border)] p-8 ring-1 ring-[var(--theme-border)]/50">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className={`mr-4 ${iconColor}`}>
            <Icon size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--theme-text-primary)]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[var(--theme-text-secondary)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {details.map((detail, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 rounded-xl bg-[var(--theme-surface-secondary)] backdrop-blur-xl border border-[var(--theme-border)]"
            >
              <span className="text-[var(--theme-text-secondary)] font-medium">
                {detail.label}:
              </span>
              <span
                className={`font-semibold ${
                  detail.valueColor || 'text-[var(--theme-text-primary)]'
                }`}
              >
                {detail.value}
              </span>
            </div>
          ))}
        </div>

        {/* Additional content */}
        {children && (
          <div className="border-t border-[var(--theme-border)] pt-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

// Specific variants for different item types
export interface PsaCardDetailProps {
  grade: number;
  certificationNumber?: string;
  gradingCompany?: string;
  dateGraded?: string;
  population?: number;
  higherGrades?: number;
  children?: React.ReactNode;
}

export const PsaCardDetailSection: React.FC<PsaCardDetailProps> = ({
  grade,
  certificationNumber,
  gradingCompany = 'PSA',
  dateGraded,
  population,
  higherGrades,
  children,
}) => {
  const details: DetailItem[] = [
    {
      label: 'Grade',
      value: grade,
      valueColor: 'text-[var(--theme-accent-primary)]',
    },
    ...(certificationNumber
      ? [{ label: 'Cert Number', value: certificationNumber }]
      : []),
    { label: 'Grading Company', value: gradingCompany },
    ...(dateGraded ? [{ label: 'Date Graded', value: dateGraded }] : []),
    ...(population
      ? [{ label: 'Population', value: population.toLocaleString() }]
      : []),
    ...(higherGrades
      ? [{ label: 'Higher Grades', value: higherGrades.toLocaleString() }]
      : []),
  ];

  return (
    <ItemDetailSection
      title="PSA Grading Details"
      subtitle="Professional Sports Authenticator grading information"
      icon={() => (
        <div className="w-8 h-8 bg-[var(--theme-accent-primary)] rounded-lg flex items-center justify-center text-white font-bold text-sm">
          PSA
        </div>
      )}
      iconColor="text-[var(--theme-accent-primary)]"
      details={details}
    >
      {children}
    </ItemDetailSection>
  );
};

export interface RawCardDetailProps {
  condition: string;
  subcondition?: string;
  centering?: string;
  corners?: string;
  edges?: string;
  surface?: string;
  children?: React.ReactNode;
}

export const RawCardDetailSection: React.FC<RawCardDetailProps> = ({
  condition,
  subcondition,
  centering,
  corners,
  edges,
  surface,
  children,
}) => {
  const details: DetailItem[] = [
    {
      label: 'Condition',
      value: condition,
      valueColor: 'text-[var(--theme-accent-secondary)]',
    },
    ...(subcondition ? [{ label: 'Subcondition', value: subcondition }] : []),
    ...(centering ? [{ label: 'Centering', value: centering }] : []),
    ...(corners ? [{ label: 'Corners', value: corners }] : []),
    ...(edges ? [{ label: 'Edges', value: edges }] : []),
    ...(surface ? [{ label: 'Surface', value: surface }] : []),
  ];

  return (
    <ItemDetailSection
      title="Raw Card Details"
      subtitle="Ungraded card condition assessment"
      icon={() => (
        <div className="w-8 h-8 bg-[var(--theme-accent-secondary)] rounded-lg flex items-center justify-center text-white font-bold text-sm">
          RC
        </div>
      )}
      iconColor="text-[var(--theme-accent-secondary)]"
      details={details}
    >
      {children}
    </ItemDetailSection>
  );
};

export interface SealedProductDetailProps {
  category: string;
  availability?: string;
  manufacturer?: string;
  releaseDate?: string;
  packCount?: number;
  cardCount?: number;
  children?: React.ReactNode;
}

export const SealedProductDetailSection: React.FC<SealedProductDetailProps> = ({
  category,
  availability,
  manufacturer = 'Pokémon',
  releaseDate,
  packCount,
  cardCount,
  children,
}) => {
  const details: DetailItem[] = [
    {
      label: 'Category',
      value: category,
      valueColor: 'text-[var(--theme-status-info)]',
    },
    ...(availability ? [{ label: 'Availability', value: availability }] : []),
    { label: 'Manufacturer', value: manufacturer },
    ...(releaseDate ? [{ label: 'Release Date', value: releaseDate }] : []),
    ...(packCount ? [{ label: 'Pack Count', value: packCount }] : []),
    ...(cardCount ? [{ label: 'Card Count', value: cardCount }] : []),
  ];

  return (
    <ItemDetailSection
      title="Sealed Product Details"
      subtitle="Product specifications and availability"
      icon={() => (
        <div className="w-8 h-8 bg-[var(--theme-status-info)] rounded-lg flex items-center justify-center text-white font-bold text-sm">
          SP
        </div>
      )}
      iconColor="text-[var(--theme-status-info)]"
      details={details}
    >
      {children}
    </ItemDetailSection>
  );
};
