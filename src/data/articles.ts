import type { CategorySlug } from './site';

export interface Section { heading: string; paragraphs: string[]; example?: string; bullets?: string[] }
export interface Article {
  slug: string;
  title: string;
  seoTitle?: string;
  category: CategorySlug;
  description: string;
  kind: 'percent' | 'equivalent' | 'algebra';
  numerator?: number;
  denominator?: number;
  sections?: Section[];
}

const percentPairs = [[1,4],[7,10],[6,7],[5,6],[1,3],[1,2],[7,8],[5,8],[3,5],[1,5],[3,4],[1,8]] as const;
const equivalentPairs = [[13,17],[11,17],[11,13],[8,9],[4,7],[1,7],[7,9],[2,9],[3,4],[5,7],[2,3],[1,3]] as const;

const algebra: Article[] = [
  {
    slug: 'remainder-theorem', title: 'What Is the Remainder Theorem?', category: 'algebra', kind: 'algebra',
    description: 'Use the remainder theorem to find the remainder of polynomial division. Follow a worked example, see why P(a) gives the answer and connect it to factors.',
    sections: [
      { heading: 'The rule', paragraphs: ['When a polynomial P(x) is divided by x − a, the remainder is P(a). Substitute a into the polynomial instead of doing a full division.'], example: 'P(x) = x² + 3x + 2. Dividing by x − 2 gives a remainder of P(2) = 4 + 6 + 2 = 12.' },
      { heading: 'Why it works', paragraphs: ['Polynomial division writes P(x) = (x − a)Q(x) + r. Setting x = a makes the first term zero, leaving P(a) = r.'] },
      { heading: 'The factor theorem', paragraphs: ['If P(a) = 0, the remainder is zero, so x − a is a factor of P(x).'], example: 'For P(x) = x² − 9, P(3) = 0. Therefore x − 3 is a factor, and x² − 9 = (x − 3)(x + 3).' },
    ],
  },
  {
    slug: 'dividing-polynomials-by-binomials', title: 'Dividing Polynomials by Binomials', category: 'algebra', kind: 'algebra',
    description: 'Learn polynomial long division by a binomial with a worked example. Divide, multiply and subtract each term, then check the quotient and remainder.',
    sections: [
      { heading: 'Start with the highest power', paragraphs: ['Write both polynomials in descending powers. Include a zero term for any missing power so that the columns line up. Divide the first term of the dividend by the first term of the divisor.'], example: '(x² + 5x + 6) ÷ (x + 2): x² ÷ x = x.' },
      { heading: 'Multiply, subtract, repeat', paragraphs: ['Multiply x by the whole divisor to get x² + 2x. Subtract this from the dividend to leave 3x + 6. Then 3x ÷ x = 3. Subtract 3(x + 2) and the remainder is zero.'], example: '(x² + 5x + 6) ÷ (x + 2) = x + 3.' },
      { heading: 'Check your answer', paragraphs: ['Multiply the quotient by the divisor and add the remainder. You should get back the original dividend.'], example: '(x + 3)(x + 2) = x² + 5x + 6.' },
    ],
  },
  {
    slug: 'factor-polynomials', title: 'How to Factor Polynomials', category: 'algebra', kind: 'algebra',
    description: 'Learn how to factor polynomials using common factors, differences of squares and monic quadratic patterns, with a worked example for each method.',
    sections: [
      { heading: 'Take out a common factor', paragraphs: ['First find the greatest factor shared by every term. Taking it outside the brackets makes the remaining expression easier to recognize.'], example: '6x² + 9x = 3x(2x + 3).' },
      { heading: 'Look for a difference of squares', paragraphs: ['A squared quantity minus another squared quantity factors into a difference multiplied by a sum.'], example: 'a² − b² = (a − b)(a + b), so x² − 16 = (x − 4)(x + 4).' },
      { heading: 'Factor a monic quadratic', paragraphs: ['For x² + bx + c, find two numbers whose sum is b and whose product is c.'], example: 'x² + 5x + 6 = (x + 2)(x + 3), because 2 + 3 = 5 and 2 × 3 = 6.' },
    ],
  },
  {
    slug: 'polynomial-definition-and-example-types-of-polynomial', title: 'Polynomials: Definition, Examples and Types', category: 'algebra', kind: 'algebra',
    seoTitle: 'Polynomial Definition, Examples & Types',
    description: 'Understand polynomial terms, coefficients and degree. Compare monomials, binomials and trinomials, and learn to combine like terms with clear examples.',
    sections: [
      { heading: 'What is a polynomial?', paragraphs: ['A polynomial is a sum of terms with constant coefficients and nonnegative integer powers of variables. Division by a variable and fractional powers of a variable are not polynomial terms.'], example: '3x² − 2x + 7 is a polynomial. 1/x and √x are not polynomials in x.' },
      { heading: 'Terms and degree', paragraphs: ['The degree of a polynomial in one variable is its highest power with a nonzero coefficient. A constant nonzero polynomial has degree zero.'], bullets: ['Monomial: one term, such as 5x³.', 'Binomial: two terms, such as x + 4.', 'Trinomial: three terms, such as x² + 2x + 1.'] },
      { heading: 'Combine like terms', paragraphs: ['Terms with the same variables and powers can be added by adding their coefficients.'], example: '3x² + 2x + 4x² − x = 7x² + x.' },
    ],
  },
  {
    slug: 'basic-algebra-formula', title: 'Basic Algebra Formulas with Examples', category: 'algebra', kind: 'algebra',
    description: 'Review basic algebra formulas for expanding brackets, squares of sums and differences, and linear equations. Each rule includes a worked example.',
    sections: [
      { heading: 'The distributive property', paragraphs: ['Multiply the outside factor by every term inside the brackets. This works in reverse when you factor an expression.'], example: 'a(b + c) = ab + ac. For example, 3(x + 4) = 3x + 12.' },
      { heading: 'Squares of sums and differences', paragraphs: ['Squaring brackets means multiplying them by themselves. Include the middle term from both cross-products.'], example: '(a + b)² = a² + 2ab + b²; (a − b)² = a² − 2ab + b².' },
      { heading: 'Solve a linear equation', paragraphs: ['For ax + b = c with a ≠ 0, subtract b from both sides and divide both sides by a.'], example: '4x + 3 = 19 → 4x = 16 → x = 4.' },
    ],
  },
  {
    slug: 'algebraic-fractions', title: 'Algebraic Fractions: Worked Examples', category: 'algebra', kind: 'algebra',
    description: 'Simplify, add, multiply and divide algebraic fractions with worked examples. Learn to cancel factors, find common denominators and check restrictions.',
    sections: [
      { heading: 'Cancel factors, not terms', paragraphs: ['Factor the numerator and denominator before cancelling common factors. A denominator may never be zero.'], example: '(x² − 4)/(x + 2) = x − 2, with x ≠ −2.' },
      { heading: 'Find a common denominator', paragraphs: ['When adding fractions, rewrite each one using the same denominator, then add the numerators.'], example: '1/x + 1/(x + 1) = (2x + 1)/(x(x + 1)), with x ≠ 0 and x ≠ −1.' },
      { heading: 'Multiply and divide', paragraphs: ['Multiply numerators together and denominators together. To divide, multiply by the reciprocal of the second fraction; that fraction must be nonzero.'], example: '(2x/3) × (9/(4x)) = 3/2, with x ≠ 0.' },
    ],
  },
  {
    slug: 'algebraic-expressions-types-operations-and-examples', title: 'Algebraic Expressions: Operations and Examples', category: 'algebra', kind: 'algebra',
    seoTitle: 'Algebraic Expressions: Types & Examples',
    description: 'Learn how variables, coefficients and operations form algebraic expressions. Evaluate a variable, combine like terms and compare expressions with equations.',
    sections: [
      { heading: 'Expressions and equations', paragraphs: ['An expression represents a value; an equation states that two expressions are equal. A variable stands for a number that may change or needs to be found.'], example: '2x + 5 is an expression. 2x + 5 = 11 is an equation.' },
      { heading: 'Evaluate an expression', paragraphs: ['Substitute a value for each variable, then follow the order of operations. Use brackets when substituting a negative value.'], example: 'If x = −3, then x² + 2x = (−3)² + 2(−3) = 3.' },
      { heading: 'Simplify like terms', paragraphs: ['Combine matching variable parts and keep unlike terms separate.'], example: '4x + 3y − x + 2y = 3x + 5y.' },
    ],
  },
];

