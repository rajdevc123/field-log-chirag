// Exact easing functions from stefanvitasovic.dev
export const easeOutExpo = (t: number): number =>
  1 - (Math.pow(2, -10 * t) - 0.0009765625) * 1.0009775171065494;

export const easeOutCirc = (t: number): number =>
  Math.sqrt(1 - --t * t);

export const easeInOutQuad = (t: number): number =>
  ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
