import type { Metadata } from "next";

import { Section } from "@/lib/components/sections/section";
import { COMPANY, LEGAL_UPDATED_AT, SITE } from "@/lib/config/site";

const description =
  "Regulamin świadczenia usług drogą elektroniczną przez EDU LUZ — zasady korzystania ze strony, formularza kontaktowego oraz prezentowanej oferty.";

export const metadata: Metadata = {
  title: "Regulamin",
  description,
  alternates: { canonical: "/regulamin" },
  openGraph: { title: "Regulamin", description, url: "/regulamin" },
  twitter: { title: "Regulamin — EDU LUZ", description },
};

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-9 text-[20px] font-extrabold text-primary sm:text-[22px]">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[14px] font-medium leading-[1.75] text-secondary sm:text-[15px]">
      {children}
    </p>
  );
}

function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-[14px] font-medium leading-[1.75] text-secondary sm:text-[15px]">
      {children}
    </ol>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-3 list-disc space-y-1.5 pl-5 text-[14px] font-medium leading-[1.75] text-secondary sm:text-[15px]">
      {children}
    </ul>
  );
}

export default function RegulaminPage() {
  return (
    <Section className="py-14">
      <div className="mx-auto max-w-[760px]">
        <h1 className="mb-2 text-[26px] font-black leading-[1.2] text-primary sm:text-[30px] md:text-[34px]">
          Regulamin <span className="text-link">strony</span>
        </h1>
        <p className="mb-7 text-[12px] font-semibold uppercase tracking-[0.5px] text-dim">
          Ostatnia aktualizacja: {LEGAL_UPDATED_AT}
        </p>

        <P>
          Niniejszy regulamin określa zasady świadczenia usług drogą elektroniczną przez{" "}
          {COMPANY.legalName} (dalej: „Usługodawca”) za pośrednictwem strony internetowej
          działającej pod marką EDU LUZ (dalej: „Strona”), zgodnie z ustawą z dnia
          18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.
        </P>

        <H2>§ 1. Postanowienia ogólne</H2>
        <OL>
          <li>
            Usługodawcą jest{" "}
            <strong className="text-primary">{COMPANY.legalName}</strong> z siedzibą pod
            adresem {COMPANY.registeredAddress.line1}, {COMPANY.registeredAddress.line2},
            NIP: {COMPANY.nip}, KRS: {COMPANY.krs}, REGON: {COMPANY.regon}.
            Reprezentant: {COMPANY.representative}.
          </li>
          <li>
            Kontakt z Usługodawcą jest możliwy pod adresem e-mail{" "}
            <a className="font-bold text-link" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>{" "}
            oraz telefonicznie pod numerem{" "}
            <a className="font-bold text-link" href={`tel:${SITE.phoneTel}`}>
              {SITE.phone}
            </a>
            .
          </li>
          <li>
            Niniejszy regulamin udostępniany jest nieodpłatnie pod adresem{" "}
            <span className="text-primary">/regulamin</span> i obowiązuje wszystkich
            użytkowników Strony.
          </li>
        </OL>

        <H2>§ 2. Definicje</H2>
        <UL>
          <li>
            <strong className="text-primary">Użytkownik</strong> — osoba fizyczna,
            osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej,
            korzystająca ze Strony.
          </li>
          <li>
            <strong className="text-primary">Usługa elektroniczna</strong> — usługa
            świadczona drogą elektroniczną przez Usługodawcę za pośrednictwem Strony,
            w szczególności udostępnianie treści informacyjnych oraz formularza
            kontaktowego.
          </li>
          <li>
            <strong className="text-primary">Formularz kontaktowy</strong> —
            interaktywny formularz dostępny na podstronie <span className="text-primary">/kontakt</span>,
            umożliwiający Użytkownikowi wysłanie wiadomości do Usługodawcy.
          </li>
        </UL>

        <H2>§ 3. Rodzaj i zakres usług elektronicznych</H2>
        <OL>
          <li>
            Usługodawca świadczy za pośrednictwem Strony następujące Usługi elektroniczne:
            <UL>
              <li>udostępnianie treści informacyjnych o ofercie centrum korepetycji,</li>
              <li>kalkulator orientacyjnych cen zajęć,</li>
              <li>formularz kontaktowy umożliwiający wysłanie wiadomości,</li>
              <li>
                prezentacja danych kontaktowych, adresu i mapy lokalizacji centrum.
              </li>
            </UL>
          </li>
          <li>
            Korzystanie ze wszystkich Usług elektronicznych dostępnych na Stronie jest
            bezpłatne.
          </li>
          <li>
            Strona nie jest sklepem internetowym ani platformą sprzedażową. Treści
            prezentowane w sekcji „Oferta i cennik” mają charakter informacyjny i nie
            stanowią oferty w rozumieniu art. 66 § 1 Kodeksu cywilnego.
          </li>
        </OL>

        <H2>§ 4. Wymagania techniczne</H2>
        <OL>
          <li>
            Do korzystania ze Strony niezbędne jest urządzenie z dostępem do internetu
            wyposażone w przeglądarkę internetową obsługującą JavaScript oraz pliki
            cookies (Chrome, Firefox, Safari, Edge — w aktualnych wersjach).
          </li>
          <li>
            Do korzystania z formularza kontaktowego dodatkowo wymagane jest posiadanie
            aktywnego konta poczty elektronicznej.
          </li>
        </OL>

        <H2>§ 5. Warunki świadczenia usług</H2>
        <OL>
          <li>
            Usługodawca dokłada starań, aby Strona była dostępna w sposób ciągły. Możliwe
            są krótkotrwałe przerwy w działaniu wynikające z prac konserwacyjnych,
            aktualizacji lub awarii.
          </li>
          <li>
            Usługodawca nie ponosi odpowiedzialności za przerwy w dostępie do Strony
            wynikające z przyczyn niezależnych, w tym z powodu działania siły wyższej,
            awarii infrastruktury dostawców usług hostingowych lub działań osób trzecich.
          </li>
          <li>
            Umowa o świadczenie Usługi elektronicznej polegającej na udostępnianiu
            treści Strony zawierana jest na czas oznaczony — przez okres przeglądania
            Strony — i ulega rozwiązaniu z chwilą jej opuszczenia przez Użytkownika.
          </li>
          <li>
            Umowa o świadczenie Usługi elektronicznej polegającej na wysłaniu wiadomości
            przez formularz kontaktowy zawierana jest jednorazowo i ulega rozwiązaniu
            z chwilą wysłania wiadomości lub rezygnacji z jej wysłania.
          </li>
        </OL>

        <H2>§ 6. Zakaz dostarczania treści bezprawnych</H2>
        <OL>
          <li>
            Użytkownik zobowiązany jest do korzystania ze Strony i Usług elektronicznych
            zgodnie z ich przeznaczeniem oraz przepisami prawa powszechnie obowiązującego.
          </li>
          <li>
            Zakazuje się Użytkownikowi dostarczania za pośrednictwem Strony treści
            o charakterze bezprawnym, w szczególności:
            <UL>
              <li>treści naruszających dobra osobiste osób trzecich,</li>
              <li>treści obraźliwych, wulgarnych lub propagujących przemoc,</li>
              <li>
                treści naruszających prawa autorskie, prawa własności przemysłowej lub
                tajemnicę przedsiębiorstwa,
              </li>
              <li>
                treści mogących zakłócić prawidłowe działanie Strony, w szczególności
                złośliwego oprogramowania.
              </li>
            </UL>
          </li>
        </OL>

        <H2>§ 7. Reklamacje</H2>
        <OL>
          <li>
            Reklamacje dotyczące świadczenia Usług elektronicznych można zgłaszać:
            <UL>
              <li>
                pocztą elektroniczną na adres{" "}
                <a className="font-bold text-link" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
                ,
              </li>
              <li>
                pisemnie na adres siedziby Usługodawcy podany w § 1 ust. 1.
              </li>
            </UL>
          </li>
          <li>
            Reklamacja powinna zawierać opis problemu oraz dane kontaktowe umożliwiające
            udzielenie odpowiedzi.
          </li>
          <li>
            Usługodawca rozpatruje reklamację w terminie 14 dni od jej otrzymania
            i informuje Użytkownika o sposobie rozpatrzenia w sposób odpowiadający
            sposobowi jej złożenia.
          </li>
        </OL>

        <H2>§ 8. Dane osobowe</H2>
        <P>
          Zasady przetwarzania danych osobowych Użytkowników, w tym danych podawanych
          w formularzu kontaktowym, określa{" "}
          <a className="font-bold text-link" href="/polityka-prywatnosci">
            Polityka prywatności
          </a>{" "}
          dostępna na Stronie.
        </P>

        <H2>§ 9. Postanowienia końcowe</H2>
        <OL>
          <li>
            W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają
            powszechnie obowiązujące przepisy prawa polskiego, w szczególności Kodeks
            cywilny oraz ustawa o świadczeniu usług drogą elektroniczną.
          </li>
          <li>
            Usługodawca zastrzega prawo do zmiany regulaminu. Zmiany wchodzą w życie
            z chwilą publikacji nowej wersji na Stronie. Korzystanie ze Strony po
            wejściu zmian w życie oznacza ich akceptację.
          </li>
          <li>
            Spory wynikające z korzystania ze Strony rozpatrywane są przez sąd właściwy
            miejscowo i rzeczowo zgodnie z przepisami prawa polskiego.
          </li>
        </OL>
      </div>
    </Section>
  );
}
