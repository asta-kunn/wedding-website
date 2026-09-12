/**
 * Satu listener scroll bersama untuk semua elemen beranimasi — persis cara
 * js/animation-scroll.js milik tema-19:
 *
 *   scrollY + innerHeight / 1.75 > offsetTop  → pasang kelas animasi
 *   scrollY + innerHeight        < offsetTop  → lepas lagi (animasi main ulang)
 *
 * Satu handler untuk seluruh halaman, dan pengukurannya ditunda ke
 * requestAnimationFrame supaya tidak memicu layout tiap event scroll.
 */
type Watcher = { el: HTMLElement; set: (on: boolean) => void };

const watchers = new Set<Watcher>();
let frame = 0;

function measure() {
  frame = 0;
  const trigger = window.scrollY + window.innerHeight * 0.88;
  const viewportBottom = window.scrollY + window.innerHeight;
  // Elemen paling bawah halaman tidak pernah sampai ke garis pemicu di 88% layar,
  // jadi begitu halaman mentok bawah semuanya dimunculkan — tanpa ini bagian
  // penutup bisa tertinggal transparan selamanya.
  const atPageBottom = viewportBottom >= document.documentElement.scrollHeight - 2;
  watchers.forEach(({ el, set }) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (trigger > top || atPageBottom) set(true);
    else if (viewportBottom < top) set(false);
  });
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(measure);
}

export function watchScrollAnimation(el: HTMLElement, set: (on: boolean) => void) {
  if (watchers.size === 0) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  const watcher: Watcher = { el, set };
  watchers.add(watcher);
  schedule();

  return () => {
    watchers.delete(watcher);
    if (watchers.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }
  };
}
