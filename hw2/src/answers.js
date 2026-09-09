// HW2 JavaScript answers from Tutorial 5

// 1A. Arrow function version of addTwoNumbers
export const addTwoNumbers = (a, b) => a + b;

// 1B. Arrow function version of stringLength
export const stringLength = (myStr) => (myStr.length < 10 ? 'short' : 'long');

// 2. This function prints the larger of two values.
export const printLargerNumber = (a, b) => {
  a > b ? console.log(a) : console.log(b);
};

// 3. Example demonstrating map() on an array
export const numbers = [1, 2, 3, 4];
export const doubledNumbers = numbers.map((number) => number * 2);

export const products = [
  { name: 'laptop', price: 800 },
  { name: 'phone', price: 200 },
  { name: 'tv', price: 1200 },
];

export const discountedProducts = products.map((product) => ({
  ...product,
  salePrice: product.price * 0.9,
}));