export const articles: Article[] = [
  ...algebra,
  ...percentPairs.map(([numerator,denominator]):Article => ({
    slug: `${numerator}-${denominator}-as-a-percent-and-decimal`,
    title: `${numerator}/${denominator} as a Percent and Decimal`,
    category: 'percent-and-decimal', kind: 'percent', numerator, denominator,
    description: `Convert ${numerator}/${denominator} to a decimal and percentage with a clear answer, a visual fraction and a step-by-step calculation.`,
  })),
  ...equivalentPairs.map(([numerator,denominator]):Article => ({
    slug: `what-is-equivalent-to-${numerator}-${denominator}-fraction`,
    title: `What Is Equivalent to ${numerator}/${denominator}?`,
    category: 'equivalent-fractions', kind: 'equivalent', numerator, denominator,
    description: `Find equivalent fractions for ${numerator}/${denominator}, see a fraction diagram and learn why multiplying both parts keeps the value the same.`,
  })),
];

export function fractionInfo(numerator: number, denominator: number) {
  const decimal = numerator / denominator;
  let reduced = denominator;
  for (const prime of [2, 5]) while (reduced % prime === 0) reduced /= prime;
  return {
    decimal: Number(decimal.toFixed(6)).toString(),
    percent: Number((decimal * 100).toFixed(4)).toString(),
    approximate: reduced !== 1,
  };
}
