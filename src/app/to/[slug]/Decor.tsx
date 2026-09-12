/**
 * Aset dekoratif (garis floral + tepi renda) — disamakan dengan referensi
 * jsambac.com/tema-19. File SVG-nya digambar sendiri di public/images/decor,
 * bukan diambil dari aset asli mereka.
 */
export function FloralDecor({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/decor/floral-branch.svg"
      alt=""
      aria-hidden
      className={`pointer-events-none select-none opacity-25 ${className}`}
    />
  );
}

export function LaceEdge({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none block bg-repeat-y ${className}`}
      // 48x60 menjaga rasio ubin SVG-nya (64x80) supaya lengkung tepinya tidak kepenyet
      style={{ backgroundImage: "url('/images/decor/lace-edge.svg')", backgroundSize: "48px 60px" }}
    />
  );
}
