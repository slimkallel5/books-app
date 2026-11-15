import { forwardRef } from 'react';

/** Cursor-following tooltip shown over shelf spines, matching the template's `#tip`. */
export const Tooltip = forwardRef<HTMLDivElement>(function Tooltip(_props, ref) {
  return <div id="tip" ref={ref} role="tooltip" aria-hidden="true" />;
});
