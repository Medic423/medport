import React, { useState } from 'react';

function HookTest() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hook Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default HookTest;
