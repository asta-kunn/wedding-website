import { Cormorant_Garamond, Jost, Mrs_Saint_Delafield } from "next/font/google";
import { ACTIVE_THEME } from "@/config/theme";
import "./invitation.css";

// Font undangan, terpisah dari font aplikasi admin. Diload di sini saja
// supaya tidak menambah bundle ke halaman /login, /guests, dll.
const display = Cormorant_Garamond({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inv-display",
  display: "swap",
});

const body = Jost({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-inv-body",
  display: "swap",
});

const script = Mrs_Saint_Delafield({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-inv-script",
  display: "swap",
});

export default function InvitationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-theme={ACTIVE_THEME}
      className={`invitation-root ${display.variable} ${body.variable} ${script.variable}`}
    >
      {children}
    </div>
  );
}
