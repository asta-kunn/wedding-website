import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm animate-riseUp">
        <div className="mb-8 text-center">
          <p className="eyebrow">Buku Tamu</p>
          <h1 className="mt-3 font-display text-[32px] leading-tight text-paper">
            Meja Penerima Tamu
          </h1>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-brass-dim/60" />
            <span className="text-brass text-xs">✦</span>
            <span className="h-px w-10 bg-brass-dim/60" />
          </div>
          <p className="mt-4 text-sm text-paper-mute">
            Masukkan PIN petugas untuk membuka pemindai.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
