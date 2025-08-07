// ========== DISC ==========
if (appState.completed.DISC) {
  ySection += 2;
  if (ySection > 265) { doc.addPage(); ySection = 20; }

  // ====== 1. JUDUL HASIL DISC ======
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0); // Warna hitam
  doc.text(`HASIL DISC ${appState.identity?.nickname || ''}`, pageWidth / 2, ySection, { align: 'center' });
  ySection += 6;
  doc.setTextColor(44, 62, 80); // Normal kembali

  // ====== 2. JAWABAN TES DISC ======
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.text('JAWABAN TES DISC', pageWidth / 2, ySection, { align: 'center' });
  doc.setFont(undefined, 'normal');
  ySection += 2;

  const jawabanDISC = (appState.answers.DISC || []).map((ans, idx) => ({
    no: (idx + 1).toString(),
    p: (ans.p + 1).toString(),
    k: (ans.k + 1).toString()
  }));

  const barisDISC = Math.ceil(jawabanDISC.length / 4);
  const cols = [[], [], [], []];
  for (let i = 0; i < jawabanDISC.length; i++) {
    const colIndex = i % 4;
    cols[colIndex].push(jawabanDISC[i]);
  }

  const colX = [29, 67, 105, 143];
  let colY = ySection + 0.5;

  for (let r = 0; r < barisDISC; r++) {
    colY += 2.3;
    if (colY > 280) { doc.addPage(); colY = 20; }
    for (let c = 0; c < 4; c++) {
      const ans = cols[c][r];
      if (ans) {
        doc.text(`${ans.no}. [P]=${ans.p} ; [K]=${ans.k}`, colX[c], colY);
      }
    }
  }
  ySection = colY + 2;

  // ====== 3. PASTIKAN ADA RUANG UNTUK GRAFIK (~126px) ======
  if (ySection > 220) {
    doc.addPage();
    ySection = 20;
  }

  // ========== PASTIKAN GRAFIK TERUPDATE SEBELUM AMBIL CANVAS ==========
  const hasilDISC = countDISC(appState.answers.DISC, tests.DISC.questions);
  if (typeof drawDISCClassic === "function") {
    drawDISCClassic('discMost',   'most',   hasilDISC.most.D,   hasilDISC.most.I,   hasilDISC.most.S,   hasilDISC.most.C,   "#2176C7");
    drawDISCClassic('discLeast',  'least',  hasilDISC.least.D,  hasilDISC.least.I,  hasilDISC.least.S,  hasilDISC.least.C,  "#DE9000");
    drawDISCClassic('discChange', 'change', hasilDISC.change.D, hasilDISC.change.I, hasilDISC.change.S, hasilDISC.change.C, "#18b172");
    await new Promise(r=>setTimeout(r,80)); // Delay penting!
  }

 

  // ========== GRAFIK DISC (CANVAS ke PDF) ==========
