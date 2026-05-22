import { Blob } from "./blob";

// Hero strony kontaktu (mockup).
export function KontaktHero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#151827_0%,#171A30_50%,#1C2035_100%)] pb-5 pt-[52px]">
      <Blob color="#3B8FF0" size={320} top={-80} right={-60} opacity={0.08} />
      <Blob color="#FF6F4A" size={200} top={20} left={-40} opacity={0.05} />
      <Blob color="#7C5CFC" size={160} bottom={-40} right={120} opacity={0.04} />

      <div className="relative z-[1] mx-auto max-w-[1080px] px-6">
        <div className="mb-4 inline-flex gap-2">
          <span className="rounded-full bg-secondary/20 px-[14px] py-[5px] text-[12px] font-extrabold text-[#FF6F4A]">
            📍 Tomaszów Mazowiecki
          </span>
          <span className="rounded-full bg-success/20 px-[14px] py-[5px] text-[12px] font-extrabold text-success">
            Odpowiadamy szybko
          </span>
        </div>

        <h1 className="mb-3 text-[36px] font-black leading-[1.15] tracking-[-0.5px] text-primary">
          Skontaktuj <span className="text-link">się z nami</span>
        </h1>
        <p className="max-w-[480px] text-[16px] font-medium leading-[1.7] text-secondary">
          Masz pytania? Chcesz umówić spotkanie organizacyjne? Napisz lub zadzwoń.
        </p>
      </div>
    </section>
  );
}
