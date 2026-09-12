import Image from "next/image";

/**
 * Bingkai foto galeri — gaya polaroid krem + selotip, disamakan dengan
 * referensi jsambac.com/tema-19. `tilt` dipakai Gallery untuk memberi variasi
 * kemiringan ala scrapbook; default lurus kalau tidak diisi.
 */
export default function PhotoFrame({
  src,
  alt,
  priority,
  tilt = 0,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  tilt?: number;
}) {
  return (
    <div
      className="relative rounded-[2px] bg-[var(--inv-frame,#f5efe4)] p-2 pb-6 shadow-[0_8px_18px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:z-10 hover:rotate-0"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* selotip */}
      <span
        aria-hidden
        className="absolute left-1/2 top-0 h-4 w-12 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] bg-[rgba(240,231,214,0.82)] shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
      />
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 45vw, 320px"
          className="object-cover"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          unoptimized
        />
      </div>
    </div>
  );
}
