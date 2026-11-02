// Runs before first paint on a full page load, so marks that are about to
// be drawn start undrawn instead of flashing. MotionFlag covers client
// navigations, where this script does not run.
export const motionScript = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.front="motion"}catch(e){}`;
