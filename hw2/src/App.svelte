<script>
  import {
    addTwoNumbers,
    stringLength,
    numbers,
    doubledNumbers,
  } from './answers.js'
</script>

<main>
  <h1>HW2 JavaScript Answers</h1>

  <section>
    <h2>1A. Arrow Function</h2>
    <p><code>const addTwoNumbers = (a, b) =&gt; a + b;</code></p>
    <p>Example: addTwoNumbers(4, 7) = {addTwoNumbers(4, 7)}</p>
  </section>

  <section>
    <h2>1B. String Length</h2>
    <p><code>const stringLength = (myStr) =&gt; myStr.length &lt; 10 ? 'short' : 'long';</code></p>
    <p>"Svelte" is {stringLength('Svelte')}.</p>
    <p>"JavaScript" is {stringLength('JavaScript')}.</p>
  </section>

  <section>
    <h2>2. Larger Number Function</h2>
    <p><code>let fn = (a, b) =&gt; &#123; a &gt; b ? console.log(a) : console.log(b) &#125;</code></p>
    <p>This function prints the larger value between <code>a</code> and <code>b</code>.</p>
  </section>

  <section>
    <h2>3. map() Example</h2>
    <p>Original array: {numbers.join(', ')}</p>
    <p>Doubled array: {doubledNumbers.join(', ')}</p>
    <p><code>const doubledNumbers = numbers.map((number) =&gt; number * 2);</code></p>
  </section>
</main>
