import type { Metadata } from "next";

import { Section } from "@/lib/components/sections/section";
import { COMPANY, LEGAL_UPDATED_AT, SITE } from "@/lib/config/site";

const description =
  "Polityka prywatności EDU LUZ — informacje o przetwarzaniu danych osobowych, podstawach prawnych, prawach użytkownika i odbiorcach danych zgodnie z RODO.";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description,
  alternates: { canonical: "/polityka-prywatnosci" },
  openGraph: { title: "Polityka prywatności", description, url: "/polityka-prywatnosci" },
  twitter: { title: "Polityka prywatności — EDU LUZ", description },
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

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-3 list-disc space-y-1.5 pl-5 text-[14px] font-medium leading-[1.75] text-secondary sm:text-[15px]">
      {children}
    </ul>
  );
}

export default function PolitykaPrywatnosciPage() {
  return (
    <Section className="py-14">
      <div className="mx-auto max-w-[760px]">
        <h1 className="mb-2 text-[26px] font-black leading-[1.2] text-primary sm:text-[30px] md:text-[34px]">
          Polityka <span className="text-link">prywatności</span>
        </h1>
        <p className="mb-7 text-[12px] font-semibold uppercase tracking-[0.5px] text-dim">
          Ostatnia aktualizacja: {LEGAL_UPDATED_AT}
        </p>

        <P>
          Niniejsza polityka prywatności określa zasady przetwarzania danych osobowych
          osób korzystających ze strony internetowej {SITE.email.split("@")[1]} (dalej:
          „Strona”) oraz kontaktujących się z {COMPANY.legalName} (dalej: „Administrator”)
          za pośrednictwem formularza kontaktowego lub innych kanałów dostępnych na
          Stronie.
        </P>

        <H2>1. Administrator danych osobowych</H2>
        <P>Administratorem danych osobowych jest:</P>
        <UL>
          <li>
            <strong className="text-primary">{COMPANY.legalName}</strong>
          </li>
          <li>
            Adres siedziby: {COMPANY.registeredAddress.line1},{" "}
            {COMPANY.registeredAddress.line2}
          </li>
          <li>NIP: {COMPANY.nip}</li>
          <li>KRS: {COMPANY.krs}</li>
          <li>REGON: {COMPANY.regon}</li>
        </UL>
        <P>
          Kontakt z Administratorem we wszelkich sprawach dotyczących przetwarzania danych
          osobowych możliwy jest pod adresem e-mail{" "}
          <a className="font-bold text-link" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>{" "}
          lub telefonicznie:{" "}
          <a className="font-bold text-link" href={`tel:${SITE.phoneTel}`}>
            {SITE.phone}
          </a>
          .
        </P>

        <H2>2. Zakres przetwarzanych danych</H2>
        <P>
          Administrator przetwarza dane osobowe podane dobrowolnie przez użytkownika
          w formularzu kontaktowym dostępnym na Stronie. Zakres przetwarzanych danych
          obejmuje:
        </P>
        <UL>
          <li>imię i nazwisko,</li>
          <li>adres e-mail,</li>
          <li>numer telefonu (opcjonalnie),</li>
          <li>treść wiadomości oraz wybrany temat zapytania.</li>
        </UL>
        <P>
          Podanie danych jest dobrowolne, jednak niezbędne do udzielenia odpowiedzi na
          przesłaną wiadomość.
        </P>

        <H2>3. Cele i podstawy prawne przetwarzania</H2>
        <P>Dane osobowe przetwarzane są w następujących celach i na podstawach prawnych:</P>
        <UL>
          <li>
            <strong className="text-primary">Obsługa zapytania</strong> — udzielenie
            odpowiedzi na wiadomość przesłaną przez formularz kontaktowy. Podstawa: art. 6
            ust. 1 lit. f RODO (prawnie uzasadniony interes Administratora polegający na
            prowadzeniu komunikacji z osobami zainteresowanymi ofertą).
          </li>
          <li>
            <strong className="text-primary">Zawarcie i wykonanie umowy</strong> —
            w przypadku, gdy zapytanie prowadzi do zawarcia umowy o świadczenie usług
            edukacyjnych. Podstawa: art. 6 ust. 1 lit. b RODO.
          </li>
          <li>
            <strong className="text-primary">Obowiązki prawne</strong> — wynikające
            z przepisów podatkowych, rachunkowych i innych. Podstawa: art. 6 ust. 1 lit.
            c RODO.
          </li>
        </UL>

        <H2>4. Okres przechowywania danych</H2>
        <P>
          Dane osobowe przechowywane są przez okres niezbędny do realizacji celów, dla
          których zostały zebrane:
        </P>
        <UL>
          <li>
            dane z formularza kontaktowego, który nie doprowadził do zawarcia umowy —
            przez okres do 12 miesięcy od ostatniego kontaktu;
          </li>
          <li>
            dane związane z zawartymi umowami — przez okres obowiązywania umowy oraz
            przez okres przedawnienia roszczeń wynikających z umowy, nie dłużej niż 6 lat;
          </li>
          <li>
            dane wymagane do celów księgowych i podatkowych — przez okres wymagany
            przepisami prawa, co do zasady 5 lat od końca roku podatkowego.
          </li>
        </UL>

        <H2>5. Odbiorcy danych</H2>
        <P>
          Dane osobowe mogą być powierzone do przetwarzania następującym kategoriom
          podmiotów współpracujących z Administratorem:
        </P>
        <UL>
          <li>
            <strong className="text-primary">Resend, Inc.</strong> (siedziba w USA) —
            dostawca usługi wysyłki wiadomości transakcyjnych. Przekazanie danych poza
            EOG odbywa się na podstawie standardowych klauzul umownych zatwierdzonych
            przez Komisję Europejską.
          </li>
          <li>
            <strong className="text-primary">Vercel, Inc.</strong> (siedziba w USA) —
            dostawca usług hostingu Strony. Przekazanie danych poza EOG odbywa się na
            podstawie standardowych klauzul umownych.
          </li>
          <li>
            podmioty świadczące Administratorowi usługi księgowe, prawne i informatyczne
            — wyłącznie w zakresie niezbędnym do realizacji tych usług.
          </li>
        </UL>

        <H2>6. Prawa osoby, której dane dotyczą</H2>
        <P>W związku z przetwarzaniem danych osobowych przysługują Ci następujące prawa:</P>
        <UL>
          <li>prawo dostępu do swoich danych (art. 15 RODO),</li>
          <li>prawo sprostowania danych (art. 16 RODO),</li>
          <li>prawo usunięcia danych — „prawo do bycia zapomnianym” (art. 17 RODO),</li>
          <li>prawo ograniczenia przetwarzania (art. 18 RODO),</li>
          <li>prawo przenoszenia danych (art. 20 RODO),</li>
          <li>
            prawo sprzeciwu wobec przetwarzania danych na podstawie prawnie uzasadnionego
            interesu (art. 21 RODO),
          </li>
          <li>
            prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych
            (ul. Stawki 2, 00-193 Warszawa), jeśli uznasz, że przetwarzanie danych narusza
            przepisy RODO.
          </li>
        </UL>
        <P>
          W celu skorzystania z powyższych praw skontaktuj się z Administratorem pod
          adresem{" "}
          <a className="font-bold text-link" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          .
        </P>

        <H2>7. Pliki cookies i technologie podobne</H2>
        <P>
          Strona wykorzystuje wyłącznie pliki cookies niezbędne do jej prawidłowego
          działania (cookies techniczne wymagane przez framework strony). Nie używamy
          plików cookies analitycznych, marketingowych, śledzących ani profilujących.
        </P>
        <P>
          W przypadku wprowadzenia w przyszłości narzędzi analitycznych lub
          marketingowych zaktualizujemy niniejszą politykę oraz, w razie wymogu prawnego,
          wprowadzimy odpowiedni mechanizm zgody (banner cookie).
        </P>

        <H2>8. Profilowanie i decyzje zautomatyzowane</H2>
        <P>
          Dane osobowe nie są wykorzystywane do profilowania ani podejmowania decyzji
          w sposób zautomatyzowany, o którym mowa w art. 22 RODO.
        </P>

        <H2>9. Zmiany polityki prywatności</H2>
        <P>
          Administrator zastrzega prawo do wprowadzania zmian w niniejszej polityce
          prywatności. Aktualna wersja zawsze dostępna jest na Stronie. Data ostatniej
          aktualizacji wskazana jest na początku dokumentu.
        </P>
      </div>
    </Section>
  );
}
