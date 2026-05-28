/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

import type { TutorMonthlyHours } from '@/lib/queries/admin'

/**
 * "Rejestr godzin realizacji zlecenia" — wzór dokumentu rozliczeniowego
 * z korepetytorem (umowa-zlecenie). Każdy wiersz to dzień miesiąca.
 */

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerCell: {
    flexBasis: '32%',
    flexGrow: 0,
  },
  headerLabel: {
    fontSize: 7,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerValue: {
    fontSize: 10,
    fontWeight: 700,
    paddingBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    borderStyle: 'solid',
  },
  table: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    borderStyle: 'solid',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
    borderStyle: 'solid',
    backgroundColor: '#f2f2f2',
    paddingVertical: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    borderStyle: 'solid',
    paddingVertical: 3,
    minHeight: 18,
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  tableFooter: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#1a1a1a',
    borderStyle: 'solid',
    paddingVertical: 5,
    marginTop: 0,
    backgroundColor: '#e8e8e8',
  },
  colDay: { width: '8%', textAlign: 'center', paddingHorizontal: 2, fontSize: 8 },
  colHours: { width: '14%', textAlign: 'center', paddingHorizontal: 2, fontSize: 9, fontWeight: 700 },
  colSig: { width: '39%', paddingHorizontal: 4, fontSize: 8 },
  cellHeader: { fontSize: 7, fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.3 },
  totalLabel: { width: '22%', textAlign: 'right', paddingRight: 6, fontSize: 10, fontWeight: 700 },
  totalValue: { width: '14%', textAlign: 'center', fontSize: 11, fontWeight: 700 },
  totalSpacer: { width: '64%' },
  legend: {
    marginTop: 16,
    fontSize: 7,
    color: '#666',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#999',
  },
})

type Props = {
  data: TutorMonthlyHours
  contractNumber: string
  centerName: string
}

export function TutorRegistryDocument({ data, contractNumber, centerName }: Props) {
  return (
    <Document
      title={`Rejestr godzin — ${data.tutorFullName} — ${data.monthLabel}`}
      author={centerName}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Rejestr godzin realizacji zlecenia</Text>

        <View style={styles.headerBlock}>
          <View style={styles.headerCell}>
            <Text style={styles.headerLabel}>Numer umowy</Text>
            <Text style={styles.headerValue}>{contractNumber}</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerLabel}>Miesiąc / rok</Text>
            <Text style={styles.headerValue}>{data.monthLabel}</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerLabel}>Zleceniobiorca</Text>
            <Text style={styles.headerValue}>{data.tutorFullName}</Text>
          </View>
        </View>

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colDay, styles.cellHeader]}>Dzień</Text>
            <Text style={[styles.colHours, styles.cellHeader]}>Liczba godzin</Text>
            <Text style={[styles.colSig, styles.cellHeader]}>Podpis zleceniobiorcy</Text>
            <Text style={[styles.colSig, styles.cellHeader]}>Podpis zleceniodawcy</Text>
          </View>

          {/* Days */}
          {data.days.map((d, idx) => (
            <View
              key={d.day}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}] as any}
            >
              <Text style={styles.colDay}>{d.day}</Text>
              <Text style={styles.colHours}>{formatHours(d.hours)}</Text>
              <Text style={styles.colSig}>{' '}</Text>
              <Text style={styles.colSig}>{' '}</Text>
            </View>
          ))}

          {/* Total */}
          <View style={styles.tableFooter}>
            <Text style={styles.totalLabel}>Łącznie:</Text>
            <Text style={styles.totalValue}>{formatHours(data.totalHours)} h</Text>
            <View style={styles.totalSpacer} />
          </View>
        </View>

        <View style={styles.legend}>
          <Text style={{ fontWeight: 700, marginBottom: 3 }}>Zasady rozliczania:</Text>
          <Text>• Zajęcia zrealizowane (z wpisem lub bez) — 100% czasu trwania</Text>
          <Text>• Odrobienie zrealizowane — 100% czasu trwania</Text>
          <Text>• No-show ucznia — 50% czasu trwania</Text>
          <Text>• Odwołanie zgłoszone &lt; 24h przed lekcją — 50% czasu trwania</Text>
          <Text>• Odwołanie zgłoszone &gt; 24h przed lekcją — 0% (nie rozliczane)</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>{centerName} · {data.monthLabel}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Strona ${pageNumber} z ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}

function formatHours(h: number): string {
  if (h === 0) return '—'
  // Wyświetlamy z 2 miejscami dziesiętnymi gdy nie jest całością, inaczej liczba całkowita.
  if (Math.abs(h - Math.round(h)) < 0.001) return String(Math.round(h))
  return h.toFixed(2).replace('.', ',')
}
