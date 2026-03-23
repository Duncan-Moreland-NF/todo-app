// useTodos custom hook — will be implemented in a later story

import { useState } from 'react';

export function useTodos() {
  const [todos] = useState([]);
  return { todos };
}
