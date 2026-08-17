import Nav from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto w-full max-w-3xl px-4 pt-6">{children}</div>
      <div className="no-print">
        <Nav />
      </div>
    </div>
  );
}
