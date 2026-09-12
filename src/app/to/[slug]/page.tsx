import type { Metadata } from "next";
import { getPublicGuestBySlug } from "@/lib/supabase";
import { qrPayload } from "@/lib/guest";
import InvitationApp from "./InvitationApp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadGuest(slug: string) {
  try {
    return await getPublicGuestBySlug(slug);
  } catch {
    // Slug tidak ketemu atau DB bermasalah — tetap tampilkan undangan umum, jangan crash.
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const guest = await loadGuest(params.slug);
  const title = guest ? `Undangan Pernikahan — untuk ${guest.name}` : "Undangan Pernikahan";
  return {
    title,
    description: "Anda diundang ke acara pernikahan kami.",
    openGraph: { title, description: "Anda diundang ke acara pernikahan kami." },
  };
}

export default async function InvitationPage({ params }: { params: { slug: string } }) {
  const guest = await loadGuest(params.slug);

  let qrDataUrl: string | null = null;
  if (guest) {
    // Render QR di server, isi persis sama dengan yang dipakai scanner admin (lib/guest.ts qrPayload).
    const QRCode = (await import("qrcode")).default;
    qrDataUrl = await QRCode.toDataURL(qrPayload(guest.code, process.env.NEXT_PUBLIC_INVITE_BASE), {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 480,
      color: { dark: "#17171aFF", light: "#FFFFFFFF" },
    });
  }

  return <InvitationApp slug={guest ? params.slug : null} guest={guest} qrDataUrl={qrDataUrl} />;
}