try {
  const imgMost   = document.getElementById('discMost')?.toDataURL('image/png') || null;
  const imgLeast  = document.getElementById('discLeast')?.toDataURL('image/png') || null;
  const imgChange = document.getElementById('discChange')?.toDataURL('image/png') || null;

  // Ukuran lebih kecil, muat semua di tengah
  const imgWidth = 28, imgHeight = 60;
  const gap = 3;
  const totalWidth = imgWidth * 3 + gap * 2;
  const xStart = pageWidth / 2 - totalWidth / 2;

  if (imgMost)   doc.addImage(imgMost,   'PNG', xStart, ySection, imgWidth, imgHeight);
  if (imgLeast)  doc.addImage(imgLeast,  'PNG', xStart + imgWidth + gap, ySection, imgWidth, imgHeight);
  if (imgChange) doc.addImage(imgChange, 'PNG', xStart + (imgWidth + gap) * 2, ySection, imgWidth, imgHeight);

  // Label bawah grafik
  doc.setFontSize(7);
  doc.setTextColor(33, 118, 199); 
  doc.text('Most (P)', xStart + imgWidth / 2, ySection + imgHeight + 6, { align: 'center' });
  doc.setTextColor(222, 144, 0);  
  doc.text('Least (K)', xStart + imgWidth + gap + imgWidth / 2, ySection + imgHeight + 6, { align: 'center' });
  doc.setTextColor(24, 177, 114); 
  doc.text('Change', xStart + (imgWidth + gap) * 2 + imgWidth / 2, ySection + imgHeight + 6, { align: 'center' });
  doc.setTextColor(44, 62, 80);

  ySection += imgHeight + 12; // Lebih irit spasi
  if (ySection > 265) { doc.addPage(); ySection = 20; }
} catch (e) {}

  // ========== TABEL NILAI DISC ==========
  doc.setFontSize(8.5);
  const tableX = pageWidth / 2 - 54;
  let tY = ySection;
  doc.setFont(undefined, 'bold');
  doc.text('Line', tableX, tY);
  doc.text('D', tableX+22, tY);
  doc.text('I', tableX+33, tY);
  doc.text('S', tableX+44, tY);
  doc.text('C', tableX+55, tY);
  doc.text('*', tableX+66, tY);
  doc.text('Total', tableX+77, tY);
  doc.setFont(undefined, 'normal');
  tY += 4;
  // Most row
  doc.text('Most (P)', tableX, tY);
  doc.text(`${hasilDISC.most.D || 0}`, tableX+22, tY);
  doc.text(`${hasilDISC.most.I || 0}`, tableX+33, tY);
  doc.text(`${hasilDISC.most.S || 0}`, tableX+44, tY);
  doc.text(`${hasilDISC.most.C || 0}`, tableX+55, tY);
  doc.text(`${hasilDISC.most['*'] || 0}`, tableX+66, tY);
  doc.text(
    `${(hasilDISC.most.D||0)+(hasilDISC.most.I||0)+(hasilDISC.most.S||0)+(hasilDISC.most.C||0)+(hasilDISC.most['*']||0)}`,
    tableX+77, tY
  );
  tY += 4;
  // Least row
  doc.text('Least (K)', tableX, tY);
  doc.text(`${hasilDISC.least.D || 0}`, tableX+22, tY);
  doc.text(`${hasilDISC.least.I || 0}`, tableX+33, tY);
  doc.text(`${hasilDISC.least.S || 0}`, tableX+44, tY);
  doc.text(`${hasilDISC.least.C || 0}`, tableX+55, tY);
  doc.text(`${hasilDISC.least['*'] || 0}`, tableX+66, tY);
  doc.text(
    `${(hasilDISC.least.D||0)+(hasilDISC.least.I||0)+(hasilDISC.least.S||0)+(hasilDISC.least.C||0)+(hasilDISC.least['*']||0)}`,
    tableX+77, tY
  );
  tY += 4;
  // Change row
  doc.text('Change', tableX, tY);
  doc.text(`${hasilDISC.change.D>=0?'+':''}${hasilDISC.change.D||0}`, tableX+22, tY);
  doc.text(`${hasilDISC.change.I>=0?'+':''}${hasilDISC.change.I||0}`, tableX+33, tY);
  doc.text(`${hasilDISC.change.S>=0?'+':''}${hasilDISC.change.S||0}`, tableX+44, tY);
  doc.text(`${hasilDISC.change.C>=0?'+':''}${hasilDISC.change.C||0}`, tableX+55, tY);
  doc.text(`${hasilDISC.change['*']>=0?'+':''}${hasilDISC.change['*']||0}`, tableX+66, tY);
  doc.text(
    `${(hasilDISC.change.D||0)+(hasilDISC.change.I||0)+(hasilDISC.change.S||0)+(hasilDISC.change.C||0)+(hasilDISC.change['*']||0)}`,
    tableX+77, tY
  );
  ySection = tY + 8;
  if (ySection > 265) { doc.addPage(); ySection = 20; }

  // ========== CEK INVALID DULU ==========
  const starMost = Number(hasilDISC.most['*'] || 0);
  const starLeast = Number(hasilDISC.least['*'] || 0);
  const totalStar = starMost + starLeast;
  const identity = appState.identity || {};
  let blokX = 16;
  let blokW = 82;

 if (totalStar >= 13) {
  if (identity.position) {
    blokHeading(doc, `Analisis Posisi: ${identity.position}`, [33,33,33], blokX, ySection, 80, 8);
    ySection += 10;
    doc.setFontSize(16);
    doc.setTextColor(200,24,44);
    doc.text("❌ INVALID", blokX+2, ySection);
    doc.setTextColor(44,62,80);
    doc.setFontSize(8.2);
    ySection += 14;
    if (ySection > 265) { doc.addPage(); ySection = 20; }
  }
  // Tambahkan paragraf penjelasan detail, jangan menyebut bintang!
  const invalidMsg = [
    "...",
    "...",
    "...",
    "..."
  ];
  invalidMsg.forEach(par => {
    const lines = doc.splitTextToSize(par, 152);
    lines.forEach(line => {
      doc.text(line, blokX+2, ySection);
      ySection += 3.1;
    });
    ySection += 1.5;
  });
  // Tetap lanjut ke proses jawaban (tidak usah break, biar selesai bagian jawaban)
} else {
  // ANALISIS DISC (most, least, change) dan variabel untuk analisis
  const most   = analisa2DominanDISC(hasilDISC.most.D, hasilDISC.most.I, hasilDISC.most.S, hasilDISC.most.C, 'most', getPixelY);
  const least  = analisa2DominanDISC(hasilDISC.least.D, hasilDISC.least.I, hasilDISC.least.S, hasilDISC.least.C, 'least', getPixelY);
  const change = analisa2DominanDISC(hasilDISC.change.D, hasilDISC.change.I, hasilDISC.change.S, hasilDISC.change.C, 'change', getPixelY);

    // REKOMENDASI KARIR
    let roles = (function(){
     const rolesMap = {
 "DD": [],
  "DI": [],
  "DS": [],
  "DC": [],
  "ID": [],
  "II": [],
  "IS": [],
  "IC": [],
  "SD": [],
  "SI": [],
  "SS": [],
  "SC": [],
  "CD": [],
  "CI": [],
  "CS": [],
  "CC": []
};

  // Urutan dominan, bukan sort!
      const k = most.dominan.slice().sort().join('');
      return rolesMap[k] || ["Beragam, sesuaikan dengan minat dan pengalaman"];
    })();
    let tinggiRole = 14 + (roles.length*3.3);
    ySection = ensureSpace(doc, ySection, tinggiRole);
    blokHeading(doc, "Rekomendasi Karir", [33,118,199], blokX, ySection, 60, 8);
    ySection += 10;
    doc.setFontSize(8);
    roles.forEach((role,i) => {
      doc.text('- ' + role, blokX+2, ySection); ySection += 3.3;
    });

    // Kecocokan POSISI
    let simbol = "-";
    let detail = "";
    if (identity.position) {
     const persyaratan = {
  "Administrator": [["SC", "DC"], ["CS", "CD"]],
  "Guru": [["IS", "IC", "SI", "SC"], ["ID", "SD"]],
  "Technical Staff": [["DC", "SC"], ["CD", "CS"]],
  "Manajer": [["DI", "ID", "DC", "CD"], ["DS", "IS"]],
  "Housekeeping": [["SC", "CS"], ["DC", "IS"]]
  // Atur kombinasi sesuai kebutuhan assessment-mu!
};
      const k = most.dominan.slice().sort().join('');
      if (persyaratan[identity.position]?.[0]?.includes(k)) {
        simbol = "CC";
      } else if (persyaratan[identity.position]?.[1]?.includes(k)) {
        simbol = "C";
      } else if (
        persyaratan[identity.position]?.flat()?.some(code =>
          k.includes(code[0]) || k.includes(code[1])
        )
      ) {
        simbol = "!";
      }
      if (identity.teacherLevel) {
        if (identity.teacherLevel === "SD" && k.includes("I")) detail += "Sangat cocok untuk mengajar anak-anak.";
        if (identity.teacherLevel === "SMA" && k.includes("C")) detail += "Cocok untuk mata pelajaran eksakta.";
      }
      let tinggiPos = 13 + (detail ? doc.splitTextToSize(detail, pageWidth-36).length*3.2 : 0);
      ySection = ensureSpace(doc, ySection, tinggiPos);
      blokHeading(doc, `Analisis Posisi: ${identity.position}`, [33,33,33], blokX, ySection, 80, 8);
      ySection += 10;
      doc.setFontSize(16);
      doc.text(simbol, blokX+2, ySection);
      doc.setFontSize(8.2);
      ySection += 5;
      if (detail) {
        let detLines = doc.splitTextToSize(detail, pageWidth-36);
        doc.text(detLines, blokX+2, ySection); ySection += detLines.length*3.2 + 2;
      }
      ySection += 5;
      if (ySection > 265) { doc.addPage(); ySection = 20; }
    }

// ========== KESIMPULAN 3 GRAFIK + KECOCOKAN POSISI (UPGRADED) ==========
if (identity.position) {
  const nickname = identity.nickname || "Peserta";
  const posisi = identity.position;

  const gabunganAnalisis = (() => {
    const introMost = `• Grafik Most (P): Menunjukkan kepribadian alami ${nickname} dalam kondisi nyaman.`;
    const mostDetails = [
      `  - Tipe Dominan: ${most.dominan.join(' dan ')} (${most.ranking})`,
      `  - Deskripsi: ${stripHTML(most.deskripsi)}`,
      `  - Implikasi: ${getImplication(most.dominan.join(""), 'most', posisi)}`
    ].join('\n');

    const introLeast = `• Grafik Least (K): Menggambarkan respons ${nickname} terhadap tekanan dan tantangan.`;
    const leastDetails = [
      `  - Tipe Dominan: ${least.dominan.join(' dan ')} (${least.ranking})`,
      `  - Deskripsi: ${stripHTML(least.deskripsi)}`,
      `  - Implikasi: ${getImplication(least.dominan.join(""), 'least', posisi)}`
    ].join('\n');

    const introChange = `• Grafik Change (P-K): Merefleksikan kemampuan adaptasi ${nickname} antara situasi normal dan tekanan.`;
    const changeDetails = [
      `  - Kombinasi Dominan: ${change.dominan.join(' dan ')} (${change.ranking})`,
      `  - Deskripsi: ${stripHTML(change.deskripsi)}`,
      `  - Implikasi: ${getImplication(change.dominan.join(""), 'change', posisi)}`
    ].join('\n');

    // Gabungkan semua jadi satu string dengan newline antar bagian
    return [
      introMost, mostDetails, "",
      introLeast, leastDetails, "",
      introChange, changeDetails
    ].join('\n');
  })();

  const cocokStr = (
    simbol === "CC" ? "SANGAT SESUAI" :
    simbol === "C"  ? "CUKUP SESUAI" :
    simbol === "!"  ? "KURANG SESUAI" :
                      "TIDAK SESUAI"
  );

  const kalimatCocok = `
  
TINGKAT KECOCOKAN:
• Posisi: ${posisi}
• Kecocokan: ${cocokStr}
• Alasan: ${getCompatibilityReason(simbol, most.dominan[0], posisi)}`;

  let levelNote = "";
  if (identity.teacherLevel) {
    if (identity.teacherLevel === "SD" && most.dominan.includes("I")) {
      levelNote = "\n• Catatan Khusus: Gaya interpersonal yang menonjol sangat mendukung pembelajaran di kelas rendah.";
    }
    if (identity.teacherLevel === "SMA" && most.dominan.includes("C")) {
      levelNote = "\n• Catatan Khusus: Pendekatan analitis sangat relevan untuk pengajaran tingkat menengah atas.";
    }
  }

  const kalimatAkhir = `
  
POTENSI PENGEMBANGAN:
${nickname} memiliki potensi untuk:
- Beradaptasi secara efektif dalam lingkungan kerja baru
- Berkontribusi positif melalui ${getStrengthArea(most.dominan[0])}
- Mengembangkan diri dalam peran ${posisi} melalui ${getDevelopmentArea(least.dominan[0])}`;

 const paragrafKesimpulan = 
  "ANALISIS TRI-GRAFIK DISC\n\n" + 
  gabunganAnalisis + "\n" + 
  kalimatCocok +
  (detail ? "\n• Detail Tambahan: " + detail : "") +
  levelNote +
  kalimatAkhir;

// SETUP margin dan lebar blok
const marginLR = 18; // margin kiri-kanan (bisa ubah 16, 20, dst)
const blokX = marginLR;
const blokW = pageWidth - 2 * marginLR;

// Judul section
const sectionTitle = "KESIMPULAN ANALISIS DISC";
ySection = ensureSpace(doc, ySection, 20);

// HEADER biru
doc.setFillColor(61, 131, 223);
doc.rect(blokX - 2, ySection - 4, blokW, 10, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(10);
doc.setFont(undefined, 'bold');
doc.text(sectionTitle, blokX + 2, ySection + 2);

// Isi kesimpulan
ySection += 15;
doc.setTextColor(0, 0, 0);
doc.setFontSize(8.5);
doc.setFont(undefined, 'normal');

// WRAP setiap baris, anti overflow kanan!
const lines = paragrafKesimpulan.split('\n');
lines.forEach(line => {
  if (!line.trim()) {
    ySection += 2; // jarak baris kosong
    return;
  }
  const wrapLines = doc.splitTextToSize(line, blokW - 8); // biar ada sedikit margin dalam box
  wrapLines.forEach(wrapLine => {
    ySection = ensureSpace(doc, ySection, 4);
    doc.text(wrapLine, blokX + 2, ySection);
    ySection += 4;
  });
});

// Jeda bawah section
ySection += 8;
if (ySection > 265) {
  doc.addPage();
  ySection = 20;
}
}


function getImplication(dominantType, graphType, position, nickname = "Peserta") {
  const pos = position;
  const key = (dominantType && dominantType.length > 0) ? dominantType[0] : '';
  const implications = {
    D: {
      Administrator: {},
      Guru: {},
      "Technical Staff": {},
      Housekeeping: {}
    },
    I: {
      Administrator: {},
      Guru: {},
      "Technical Staff": {},
      Housekeeping: {}
    },
    S: {
      Administrator: {},
      Guru: {},
      "Technical Staff": {},
      Housekeeping: {}
    },
    C:{
      Administrator: {},
      Guru: {},
      "Technical Staff": {},
      Housekeeping: {}
    }
  };

  // Safe get & template support
  let txt = implications[key]?.[pos]?.[graphType];
  if (txt) return txt.replace(/\$\{nickname\}/g, nickname);
  return "Deskripsi implikasi khusus untuk posisi ini belum tersedia.";
}


// ====== 2. CONTOH PEMANGGILAN (PASTIKAN HANYA 1 HURUF, BUKAN GABUNGAN) ======
const dominantType = most.dominan[0]; // <-- ambil HANYA huruf pertama
const implication = getImplication(dominantType, 'most', 'Housekeeping');
// dst.

function getCompatibilityReason(symbol, dominantType, position) {
  const pos = position; // TANPA .toLowerCase()!
  const reasons = {
    Administrator: {},
    Guru: {},
    "Technical Staff": {},
    Housekeeping: {}
  };

  return reasons[pos]?.[symbol] || `Deskripsi kecocokan khusus untuk posisi ${position} belum tersedia.`;
}

function getStrengthArea(dominantType, position) {
  const pos = position;
  const strengths = {
    D: {
      Administrator: "mengambil inisiatif perbaikan administrasi dan memimpin pelaksanaan prosedur",
      Guru: "mengelola kelas dengan tegas dan membuat keputusan strategis untuk kemajuan pembelajaran",
      "Technical Staff": "mengambil keputusan cepat dalam troubleshooting dan memimpin solusi teknis",
      Housekeeping: "memimpin dan mengatur tim kerja, memastikan standar kebersihan selalu terpenuhi"
    },
    I: {
      Administrator: "memudahkan komunikasi antar divisi dan membangun suasana kerja yang kondusif",
      Guru: "membangun semangat dan motivasi belajar, serta menjalin relasi positif dengan siswa",
      "Technical Staff": "memudahkan koordinasi tim teknis dan menjaga kerja sama di lapangan",
      Housekeeping: "membangun kolaborasi tim yang harmonis, menjaga semangat dan kekompakan kerja"
    },
    S: {
      Administrator: "menjamin konsistensi, kerapian, dan keandalan sistem administrasi",
      Guru: "menyediakan kestabilan dan pendampingan berkelanjutan bagi siswa di kelas",
      "Technical Staff": "menjaga konsistensi hasil kerja dan mengutamakan prosedur keselamatan",
      Housekeeping: "menjaga rutinitas dan kestabilan standar kebersihan setiap hari"
    },
    C: {
      Administrator: "mengelola data, dokumen, dan laporan dengan teliti dan sistematis",
      Guru: "menyusun rencana belajar dan evaluasi secara detail, menjaga kualitas pendidikan",
      "Technical Staff": "melakukan pemeriksaan teknis secara detail, memastikan tidak ada kesalahan kecil",
      Housekeeping: "memastikan kebersihan setiap area secara detail, tidak melewatkan hal kecil"
    }
  };
  return strengths[dominantType]?.[pos] || "kekuatan spesifik sesuai posisi";
}



function getDevelopmentArea(dominantType) {
  const areas = {
    D: "pelatihan manajemen konflik",
    I: "pengembangan fokus dan disiplin",
    S: "pelatihan adaptasi perubahan",
    C: "pengelolaan ekspektasi realistis"
  };
  return areas[dominantType] || "pengembangan kompetensi";
}

function formatBulletPoints(lines) {
  const formatted = [];
  let isNewSection = true;

  lines.forEach(line => {
    if (line.match(/^(ANALISIS|TINGKAT|POTENSI)/)) {
      formatted.push("");
      formatted.push("• " + line);
      isNewSection = true;
    } else if (line.startsWith("-") || isNewSection) {
      formatted.push("• " + line);
      isNewSection = false;
    } else {
      formatted[formatted.length - 1] += " " + line.trim();
    }
  });

  return formatted;
}}}
