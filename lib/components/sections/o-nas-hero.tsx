import { Blob } from "./blob";

// Hero strony "O nas" (mockup).
export function ONasHero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#151827_0%,#171A30_50%,#1C2035_100%)] pb-5 pt-[52px]">
      <Blob color="#7C5CFC" size={300} top={-70} right={-50} opacity={0.07} />
      <Blob color="#FF6F4A" size={200} bottom={-40} left={-30} opacity={0.05} />
      <Blob color="#3B8FF0" size={160} top={40} left={200} opacity={0.04} />

      <div className="relative z-[1] mx-auto max-w-[1080px] px-6">
        <h1 className="mb-3 text-[28px] font-black leading-[1.15] tracking-[-0.5px] text-primary sm:text-[32px] md:text-[36px]">
          O <span className="text-link">nas</span>
        </h1>
        <p className="max-w-[500px] text-[16px] font-medium leading-[1.7] text-secondary">
          Kim jesteśmy, skąd się wzięliśmy i dlaczego uczymy tak, a nie inaczej.
        </p>
      </div>
    </section>
  );
}
