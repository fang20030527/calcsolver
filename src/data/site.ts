export const site = {
  name: 'CalcSolver',
  domain: 'calcsolver.info',
  url: 'https://calcsolver.info',
  description: 'Use our free online scientific calculator for arithmetic, powers, roots and percentages. Learn fractions and algebra with clear answers and worked examples.',
};

export const categories = [
  { slug: 'algebra', name: 'Algebra', heading: 'Basic Algebra', symbol: 'x²', description: 'Make sense of expressions, equations and polynomials.' },
  { slug: 'percent-and-decimal', name: 'Percent and Decimal', heading: 'Fraction to Decimal and Percent', symbol: '%', description: 'Move confidently between fractions, decimals and percentages.' },
  { slug: 'equivalent-fractions', name: 'Equivalent fractions', heading: 'Equivalent Fractions', symbol: '½', description: 'Find different fractions that represent the same value.' },
] as const;

export type CategorySlug = typeof categories[number]['slug'];
