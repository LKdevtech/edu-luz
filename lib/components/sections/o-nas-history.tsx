import { Section } from "./section";

// "Jak powstało EDU LUZ" — historia (mockup). Treść to PLACEHOLDER (sekcja 7).
export function ONasHistory() {
  return (
    <Section alt className="py-14">
      <div className="flex flex-wrap items-center gap-9">
        <div className="flex-[1_1_480px]">
          <div className="mb-4 inline-flex gap-1.5">
            <span className="rounded-full bg-secondary/20 px-[14px] py-[5px] text-[12px] font-extrabold text-[#FF6F4A]">
              Nasza historia
            </span>
          </div>
          <h2 className="mb-4 text-[28px] font-black leading-[1.25] text-primary">
            Jak powstało <span className="text-link">EDU LUZ</span>
          </h2>
          <div className="text-[15px] font-medium leading-[1.85] text-secondary">
            <p className="mb-4">
              [Placeholder — Tu opowiedz swoją historię. Jak wpadłeś na pomysł? Co Cię
              frustrowało w tradycyjnych korepetycjach? Dlaczego „na luzie”?]
            </p>
            <p className="mb-4">
              [Placeholder — Co chciałeś zmienić? Może sam byłeś uczniem który nienawidził
              korepetycji? Może widziałeś jak znajomi biegają po mieście od jednego
              korepetytora do drugiego?]
            </p>
            <p className="m-0">
              [Placeholder — Jakie jest Twoje podejście? Co odróżnia EDU LUZ od typowej
              „pani od matmy”? Dlaczego Tomaszów Mazowiecki potrzebuje czegoś takiego?]
            </p>
          </div>
        </div>

        <div className="flex-[1_1_320px]">
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-[22px] border border-subtle bg-[linear-gradient(160deg,#232840_0%,#1E2440_100%)] text-[13px] text-dim">
            <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,rgba(59,143,240,0.12),rgba(124,92,252,0.08))] text-[28px]">
              📸
            </div>
            <span className="font-semibold">Zdjęcie centrum / zespołu</span>
            <span className="text-[11px]">Placeholder</span>
          </div>
        </div>
      </div>
    </Section>
  );
}
