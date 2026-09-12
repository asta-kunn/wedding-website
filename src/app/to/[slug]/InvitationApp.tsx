"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { t } from "@/config/i18n";
import type { PublicGuest } from "@/lib/supabase";
import {
  Closing,
  Countdown,
  Couple,
  EventDetails,
  Gallery,
  QrCheckin,
  Quotes,
  RsvpAndWishes,
  StoryTimeline,
} from "./Sections";
import { useLang } from "./useLang";

export default function InvitationApp({
  slug,
  guest,
  qrDataUrl,
}: {
  slug: string | null;
  guest: PublicGuest | null;
  qrDataUrl: string | null;
}) {
  const { lang, setLang } = useLang();
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  // Sumber kebenaran adalah event play/pause elemen audio, bukan flag terpisah —
  // supaya ikon tetap benar walau autoplay diblokir browser (umum di HP/headless).
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  function openInvitation() {
    setOpened(true);
    audioRef.current?.play().catch(() => {
      // autoplay diblokir browser — tombol mute tetap ada untuk mulai manual
    });
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  return (
    <div className={!opened ? "locked" : ""}>
      <audio
        ref={audioRef}
        src="/audio/Elephant_Kind_-_Feels_(Official_Lyric_Video).wav"
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--inv-bg)]">
          <p className="font-inv-script animate-pulse text-3xl" style={{ color: "var(--inv-accent)" }}>
            {guest?.name ?? t("generalGuest", lang)}
          </p>
        </div>
      ) : null}

      {/* Cover */}
      <section className="relative flex h-screen flex-col items-center justify-end overflow-hidden px-6 pb-16 text-center">
        <Image
          src="/images/placeholder/cover.svg"
          alt="Foto sampul"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--inv-bg)] via-[var(--inv-bg)]/40 to-transparent" />

        <div className="relative z-10">
          <p className="eyebrow-inv">{t("invitedTo", lang)}</p>
          {/* nama tamu mengambang pelan + tombol bergoyang, meniru iddle9 & swing tema-19 */}
          <p className="font-inv-script anim-idle mt-3 text-4xl" style={{ color: "var(--inv-ink)" }}>
            {guest?.name ?? t("generalGuest", lang)}
          </p>

          {!opened ? (
            <button onClick={openInvitation} className="btn-inv anim-swing mt-8">
              {t("openInvitation", lang)}
            </button>
          ) : null}
        </div>
      </section>

      {opened ? (
        <>
          <Quotes lang={lang} />
          <Couple />
          <StoryTimeline lang={lang} />
          <EventDetails lang={lang} />
          <Countdown lang={lang} />
          <Gallery lang={lang} />
          <QrCheckin lang={lang} guest={guest} qrDataUrl={qrDataUrl} />
          <RsvpAndWishes lang={lang} slug={slug} />
          <Closing lang={lang} />
        </>
      ) : null}

      {/* Floating controls */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2">
        <button
          onClick={toggleMute}
          aria-label={playing ? t("muteMusic", lang) : t("playMusic", lang)}
          className="flex h-11 w-11 items-center justify-center rounded-full border text-sm"
          style={{ borderColor: "var(--inv-border)", background: "var(--inv-bg-soft)", color: "var(--inv-ink)" }}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <div className="flex overflow-hidden rounded-full border text-[11px]" style={{ borderColor: "var(--inv-border)" }}>
          <button
            onClick={() => setLang("id")}
            className="px-2 py-1"
            style={{
              background: lang === "id" ? "var(--inv-accent)" : "var(--inv-bg-soft)",
              color: lang === "id" ? "var(--inv-bg)" : "var(--inv-ink-mute)",
            }}
          >
            ID
          </button>
          <button
            onClick={() => setLang("en")}
            className="px-2 py-1"
            style={{
              background: lang === "en" ? "var(--inv-accent)" : "var(--inv-bg-soft)",
              color: lang === "en" ? "var(--inv-bg)" : "var(--inv-ink-mute)",
            }}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
}
