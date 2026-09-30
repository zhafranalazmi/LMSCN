export interface ParsedSoal {
  tipe: "pg" | "esai";
  pertanyaan: string;
  pilihan: string[];
  jawabanBenar: number | null;
  poin: number;
}

const QUESTION_RE = /^Q\d+>:\s*(.*)$/i;
const OPTION_RE = /^A>:\s*(.*)$/i;
const POIN_RE = /^PT>:\s*(\d+(?:\.\d+)?)/i;
const KUNCI_RE = /^K>:\s*([A-Za-z])/i;
const PF_RE = /^PF>:/i; // poin pengurangan, tidak dipakai sistem ini

export function parseSoalFromText(text: string): ParsedSoal[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const soalList: ParsedSoal[] = [];
  let current: ParsedSoal | null = null;

  for (const line of lines) {
    const qMatch = line.match(QUESTION_RE);
    if (qMatch) {
      if (current) soalList.push(current);
      current = {
        tipe: "esai",
        pertanyaan: qMatch[1].trim(),
        pilihan: [],
        jawabanBenar: null,
        poin: 10,
      };
      continue;
    }

    if (!current) continue;

    const oMatch = line.match(OPTION_RE);
    if (oMatch) {
      current.tipe = "pg";
      current.pilihan.push(oMatch[1].trim());
      continue;
    }

    const poinMatch = line.match(POIN_RE);
    if (poinMatch) {
      current.poin = Number(poinMatch[1]);
      continue;
    }

    if (PF_RE.test(line)) {
      continue;
    }

    const kunciMatch = line.match(KUNCI_RE);
    if (kunciMatch) {
      const index = kunciMatch[1].toUpperCase().charCodeAt(0) - 65;
      if (index >= 0 && index < current.pilihan.length) {
        current.jawabanBenar = index;
      }
      continue;
    }

    // baris lanjutan pertanyaan (soal esai yang lebih dari 1 baris)
    current.pertanyaan += " " + line;
  }

  if (current) soalList.push(current);

  return soalList;
}