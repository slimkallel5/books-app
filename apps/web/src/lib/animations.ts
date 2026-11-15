/** Shared animation helpers, all of which honour `prefers-reduced-motion`. */

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Fly a coloured rectangle from `from` to `to`, used for the add-to-cart and
 * spine-to-catalogue animations. Falls back to doing nothing when the user has
 * reduced motion enabled.
 */
export function flyElement(
  from: DOMRect,
  to: DOMRect,
  options: { color: string; width?: number; height?: number; scaleTo?: DOMRect },
): void {
  if (prefersReducedMotion()) return;

  const width = options.width ?? 28;
  const height = options.height ?? 38;
  const el = document.createElement('div');
  el.className = 'fly';
  el.style.cssText = `left:${from.left + from.width / 2 - width / 2}px;top:${from.top}px;width:${width}px;height:${height}px;background:${options.color}`;
  document.body.append(el);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const keyframes: Keyframe[] = options.scaleTo
    ? [
        { transform: 'none' },
        {
          transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 90}px) rotate(-8deg) scale(1.2)`,
          offset: 0.4,
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${options.scaleTo.width / width}, ${
            options.scaleTo.height / height
          })`,
        },
      ]
    : [
        { transform: 'none', opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy}px) rotate(200deg) scale(.4)`,
          opacity: 0.2,
        },
      ];

  el.animate(keyframes, {
    duration: options.scaleTo ? 1100 : 700,
    easing: options.scaleTo ? 'ease-in-out' : 'cubic-bezier(.5,-.3,.7,.5)',
    fill: 'forwards',
  }).onfinish = () => el.remove();
}

/** Re-trigger a CSS animation class on an element (used for the cart "bump"). */
export function replayClass(el: HTMLElement | null, className: string): void {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}
