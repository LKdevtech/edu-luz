import { Section, SectionTitle, cardBase } from "./section";

interface Testimonial {
  quote: string;
  author: string;
  stars: number;
}

// "Co o nas mówią" — prawdziwe opinie rodziców (treść dostarczona przez właściciela).
const TESTIMONIALS: Testimonial[] = [
  {
    stars: 5,
    quote:
      "Na początku posłałam tylko jednego syna na zajęcia z matematyki, nie wiedziałam jeszcze wtedy, że to tak rozbudowane miejsce. Potem przy rozmowie wyszło, że w zasadzie obaj moi synowie mogą mieć wszystkie swoje zajęcia tutaj w jednym miejscu bez ciągłej gonitwy po mieście. Zaryzykowałam i od września przeniosłam im wszystkie zajęcia tutaj. Prowadzący to po prostu wulkany energii, ale jednocześnie oazy spokoju, sama czasem nie miałam cierpliwości aby pomagać synom w nauce, więc wiem jakie to trudne. Chłopcy mają lepsze wyniki, a ja więcej czasu na swoje sprawy, poleciłam znajomym i polecam każdemu.",
    author: "Pani Sylwia, mama dwójki naszych uczniów (6 kl. szkoła podstawowa i 3 kl. technikum)",
  },
  {
    stars: 4.5,
    quote:
      "Trafiliśmy z żoną na EduLuz przez polecenie, nie szukaliśmy takich zajęć wcześniej. Uważałem, że sam dobrze pomagam mojemu synowi z fizyką i matematyką, w końcu siedziałem w tym po uszy. Kiedyś kuzynka (psycholog z zawodu) rzuciła, że jakieś tam badania wykazały, że przez takie nauczanie mogę niszczyć relację z synem. Zapytałem go o to, coś tam się tłumaczył, że to nie tak, że rozumie dużo, ale no stresuje się bardzo i czasem woli skłamać że rozumie bo byłoby mi przykro inaczej. Widziałem jak trudno mu było powiedzieć jeszcze kilka innych rzeczy na ten temat. Opowiedziałem o tym kumplowi z pracy, powiedział żebym zadzwonił do Kacpra, że jego siostra zapisała do niego córkę i jest pozytywnie zaskoczona. Założyłem na początku że to jakiś nauczyciel lub student który dorabia sobie na korkach, jak ja się zdziwiłem jak zobaczyłem tego chłopaka. Na początku mocno się zastanowiłem czy ktoś tak młody nie będąc nauczycielem może czegoś dobrze nauczyć i wahałem się zostawiając syna. Efekty jednak pojawiły się dość szybko, a syn wracał zachwycony z zajęć opowiadając czasem o różnych anegdotach o których dowiedział się przy okazji. Po trzech miesiącach poprosiłem o spotkanie, aby dowiedzieć się jak postępy z perspektywy korepetytora. Dostałem tabelkę z datami, tematami i notatkami lekcji które się odbyły, a przy okazji sam odbyłem rozmowę z kimś kto powinien być wzorem dla nauczycieli. Zaraził fizyką mojego syna i to błyskawicznie, sam myślałem że to niemożliwe bo przecież próbowałem. Chętnie dałbym 5 gwiazdek, ale... bardzo trudno o termin na zajęcia w trakcie roku szkolnego",
    author:
      "Pan Tomasz, tata naszego ucznia (Mirek właśnie wybiera się do liceum na mat-fiz, także chyba polubił bardzo)",
  },
];

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const hasHalf = value % 1 >= 0.5;
  return (
    <div className="mb-3 flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, j) => (
        <span key={j} className="text-[16px] text-tertiary">
          ★
        </span>
      ))}
      {hasHalf && (
        <span className="ml-0.5 text-[12px] font-extrabold text-tertiary" aria-label="pół gwiazdki">
          ½
        </span>
      )}
    </div>
  );
}

export function SocialProof() {
  return (
    <Section>
      <SectionTitle sub="Opinie rodziców i uczniów z naszego centrum.">
        Co o nas mówią
      </SectionTitle>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {TESTIMONIALS.map((t) => (
          <div key={t.author} className={`${cardBase} relative`}>
            <Stars value={t.stars} />
            <p className="mb-3.5 text-[14px] font-medium italic leading-[1.75] text-primary">
              „{t.quote}”
            </p>
            <p className="text-[12px] font-bold text-dim">— {t.author}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
