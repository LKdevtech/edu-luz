"use client";

import Image from "next/image";
import { useState } from "react";

// Historia założycielska — pisana w 1. osobie, ton bezpośredni.
// Tablica akapitów żeby łatwo policzyć "ile pokazujemy na mobile".
const PARAGRAPHS = [
  "Pomysł na EDU LUZ narodził się z kilku obserwacji. Po pierwsze — komunikacja w Tomaszowie. Chodzenie na kilka zajęć tygodniowo w różnych częściach miasta pochłania mnóstwo czasu. Dostanie się z jednego końca na drugi potrafi trwać 40 minut, a mówimy o dość niewielkim mieście.",
  "Druga sprawa to tradycyjne korepetycje. W zasadzie sprowadzają się do jednego: ktoś płaci i oczekuje wyników. Bardzo trudno zweryfikować po drodze, dlaczego tych wyników nie ma. Czasem miałem uczniów, którzy na zajęciach radzili sobie świetnie, ale na sprawdzianie była tragedia. I gdzie jest problem?",
  "Założyłem więc, że fajnie byłoby to monitorować — ale dla kogoś, kto uczy jednoosobowo, to spore koszty i dużo dodatkowej pracy. A dlaczego nie dać uczniom więcej i lepiej? Po co mają biegać po mieście szukając kogoś równie młodego, kto wytłumaczy ich językiem inny przedmiot?",
  "Tak powstał pomysł na centrum edukacyjne, gdzie łączyć wszystkich będzie podejście „na luzie”. Nie chcieliśmy tworzyć dodatkowej szkoły — tylko miejsce, gdzie masz ludzi, którzy mówią Twoim językiem i tłumaczą z pozoru trudne rzeczy jak Twój znajomy, a nie jak większość nauczycieli z dyplomami.",
  "Pokazujemy piękno nauki tam, gdzie ono jest, ale nie robimy tego na wyrost. Jeśli chcesz nauczyć się matematyki po prostu żeby nie mieć problemów w szkole — nie będziemy Cię zanudzać ciekawostkami, tylko nauczymy najważniejszych rzeczy i pokażemy jak zaliczyć sprawdzian.",
  "Najważniejszą zmianą, jakiej chcieliśmy dokonać, było uporządkowanie tego, co często bywa bałaganem. Trzy przedmioty, trzech nauczycieli, trzy miejsca na mapie, trzy stawki za godzinę. Raz godzina, innym razem 90 minut, bo tak wypadło korepetytorowi. Odwołane zajęcia tuż przed ważnym sprawdzianem, bałagan z terminami.",
  "Dlatego u nas robimy z tym porządek. A jak coś możemy usprawnić czy poprawić — po prostu to robimy. Celem zawsze było stworzenie systemu, który od roku szkolnego 2026/27 będzie w pełni sprawny — dzięki niemu wszystko będzie jasne: od tego co było na zajęciach, przez to jak pracowało dziecko, aż po płatności. A przede wszystkim — u nas stałe godziny i dni w tygodniu.",
  "Podchodzimy do tego poważnie, ale potrafimy zachować luz tam, gdzie można. W końcu żeby ktoś nas rozumiał, podstawą jest wspólny język. U nas nikt nie boi się pytać, bo to nasza najważniejsza zasada — pytania ponad wszystko. Nie ma co się bać, w końcu każdy czegoś nie wie.",
];

// Ile akapitów pokazujemy domyślnie na mobile (przed kliknięciem "Czytaj więcej").
const MOBILE_PREVIEW_COUNT = 2;

export function ONasHistory() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-alt py-14">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/images/sala.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.06]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,32,53,0.85)_0%,rgba(28,32,53,0.55)_50%,rgba(28,32,53,0.95)_100%)]" />
      </div>

      <div className="relative z-[1] mx-auto max-w-[760px] px-6">
        <div className="mb-4 inline-flex gap-1.5">
          <span className="rounded-full bg-secondary/20 px-[14px] py-[5px] text-[12px] font-extrabold text-[#FF6F4A]">
            Nasza historia
          </span>
        </div>
        <h2 className="mb-5 text-[22px] font-black leading-[1.25] text-primary sm:text-[26px] md:text-[28px]">
          Jak powstało <span className="text-link">EDU LUZ</span>
        </h2>

        <div className="text-[15px] font-medium leading-[1.85] text-secondary">
          {PARAGRAPHS.map((p, i) => {
            const isAboveFold = i < MOBILE_PREVIEW_COUNT;
            const isLast = i === PARAGRAPHS.length - 1;
            return (
              <p
                key={i}
                className={[
                  isLast ? "m-0" : "mb-4",
                  // Na mobile akapity poza preview ukrywamy dopóki nie rozwinięte.
                  // Na md+ zawsze pokazujemy wszystko.
                  isAboveFold ? "" : expanded ? "" : "hidden md:block",
                ].join(" ")}
              >
                {p}
              </p>
            );
          })}
        </div>

        {/* Przycisk "Czytaj więcej" / "Zwiń" — tylko mobile */}
        <div className="mt-5 md:hidden">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 rounded-[12px] border border-subtle bg-surface px-5 py-2.5 text-[13px] font-bold text-link transition-colors hover:bg-surface-hover"
          >
            {expanded ? "Zwiń" : "Czytaj więcej"}
            <span
              className="inline-block transition-transform duration-200"
              style={{ transform: expanded ? "rotate(180deg)" : "none" }}
            >
              ▼
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
