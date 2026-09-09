# HW2: JavaScript and Svelte Notes

## JavaScript

### 1A. Convert `addTwoNumbers` to an arrow function

Original function:

```js
function addTwoNumbers(a, b) {
  return a + b;
}
```

Arrow function:

```js
const addTwoNumbers = (a, b) => a + b;
```

This function takes two numbers, `a` and `b`, and returns their sum.

### 1B. Convert `stringLength` to an arrow function

Original function:

```js
function stringLength(myStr) {
  if (myStr.length < 10) {
    return "short";
  }
  return "long";
}
```

Arrow function:

```js
const stringLength = (myStr) => {
  if (myStr.length < 10) {
    return "short";
  }
  return "long";
};
```

Shorter version using a ternary operator:

```js
const stringLength = (myStr) => (myStr.length < 10 ? "short" : "long");
```

This function checks the length of a string. If the string has fewer than 10
characters, it returns `"short"`. Otherwise, it returns `"long"`.

### 2. What does this arrow function do?

```js
let fn = (a, b) => { a > b ? console.log(a) : console.log(b) };
```

This arrow function compares two values, `a` and `b`, and prints the larger value
to the console.

- If `a > b`, it prints `a`.
- Otherwise, it prints `b`.

Example:

```js
fn(10, 5); // prints 10
fn(3, 8);  // prints 8
```

### 3. Example using `map()` on an array

```js
const numbers = [1, 2, 3, 4];
const doubledNumbers = numbers.map((number) => number * 2);

console.log(doubledNumbers); // [2, 4, 6, 8]
```

The `map()` function creates a new array by applying a function to every element
in the original array. In this example, each number is multiplied by 2.

Another example with objects:

```js
const products = [
  { name: "laptop", price: 800 },
  { name: "phone", price: 200 },
  { name: "tv", price: 1200 }
];

const discountedProducts = products.map((product) => ({
  ...product,
  salePrice: product.price * 0.9
}));

console.log(discountedProducts);
```

This creates a new array of product objects and adds a `salePrice` property to
each object.

## Svelte

For the Svelte part of HW2:

1. Complete the Basic Svelte tutorial only.
2. Skip the Advanced Svelte tutorial unless doing extra practice.
3. Skip the SvelteKit tutorials because this course is using Svelte, not SvelteKit.
4. Submit a couple of screenshots taken while completing the Basic Svelte tutorial.
5. Read Tutorial 7: Svelte and VSCode.

This `hw2` folder is a starter Svelte + Vite project, not a SvelteKit project.
