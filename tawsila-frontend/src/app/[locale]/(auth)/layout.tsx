import { VIDEO_CONFIG } from '@/lib/video.config';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left: Form panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-5/12 bg-[var(--surface)] relative z-10">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {children}
        </div>
      </div>

      {/* Right: Video / gradient panel (desktop only) */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={VIDEO_CONFIG.auth.mp4} type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, var(--surface) 0%, transparent 15%), linear-gradient(to bottom, rgba(2,43,58,0.5) 0%, rgba(2,43,58,0.3) 50%, rgba(2,43,58,0.7) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Branding overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18H9" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                <circle cx="17" cy="18" r="2" />
                <circle cx="7" cy="18" r="2" />
              </svg>
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
              Tawsila
            </span>
          </div>
          <p className="text-white/70 text-center text-lg max-w-md leading-relaxed drop-shadow">
            La plateforme de covoiturage universitaire pour les étudiants tunisiens.
          </p>
        </div>
      </div>
    </div>
  );
}
