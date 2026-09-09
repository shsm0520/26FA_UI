<script>
  import {
    addTwoNumbers,
    stringLength,
    numbers,
    doubledNumbers,
    products,
    discountedProducts,
  } from './answers.js'
</script>

<main class="assignment-page">
  <section class="hero-card">
    <p class="eyebrow">HW2</p>
    <h1>JavaScript + Svelte Practice</h1>
    <p>
      This page shows the JavaScript arrow function and array map examples from
      Tutorial 5 inside a starter Svelte + Vite project.
    </p>
  </section>

  <section class="grid">
    <article class="card">
      <h2>1A. Arrow Function</h2>
      <pre><code>const addTwoNumbers = (a, b) =&gt; a + b;</code></pre>
      <p>Example: <strong>addTwoNumbers(4, 7) = {addTwoNumbers(4, 7)}</strong></p>
    </article>

    <article class="card">
      <h2>1B. String Length</h2>
      <pre><code>const stringLength = (myStr) =&gt;
  myStr.length &lt; 10 ? 'short' : 'long';</code></pre>
      <ul>
        <li>"Svelte" is <strong>{stringLength('Svelte')}</strong></li>
        <li>"JavaScript" is <strong>{stringLength('JavaScript')}</strong></li>
      </ul>
    </article>

    <article class="card">
      <h2>2. Larger Number Function</h2>
      <pre><code>let fn = (a, b) =&gt; &#123;
  a &gt; b ? console.log(a) : console.log(b)
&#125;</code></pre>
      <p>
        This function compares <code>a</code> and <code>b</code>, then prints the larger
        value to the console.
      </p>
    </article>

    <article class="card">
      <h2>3. map() Example</h2>
      <p>Original numbers: {numbers.join(', ')}</p>
      <p>Doubled numbers: <strong>{doubledNumbers.join(', ')}</strong></p>
      <pre><code>const doubledNumbers = numbers.map((number) =&gt; number * 2);</code></pre>
    </article>
  </section>

  <section class="card full-width">
    <h2>map() with Objects</h2>
    <div class="products">
      {#each discountedProducts as product, index}
        <div class="product">
          <h3>{product.name}</h3>
          <p>Original price: ${products[index].price}</p>
          <p>Sale price: <strong>${product.salePrice}</strong></p>
        </div>
      {/each}
    </div>
  </section>
</main>
