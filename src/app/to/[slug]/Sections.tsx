"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CONTENT } from "@/config/content";
import { EVENTS } from "@/config/event";
import { t, type Lang } from "@/config/i18n";
import { buildIcs } from "@/lib/ics";
import PhotoFrame from "./PhotoFrame";
import Reveal from "./Reveal";
import { FloralDecor, LaceEdge } from "./Decor";

const GALLERY_TILTS = [-3, 2, -2, 3, -1.5, 2.5];

const GALLERY_IMAGES = Array.from({ length: CONTENT.galleryCount }, (_, i) => ({
  src: `/images/placeholder/gallery-${(i % 6) + 1}.svg`,
  alt: `Foto galeri ${i + 1}`,
}));

export function Quotes({ lang }: { lang: Lang }) {
  return (
    <section className="mx-auto max-w-md px-6 py-20 text-center">
      <Reveal variant="fade">
        <p className="font-inv-display text-2xl leading-relaxed" style={{ color: "var(--inv-ink)" }}>
          {CONTENT.quote[lang]}
        </p>
      </Reveal>
    </section>
  );
}

export function Couple() {
  return (
    <section className="mx-auto max-w-md px-6 py-16 text-center">
      <Reveal variant="fade">
        <p className="eyebrow-inv">{t("couple", "id")}</p>
      </Reveal>
      <Reveal variant="grow" className="relative mx-auto mt-6 w-52">
        {/* bingkai ukir krem, disamakan dengan referensi jsambac.com/tema-19 */}
        <div
          className="relative aspect-square overflow-hidden rounded-sm p-3"
          style={{
            borderImageSource: "url('/images/decor/ornate-frame.svg')",
            borderImageSlice: 30,
            borderImageWidth: "18px",
            borderImageRepeat: "stretch",
            borderStyle: "solid",
            borderWidth: "18px",
            backgroundColor: "var(--inv-frame,#f5efe4)",
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[1px]">
            <Image
              src="/images/placeholder/couple.svg"
              alt="Foto mempelai"
              fill
              sizes="208px"
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </Reveal>

      <Reveal variant="left" className="mt-8">
        <h2 className="font-inv-script text-4xl" style={{ color: "var(--inv-accent)" }}>
          {CONTENT.groom.shortName}
        </h2>
        <p className="font-inv-display mt-1 text-xl">{CONTENT.groom.fullName}</p>
        <p className="mt-2 text-sm" style={{ color: "var(--inv-ink-mute)" }}>
          {CONTENT.groom.parents}
        </p>
      </Reveal>

      <Reveal variant="grow" className="my-8 font-inv-script text-3xl" delay={120}>
        <span style={{ color: "var(--inv-accent)" }}>&amp;</span>
      </Reveal>

      <Reveal variant="right">
        <h2 className="font-inv-script text-4xl" style={{ color: "var(--inv-accent)" }}>
          {CONTENT.bride.shortName}
        </h2>
        <p className="font-inv-display mt-1 text-xl">{CONTENT.bride.fullName}</p>
        <p className="mt-2 text-sm" style={{ color: "var(--inv-ink-mute)" }}>
          {CONTENT.bride.parents}
        </p>
      </Reveal>
    </section>
  );
}

export function StoryTimeline({ lang }: { lang: Lang }) {
  return (
    <section className="relative mx-auto max-w-md overflow-hidden px-6 py-16">
      <FloralDecor className="anim-idle pointer-events-none absolute -left-8 bottom-0 w-40 rotate-180" />
      <LaceEdge className="absolute right-0 top-0 h-full w-12" />
      <div className="relative pr-8">
        <Reveal variant="fade">
          <p className="eyebrow-inv text-center">{t("ourStory", lang)}</p>
        </Reveal>
        <ol className="mt-8 space-y-8 border-l" style={{ borderColor: "var(--inv-border)" }}>
          {CONTENT.story.map((item, index) => (
            <li key={item.year + index} className="relative pl-6">
              <Reveal variant={index % 2 === 0 ? "left" : "right"} delay={(index % 2) * 90}>
                <span
                  aria-hidden
                  className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--inv-accent)" }}
                />
                <p className="font-inv-display text-lg" style={{ color: "var(--inv-accent)" }}>
                  {item.year}
                </p>
                <p className="mt-1 font-medium">{item.title[lang]}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--inv-ink-mute)" }}>
                  {item.text[lang]}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function EventCard({
  event,
  lang,
  delay = 0,
}: {
  event: (typeof EVENTS)[number];
  lang: Lang;
  delay?: number;
}) {
  const date = new Date(event.start);
  const dateLabel = date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeLabel = date.toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  function downloadIcs() {
    const ics = buildIcs({
      title: event.name,
      location: `${event.venue}, ${event.address}`,
      start: event.start,
      end: event.end,
      uid: `${event.key}@undangan`,
    });
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.key}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Reveal variant="up" delay={delay} className="rounded-md border p-6 text-center">
      <div style={{ borderColor: "var(--inv-border)" }} className="rounded-md">
        <p className="font-inv-display text-2xl" style={{ color: "var(--inv-accent)" }}>
          {event.name}
        </p>
        <p className="mt-3 text-sm">{dateLabel}</p>
        <p className="text-sm" style={{ color: "var(--inv-ink-mute)" }}>
          {timeLabel}
        </p>
        <p className="mt-4 font-medium">{event.venue}</p>
        <p className="mt-1 text-sm" style={{ color: "var(--inv-ink-mute)" }}>
          {event.address}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <a href={event.mapsUrl} target="_blank" rel="noreferrer" className="btn-inv">
            {t("viewLocation", lang)}
          </a>
          <button onClick={downloadIcs} className="btn-inv-outline">
            {t("saveToCalendar", lang)}
          </button>
        </div>
      </div>
    </Reveal>
  );
}

export function EventDetails({ lang }: { lang: Lang }) {
  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <Reveal variant="fade">
        <p className="eyebrow-inv text-center">{t("eventDetail", lang)}</p>
      </Reveal>
      <div className="mt-8 space-y-6">
        {EVENTS.map((event, index) => (
          <EventCard key={event.key} event={event} lang={lang} delay={index * 140} />
        ))}
      </div>
    </section>
  );
}

function useCountdown(target: string) {
  const [remaining, setRemaining] = useState<number>(() => new Date(target).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(new Date(target).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const clamped = Math.max(0, remaining);
  return {
    days: Math.floor(clamped / 86400000),
    hours: Math.floor((clamped / 3600000) % 24),
    minutes: Math.floor((clamped / 60000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

export function Countdown({ lang }: { lang: Lang }) {
  const { days, hours, minutes, seconds } = useCountdown(EVENTS[0].start);
  const units = [
    { value: days, label: t("days", lang) },
    { value: hours, label: t("hours", lang) },
    { value: minutes, label: t("minutes", lang) },
    // detik ikut berdenyut, meniru animationcountertime tema-19
    { value: seconds, label: t("seconds", lang), pulse: true },
  ];

  return (
    <section className="mx-auto max-w-md px-6 py-16 text-center">
      <Reveal variant="fade">
        <p className="eyebrow-inv">{t("countdownTitle", lang)}</p>
      </Reveal>
      <div className="mt-6 grid grid-cols-4 gap-2">
        {units.map((unit, index) => (
          <Reveal key={unit.label} variant="grow" delay={index * 110}>
            <div className="rounded-md border py-4" style={{ borderColor: "var(--inv-border)" }}>
              <p
                className={`font-inv-display text-2xl ${unit.pulse ? "anim-counter" : ""}`}
                style={{ color: "var(--inv-accent)" }}
              >
                {String(unit.value).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest" style={{ color: "var(--inv-ink-mute)" }}>
                {unit.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Gallery({ lang }: { lang: Lang }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <Reveal variant="fade">
        <p className="eyebrow-inv text-center">{t("gallery", lang)}</p>
      </Reveal>
      <div className="mt-8 grid grid-cols-2 gap-5">
        {GALLERY_IMAGES.map((img, index) => (
          <Reveal key={img.src + index} variant={index % 2 === 0 ? "left" : "right"} delay={(index % 2) * 90}>
            <button
              onClick={() => setLightbox(index)}
              className="block w-full"
              aria-label={`Perbesar ${img.alt}`}
            >
              <PhotoFrame
                src={img.src}
                alt={img.alt}
                priority={index < 2}
                tilt={GALLERY_TILTS[index % GALLERY_TILTS.length]}
              />
            </button>
          </Reveal>
        ))}
      </div>

      {lightbox !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setLightbox(null)}
        >
          <div className="relative w-full max-w-sm">
            <Image
              src={GALLERY_IMAGES[lightbox].src}
              alt={GALLERY_IMAGES[lightbox].alt}
              width={800}
              height={1000}
              className="h-auto w-full rounded-sm"
              unoptimized
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function QrCheckin({
  lang,
  guest,
  qrDataUrl,
}: {
  lang: Lang;
  guest: { name: string; pax: number | null; code: string } | null;
  qrDataUrl: string | null;
}) {
  if (!guest || !qrDataUrl) return null;

  return (
    <section className="mx-auto max-w-md px-6 py-16 text-center">
      <Reveal variant="fade">
        <p className="eyebrow-inv">{t("qrTitle", lang)}</p>
        <p className="mt-2 text-sm" style={{ color: "var(--inv-ink-mute)" }}>
          {t("qrDesc", lang)}
        </p>
      </Reveal>
      <Reveal variant="grow" delay={120}>
        <div className="mx-auto mt-6 max-w-[280px] rounded-md bg-white p-5 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt={`Kode QR untuk ${guest.name}`} className="h-auto w-full" />
          <p className="mt-4 font-inv-display text-lg text-[#17171a]">{guest.name}</p>
          <p className="text-xs text-[#6b6152]">
            {guest.pax ?? 1} {t("qrGuestCount", lang)}
          </p>
        </div>
      </Reveal>
      <Reveal variant="up" delay={220}>
        <a
          href={qrDataUrl}
          download={`qr-${guest.code}.png`}
          className="btn-inv mt-5 inline-block"
        >
          {t("saveQr", lang)}
        </a>
      </Reveal>
    </section>
  );
}

export function RsvpAndWishes({ lang, slug }: { lang: Lang; slug: string | null }) {
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"hadir" | "tidak_hadir" | "ragu">("hadir");
  const [pax, setPax] = useState("1");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishes, setWishes] = useState<
    { name: string; attendance: string; message: string | null; created_at: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/rsvp", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setWishes(data.rsvps ?? []))
      .catch(() => {});
  }, [sent]);

  const attendanceOptions = useMemo(
    () => [
      { key: "hadir" as const, label: t("attendYes", lang) },
      { key: "ragu" as const, label: t("attendMaybe", lang) },
      { key: "tidak_hadir" as const, label: t("attendNo", lang) },
    ],
    [lang]
  );

  async function submit() {
    if (!name.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          name,
          attendance,
          pax: Number(pax),
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim.");
        return;
      }
      setSent(true);
      setName("");
      setMessage("");
    } catch {
      setError("Koneksi terputus.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <Reveal variant="fade">
        <p className="eyebrow-inv text-center">{t("rsvpTitle", lang)}</p>
      </Reveal>

      <Reveal variant="up" className="mt-6">
        {sent ? (
          <p className="rounded-md border p-4 text-center text-sm" style={{ borderColor: "var(--inv-border)" }}>
            {t("rsvpSent", lang)}
          </p>
        ) : (
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("rsvpName", lang)}
              className="input-inv"
            />
            <div className="flex gap-2">
              {attendanceOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAttendance(opt.key)}
                  className={`chip-inv ${attendance === opt.key ? "chip-inv-active" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {attendance === "hadir" ? (
              <input
                value={pax}
                onChange={(e) => setPax(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder={t("rsvpPax", lang)}
                className="input-inv"
              />
            ) : null}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("rsvpMessage", lang)}
              rows={3}
              className="input-inv resize-none"
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button onClick={submit} disabled={sending || !name.trim()} className="btn-inv w-full">
              {t("rsvpSubmit", lang)}
            </button>
          </div>
        )}
      </Reveal>

      {wishes.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {wishes.map((wish, index) => (
            <li key={index} className="rounded-md border p-4" style={{ borderColor: "var(--inv-border)" }}>
              <Reveal variant="up">
                <p className="font-medium">{wish.name}</p>
                {wish.message ? (
                  <p className="mt-1 text-sm" style={{ color: "var(--inv-ink-mute)" }}>
                    {wish.message}
                  </p>
                ) : null}
              </Reveal>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function Closing({ lang }: { lang: Lang }) {
  return (
    <section className="relative mx-auto max-w-md overflow-hidden px-6 py-24 text-center">
      <FloralDecor className="anim-idle pointer-events-none absolute -right-10 -top-6 w-36 rotate-45" />
      <FloralDecor className="anim-idle pointer-events-none absolute -left-10 -bottom-6 w-36 rotate-[225deg]" />
      <Reveal variant="grow">
        <p className="font-inv-script text-4xl" style={{ color: "var(--inv-accent)" }}>
          {t("closingTitle", lang)}
        </p>
      </Reveal>
      <Reveal variant="up" delay={150}>
        <p className="mt-6 text-sm leading-relaxed" style={{ color: "var(--inv-ink-mute)" }}>
          {CONTENT.closing[lang]}
        </p>
      </Reveal>
    </section>
  );
}
