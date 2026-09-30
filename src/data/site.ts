export const site = {
  name: 'CalcSolver',
  domain: 'calcsolver.info',
  url: 'https://calcsolver.info',
  description: 'A free online calculator for everyday arithmetic, scientific calculations, fractions and percentages. Simple tools. Clear answers.',
};

export const categories = [
  { slug: 'algebra', name: 'Algebra', heading: 'Basic Algebra', symbol: 'x²', description: 'Make sense of expressions, equations and polynomials.' },
  { slug: 'percent-and-decimal', name: 'Percent and Decimal', heading: 'Percent and Decimal', symbol: '%', description: 'Move confidently between fractions, decimals and percentages.' },
  { slug: 'equivalent-fractions', name: 'Equivalent fractions', heading: 'Equivalent Fractions', symbol: '½', description: 'Find different fractions that represent the same value.' },
] as const;

export type CategorySlug = typeof categories[number]['slug'];
