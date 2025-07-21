
const { jsPDF } = window.jspdf;
let sharedAudioCtx = null;
function prepareAudioContext() {
  if (!sharedAudioCtx) {
    try { sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  }
}
function playBeep() {
  if (!sharedAudioCtx) return;
  const o = sharedAudioCtx.createOscillator();
  const g = sharedAudioCtx.createGain();
  o.type = 'square';
  o.frequency.value = 1080; // Lebih “teng” dari default
  g.gain.value = 0.18;
  o.connect(g);
  g.connect(sharedAudioCtx.destination);
  o.start();
  setTimeout(() => {
    o.stop();
    g.disconnect();
    o.disconnect();
  }, 260); // ← Durasi beep-nya lebih panjang sedikit
}


// Application state
const appState = {
  currentTest: null,
  currentSubtest: 0,
  currentQuestion: 0,
  timer: null,
  timeLeft: 0,
  answers: {
    IST: [],
    KRAEPLIN: [],
    DISC: [],
    PAPI: [],
    BIGFIVE: []
  },
  kraeplinHistory: {},     // tracking riwayat edit tiap cell
  kraeplinKey: [],         // kunci jawaban (isi saat generate kolom)
  kraeplinStartTime: 0,    // waktu mulai tes Kraeplin
  kraeplinEndTime: 0,      // waktu selesai tes Kraeplin
  kraeplinWaktuKolom: [],
  grafis: {
    rumah: "",
    pohon: "",
    orang: ""
},// array waktu per kolom
  completed: {
  IST: false,
  KRAEPLIN: false,
  DISC: false,
  PAPI: false,
  BIGFIVE: false,
  GRAFIS: false,
  EXCEL: false,
  TYPING: false,
  SUBJECT: false,
},
  isKraeplinTrial: false,    // ← STATUS TRIAL KRAEPLIN
  kraeplinStarted: false,    // ← TAMBAHKAN INI untuk penanda "sudah klik mulai"
  currentColumn: 0,          // ← kolom aktif
  currentRow: {},            // ← baris aktif per kolom (obj)
  timerActive: false,        // ← penanda interval
  identity: {
    name: '',
    email: '',
    phone: '',
    dob: '',
    age: '',
    addressKTP: '',
    addressCurrent: '',
    sameAddress: false,
    position: '',
    teacherLevel: '',
    techRole: '',
    education: '',
    explanation: '',
    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
  }, grafis: {
    rumah: null,
    pohon: null,
    orang: null
  },
  // Untuk hasil jawaban admin:
  adminAnswers: {
    EXCEL: null,
    TYPING: null
  }
};

// Test data
const tests = {
  IST: {
    name: "Intelligenz Struktur Test (IST)",
    description: "Tes kemampuan intelektual yang mengukur berbagai aspek kecerdasan",
    subtests: [
      {
        name: "SE (Satzergänzung)",
        description: "Melengkapi kalimat",
        time: 360, // 6 menit
        type: "multiple-choice",
        instruction: "Pilih kata yang tepat untuk melengkapi kalimat",
        example: {
          question: "Dia pergi ke ... untuk membeli sayuran.",
          options: ["A. Pasar", "B. Kantor", "C. Sekolah", "D. Rumah sakit"],
          answer: "A. Pasar",
          explanation: "Tempat membeli sayuran adalah pasar"
        },
 questions: [
  {
    id: 1,
    text: "Pengaruh seseorang terhadap orang lain seharusnya bergantung pada .....",
    options: [
      "A. kekuasaan",
      "B. bujukan",
      "C. kekayaan",
      "D. keberanian",
      "E. kewibawaan"
    ]
  },
  {
    id: 2,
    text: "Lawan kata 'hemat' ialah .....",
    options: [
      "A. murah",
      "B. kikir",
      "C. boros",
      "D. bernilai",
      "E. kaya"
    ]
  },
  {
    id: 3,
    text: "..... tidak termasuk cuaca",
    options: [
      "A. angin puyuh",
      "B. halilintar",
      "C. salju",
      "D. gempa bumi",
      "E. kabut"
    ]
  },
  {
    id: 4,
    text: "Lawan kata 'setia' ialah .....",
    options: [
      "A. cinta",
      "B. benci",
      "C. persahabatan",
      "D. khianat",
      "E. permusuhan"
    ]
  },
  {
    id: 5,
    text: "Seekor kuda selalu mempunyai .....",
    options: [
      "A. kandang",
      "B. ladam",
      "C. pelana",
      "D. kuku",
      "E. surai"
    ]
  },
  {
    id: 6,
    text: "Seorang paman ..... lebih tua dari keponakannya.",
    options: [
      "A. jarang",
      "B. biasanya",
      "C. selalu",
      "D. tidak pernah",
      "E. kadang-kadang"
    ]
  },
  {
    id: 7,
    text: "Pada jumlah yang sama, nilai kalori yang tertinggi terdapat pada .....",
    options: [
      "A. ikan",
      "B. daging",
      "C. lemak",
      "D. tahu",
      "E. sayuran"
    ]
  },
  {
    id: 8,
    text: "Pada suatu pertandingan selalu terdapat .....",
    options: [
      "A. wasit",
      "B. hadiah",
      "C. sorak",
      "D. penonton",
      "E. kemenangan"
    ]
  },
  {
    id: 9,
    text: "Suatu pernyataan yang belum dipastikan dikatakan sebagai pernyataan yang .....",
    options: [
      "A. paradoks",
      "B. tergesa-gesa",
      "C. mempunyai arti rangkap",
      "D. menyesatkan",
      "E. hipotesis"
    ]
  },
  {
    id: 10,
    text: "Pada sepatu selalu terdapat .....",
    options: [
      "A. kulit",
      "B. sol",
      "C. tali sepatu",
      "D. gesper",
      "E. lidah"
    ]
  },
   
{
  id: 11,
  text: "Suatu …………… tidak menyangkut persoalan pencegahan kecelakaan.",
  options: [
    "A. lampu lalu lintas",
    "B. kacamata pelindung",
    "C. kotak PPPK",
    "D. tanda peringatan",
    "E. palang kereta api"
  ]
},
{
  id: 12,
  text: "Mata uang logam Rp 50,- tahun 1991, garis tengahnya ialah …………… mm.",
  options: [
    "A. 17",
    "B. 29",
    "C. 25",
    "D. 20",
    "E. 15"
  ]
},
{
  id: 13,
  text: "Seseorang yang bersikap menyangsikan setiap kemajuan ialah seorang yang …..",
  options: [
    "A. demokratis",
    "B. radikal",
    "C. liberal",
    "D. konservatif",
    "E. anarkis"
  ]
},
{
  id: 14,
  text: "Lawannya “tidak pernah” ialah ……………",
  options: [
    "A. sering",
    "B. kadang-kadang",
    "C. jarang",
    "D. kerap kali",
    "E. selalu"
  ]
},
{
  id: 15,
  text: "Jarak antara Jakarta – Surabaya kira-kira ………… Km",
  options: [
    "A. 650",
    "B. 1000",
    "C. 800",
    "D. 600",
    "E. 950"
  ]
},
{
  id: 16,
  text: "Untuk dapat membuat nada yang rendah dan mendalam, kita memerlukan banyak ………",
  options: [
    "A. kekuatan",
    "B. peranan",
    "C. ayunan",
    "D. berat",
    "E. suara"
  ]
},
{
  id: 17,
  text: "Ayah …………… lebih berpengalaman dari pada anaknya",
  options: [
    "A. selalu",
    "B. biasanya",
    "C. jauh",
    "D. jarang",
    "E. pada dasarnya"
  ]
},
{
  id: 18,
  text: "Diantara kota-kota berikut ini, maka kota ……. letaknya paling selatan.",
  options: [
    "A. Jakarta",
    "B. Bandung",
    "C. Cirebon",
    "D. Semarang",
    "E. Surabaya"
  ]
},
{
  id: 19,
  text: "Jika kita mengetahui jumlah presentase nomor-nomor lotere yang tidak menang, maka kita dapat menghitung ………",
  options: [
    "A. jumlah nomor yang menang",
    "B. pajak lotere",
    "C. kemungkinan menang",
    "D. jumlah pengikut",
    "E. tinggi keuntungan"
  ]
},
{
  id: 20,
  text: "Seorang anak yang berumur 10 tahun tingginya rata-rata ………… cm",
  options: [
    "A. 150",
    "B. 130",
    "C. 110",
    "D. 105",
    "E. 115"
  ]
}
]
      },
      {
        name: "WA (Wortauswahl)",
        description: "Memilih kata",
        time: 360, // 6 menit
        type: "multiple-choice",
        instruction: "Pilih kata yang paling sesuai dengan definisi",
        example: {
          question: "Tempat untuk menyimpan buku disebut:",
          options: ["A. Lemari", "B. Rak buku", "C. Meja", "D. Tas"],
          answer: "B. Rak buku",
          explanation: "Rak buku adalah tempat menyimpan buku"
        },
        questions: [
  {
    id: 21,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. lingkungan",
      "B. panah",
      "C. elips",
      "D. busur",
      "E. lengkungan"
    ]
  },
  {
    id: 22,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. mengetuk",
      "B. memakai",
      "C. menjahit",
      "D. menggergaji",
      "E. memukul"
    ]
  },
  {
    id: 23,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. lebar",
      "B. keliling",
      "C. luas",
      "D. isi",
      "E. panjang"
    ]
  },
  {
    id: 24,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. mengikat",
      "B. menyatukan",
      "C. melepaskan",
      "D. mengaitkan",
      "E. melekatkan"
    ]
  },
  {
    id: 25,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. arah",
      "B. timur",
      "C. perjalanan",
      "D. tujuan",
      "E. selatan"
    ]
  },
  {
    id: 26,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. jarak",
      "B. perpisahan",
      "C. tugas",
      "D. batas",
      "E. perceraian"
    ]
  },
  {
    id: 27,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. saringan",
      "B. kelambu",
      "C. payung",
      "D. tapisan",
      "E. jala"
    ]
  },
  {
    id: 28,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. putih",
      "B. pucat",
      "C. buram",
      "D. kasar",
      "E. berkilauan"
    ]
  },
  {
    id: 29,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. otobis",
      "B. pesawat terbang",
      "C. sepeda motor",
      "D. kereta api",
      "E. kapal api"
    ]
  },
  {
    id: 30,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. biola",
      "B. seruling",
      "C. klarinet",
      "D. terompet",
      "E. saxophon"
    ]
  },
  {
    id: 31,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. bergelombang",
      "B. kasar",
      "C. berduri",
      "D. licin",
      "E. lurus"
    ]
  },
  {
    id: 32,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. jam",
      "B. kompas",
      "C. pemupuk jalan",
      "D. bintang pari",
      "E. arah"
    ]
  },
  {
    id: 33,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. kebijaksanaan",
      "B. pendidikan",
      "C. perencanaan",
      "D. penempatan",
      "E. pengetahuan"
    ]
  },
  {
    id: 34,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. bermotor",
      "B. berjalan",
      "C. berlayar",
      "D. bersepeda",
      "E. berkuda"
    ]
  },
  {
    id: 35,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. gambar",
      "B. lukisan",
      "C. potret",
      "D. patung",
      "E. ukiran"
    ]
  },
  {
    id: 36,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. panjang",
      "B. lonjong",
      "C. runcing",
      "D. bulat",
      "E. bersudut"
    ]
  },
  {
    id: 37,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. kunci",
      "B. palang pintu",
      "C. gerendel",
      "D. gunting",
      "E. obeng"
    ]
  },
  {
    id: 38,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. jembatan",
      "B. batas",
      "C. perkawinan",
      "D. pagar",
      "E. masyarakat"
    ]
  },
  {
    id: 39,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. mengetam",
      "B. menasehati",
      "C. mengasah",
      "D. melicinkan",
      "E. menggosok"
    ]
  },
  {
    id: 40,
    text: "Carilah kata yang tidak memiliki persamaan.",
    options: [
      "A. batu",
      "B. baja",
      "C. bulu",
      "D. karet",
      "E. kayu"
    ]
  }
]
},
      {
        name: "AN (Analogien)",
        description: "Analogi",
        time: 420, // 7 menit
        type: "multiple-choice",
        instruction: "Temukan hubungan analogi yang tepat",
        example: {
          question: "Kaki : Sepatu = Tangan : ?",
          options: ["A. Sarung", "B. Jam", "C. Sarung Tangan", "D. Gelang"],
          answer: "C. Sarung Tangan",
          explanation: "Seperti kaki dilindungi sepatu, tangan dilindungi sarung tangan"
        },
questions: [
  {
    id: 41,
    text: "Menemukan : menghilangkan = Mengingat : ?",
    options: [
      "A. menghapal",
      "B. mengenai",
      "C. melupakan",
      "D. berpikir",
      "E. memimpikan"
    ]
  },
  {
    id: 42,
    text: "Bunga : jambangan = Burung : ?",
    options: [
      "A. sarang",
      "B. langit",
      "C. pagar",
      "D. pohon",
      "E. sangkar"
    ]
  },
  {
    id: 43,
    text: "Kereta api : rel = Otobis : ?",
    options: [
      "A. roda",
      "B. poros",
      "C. ban",
      "D. jalan raya",
      "E. kecepatan"
    ]
  },
  {
    id: 44,
    text: "Perak : emas = Cincin : ?",
    options: [
      "A. arloji",
      "B. berlian",
      "C. permata",
      "D. gelang",
      "E. platina"
    ]
  },
  {
    id: 45,
    text: "Lingkaran : bola = Bujur sangkar : ?",
    options: [
      "A. bentuk",
      "B. gambar",
      "C. segi empat",
      "D. kubus",
      "E. piramida"
    ]
  },
  {
    id: 46,
    text: "Saran : keputusan = Merundingkan : ?",
    options: [
      "A. menawarkan",
      "B. menentukan",
      "C. menilai",
      "D. menimbang",
      "E. merenungkan"
    ]
  },
  {
    id: 47,
    text: "Lidah : asam = Hidung : ?",
    options: [
      "A. mencium",
      "B. bernapas",
      "C. mengecap",
      "D. tengik",
      "E. asin"
    ]
  },
  {
    id: 48,
    text: "Darah : pembuluh = Air : ?",
    options: [
      "A. pintu air",
      "B. sungai",
      "C. talang",
      "D. hujan",
      "E. ember"
    ]
  },
  {
    id: 49,
    text: "Saraf : penyalur = Pupil : ?",
    options: [
      "A. penyinaran",
      "B. mata",
      "C. melihat",
      "D. cahaya",
      "E. pelindung"
    ]
  },
  {
    id: 50,
    text: "Pengantar surat : pengantar telegram = Pandai besi : ?",
    options: [
      "A. palu godam",
      "B. pedagang besi",
      "C. api",
      "D. tukang emas",
      "E. besi tempa"
    ]
  },
  {
    id: 51,
    text: "Buta : warna = Tuli : ?",
    options: [
      "A. pendengaran",
      "B. mendengar",
      "C. nada",
      "D. kata",
      "E. telinga"
    ]
  },
  {
    id: 52,
    text: "Makanan : bumbu = Ceramah : ?",
    options: [
      "A. penghinaan",
      "B. pidato",
      "C. kelakar",
      "D. kesan",
      "E. ayat"
    ]
  },
  {
    id: 53,
    text: "Marah : emosi = Duka cita : ?",
    options: [
      "A. suka cita",
      "B. sakit hati",
      "C. suasana hati",
      "D. sedih",
      "E. rindu"
    ]
  },
  {
    id: 54,
    text: "Mantel : jubah = wool : ?",
    options: [
      "A. bahan sandang",
      "B. domba",
      "C. sutra",
      "D. jas",
      "E. tekstil"
    ]
  },
  {
    id: 55,
    text: "Ketinggian puncak : tekanan udara = ketinggian nada : ?",
    options: [
      "A. garpu tala",
      "B. sopran",
      "C. nyanyian",
      "D. panjang senar",
      "E. selubung"
    ]
  },
  {
    id: 56,
    text: "Negara : revolusi = Hidup : ?",
    options: [
      "A. biologi",
      "B. keturunan",
      "C. mutasi",
      "D. seleksi",
      "E. ilmu hewan"
    ]
  },
  {
    id: 57,
    text: "Kekurangan : penemuan = Panas : ?",
    options: [
      "A. haus",
      "B. khatulistiwa",
      "C. es",
      "D. matahari",
      "E. dingin"
    ]
  },
  {
    id: 58,
    text: "Kayu : diketam = Besi : ?",
    options: [
      "A. dipalu",
      "B. digergaji",
      "C. dituang",
      "D. dikikir",
      "E. ditempa"
    ]
  },
  {
    id: 59,
    text: "Olahragawan : lembing = Cendekiawan : ?",
    options: [
      "A. perpustakaan",
      "B. penelitian",
      "C. karya",
      "D. studi",
      "E. mikroskop"
    ]
  },
  {
    id: 60,
    text: "Keledai : kuda pacuan = Pembakaran : ?",
    options: [
      "A. pemadam api",
      "B. obor",
      "C. letupan",
      "D. korek api",
      "E. lautan api"
]
  }
]
},
      {
        name: "GE (Gemeinsamkeiten Finden)",
        description: "Mencari kesamaan",
        time: 480, // 8 menit
        type: "text-input",
        instruction: "Temukan kesamaan dari dua kata berikut",
        example: {
          question: "Apa kesamaan antara Apel dan Jeruk?",
          answer: "Buah-buahan",
          explanation: "Keduanya adalah jenis buah-buahan"
        },
questions: [
  {
    id: 61,
    text: "Apa kesamaan antara Mawar dan Melati?"
  },
  {
    id: 62,
    text: "Apa kesamaan antara Mata dan Telinga?"
  },
  {
    id: 63,
    text: "Apa kesamaan antara Gula dan Intan?"
  },
  {
    id: 64,
    text: "Apa kesamaan antara Hujan dan Salju?"
  },
  {
    id: 65,
    text: "Apa kesamaan antara Pengantar surat dan Telepon?"
  },
  {
    id: 66,
    text: "Apa kesamaan antara Kamera dan Kacamata?"
  },
  {
    id: 67,
    text: "Apa kesamaan antara Lambung dan Usus?"
  },
  {
    id: 68,
    text: "Apa kesamaan antara Banyak dan Sedikit?"
  },
  {
    id: 69,
    text: "Apa kesamaan antara Telur dan Benih?"
  },
  {
    id: 70,
    text: "Apa kesamaan antara Bendera dan Lencana?"
  },
  {
    id: 71,
    text: "Apa kesamaan antara Rumput dan Gajah?"
  },
  {
    id: 72,
    text: "Apa kesamaan antara Ember dan Kantong?"
  },
  {
    id: 73,
    text: "Apa kesamaan antara Awal dan Akhir?"
  },
  {
    id: 74,
    text: "Apa kesamaan antara Kikir dan Boros?"
  },
  {
    id: 75,
    text: "Apa kesamaan antara Penawaran dan Permintaan?"
  },
  {
    id: 76,
    text: "Apa kesamaan antara Atas dan Bawah?"
  }
]
      },
      {
        name: "RA (Rechenaufgaben)",
        description: "Soal hitungan",
        time: 600, // 10 menit
        type: "number-input",
        instruction: "Selesaikan soal hitungan berikut",
        example: {
          question: "Berapa hasil dari 15 + 27?",
          answer: "42",
          explanation: "15 + 27 = 42"
        },
questions: [
  {
    id: 77,
    text: "Jika seorang anak memiliki 50 rupiah dan memberikan 15 rupiah kepada orang lain, berapa rupiahkah yang masih tinggal padanya?"
  },
  {
    id: 78,
    text: "Berapa km-kah yang dapat ditempuh oleh kereta api dalam waktu 7 jam, jika kecepatannya 40 km/jam?"
  },
  {
    id: 79,
    text: "15 peti buah-buahan beratnya 250 kg dan setiap peti kosong beratnya 3 kg, berapakah berat buah-buahan itu?"
  },
  {
    id: 80,
    text: "Seseorang mempunyai persediaan rumput yang cukup untuk 7 ekor kuda selama 78 hari. Berapa harikah persediaan ini cukup untuk 21 ekor kuda?"
  },
  {
    id: 81,
    text: "3 batang coklat harganya Rp 5,-. Berapa batangkah yang dapat kita beli dengan Rp 50,-?"
  },
  {
    id: 82,
    text: "Seseorang dapat berjalan 1,75 m dalam waktu 1/4 detik. Berapakah meterkah yang dapat ia tempuh dalam waktu 10 detik?"
  },
  {
    id: 83,
    text: "Jika sebuah batu terletak 15 m di sebelah selatan dari sebidang pohon dan pohon itu terletak 30 m di sebelah selatan dari sebuah rumah, berapa meterkah jarak antara batu dan rumah itu?"
  },
  {
    id: 84,
    text: "Jika 4 1/2 m bahan sandang harganya Rp 90,- berapakah rupiahkah harganya 2 1/2 m?"
  },
  {
    id: 85,
    text: "7 orang dapat menyelesaikan sesuatu pekerjaan dalam 6 hari. Berapa orangkah yang diperlukan untuk menyelesaikan pekerjaan itu dalam setengah hari?"
  },
  {
    id: 86,
    text: "Karena dipanaskan, kawat yang panjangnya 48 cm akan mengembang menjadi 52 cm. setelah pemanasan, berapakah panjangnya kawat yang berukuran 72 cm?"
  },
  {
    id: 87,
    text: "Suatu pabrik dapat menghasilkan 304 batang pensil dalam waktu 8 jam. Berapa batangkah yang dihasilkan dalam waktu setengah jam?"
  },
  {
    id: 88,
    text: "Untuk suatu campuran diperlukan 2 bagian perak dan 3 bagian timah. Berapa gramkah perak yang diperlukan untuk mendapatkan campuran itu yang beratnya 15 gram?"
  },
  {
    id: 89,
    text: "Untuk setiap Rp 3,- yang dimiliki Sidin, Hamid memiliki Rp 5,-. Jika mereka bersama mempunyai Rp 120,- berapa rupiahkah yang dimiliki Hamid?"
  },
  {
    id: 90,
    text: "Mesin A menenun 60 m kain, sedangkan mesin B menenun 40 m. berapa meterkah waktu ditenun mesin A, jika mesin B menenun 60 m?"
  },
  {
    id: 91,
    text: "Seseorang membelikan 1/10 dari uangnya untuk perangko dan 4 kali jumlah itu untuk alat tulis. Sisa uangnya masih Rp 60. Berapa rupiahkah uang semula?"
  },
  {
    id: 92,
    text: "Di dalam dua peti terdapat 43 piring. Di dalam peti yang satu terdapat 9 piring lebih banyak dari pada di dalam peti yang lain. Berapa buah piring terdapat di dalam peti yang lebih kecil?"
  },
  {
    id: 93,
    text: "Suatu lembaran kain yang panjangnya 60 cm harus dibagikan sedemikian rupa sehingga panjangnya satu bagian ialah 2/3 dari bagian yang lain. Berapa panjangnya bagian yang terpendek."
  },
  {
    id: 94,
    text: "Suatu perusahaan mengekspor 3/4 dari hasil produksinya dan menjual 4/5 dari sisa itu dalam negeri. Berapa % kah hasil produksi yang masih tinggal?"
  },
  {
    id: 95,
    text: "Jika suatu botol berisi anggur hanya 7/8 bagian dan harganya adalah Rp 84,- berapakah harga anggur di dalam botol itu hanya terisi 1/2 penuh?"
  },
  {
    id: 96,
    text: "Di dalam suatu keluarga setiap anak perempuan mempunyai jumlah saudara laki-laki yang sama dengan jumlah saudara perempuan dan setiap anak laki-laki mempunyai dua kali lebih banyak saudara perempuan dari pada saudara laki-laki. Berapa anak laki-lakikah yang terdapat di dalam keluarga tersebut?"
  }
]
      },
      {
        name: "ZR (Zahlenreihen)",
        description: "Deret angka",
        time: 600, // 10 menit
        type: "number-input",
        instruction: "Lanjutkan deret angka berikut",
        example: {
          question: "2, 4, 6, 8, ...",
          answer: "10",
          explanation: "Deret angka genap"
        },
questions: [
  {
    id: 97,
    text: "6, 9, 12, 15, 18, 21, 24, ?"
  },
  {
    id: 98,
    text: "15, 16, 18, 19, 21, 22, 24, ?"
  },
  {
    id: 99,
    text: "19, 18, 22, 21, 25, 24, 28, ?"
  },
  {
    id: 100,
    text: "16, 12, 17, 13, 18, 14, 19, ?"
  },
  {
    id: 101,
    text: "2, 4, 8, 10, 20, 22, 44, ?"
  },
  {
    id: 102,
    text: "15, 13, 16, 15, 17, 11, 18, ?"
  },
  {
    id: 103,
    text: "25, 22, 11, 33, 30, 15, 45, ?"
  },
  {
    id: 104,
    text: "49, 51, 54, 27, 9, 11, 14, ?"
  },
  {
    id: 105,
    text: "2, 3, 1, 3, 4, 2, 5, 4, ?"
  },
  {
    id: 106,
    text: "19, 17, 20, 16, 21, 15, 22, ?"
  },
  {
    id: 107,
    text: "94, 92, 46, 44, 22, 20, 10, ?"
  },
  {
    id: 108,
    text: "5, 8, 9, 8, 11, 12, 11, ?"
  },
  {
    id: 109,
    text: "12, 15, 19, 23, 28, 33, 39, ?"
  },
  {
    id: 110,
    text: "7, 5, 10, 7, 21, 17, 68, ?"
  },
  {
    id: 111,
    text: "11, 15, 18, 9, 13, 16, 8, ?"
  },
  {
    id: 112,
    text: "3, 8, 15, 24, 35, 48, 63, ?"
  },
  {
    id: 113,
    text: "4, 5, 7, 4, 8, 13, 7, ?"
  },
  {
    id: 114,
    text: "8, 5, 15, 18, 6, 3, 9, ?"
  },
  {
    id: 115,
    text: "4, 6, 18, 10, 30, 23, 69, ?"
  },
  {
    id: 116,
    text: "5, 35, 28, 4, 11, 77, 70, ?"
  }
]
      },
      {
  name: "FA (Figurenauswahl)",
  description: "Pilih gambar yang berbeda dari yang lain",
  time: 420, // 7 menit
  type: "image-choice",
  instruction: "Klik gambar yang berbeda dari yang lain",
  example: {
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png"
    ],
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png",
    options: ["A", "B", "C", "D"],
    answer: "B",
    explanation: "Gambar B berbeda dengan yang lain"
  },
questions: [
  {
    id: 117,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/205c67b956f2661495.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 118,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/21386a41db714e26b8.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 119,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/226366d2502ccf356d.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 120,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/23007d94fa6331ee6d.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 121,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/2443f926fc1ecde1d0.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 122,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/deras49dc12fceb1496eb.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 123,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/2642cdd9f9ac843822.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 124,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/27f0a30f9fb17f7866.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 125,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/28f6f788ddf8e7defa.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 126,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/29489394308ac46e00.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 127,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/3044fc90f62837139e.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 128,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/31da931fe8c37838b9.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/16c3621623303f21a1.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/17458cacf5115819ef.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/19d8c9c34c80727d67.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/2038ed4cc5f09a7911.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/12/18abae129aec30ed62.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 129,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/3751c6e710d4893bf6.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/32d70b2d964fc29512.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/338536228e0d104dca.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/3481a0639e2ef4809d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/355a4c873ec301357b.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/36d28cbeaaac3f3db9.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 130,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/38d6d87479b6a63a8a.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/32d70b2d964fc29512.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/338536228e0d104dca.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/3481a0639e2ef4809d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/355a4c873ec301357b.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/36d28cbeaaac3f3db9.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 131,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/39b2c99f66921c1673.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/32d70b2d964fc29512.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/338536228e0d104dca.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/3481a0639e2ef4809d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/355a4c873ec301357b.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/36d28cbeaaac3f3db9.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 132,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/403072239156b7986a.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/32d70b2d964fc29512.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/338536228e0d104dca.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/3481a0639e2ef4809d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/355a4c873ec301357b.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/36d28cbeaaac3f3db9.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 133,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/411ccc2f03572e0265.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/32d70b2d964fc29512.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/338536228e0d104dca.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/3481a0639e2ef4809d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/355a4c873ec301357b.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/36d28cbeaaac3f3db9.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 134,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/4240e38a69700af335.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/32d70b2d964fc29512.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/338536228e0d104dca.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/3481a0639e2ef4809d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/355a4c873ec301357b.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/36d28cbeaaac3f3db9.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 135,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/43f021c792921e3f01.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/32d70b2d964fc29512.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/338536228e0d104dca.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/3481a0639e2ef4809d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/355a4c873ec301357b.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/36d28cbeaaac3f3db9.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  },
  {
    id: 136,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/443e53a1ea0dbe1673.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/32d70b2d964fc29512.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/338536228e0d104dca.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/3481a0639e2ef4809d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/355a4c873ec301357b.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/13/36d28cbeaaac3f3db9.png"
    ],
    options: ["A", "B", "C", "D", "E"]
  }
]
      },
      {
    name: "WU (Würfelaufgaben)",
  description: "Pilih gambar kubus yang sesuai dengan pola",
  time: 540, // 9 menit
  type: "image-choice",
  instruction: "Klik gambar kubus yang sesuai dengan pola",
  example: {
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png"
    ],
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png",
    options: ["A", "B", "C", "D"],
    answer: "B",
    explanation: "Gambar B berbeda dengan yang lain"
  },
  questions: [
  {
    id: 137,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/50b04de3d48713c6ba.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 138,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/515a7ac8333f8685c4.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 139,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/526c5927848c3b3f09.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 140,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/539a5c781f1541e4fb.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 141,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/54db6bd0a080027633.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 142,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/5555a831a23f1d6527.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 143,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/5651d3aea3314f55ca.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 144,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/57059cc0ec8bf26217.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 145,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/5864f6d5e550400c25.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 146,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/591d1dd1dfbe8882a9.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 147,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/60ced4a6b82ea2556c.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 148,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/6120396f2ffea68c14.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 149,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/62f1cce17708f277dc.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 150,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/632f93550fa40c2666.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 151,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/648566f7234cddd964.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 152,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/6584b2afe603e965a7.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 153,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/66e0b1e9190510108e.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 154,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/67ef0bac2e51e96e49.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 155,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/6850682f7411713dd9.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
},
{
    id: 156,
    questionImage: "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/692f613e9b245dd20a.md.png",
    images: [
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/453530605a9725aecf.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/4633618ffa350cdf0c.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/470e62dbc5e3974323.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/48a5330df2b3912b2d.md.png",
      "https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/16/49c2bcc428f756c763.md.png"
    ],
    options: ["A", "B", "C", "D", "E"]
}
]

      }
    ]
  },
  KRAEPLIN: {
    name: "Tes Kraeplin",
    description: "Hitung cepat dan teliti, isi satu kolom dalam 15 detik.",
    columns: [], // Diisi dinamis
    timePerColumn: 15
  },
  DISC: {
  name: "Tes DISC",
  description: "Tes kepribadian yang mengukur Dominance, Influence, Steadiness, dan Compliance",
  instruction: "Untuk setiap pernyataan, pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda",
  example: {
    question: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: ["Disiplin", "Kreatif", "Sabar", "Teliti"],
    p: "Disiplin",
    k: "Kreatif",
    explanation: "Pilih 1 untuk Paling dan 1 untuk Kurang menggambarkan Anda"
  },
  questions: [
  {
    id: 1,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Gampangan, Mudah setuju",                 P: 'S', K: 'S' },
      { text: "Percaya, Mudah percaya pada orang",        P: 'I', K: 'I' },
      { text: "Petualang, Mengambil resiko",              P: '*', K: 'D' },
      { text: "Toleran, Menghormati",                     P: 'C', K: 'C' }
    ]
  },
  {
    id: 2,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Lembut suara, Pendiam",                    P: 'C', K: '*' },
      { text: "Optimistik, Visioner",                     P: 'D', K: 'D' },
      { text: "Pusat perhatian, Suka gaul",               P: '*', K: 'I' },
      { text: "Pendamai, Membawa Harmoni",                P: 'S', K: 'S' }
    ]
  },
  {
    id: 3,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Menyemangati orang",                       P: 'I', K: 'I' },
      { text: "Berusaha sempurna",                        P: '*', K: 'C' },
      { text: "Bagian dari kelompok",                     P: '*', K: 'S' },
      { text: "Ingin membuat tujuan",                     P: 'D', K: '*' }
    ]
  },
  {
    id: 4,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Menjadi frustrasi",                        P: 'C', K: 'C' },
      { text: "Menyimpan perasaan saya",                  P: 'S', K: 'S' },
      { text: "Menceritakan sisi saya",                   P: '*', K: 'I' },
      { text: "Siap beroposisi",                          P: 'D', K: 'D' }
    ]
  },
  {
    id: 5,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Hidup, Suka bicara",                       P: 'I', K: '*' },
      { text: "Gerak cepat, Tekun",                       P: 'D', K: 'D' },
      { text: "Usaha menjaga keseimbangan",               P: 'S', K: 'S' },
      { text: "Usaha mengikuti aturan",                   P: '*', K: 'C' }
    ]
  },
  {
    id: 6,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Kelola waktu secara efisien",              P: 'C', K: '*' },
      { text: "Sering terburu-buru, Merasa tertekan",     P: 'D', K: 'D' },
      { text: "Masalah sosial itu penting",               P: 'I', K: 'I' },
      { text: "Suka selesaikan apa yang saya mulai",      P: 'S', K: 'S' }
    ]
  },
  {
    id: 7,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Tolak perubahan mendadak",                 P: 'S', K: '*' },
      { text: "Cenderung janji berlebihan",               P: 'I', K: 'I' },
      { text: "Tarik diri di tengah tekanan",             P: '*', K: 'C' },
      { text: "Tidak takut bertempur",                    P: '*', K: 'D' }
    ]
  },
  {
    id: 8,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Penyemangat yang baik",                    P: 'I', K: 'I' },
      { text: "Pendengar yang baik",                      P: 'S', K: 'S' },
      { text: "Penganalisa yang baik",                    P: 'C', K: 'C' },
      { text: "Delegator yang baik",                      P: 'D', K: 'D' }
    ]
  },
  {
    id: 9,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Hasil adalah penting",                     P: 'D', K: 'D' },
      { text: "Lakukan dengan benar, Akurasi penting",    P: 'C', K: 'C' },
      { text: "Dibuat menyenangkan",                      P: '*', K: 'I' },
      { text: "Mari kerjakan bersama",                    P: '*', K: 'S' }
    ]
  },
  {
    id: 10,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Akan berjalan terus tanpa kontrol diri",   P: '*', K: 'C' },
      { text: "Akan membeli sesuai dorongan hati",        P: 'D', K: 'D' },
      { text: "Akan menunggu, Tanpa tekanan",             P: 'S', K: 'S' },
      { text: "Akan mengusahakan yang kuinginkan",        P: 'I', K: '*' }
    ]
  },
  {
    id: 11,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Ramah, Mudah bergabung",                   P: 'S', K: '*' },
      { text: "Unik, Bosan rutinitas",                    P: '*', K: 'I' },
      { text: "Aktif mengubah sesuatu",                   P: 'D', K: 'D' },
      { text: "Ingin hal-hal yang pasti",                 P: 'C', K: 'C' }
    ]
  },
  {
    id: 12,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Non-konfrontasi, Menyerah",                P: '*', K: 'S' },
      { text: "Dipenuhi hal detail",                      P: 'C', K: '*' },
      { text: "Perubahan pada menit terakhir",            P: 'I', K: 'I' },
      { text: "Menuntut, Kasar",                          P: 'D', K: 'D' }
    ]
  },
  {
    id: 13,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Ingin kemajuan",                           P: 'D', K: 'D' },
      { text: "Puas dengan segalanya",                    P: 'S', K: '*' },
      { text: "Terbuka memperlihatkan perasaan",          P: 'I', K: '*' },
      { text: "Rendah hati, Sederhana",                   P: '*', K: 'C' }
    ]
  },
  {
    id: 14,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Tenang, Pendiam",                          P: 'C', K: 'C' },
      { text: "Bahagia, Tanpa beban",                     P: 'I', K: 'I' },
      { text: "Menyenangkan, Baik hati",                  P: 'S', K: '*' },
      { text: "Tak gentar, Berani",                       P: 'D', K: 'D' }
    ]
  },
  {
    id: 15,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Menggunakan waktu berkualitas dengan teman", P: 'S', K: 'S' },
      { text: "Rencanakan masa depan, Bersiap",            P: 'C', K: '*' },
      { text: "Bepergian demi petualangan baru",           P: 'I', K: 'I' },
      { text: "Menerima ganjaran atas tujuan yang dicapai", P: 'D', K: 'D' }
    ]
  },
 {
  id: 16,
  text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
  options: [
    { text: "Aturan perlu dipertanyakan",   P: '*', K: 'D' },
    { text: "Aturan membuat adil",          P: 'C', K: '*' },
    { text: "Aturan membuat bosan",         P: 'I', K: 'I' },
    { text: "Aturan membuat aman",          P: 'S', K: 'S' }
  ]
},
  {
    id: 17,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Pendidikan, Kebudayaan",           P: '*', K: 'C' },
      { text: "Prestasi, Ganjaran",               P: 'D', K: 'D' },
      { text: "Keselamatan, Keamanan",            P: 'S', K: 'S' },
      { text: "Sosial, Perkumpulan kelompok",     P: 'I', K: '*' }
    ]
  },
  {
    id: 18,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Tidak mudah dikalahkan",                   P: 'D', K: 'D' },
      { text: "Kerjakan sesuai perintah, Ikut pimpinan",  P: '*', K: 'I' },
      { text: "Mudah terangsang, Riang",                  P: '*', K: 'S' },
      { text: "Ingin segalanya teratur, Rapi",            P: 'C', K: '*' }
    ]
  },
  {
    id: 19,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Saya akan pimpin mereka",                  P: 'D', K: 'D' },
      { text: "Saya akan melaksanakan",                   P: 'S', K: '*' },
      { text: "Saya akan meyakinkan mereka",              P: 'I', K: 'I' },
      { text: "Saya dapatkan fakta",                      P: '*', K: 'C' }
    ]
  },
  {
    id: 20,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Memikirkan orang dahulu",                  P: 'D', K: '*' },
      { text: "Kompetitif, Suka tantangan",               P: 'S', K: 'S' },
      { text: "Optimis, Positif",                         P: 'I', K: 'I' },
      { text: "Pemikir logis, Sistematik",                P: 'C', K: '*' }
    ]
  },
  {
    id: 21,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Menyenangkan orang, Mudah setuju",         P: 'S', K: 'S' },
      { text: "Tertawa lepas, Hidup",                     P: 'D', K: 'D' },
      { text: "Berani, Tak gentar",                       P: 'I', K: 'I' },
      { text: "Tenang, Pendiam",                          P: '*', K: 'C' }
    ]
  },
  {
    id: 22,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Menyenangkan orang, mudah setuju",                    P: 'S', K: 'S' },
      { text: "Tertawa lepas, hidup",                   P: '*', K: 'I' },
      { text: "Berani, tak gentar",                     P: 'D', K: 'D' },
      { text: "Tenang, pendiam",             P: 'C', K: 'C' }
    ]
  },
  {
    id: 23,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Ingin otoritas lebih",        P: '*', K: 'D' },
      { text: "Ingin kesempatan baru",        P: 'I', K: '*' },
      { text: "Menghindari konflik",          P: 'S', K: 'S' },
      { text: "Ingin petunjuk, ingin jelas",  P: '*', K: 'C' }
    ]
  },
  {
    id: 24,
    text: "Pilih yang PALING (P) dan KURANG (K) menggambarkan diri Anda:",
    options: [
      { text: "Dapat diandalkan, Dapat dipercaya",        P: '*', K: 'S' },
      { text: "Kreatif, Unik",                            P: 'I', K: 'I' },
      { text: "Garis dasar, Orientasi hasil",             P: 'D', K: '*' },
      { text: "Jalankan standar yang tinggi, Akurat",     P: 'C', K: '*' }
    ]
  }
]
},

  PAPI: {
    name: "Tes PAPI Kostick",
    description: "Tes kepribadian yang mengukur kebutuhan psikologis individu",
    time: 1500, // 5 menit
    instruction: "Pilih pernyataan yang lebih menggambarkan diri Anda",
    example: {
      question: "Manakah yang lebih menggambarkan Anda?",
      optionA: "Saya suka bekerja sendiri",
      optionB: "Saya suka bekerja dalam tim",
      answer: "Pilih salah satu yang lebih sesuai dengan Anda",
      explanation: "Tidak ada jawaban benar/salah, pilih yang paling sesuai"
    },
       questions: [
  { id: 1, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya seorang pekerja 'keras'", optionB: "Saya 'bukan' seorang pemurung" },
  { id: 2, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka bekerja lebih baik dari orang lain", optionB: "Saya suka mengerjakan apa yang sedang saya kerjakan, sampai selesai" },
  { id: 3, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menunjukkan caranya melaksanakan sesuatu hal", optionB: "Saya ingin bekerja sebaik mungkin" },
  { id: 4, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka berkelakar", optionB: "Saya senang mengatakan kepada orang lain, apa yang harus dilakukannya" },
  { id: 5, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menggabungkan diri dengan kelompok-kelompok", optionB: "Saya suka diperhatikan oleh kelompok-kelompok" },
  { id: 6, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang bersahabat intim dengan seseorang", optionB: "Saya senang bersahabat dengan sekelompok orang" },
  { id: 7, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya cepat berubah bila hal itu diperlukan", optionB: "Saya berusaha untuk intim dengan teman-teman" },
  { id: 8, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka membalas dendam bila saya benar-benar disakiti", optionB: "Saya suka melakukan hal-hal yang baru dan berbeda" },
  { id: 9, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya ingin atasan saya menyukai saya", optionB: "Saya suka mengatakan kepada orang lain, bila mereka salah" },
  { id: 10, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka mengikuti perintah-perintah yang diberikan kepada saya", optionB: "Saya suka menyenangkan hati orang yang memimpin saya" },
  { id: 11, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya mencoba sekuat tenaga", optionB: "Saya seorang yang tertib. Saya meletakkan segala sesuatu pada tempatnya" },
  { id: 12, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya membuat orang lain melakukan apa yang saya inginkan", optionB: "Saya bukan orang yang cepat gusar" },
  { id: 13, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka mengatakan kepada kelompok, apa yang harus dilakukan", optionB: "Saya menekuni satu pekerjaan sampai selesai" },
  { id: 14, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya ingin tampak bersemangat dan menarik", optionB: "Saya ingin menjadi sangat sukses" },
  { id: 15, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menyelaraskan diri dengan kelompok", optionB: "Saya suka membantu orang lain menentukan pendapatnya" },
  { id: 16, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya cemas kalau orang lain tidak menyukai saya", optionB: "Saya senang kalau orang-orang memperhatikan saya" },
  { id: 17, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka mencoba sesuatu yang baru", optionB: "Saya lebih suka bekerja bersama orang-orang daripada bekerja sendiri" },
  { id: 18, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Kadang-kadang saya menyalahkan orang lain bila terjadi sesuatu kesalahan", optionB: "Saya cemas bila seseorang tidak menyukai saya" },
  { id: 19, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menyenangkan hati orang yang memimpin saya", optionB: "Saya suka mencoba pekerjaan-pekerjaan baru dan berbeda" },
  { id: 20, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka petunjuk yang terinci untuk melakukan suatu pekerjaan", optionB: "Saya suka mengatakan kepada orang lain bila mereka mengganggu saya" },
  { id: 21, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya selalu mencoba sekuat tenaga", optionB: "Saya senang bekerja dengan sangat cermat dan hati-hati" },
  { id: 22, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya adalah seorang pemimpin yang baik", optionB: "Saya mengorganisir tugas-tugas secara baik" },
  { id: 23, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya mudah menjadi gusar", optionB: "Saya seorang yang lambat dalam membuat keputusan" },
  { id: 24, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang mengerjakan beberapa pekerjaan pada waktu yang bersamaan", optionB: "Bila dalam kelompok, saya lebih suka diam" },
  { id: 25, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang bila diundang", optionB: "Saya ingin melakukan sesuatu lebih baik dari orang lain" },
  { id: 26, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka berteman intim dengan teman-teman saya", optionB: "Saya suka memberikan nasihat kepada orang lain" },
  { id: 27, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka melakukan hal-hal yang baru dan berbeda", optionB: "Saya suka menceritakan keberhasilan saya dalam mengerjakan tugas" },
  { id: 28, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Bila saya benar, saya suka mempertahankan mati-matian", optionB: "Saya suka bergabung dalam suatu kelompok" },
  { id: 29, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya tidak mau berbeda dengan orang lain", optionB: "Saya berusaha untuk sangat intim dengan orang-orang" },
  { id: 30, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka diajari mengenai caranya mengerjakan suatu pekerjaan", optionB: "Saya mudah merasa bosan" },
  { id: 31, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya bekerja keras", optionB: "Saya banyak berpikir dan berencana" },
  { id: 32, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya memimpin kelompok", optionB: "Hal-hal yang kecil (detail) menarik hati saya" },
  { id: 33, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya cepat dan mudah mengambil keputusan", optionB: "Saya meletakkan segala sesuatu secara rapi dan teratur" },
  { id: 34, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Tugas-tugas saya kerjakan secara cepat", optionB: "Saya jarang marah/sedih" },
  { id: 35, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya ingin menjadi bagian dari kelompok", optionB: "Pada suatu waktu tertentu, saya hanya ingin mengerjakan satu tugas saja" },
  { id: 36, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya berusaha untuk intim dengan teman-teman saya", optionB: "Saya berusaha keras untuk menjadi yang terbaik" },
  { id: 37, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya menyukai mode baju baru dan tipe-tipe mobil baru", optionB: "Saya ingin menjadi penanggungjawab bagi orang-orang lain" },
  { id: 38, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka berdebat", optionB: "Saya ingin diperhatikan" },
  { id: 39, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menyenangkan hati orang yang memimpin saya", optionB: "Saya tertarik menjadi anggota dari suatu kelompok" },
  { id: 40, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka mengikuti aturan secara tertib", optionB: "Saya suka orang-orang mengenal saya benar-benar" },
  { id: 41, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya mencoba sekuat tenaga", optionB: "Saya sangat menyenangkan" },
  { id: 42, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Orang lain beranggapan bahwa saya adalah seorang pemimpin yang baik", optionB: "Saya berpikir jauh ke depan dan terinci" },
  { id: 43, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Seringkali saya memanfaatkan peluang", optionB: "Saya senang memperhatikan hal-hal sampai sekecil-kecilnya" },
  { id: 44, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Orang lain menganggap saya bekerja cepat", optionB: "Orang lain menganggap saya dapat melakukan penataan yang rapi dan teratur" },
  { id: 45, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya menyukai permainan-permainan dan olahraga", optionB: "Saya sangat menyenangkan" },
  { id: 46, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang bila orang-orang dapat intim dan bersahabat", optionB: "Saya selalu berusaha menyelesaikan apa yang telah saya mulai" },
  { id: 47, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka bereksperimen dan mencoba sesuatu yang baru", optionB: "Saya suka mengerjekan pekerjaan-pekerjaan yang sulit dengan baik" },
  { id: 48, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang diperlakukan secara adil", optionB: "Saya senang mengajari orang lain bagaimana caranya mengerjakan sesuatu" },
  { id: 49, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka mengerjakan apa yang diharapkan dari saya", optionB: "Saya suka menarik perhatian" },
  { id: 50, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka petunjuk-petunjuk terinci dalam melaksanakan pekerjaan", optionB: "Saya senang berada bersama dengan orang lain" },
  { id: 51, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya selalu berusaha mengerjakan tugas secara sempurna", optionB: "Orang lain menganggap, saya tidak kenal lelah dalam kerja sehari-hari" },
  { id: 52, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya tergolong tipe pemimpin", optionB: "Saya mudah berteman" },
  { id: 53, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya memanfaatkan peluang", optionB: "Saya banyak berfikir" },
  { id: 54, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya kerja dengan kecepatan yang mantap dan cepat", optionB: "Saya senang mengerjakan hal-hal yang detail" },
  { id: 55, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya memiliki banyak energi untuk permainan dan olahraga", optionB: "Saya menempatkan segala sesuatunya secara rapi dan teratur" },
  { id: 56, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya bergaul baik dengan semua orang", optionB: "Saya pandai mengendalikan diri" },
  { id: 57, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya ingin berkenalan dengan orang baru dan mengerjakan hal baru", optionB: "Saya selalu ingin menyelesaikan pekerjaan yang sudah saya mulai" },
  { id: 58, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya saya bersikeras mengenai apa yang saya yakini", optionB: "Biasanya saya suka bekerja keras" },
  { id: 59, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya menyukai saran dari orang yang saya kagumi", optionB: "Saya senang mengatur orang lain" },
  { id: 60, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya biarkan orang lain mempengaruhi saya", optionB: "Saya suka menerima banyak perhatian" },
  { id: 61, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya saya bekerja sangat keras", optionB: "Biasanya saya bekerja cepat" },
  { id: 62, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Bila saya berbicara, kelompok akan mendengarkan", optionB: "Saya terampil mempergunakan alat-alat kerja" },
  { id: 63, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya lambat membina persahabatan", optionB: "Saya lambat dalam mengambil keputusan" },
  { id: 64, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya saya makan secara cepat", optionB: "Saya suka membaca" },
  { id: 65, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya menyukai pekerjaan yang memungkinkan saya berkeliling", optionB: "Saya menyukai pekerjaan yang harus dilakukan secara teliti" },
  { id: 66, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya berteman sebanyak mungkin", optionB: "Saya dapat menemukan hal-hal yang telah saya pindahkan" },
  { id: 67, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Perencanaan saya jauh ke masa depan", optionB: "Saya selalu menyenangkan" },
  { id: 68, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya merasa bangga akan nama baik saya", optionB: "Saya tetap menekuni satu permasalahan sampai terselesaikan" },
  { id: 69, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka menyenangkan hati orang yang saya kagumi", optionB: "Saya suka menjadi orang yang berhasil" },
  { id: 70, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang bila orang lain mengambil keputusan untuk kelompok", optionB: "Saya suka mengambil keputusan untuk kelompok" },
  { id: 71, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya selalu berusaha sangat keras", optionB: "Saya cepat dan mudah mengambil keputusan" },
  { id: 72, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya kelompok saya mengerjakan hal-hal yang saya inginkan", optionB: "Biasanya saya tergesa-gesa" },
  { id: 73, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya seringkali merasa lelah", optionB: "Saya lambat dalam mengambil keputusan" },
  { id: 74, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya bekerja secara cepat", optionB: "Saya mudah mendapatkan kawan" },
  { id: 75, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya saya bersemangat dan bergairah", optionB: "Sebagian besar waktu saya untuk berpikir" },
  { id: 76, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya sangat hangat kepada orang-orang", optionB: "Saya menyukai pekerjaan yang menuntut ketepatan" },
  { id: 77, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya banyak berpikir dan merencanakan", optionB: "Saya melakukan segala sesuatu pada tempatnya" },
  { id: 78, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka tugas yang perlu ditekuni sampai kepada hal sedetailnya", optionB: "Saya tidak cepat marah" },
  { id: 79, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang mengikuti orang-orang yang saya kagumi", optionB: "Saya selalu menyelesaikan pekerjaan yang saya mulai" },
  { id: 80, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya menyukai petunjuk-petunjuk yang jelas", optionB: "Saya suka bekerja keras" },
  { id: 81, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya mengejar apa yang saya inginkan", optionB: "Saya adalah seorang pemimpin yang baik" },
  { id: 82, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya membuat orang lain bekerja keras", optionB: "Saya adalah orang yang gampangan (tidak banyak pertimbangan)" },
  { id: 83, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya membuat keputusan-keputusan secara cepat", optionB: "Bicara saya cepat" },
  { id: 84, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Biasanya saya bekerja tergesa-gesa", optionB: "Secara teratur saya berolahraga" },
  { id: 85, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya tidak suka bertemu dengan orang", optionB: "Saya cepat lelah" },
  { id: 86, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya mempunyai banyak sekali teman", optionB: "Banyak waktu saya untuk berpikir" },
  { id: 87, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka bekerja dengan teori", optionB: "Saya suka bekerja sedetail-detailnya" },
  { id: 88, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka bekerja sampai sedetail-detailnya", optionB: "Saya suka mengorganisir pekerjaan saya" },
  { id: 89, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya suka meletakkan segala sesuatu pada tempatnya", optionB: "Saya selalu menyenangkan" },
  { id: 90, text: "Manakah yang lebih menggambarkan Anda?", optionA: "Saya senang diberi petunjuk mengenai apa yang harus saya lakukan", optionB: "Saya harus menyelesaikan apa yang sudah saya mulai" }
]
  },
BIGFIVE: {
  name: "Tes Big Five Personality",
  description: "Tes kepribadian berdasarkan model lima faktor besar (OCEAN)",
  time: 1800, // 10 menit (ubah sesuai kebutuhan)
  instruction: "Beri penilaian seberapa sesuai pernyataan berikut dengan diri Anda (1 = Sangat Tidak Sesuai, 5 = Sangat Sesuai)",
  example: {
    question: "Saya adalah seseorang yang suka bersosialisasi",
    options: ["1", "2", "3", "4", "5"],
    answer: "Pilih angka yang sesuai",
    explanation: "Tidak ada jawaban benar/salah, pilih yang paling menggambarkan diri Anda"
  },
  questions: [
    // ========== O ========== (1–24)
    { id: 1, text: "Saya memiliki imajinasi yang aktif.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id: 2, text: "Saya tidak tertarik pada seni abstrak.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id: 3, text: "Saya suka mendengarkan ide-ide baru.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id: 4, text: "Saya tidak suka pergi ke museum seni.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id: 5, text: "Saya suka memecahkan teka-teki yang rumit.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id: 6, text: "Puisi memiliki sedikit efek emosional pada saya.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id: 7, text: "Saya penasaran tentang berbagai hal.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id: 8, text: "Saya menghindari film yang membutuhkan pemikiran mendalam.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id: 9, text: "Saya memiliki ide yang cemerlang.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:10, text: "Saya tidak tertarik pada diskusi teoritis.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:11, text: "Saya suka memikirkan cara-cara baru dalam melakukan sesuatu.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:12, text: "Saya merasa sulit memahami ide-ide abstrak.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:13, text: "Saya tertarik pada pengetahuan dari berbagai bidang.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:14, text: "Saya tidak suka membaca buku yang menantang.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:15, text: "Saya suka memecahkan masalah yang kompleks.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:16, text: "Saya lebih suka hal-hal rutin daripada perubahan.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:17, text: "Saya suka mengeksplorasi ide dan teori baru.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:18, text: "Saya menghindari percakapan filosofis.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:19, text: "Saya menikmati mencoba makanan baru.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:20, text: "Saya lebih suka kegiatan yang sudah saya kenal.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:21, text: "Saya suka memikirkan tentang masa depan.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:22, text: "Saya tidak tertarik pada spekulasi tentang alam semesta.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },
    { id:23, text: "Saya suka belajar tentang budaya lain.", options: ["1","2","3","4","5"], dimension: "O", reverse: false },
    { id:24, text: "Saya tidak suka membahas teori ilmiah.", options: ["1","2","3","4","5"], dimension: "O", reverse: true },

    // ========== C ========== (25–48)
    { id:25, text: "Saya selalu siap.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:26, text: "Saya meninggalkan barang-barang saya di mana saja.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:27, text: "Saya memperhatikan detail.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:28, text: "Saya membuat kekacauan.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:29, text: "Saya menyelesaikan tugas tepat waktu.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:30, text: "Saya sering lupa mengembalikan barang ke tempatnya.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:31, text: "Saya suka keteraturan.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:32, text: "Saya cenderung malas.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:33, text: "Saya mengikuti jadwal dengan ketat.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:34, text: "Saya menunda-nunda pekerjaan.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:35, text: "Saya melakukan tugas dengan hati-hati.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:36, text: "Saya menghindari tugas yang sulit.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:37, text: "Saya menyelesaikan apa yang saya mulai.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:38, text: "Saya tidak peduli dengan aturan.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:39, text: "Saya bekerja keras untuk mencapai tujuan saya.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:40, text: "Saya sulit memulai tugas.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:41, text: "Saya sangat teliti dalam pekerjaan saya.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:42, text: "Saya mudah terganggu dari pekerjaan.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:43, text: "Saya membuat rencana dan menaatinya.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:44, text: "Saya sering kehilangan fokus.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:45, text: "Saya menyelesaikan pekerjaan sebelum bersenang-senang.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:46, text: "Saya cenderung tidak teratur.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },
    { id:47, text: "Saya memenuhi tenggat waktu dengan baik.", options: ["1","2","3","4","5"], dimension: "C", reverse: false },
    { id:48, text: "Saya mengabaikan tugas yang tidak menyenangkan.", options: ["1","2","3","4","5"], dimension: "C", reverse: true },

    // ========== E ========== (49–72)
    { id:49, text: "Saya adalah jiwa pesta.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:50, text: "Saya tidak banyak bicara.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:51, text: "Saya merasa nyaman di sekitar orang.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:52, text: "Saya menyimpan diri saya sendiri.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:53, text: "Saya memulai percakapan.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:54, text: "Saya tidak suka menjadi pusat perhatian.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:55, text: "Saya banyak bicara.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:56, text: "Saya lebih suka mendengarkan daripada berbicara.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:57, text: "Saya memiliki banyak teman.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:58, text: "Saya merasa tidak nyaman di keramaian.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:59, text: "Saya bersemangat dalam kelompok sosial.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:60, text: "Saya menghindari kontak mata dengan orang asing.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:61, text: "Saya mudah berteman.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:62, text: "Saya membutuhkan banyak waktu untuk diri sendiri.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:63, text: "Saya suka memimpin kelompok.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:64, text: "Saya lebih suka bekerja sendirian.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:65, text: "Saya menikmati pertemuan sosial besar.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:66, text: "Saya merasa lelah setelah bersosialisasi.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:67, text: "Saya suka menjadi pusat perhatian.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:68, text: "Saya tidak suka pesta besar.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:69, text: "Saya energik saat bersama orang lain.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:70, text: "Saya pemalu dengan orang asing.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },
    { id:71, text: "Saya mudah bergaul dengan orang baru.", options: ["1","2","3","4","5"], dimension: "E", reverse: false },
    { id:72, text: "Saya lebih suka aktivitas tenang.", options: ["1","2","3","4","5"], dimension: "E", reverse: true },

    // ========== A ========== (73–96)
    { id:73, text: "Saya tertarik pada orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:74, text: "Saya mengolok-olok orang.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:75, text: "Saya bersimpati pada perasaan orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:76, text: "Saya tidak tertarik pada masalah orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:77, text: "Saya memiliki hati yang lembut.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:78, text: "Saya tidak terlalu peduli dengan orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:79, text: "Saya membuat orang merasa nyaman.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:80, text: "Saya menghina orang.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:81, text: "Saya mengasihi orang yang kurang beruntung.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:82, text: "Saya cenderung kritis terhadap orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:83, text: "Saya suka membantu orang.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:84, text: "Saya curiga pada niat orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:85, text: "Saya memaafkan orang yang menyakiti saya.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:86, text: "Saya suka membalas dendam.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:87, text: "Saya percaya pada apa yang orang katakan.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:88, text: "Saya memanipulasi orang untuk mendapatkan keuntungan.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:89, text: "Saya mudah percaya pada orang.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:90, text: "Saya mengeksploitasi orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:91, text: "Saya menghormati orang lain.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:92, text: "Saya tidak sabar dengan orang yang tidak efisien.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:93, text: "Saya menghindari konflik.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:94, text: "Saya suka berdebat.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },
    { id:95, text: "Saya kooperatif dalam kelompok.", options: ["1","2","3","4","5"], dimension: "A", reverse: false },
    { id:96, text: "Saya suka bersaing daripada bekerja sama.", options: ["1","2","3","4","5"], dimension: "A", reverse: true },

        // ========== N ========== (97–120)
    { id:97,  text: "Saya mudah gugup.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:98,  text: "Saya jarang merasa sedih.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:99,  text: "Saya sering merasa khawatir.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:100, text: "Saya puas dengan diri saya sendiri.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:101, text: "Saya mudah tersinggung.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:102, text: "Saya menangani stres dengan baik.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:103, text: "Saya sering merasa tidak enak hati.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:104, text: "Saya jarang merasa kesal.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:105, text: "Saya sering merasa murung.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:106, text: "Saya percaya diri dalam situasi baru.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:107, text: "Saya terlalu khawatir tentang hal-hal.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:108, text: "Saya merasa nyaman dengan diri sendiri.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:109, text: "Saya mudah panik.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:110, text: "Saya jarang merasa cemas.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:111, text: "Saya sering merasa tegang.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:112, text: "Saya jarang merasa tertekan.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:113, text: "Saya mudah marah.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:114, text: "Saya tetap tenang di bawah tekanan.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:115, text: "Saya merasa tidak aman dalam banyak hal.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:116, text: "Saya jarang merasa takut.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:117, text: "Saya merasa tidak berharga kadang-kadang.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:118, text: "Saya puas dengan hidup saya.", options: ["1","2","3","4","5"], dimension: "N", reverse: true },
    { id:119, text: "Saya merasa kewalahan dengan mudah.", options: ["1","2","3","4","5"], dimension: "N", reverse: false },
    { id:120, text: "Saya menikmati sebagian besar aspek hidup saya.", options: ["1","2","3","4","5"], dimension: "N", reverse: true }
  ]
}


};
// Membuat kolom Kraeplin random (helper nomor 2)
// Membuat kolom Kraeplin random (helper)
function generateKraeplinColumns(jumlahKolom, jumlahBaris) {
  return Array.from({length: jumlahKolom}, () =>
    Array.from({length: jumlahBaris}, () => Math.floor(Math.random() * 9) + 1)
  );
}
// /src/data/kamusPAPI.js

 const kamusPAPI = {
  A: [
    { range: [0, 4], desc: "Tidak kompetitif, mapan, puas. Tidak terdorong untuk menghasilkan prestasi, tdk berusaha utk mencapai sukses, membutuhkan dorongan dari luar diri, tidak berinisiatif, tidak memanfaatkan kemampuan diri secara optimal, ragu akan tujuan diri, misalnya sbg akibat promosi / perubahan struktur jabatan." },
    { range: [5, 7], desc: "Tahu akan tujuan yang ingin dicapainya dan dapat merumuskannya, realistis akan kemampuan diri, dan berusaha untuk mencapai target." },
    { range: [8, 9], desc: "Sangat berambisi utk berprestasi dan menjadi yg terbaik, menyukai tantangan, cenderung mengejar kesempurnaan, menetapkan target yg tinggi, 'self-starter', merumuskan kerja dg baik. Tdk realistis akan kemampuannya, sulit dipuaskan, mudah kecewa, harapan yg tinggi mungkin mengganggu org lain." }
  ],
  N: [
    { range: [0, 2], desc: "Tidak terlalu merasa perlu untuk menuntaskan sendiri tugas-tugasnya, senang menangani beberapa pekerjaan sekaligus, mudah mendelegasikan tugas. Komitmen rendah, cenderung meninggalkan tugas sebelum tuntas, konsentrasi mudah buyar, mungkin suka berpindah pekerjaan." },
    { range: [3, 5], desc: "Cukup memiliki komitmen untuk menuntaskan tugas, akan tetapi jika memungkinkan akan mendelegasikan sebagian dari pekerjaannya kepada orang lain." },
    { range: [6, 7], desc: "Komitmen tinggi, lebih suka menangani pekerjaan satu demi satu, akan tetapi masih dapat mengubah prioritas jika terpaksa." },
    { range: [8, 9], desc: "Memiliki komitmen yg sangat tinggi thd tugas, sangat ingin menyelesaikan tugas, tekun dan tuntas dlm menangani pekerjaan satu demi satu hingga tuntas. Perhatian terpaku pada satu tugas, sulit utk menangani beberapa pekerjaan sekaligus, sulit diinterupsi, tidak melihat masalah sampingan." }
  ],
  G: [
    { range: [0, 2], desc: "Santai, kerja adalah sesuatu yang menyenangkan-bukan beban yg membutuhkan usaha besar. Mungkin termotivasi utk mencari cara atau sistem yg dpt mempermudah dirinya dlm menyelesaikan pekerjaan, akan berusaha menghindari kerja keras, sehingga dapat memberi kesan malas." },
    { range: [3, 4], desc: "Bekerja keras sesuai tuntutan, menyalurkan usahanya untuk hal-hal yang bermanfaat / menguntungkan." },
    { range: [5, 7], desc: "Bekerja keras, tetapi jelas tujuan yg ingin dicapainya." },
    { range: [8, 9], desc: "Ingin tampil sbg pekerja keras, sangat suka bila orang lain memandangnya sbg pekerja keras. Cenderung menciptakan pekerjaan yang tidak perlu agar terlihat tetap sibuk, kadang kala tanpa tujuan yang jelas." }
  ],
  C: [
    { range: [0, 2], desc: "Lebih mementingkan fleksibilitas daripada struktur, pendekatan kerja lebih ditentukan oleh situasi daripada oleh perencanaan sebelumnya, mudah beradaptasi. Tidak mempedulikan keteraturan atau kerapihan, ceroboh." },
    { range: [3, 4], desc: "Fleksibel tapi masih cukup memperhatikan keteraturan atau sistematika kerja." },
    { range: [5, 6], desc: "Memperhatikan keteraturan dan sistematika kerja, tapi cukup fleksibel." },
    { range: [7, 9], desc: "Sistematis, bermetoda, berstruktur, rapi dan teratur, dapat menata tugas dengan baik. Cenderung kaku, tidak fleksibel." }
  ],
  D: [
    { range: [0, 1], desc: "Melihat pekerjaan scr makro, membedakan hal penting dari yg kurang penting, mendelegasikan detil pd org lain, generalis. Menghindari detail, konsekuensinya mungkin bertindak tanpa data yg cukup/akurat, bertindak ceroboh pd hal yg butuh kecermatan. Dpt mengabaikan proses yg vital dlm evaluasi data." },
    { range: [2, 3], desc: "Cukup peduli akan akurasi dan kelengkapan data." },
    { range: [4, 6], desc: "Tertarik untuk menangani sendiri detail." },
    { range: [7, 9], desc: "Sangat menyukai detail, sangat peduli akan akurasi dan kelengkapan data. Cenderung terlalu terlibat dengan detail sehingga melupakan tujuan utama." }
  ],
  R: [
    { range: [0, 3], desc: "Tipe pelaksana, praktis - pragmatis, mengandalkan pengalaman masa lalu dan intuisi. Bekerja tanpa perencanaan, mengandalkan perasaan." },
    { range: [4, 5], desc: "Pertimbangan mencakup aspek teoritis (konsep atau pemikiran baru) dan aspek praktis (pengalaman) secara berimbang." },
    { range: [6, 7], desc: "Suka memikirkan suatu problem secara mendalam, merujuk pada teori dan konsep." },
    { range: [8, 9], desc: "Tipe pemikir, sangat berminat pada gagasan, konsep, teori, mencari alternatif baru, menyukai perencanaan. Mungkin sulit dimengerti oleh orang lain, terlalu teoritis dan tidak praktis, mengawang-awang dan berbelit-belit." }
  ],
  T: [
    { range: [0, 3], desc: "Santai. Kurang peduli akan waktu, kurang memiliki rasa urgensi, membuang-buang waktu, bukan pekerja yang tepat waktu." },
    { range: [4, 6], desc: "Cukup aktif dalam segi mental, dapat menyesuaikan tempo kerjanya dengan tuntutan pekerjaan / lingkungan." },
    { range: [7, 9], desc: "Cekatan, selalu siaga, bekerja cepat, ingin segera menyelesaikan tugas. Negatifnya: Tegang, cemas, impulsif, mungkin ceroboh, banyak gerakan yang tidak perlu." }
  ],
  V: [
    { range: [0, 2], desc: "Cocok untuk pekerjaan 'di belakang meja'. Cenderung lamban, tidak tanggap, mudah lelah, daya tahan lemah." },
    { range: [3, 6], desc: "Dapat bekerja di belakang meja dan senang jika sesekali harus terjun ke lapangan atau melaksanakan tugas-tugas yang bersifat mobile." },
    { range: [7, 9], desc: "Menyukai aktifitas fisik (a.l.: olah raga), enerjik, memiliki stamina untuk menangani tugas-tugas berat, tidak mudah lelah. Tidak betah duduk lama, kurang dapat konsentrasi 'di belakang meja'." }
  ],
  W: [
    { range: [0, 3], desc: "Hanya butuh gambaran ttg kerangka tugas scr garis besar, berpatokan pd tujuan, dpt bekerja dlm suasana yg kurang berstruktur, berinsiatif, mandiri. Tdk patuh, cenderung mengabaikan/tdk paham pentingnya peraturan/prosedur, suka membuat peraturan sendiri yg bisa bertentangan dg yg telah ada." },
    { range: [4, 5], desc: "Perlu pengarahan awal dan tolok ukur keberhasilan." },
    { range: [6, 7], desc: "Membutuhkan uraian rinci mengenai tugas, dan batasan tanggung jawab serta wewenang." },
    { range: [8, 9], desc: "Patuh pada kebijaksanaan, peraturan dan struktur organisasi. Ingin segala sesuatunya diuraikan secara rinci, kurang memiliki inisiatif, tdk fleksibel, terlalu tergantung pada organisasi, berharap 'disuapi'." }
  ],
  F: [
    { range: [0, 3], desc: "Otonom, dapat bekerja sendiri tanpa campur tangan orang lain, motivasi timbul krn pekerjaan itu sendiri - bukan krn pujian dr otoritas. Mempertanyakan otoritas, cenderung tidak puas thdp atasan, loyalitas lebih didasari kepentingan pribadi." },
    { range: [4, 6], desc: "Loyal pada Perusahaan." },
    { range: [7, 7], desc: "Loyal pada pribadi atasan." },
    { range: [8, 9], desc: "Loyal, berusaha dekat dg pribadi atasan, ingin menyenangkan atasan, sadar akan harapan atasan akan dirinya. Terlalu memperhatikan cara menyenangkan atasan, tidak berani berpendirian lain, tidak mandiri." }
  ],
  L: [
    { range: [0, 1], desc: "Puas dengan peran sebagai bawahan, memberikan kesempatan pada orang lain untuk memimpin, tidak dominan. Tidak percaya diri; sama sekali tidak berminat untuk berperan sebagai pemimpin; bersikap pasif dalam kelompok." },
    { range: [2, 3], desc: "Tidak percaya diri dan tidak ingin memimpin atau mengawasi orang lain." },
    { range: [4, 4], desc: "Kurang percaya diri dan kurang berminat utk menjadi pemimpin." },
    { range: [5, 5], desc: "Cukup percaya diri, tidak secara aktif mencari posisi kepemimpinan akan tetapi juga tidak akan menghindarinya." },
    { range: [6, 7], desc: "Percaya diri dan ingin berperan sebagai pemimpin." },
    { range: [8, 9], desc: "Sangat percaya diri utk berperan sbg atasan & sangat mengharapkan posisi tersebut. Lebih mementingkan citra & status kepemimpinannya dari pada efektifitas kelompok, mungkin akan tampil angkuh atau terlalu percaya diri." }
  ],
  P: [
    { range: [0, 1], desc: "Permisif, akan memberikan kesempatan pada orang lain untuk memimpin. Tidak mau mengontrol orang lain dan tidak mau mempertanggung jawabkan hasil kerja bawahannya." },
    { range: [2, 3], desc: "Enggan mengontrol org lain & tidak mau mempertanggung jawabkan hasil kerja bawahannya, lebih memberi kebebasan kpd bawahan utk memilih cara sendiri dlm penyelesaian tugas dan meminta bawahan utk mempertanggungjawabkan hasilnya masing-masing." },
    { range: [4, 4], desc: "Cenderung enggan melakukan fungsi pengarahan, pengendalian dan pengawasan, kurang aktif memanfaatkan kapasitas bawahan secara optimal, cenderung bekerja sendiri dalam mencapai tujuan kelompok." },
    { range: [5, 5], desc: "Bertanggung jawab, akan melakukan fungsi pengarahan, pengendalian dan pengawasan, tapi tidak mendominasi." },
    { range: [6, 7], desc: "Dominan dan bertanggung jawab, akan melakukan fungsi pengarahan, pengendalian dan pengawasan." },
    { range: [8, 9], desc: "Sangat dominan, sangat mempengaruhi & mengawasi org lain, bertanggung jawab atas tindakan & hasil kerja bawahan. Posesif, tdk ingin berada di bawah pimpinan org lain, cemas bila tdk berada di posisi pemimpin, mungkin sulit utk bekerja sama dgn rekan yg sejajar kedudukannya." }
  ],
  I: [
    { range: [0, 1], desc: "Sangat berhati-hati, memikirkan langkah-langkahnya secara bersungguh-sungguh. Lamban dlm mengambil keputusan, terlalu lama merenung, cenderung menghindar mengambil keputusan." },
    { range: [2, 3], desc: "Enggan mengambil keputusan." },
    { range: [4, 5], desc: "Berhati-hati dlm pengambilan keputusan." },
    { range: [6, 7], desc: "Cukup percaya diri dlm pengambilan keputusan, mau mengambil resiko, dpt memutuskan dgn cepat, mengikuti alur logika." },
    { range: [8, 9], desc: "Sangat yakin dl mengambil keputusan, cepat tanggap thd situasi, berani mengambil resiko, mau memanfaatkan kesempatan. Impulsif, dpt membuat keputusan yg tdk praktis, cenderung lebih mementingkan kecepatan daripada akurasi, tdk sabar, cenderung meloncat pd keputusan." }
  ],
  S: [
    { range: [0, 2], desc: "Dpt. bekerja sendiri, tdk membutuhkan kehadiran org lain. Menarik diri, kaku dlm bergaul, canggung dlm situasi sosial, lebih memperhatikan hal-hal lain daripada manusia." },
    { range: [3, 4], desc: "Kurang percaya diri & kurang aktif dlm menjalin hubungan sosial." },
    { range: [5, 9], desc: "Percaya diri & sangat senang bergaul, menyukai interaksi sosial, bisa menciptakan suasana yg menyenangkan, mempunyai inisiatif & mampu menjalin hubungan & komunikasi, memperhatikan org lain. Mungkin membuang-buang waktu utk aktifitas sosial, kurang peduli akan penyelesaian tugas." }
  ],
  B: [
    { range: [0, 2], desc: "Mandiri (dari segi emosi), tdk mudah dipengaruhi oleh tekanan kelompok. Penyendiri, kurang peka akan sikap & kebutuhan kelompok, mungkin sulit menyesuaikan diri." },
    { range: [3, 5], desc: "Selektif dlm bergabung dg kelompok, hanya mau berhubungan dg kelompok di lingkungan kerja apabila bernilai & sesuai minat, tdk terlalu mudah dipengaruhi." },
    { range: [6, 9], desc: "Suka bergabung dlm kelompok, sadar akan sikap & kebutuhan kelompok, suka bekerja sama, ingin menjadi bagian dari kelompok, ingin disukai & diakui oleh lingkungan; sangat tergantung pd kelompok, lebih memperhatikan kebutuhan kelompok daripada pekerjaan." }
  ],
  O: [
    { range: [0, 2], desc: "Menjaga jarak, lebih memperhatikan hal-hal kedinasan, tdk mudah dipengaruhi oleh individu tertentu, objektif & analitis. Tampil dingin, tdk acuh, tdk ramah, suka berahasia, mungkin tdk sadar akan perasaan org lain, & mungkin sulit menyesuaikan diri." },
    { range: [3, 5], desc: "Tidak mencari atau menghindari hubungan antar pribadi di lingkungan kerja, masih mampu menjaga jarak." },
    { range: [6, 9], desc: "Peka akan kebutuhan org lain, sangat memikirkan hal-hal yg dibutuhkan org lain, suka menjalin hubungan persahabatan yg hangat & tulus. Sangat perasa, mudah tersinggung, cenderung subjektif, dpt terlibat terlalu dalam/intim dg individu tertentu dlm pekerjaan, sangat tergantung pd individu tertentu." }
  ],
  X: [
    { range: [0, 1], desc: "Sederhana, rendah hati, tulus, tidak sombong dan tidak suka menampilkan diri. Terlalu sederhana, cenderung merendahkan kapasitas diri, tidak percaya diri, cenderung menarik diri dan pemalu." },
    { range: [2, 3], desc: "Sederhana, cenderung diam, cenderung pemalu, tidak suka menonjolkan diri." },
    { range: [4, 5], desc: "Mengharapkan pengakuan lingkungan dan tidak mau diabaikan tetapi tidak mencari-cari perhatian." },
    { range: [6, 9], desc: "Bangga akan diri dan gayanya sendiri, senang menjadi pusat perhatian, mengharapkan penghargaan dari lingkungan. Mencari-cari perhatian dan suka menyombongkan diri." }
  ],
  E: [
    { range: [0, 1], desc: "Sangat terbuka, terus terang, mudah terbaca (dari air muka, tindakan, perkataan, sikap). Tidak dapat mengendalikan emosi, cepat bereaksi, kurang mengindahkan/tidak mempunyai 'nilai' yg mengharuskannya menahan emosi." },
    { range: [2, 3], desc: "Terbuka, mudah mengungkap pendapat atau perasaannya mengenai suatu hal kepada org lain." },
    { range: [4, 6], desc: "Mampu mengungkap atau menyimpan perasaan, dapat mengendalikan emosi." },
    { range: [7, 9], desc: "Mampu menyimpan pendapat atau perasaannya, tenang, dapat mengendalikan emosi, menjaga jarak. Tampil pasif dan tidak acuh, mungkin sulit mengungkapkan emosi/perasaan/pandangan." }
  ],
  K: [
    { range: [0, 1], desc: "Sabar, tidak menyukai konflik. Mengelak atau menghindar dari konflik, pasif, menekan atau menyembunyikan perasaan sesungguhnya, menghindari konfrontasi, lari dari konflik, tidak mau mengakui adanya konflik." },
    { range: [2, 3], desc: "Lebih suka menghindari konflik, akan mencari rasionalisasi untuk dapat menerima situasi dan melihat permasalahan dari sudut pandang orang lain." },
    { range: [4, 5], desc: "Tidak mencari atau menghindari konflik, mau mendengarkan pandangan orang lain tetapi dapat menjadi keras kepala saat mempertahankan pandangannya." },
    { range: [6, 7], desc: "Akan menghadapi konflik, mengungkapkan serta memaksakan pandangan dengan cara positif." },
    { range: [8, 9], desc: "Terbuka, jujur, terus terang, asertif, agresif, reaktif, mudah tersinggung, mudah meledak, curiga, berprasangka, suka berkelahi atau berkonfrontasi, berpikir negatif." }
  ],
  Z: [
    { range: [0, 1], desc: "Mudah beradaptasi dg pekerjaan rutin tanpa merasa bosan, tidak membutuhkan variasi, menyukai lingkungan stabil dan tidak berubah. Konservatif, menolak perubahan, sulit menerima hal-hal baru, tidak dapat beradaptasi dengan situasi yg berbeda-beda." },
    { range: [2, 3], desc: "Enggan berubah, tidak siap untuk beradaptasi, hanya mau menerima perubahan jika alasannya jelas dan meyakinkan." },
    { range: [4, 5], desc: "Mudah beradaptasi, cukup menyukai perubahan." },
    { range: [6, 7], desc: "Antusias terhadap perubahan dan akan mencari hal-hal baru, tetapi masih selektif (menilai kemanfaatannya)." },
    { range: [8, 9], desc: "Sangat menyukai perubahan, gagasan baru/variasi, aktif mencari perubahan, antusias dg hal-hal baru, fleksibel dlm berpikir, mudah beradaptasi pd situasi yg berbeda-beda. Gelisah, frustasi, mudah bosan, sangat membutuhkan variasi, tidak menyukai tugas/situasi yg rutin-monoton." }
  ]
};


function getInterpretasiPAPI(aspek, nilai) {
  if (!kamusPAPI[aspek]) return "-";
  const entry = kamusPAPI[aspek].find(r => nilai >= r.range[0] && nilai <= r.range[1]);
  return entry ? entry.desc : "-";
}
// ---------- ANALISIS KECOCOKAN UNTUK SEMUA POSISI ----------
function analisisKecocokanPAPI(scores, posisi) {
  // Analisis kecocokan dengan posisi: Technical Staff, Guru, Administrator, Manajer, dst.
  // Ubah sesuai kebutuhan HRD-mu, ini sudah umum dipakai di psikotes rekrutmen Indonesia.
  let catatan = "";
  if (posisi === "Technical Staff") {
    catatan = "Pada posisi Technical Staff, dibutuhkan ketelitian, perhatian pada detail, kemampuan mengikuti aturan, dan komitmen kerja. " +
      "Jika skor D (detail), C (teratur), W (taat aturan), dan N/G/A (komitmen, dorongan kerja, prestasi) rendah, maka peserta **kurang cocok** untuk posisi ini. " +
      "Jika semua skor rendah, berarti sangat kurang cocok (minim motivasi, kurang teliti, kurang terstruktur, kurang bertanggung jawab, kurang percaya diri, kurang inisiatif, dan kurang adaptif pada perubahan).";
  } else if (posisi === "Guru") {
    catatan = "Posisi Guru memerlukan empati, kemampuan sosial (S/B/O), komitmen kerja (N/G/A), dan kestabilan emosi (E/K). " +
      "Jika seluruh skor utama ini rendah, maka peserta **kurang cocok** sebagai Guru, apalagi bila S/B/O rendah (kurang peduli, pasif secara sosial, tidak mampu membangun relasi dengan siswa, minim inisiatif).";
  } else if (posisi === "Administrator") {
    catatan = "Administrator harus teliti (D), teratur (C), patuh pada sistem (W), dan mampu menyelesaikan tugas hingga tuntas (N/A/G). " +
      "Jika semua skor rendah, berarti kandidat kurang cocok menjadi Administrator karena kurang teliti, kurang terorganisir, mudah bosan, serta kurang bertanggung jawab.";
  } else if (posisi === "Manajer") {
    catatan = "Manajer memerlukan inisiatif (A/G/N), kepemimpinan (L/P/I), serta komunikasi (S/B), dan kemampuan adaptif (Z/E). " +
      "Jika skor kepemimpinan, pengambilan keputusan, serta dorongan kerja rendah, kandidat kurang cocok menjadi Manajer.";
  } else {
    catatan = "Dengan skor yang rendah di hampir semua aspek utama PAPI, kecocokan untuk posisi ini **sangat kurang**. Kandidat perlu pengembangan besar dalam motivasi, kemandirian, ketelitian, kedisiplinan, kepedulian sosial, dan kemampuan mengikuti aturan kerja.";
  }
  return catatan;
}
// ---------- PARAGRAF ANALISIS LENGKAP SEMUA FAKTOR ----------
function generateAnalisaPAPI(scores, posisi) {
  const faktorList = [
    ['N', 'Penyelesaian secara prestasi'],
    ['G', 'Peranan sebagai pekerja keras'],
    ['A', 'Hasrat untuk berprestasi'],
    ['L', 'Peran sebagai pimpinan'],
    ['P', 'Pengendalian orang lain'],
    ['I', 'Mudah dalam mengambil keputusan'],
    ['T', 'Tipe selalu sibuk'],
    ['V', 'Tipe yang bersemangat'],
    ['X', 'Kebutuhan untuk mendapatkan perhatian'],
    ['S', 'Pergaulan luas'],
    ['B', 'Kebutuhan berkelompok'],
    ['O', 'Kebutuhan untuk dekat dan menyayangi'],
    ['R', 'Tipe teoritikal'],
    ['D', 'Suka pekerjaan yang terperinci'],
    ['C', 'Tipe teratur'],
    ['Z', 'Hasrat untuk berubah'],
    ['E', 'Pengendalian emosi'],
    ['K', 'Agresi'],
    ['F', 'Dukungan terhadap atasan'],
    ['W', 'Kebutuhan taat pada aturan dan pengarahan'],
  ];
  let teks = "";
  faktorList.forEach(([kode, nama]) => {
    const val = scores[kode] ?? '-';
    const desc = getInterpretasiPAPI(kode, val);
    teks += `${nama} (${kode} = ${val}): ${desc}\n\n`;
  });
  const kecocokan = analisisKecocokanPAPI(scores, posisi);
  return `Rangkuman hasil PAPI Kostick berikut memuat interpretasi lengkap seluruh aspek kepribadian kandidat:\n\n${teks}\nKecocokan untuk posisi "${posisi}":\n${kecocokan}`;
}


// Kunci mapping arah kerja PAPI (N, G, A)
const mappingPAPI = {
  ArahKerja: {
    N: { tipe: 'B', nomor: [2, 13, 24, 35, 46, 57, 68, 79, 90] },
    G: { tipe: 'A', nomor: [1, 11, 21, 31, 41, 51, 61, 71, 81] },
    A: [
      { tipe: 'A', nomor: [2] },
      { tipe: 'B', nomor: [3, 14, 25, 36, 47, 58, 69, 80] }
    ]
  },
 Kepemimpinan: {
  L: [
    { tipe: 'A', nomor: [12, 22, 32, 42, 52, 62, 72, 82] },
    { tipe: 'B', nomor: [81] }
  ],
  P: [
    { tipe: 'A', nomor: [3, 13] },
    { tipe: 'B', nomor: [4, 15, 26, 37, 48, 59, 70] }
  ],
  I: [
    { tipe: 'A', nomor: [23, 33, 43, 53, 63, 73, 83] },
    { tipe: 'B', nomor: [71, 82] }
  ]
},
 Aktivitas: {
  T: [
    { tipe: 'A', nomor: [34, 44, 54, 64, 74, 84] },
    { tipe: 'B', nomor: [61, 72, 83] }
  ],
  V: [
    { tipe: 'A', nomor: [45, 55, 65, 75, 85] },
    { tipe: 'B', nomor: [51, 62, 73, 84] }
  ]
},
  Pergaulan: {
  X: [
    { tipe: 'A', nomor: [4, 14, 24] },
    { tipe: 'B', nomor: [5, 16, 27, 38, 49, 60] }
  ],
  S: [
    { tipe: 'A', nomor: [56, 66, 76, 86] },
    { tipe: 'B', nomor: [41, 52, 63, 74, 85] }
  ],
  B: [
    { tipe: 'A', nomor: [5, 15, 25, 35] },
    { tipe: 'B', nomor: [6, 17, 28, 39, 50] }
  ],
  O: [
    { tipe: 'A', nomor: [6, 16, 26, 36, 46] },
    { tipe: 'B', nomor: [7, 18, 29, 40] }
  ]
}
,
  GayaKerja: {
  R: [
    { tipe: 'A', nomor: [67, 77, 87] },
    { tipe: 'B', nomor: [31, 42, 53, 64, 75, 86] }
  ],
  D: [
    { tipe: 'A', nomor: [78, 88] },
    { tipe: 'B', nomor: [21, 32, 43, 54, 65, 76, 87] }
  ],
  C: [
    { tipe: 'A', nomor: [89] },
    { tipe: 'B', nomor: [11, 22, 33, 44, 55, 66, 77, 88] }
  ]
}
,
 Sifat: {
  Z: [
    { tipe: 'A', nomor: [7, 17, 27, 37, 47, 57] },
    { tipe: 'B', nomor: [8, 19, 30] }
  ],
  E: { tipe: 'B', nomor: [1, 12, 23, 34, 45, 56, 67, 78, 89] },
  K: [
    { tipe: 'A', nomor: [8, 18, 28, 38, 48, 58, 68] },
    { tipe: 'B', nomor: [9, 20] }
  ]
}
,
  Ketaatan: {
  F: [
    { tipe: 'A', nomor: [9, 19, 29, 39, 49, 59, 69, 79] },
    { tipe: 'B', nomor: [10] }
  ],
  W: { tipe: 'A', nomor: [10, 20, 30, 40, 50, 60, 70, 80, 90] }
}
};



function skorPAPIArahKerja(answerObjArray) {
  let hasil = { N: 0, G: 0, A: 0 };
  mappingPAPI.ArahKerja.N.nomor.forEach(n => {
    const jaw = answerObjArray.find(a => a.id === n);
    if (jaw && jaw.answer === mappingPAPI.ArahKerja.N.tipe) hasil.N++;
  });
  mappingPAPI.ArahKerja.G.nomor.forEach(n => {
    const jaw = answerObjArray.find(a => a.id === n);
    if (jaw && jaw.answer === mappingPAPI.ArahKerja.G.tipe) hasil.G++;
  });
  mappingPAPI.ArahKerja.A.forEach(group => {
    group.nomor.forEach(n => {
      const jaw = answerObjArray.find(a => a.id === n);
      if (jaw && jaw.answer === group.tipe) hasil.A++;
    });
  });
  return hasil;
}

function skorPAPIKepemimpinan(answerObjArray) {
  let hasil = { L: 0, P: 0, I: 0 };
  ['L', 'P', 'I'].forEach(kode => {
    mappingPAPI.Kepemimpinan[kode].forEach(group => {
      group.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === group.tipe) hasil[kode]++;
      });
    });
  });
  return hasil;
}

function skorPAPIAktivitas(answerObjArray) {
  let hasil = { T: 0, V: 0 };
  ['T', 'V'].forEach(kode => {
    mappingPAPI.Aktivitas[kode].forEach(group => {
      group.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === group.tipe) hasil[kode]++;
      });
    });
  });
  return hasil;
}

function skorPAPIPergaulan(answerObjArray) {
  let hasil = { X: 0, S: 0, B: 0, O: 0 };
  ['X', 'S', 'B', 'O'].forEach(kode => {
    mappingPAPI.Pergaulan[kode].forEach(group => {
      group.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === group.tipe) hasil[kode]++;
      });
    });
  });
  return hasil;
}

function skorPAPIGayaKerja(answerObjArray) {
  let hasil = { R: 0, D: 0, C: 0 };
  ['R', 'D', 'C'].forEach(kode => {
    mappingPAPI.GayaKerja[kode].forEach(group => {
      group.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === group.tipe) hasil[kode]++;
      });
    });
  });
  return hasil;
}

function skorPAPISifat(answerObjArray) {
  let hasil = { Z: 0, E: 0, K: 0 };

  ['Z', 'E', 'K'].forEach(kode => {
    const faktor = mappingPAPI.Sifat[kode];

    if (Array.isArray(faktor)) {
      // tipe campuran A dan B
      faktor.forEach(group => {
        group.nomor.forEach(n => {
          const jaw = answerObjArray.find(a => a.id === n);
          if (jaw && jaw.answer === group.tipe) hasil[kode]++;
        });
      });
    } else {
      // hanya satu tipe
      faktor.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === faktor.tipe) hasil[kode]++;
      });
    }
  });

  return hasil;
}


function skorPAPIKetaatan(answerObjArray) {
  let hasil = { F: 0, W: 0 };

  ['F', 'W'].forEach(kode => {
    const faktor = mappingPAPI.Ketaatan[kode];

    if (Array.isArray(faktor)) {
      // tipe campuran A dan B
      faktor.forEach(group => {
        group.nomor.forEach(n => {
          const jaw = answerObjArray.find(a => a.id === n);
          if (jaw && jaw.answer === group.tipe) hasil[kode]++;
        });
      });
    } else {
      // hanya satu tipe
      faktor.nomor.forEach(n => {
        const jaw = answerObjArray.find(a => a.id === n);
        if (jaw && jaw.answer === faktor.tipe) hasil[kode]++;
      });
    }
  });

  return hasil;
}
function getBigFiveSuitabilityLabel(percent) {
  if (percent >= 80) return "Cocok sekali";
  if (percent >= 65) return "Cocok";
  if (percent >= 40) return "Kurang cocok";
  return "Tidak cocok";
}
function analisaBigFiveSuitability(hasilOCEAN, posisiKey) {
  // Daftar kebutuhan ideal untuk masing-masing posisi dan aspek
  const kebutuhan = {
    "Administrator":   { O: 60, C: 75, E: 60, A: 65, N: 35 },
    "Guru":            { O: 70, C: 70, E: 65, A: 70, N: 40 },
    "Kindergartens":   { O: 70, C: 65, E: 70, A: 75, N: 35 },
    "Primary":         { O: 70, C: 70, E: 70, A: 70, N: 35 },
    "Math":            { O: 65, C: 75, E: 60, A: 65, N: 40 },
    "PE & Health":     { O: 70, C: 70, E: 80, A: 70, N: 35 },
    "Biology":         { O: 70, C: 70, E: 65, A: 70, N: 35 },
    "Technical Staff": { O: 60, C: 70, E: 60, A: 65, N: 35 },
    "Welder":          { O: 55, C: 80, E: 55, A: 60, N: 35 },
    "Wood Maintenance Technician": { O: 60, C: 75, E: 60, A: 60, N: 35 },
    "Baker":           { O: 65, C: 75, E: 60, A: 65, N: 35 }
  };
  const kebutuhanPosisi = kebutuhan[posisiKey] || kebutuhan["Administrator"];
  let lines = [];
  Object.entries(hasilOCEAN).forEach(([dim, val]) => {
    const ideal = kebutuhanPosisi[dim] || 60;
    const label = getBigFiveSuitabilityLabel(val.percent);
    lines.push(`${val.name} (${val.percent}%) → Kebutuhan: ${ideal}%. **${label}**.\n${val.desc}`);
  });
  return lines;
}

const bigFivePositionAnalysis = {
  "Administrator": [
    "Dalam posisi Administrator, kelima dimensi kepribadian Big Five memiliki peran yang sangat penting dalam menentukan efektivitas dan kinerja individu di lingkungan kerja yang menuntut ketelitian serta koordinasi yang baik. Administrator yang memiliki skor tinggi pada aspek Conscientiousness akan sangat terorganisir, teliti, dan mampu memastikan semua proses administratif berjalan sesuai prosedur, mulai dari pencatatan data, pengarsipan, hingga pelaporan. Sikap disiplin dan konsistensi kerja yang tinggi akan mengurangi risiko kesalahan dan meningkatkan kepercayaan stakeholder terhadap integritas pelayanan administrasi. Skor Openness yang baik juga diperlukan agar Administrator siap menerima dan mengimplementasikan perubahan sistem, prosedur, maupun teknologi baru yang dapat meningkatkan efisiensi dan mutu kerja. Pada dimensi Agreeableness, Administrator yang ramah, kooperatif, dan mudah dipercaya akan menciptakan hubungan kerja yang harmonis, baik dengan rekan satu tim, atasan, maupun pihak eksternal. Kemampuan untuk menyesuaikan komunikasi dan sikap kooperatif sangat mendukung pelayanan prima dan penyelesaian tugas secara kolektif. Extraversion mendukung kemampuan dalam melayani banyak pihak, menjalin koordinasi lintas bagian, serta menjaga lingkungan kerja yang kondusif. Terakhir, skor Neuroticism yang rendah sangat penting untuk menjaga kestabilan emosi, sehingga Administrator tetap tenang, mampu mengelola stres, serta dapat berpikir jernih dalam situasi deadline atau tekanan beban kerja tinggi. Kombinasi kelima aspek kepribadian ini akan membentuk Administrator yang profesional, efisien, adaptif, dan mampu menjaga mutu pelayanan secara konsisten."
  ],
  "Guru": [
    "Sebagai Guru, kelima dimensi kepribadian Big Five memberikan gambaran yang sangat luas terhadap potensi dan kecocokan dalam mendidik serta membimbing siswa. Guru dengan skor Openness yang tinggi akan mudah mengadopsi dan mengembangkan metode pembelajaran inovatif, mampu merespon perubahan kurikulum, serta mengintegrasikan teknologi atau pendekatan kreatif dalam proses belajar-mengajar. Sikap terbuka ini akan menumbuhkan minat siswa serta menciptakan suasana kelas yang dinamis. Pada aspek Conscientiousness, guru yang teliti dan bertanggung jawab akan memastikan semua rencana pembelajaran, tugas, serta penilaian dilakukan dengan sistematis dan tepat waktu. Guru seperti ini sangat konsisten dalam evaluasi hasil belajar dan administrasi kelas. Dimensi Extraversion sangat menunjang kemampuan berkomunikasi efektif, baik dengan siswa, orang tua, maupun kolega. Guru ekstrovert akan lebih mudah membangun relasi interpersonal yang positif, mendorong partisipasi aktif di kelas, dan menjadi motivator bagi siswa. Agreeableness yang tinggi menggambarkan guru yang penuh empati, sabar, mudah dipercaya, dan dapat memahami berbagai karakter siswa. Kepekaan sosial ini sangat membantu dalam menciptakan suasana belajar yang suportif, menghargai perbedaan, dan mampu menangani konflik dengan pendekatan solutif. Terakhir, skor Neuroticism yang rendah menunjukkan kemampuan guru dalam menjaga kestabilan emosi, tetap tenang saat menghadapi tantangan atau tekanan kelas, serta menjadi teladan dalam mengelola stres. Kombinasi kelima dimensi ini menjadikan seorang guru tidak hanya berkompeten secara akademis, tetapi juga mampu membangun lingkungan belajar yang positif, adaptif, dan inspiratif bagi siswa."
  ],
  "Kindergartens": [
    "Pada posisi Guru Taman Kanak-kanak, karakter kepribadian sangat menentukan dalam mendukung tumbuh kembang anak usia dini. Skor Openness yang tinggi akan membantu guru untuk selalu kreatif dalam menyusun permainan edukatif, merancang aktivitas yang menarik, dan menghadirkan suasana belajar yang penuh warna. Kemampuan berimajinasi dan berpikir inovatif sangat dibutuhkan untuk menghadapi rasa ingin tahu dan energi anak-anak. Conscientiousness berperan penting dalam merencanakan kegiatan pembelajaran harian secara teratur, mencatat perkembangan anak dengan detail, serta memastikan setiap anak mendapat perhatian sesuai kebutuhannya. Agreeableness sangat menonjol dalam peran ini, karena guru harus mampu menunjukkan empati, kasih sayang, dan kesabaran ekstra menghadapi ragam perilaku anak. Guru yang mudah dipercaya akan lebih efektif dalam membangun rasa aman dan nyaman pada siswa. Extraversion akan memperkuat kemampuan berinteraksi, menciptakan suasana yang ceria, serta membangun komunikasi positif dengan orang tua. Neuroticism yang rendah penting agar guru dapat tetap tenang saat menghadapi tantrum atau konflik antar anak, sehingga mampu memberikan teladan pengelolaan emosi sejak dini. Kombinasi semua aspek kepribadian ini sangat krusial untuk menciptakan lingkungan belajar yang penuh cinta, aman, dan mendukung perkembangan sosial-emosional anak-anak."
  ],
  "Primary": [
    "Sebagai Guru SD, kelima aspek kepribadian Big Five memberikan pengaruh besar pada kualitas pembelajaran dan bimbingan karakter siswa. Openness yang tinggi mendorong inovasi dalam menyampaikan materi, penggunaan alat peraga yang variatif, serta kemauan mencoba pendekatan belajar yang sesuai dengan perkembangan zaman. Conscientiousness sangat dibutuhkan untuk pengelolaan kelas yang terstruktur, pendataan perkembangan siswa, dan penilaian hasil belajar yang objektif serta adil. Extraversion membantu guru membangun interaksi yang menyenangkan di kelas, mendorong siswa untuk aktif bertanya dan berpendapat, serta membangun hubungan positif dengan orang tua. Agreeableness berperan dalam membentuk guru yang sabar, toleran, serta mampu merangkul siswa dengan berbagai karakter dan latar belakang. Sikap empati dan kehangatan akan memperkuat rasa percaya diri siswa dan memperlancar komunikasi dua arah. Neuroticism yang rendah penting untuk menjaga kestabilan emosi, mengelola tekanan administrasi maupun tantangan perilaku siswa, serta menjadi contoh dalam pengendalian diri. Guru SD yang menonjol pada kelima aspek ini akan mampu membimbing siswa tidak hanya secara akademik, tetapi juga membentuk karakter dan kepribadian anak sejak dini."
  ],
  "Math": [
    "Guru Matematika membutuhkan kombinasi kepribadian yang mencakup ketelitian tinggi (Conscientiousness), keterbukaan pada metode ajar baru (Openness), serta kemampuan membina hubungan positif dengan siswa (Agreeableness dan Extraversion). Ketelitian menjadi kunci dalam menjelaskan konsep-konsep matematis yang presisi dan logis, memeriksa hasil kerja siswa, serta menjaga keakuratan penilaian. Openness diperlukan agar guru selalu update dengan perkembangan metode pengajaran matematika, seperti penggunaan alat peraga, teknologi pembelajaran digital, atau strategi problem-based learning yang modern. Guru yang memiliki agreeableness dan extraversion baik akan lebih mudah membangun suasana kelas yang interaktif, mendorong siswa untuk bertanya, berdiskusi, dan tidak takut melakukan kesalahan. Neuroticism yang rendah akan membantu guru tetap sabar menghadapi siswa yang kesulitan memahami materi, serta menjaga suasana kelas tetap kondusif. Perpaduan kelima aspek kepribadian ini sangat mendukung keberhasilan proses belajar-mengajar matematika yang efektif, inspiratif, dan menyenangkan."
  ],
  "PE & Health": [
    "Guru Olahraga & Kesehatan sangat diuntungkan dengan kepribadian yang enerjik (Extraversion tinggi), adaptif pada variasi metode pengajaran (Openness), serta disiplin tinggi (Conscientiousness) untuk mengatur jadwal dan memastikan keselamatan siswa dalam setiap aktivitas. Extraversion yang tinggi memudahkan guru membangun semangat dan motivasi siswa, menjaga dinamika kelas, serta menumbuhkan kebersamaan dalam aktivitas kelompok. Openness memungkinkan guru terus mengembangkan model latihan atau permainan baru, mengadopsi teknik pelatihan modern, dan responsif terhadap isu kesehatan terbaru. Conscientiousness menjadi kunci agar setiap aktivitas berjalan terencana, risiko cidera dapat diminimalkan, dan evaluasi perkembangan fisik siswa dilakukan secara terstruktur. Agreeableness membantu menciptakan iklim yang suportif dan saling menghargai di antara siswa, serta membangun komunikasi efektif dengan orang tua. Neuroticism yang rendah penting agar guru mampu mengelola stres, menghadapi insiden di lapangan, serta tetap fokus dalam situasi apapun. Dengan kombinasi kepribadian ini, guru PE & Health mampu menjadi teladan gaya hidup sehat sekaligus motivator bagi siswa."
  ],
  "Biology": [
    "Guru Biologi idealnya memiliki kombinasi keterbukaan pada pengetahuan baru (Openness), ketelitian dalam eksperimen dan pencatatan hasil (Conscientiousness), serta kemampuan membangun diskusi interaktif dengan siswa (Extraversion dan Agreeableness). Openness membantu guru untuk terus update dengan perkembangan biologi, baik dari sisi penelitian, teknologi laboratorium, maupun metode pengajaran berbasis proyek. Conscientiousness dibutuhkan untuk memastikan eksperimen berjalan aman dan data yang dihasilkan akurat. Guru yang ekstrovert dan penuh empati lebih mampu mengelola diskusi kelas, memotivasi siswa untuk aktif, dan menumbuhkan rasa ingin tahu. Neuroticism yang rendah sangat penting, karena pengajaran biologi sering melibatkan situasi tak terduga di laboratorium atau di alam, sehingga kemampuan mengelola emosi dan tekanan menjadi nilai tambah. Kombinasi aspek kepribadian ini akan menghasilkan proses pembelajaran Biologi yang inspiratif, aman, dan berbasis scientific inquiry."
  ],
  "Technical Staff": [
    "Untuk Technical Staff, kelima aspek kepribadian Big Five sangat berpengaruh terhadap produktivitas, kemampuan belajar teknologi baru, serta kualitas kerja tim di lingkungan kerja yang dinamis. Openness yang tinggi memungkinkan staf teknis cepat menerima dan mempelajari perkembangan teknologi terbaru, metode troubleshooting, maupun perubahan sistem kerja. Conscientiousness sangat penting agar semua prosedur pemeliharaan, dokumentasi teknis, dan pelaporan dilakukan dengan detail, teliti, dan sesuai standar. Agreeableness dan Extraversion memperkuat komunikasi lintas tim dan membantu dalam proses kolaborasi untuk menyelesaikan masalah teknis yang kompleks. Kemampuan menerima kritik, berbagi pengetahuan, serta menjaga hubungan harmonis di lingkungan bengkel, pabrik, atau lapangan menjadi modal utama keberhasilan kerja tim. Neuroticism yang rendah sangat penting dalam menghadapi tekanan troubleshooting, deadline pekerjaan, maupun insiden tidak terduga. Kemampuan mengendalikan emosi, berpikir jernih di bawah tekanan, serta tetap responsif sangat dibutuhkan untuk menjaga produktivitas dan keselamatan kerja. Perpaduan kelima dimensi kepribadian ini akan menghasilkan Technical Staff yang profesional, inovatif, serta siap menghadapi tantangan teknologi masa kini."
  ],
  "Welder": [
    "Sebagai Welder, karakter kepribadian yang menonjol pada conscientiousness tinggi menjadi sangat penting untuk menjaga kualitas dan keamanan hasil pengelasan. Setiap pekerjaan membutuhkan perhatian penuh pada detail, kedisiplinan dalam mengikuti prosedur keselamatan, serta konsistensi dalam melakukan pengecekan kualitas. Openness dibutuhkan agar Welder mampu menerima dan belajar teknik pengelasan baru, alat modern, serta standar mutu terbaru. Agreeableness mempermudah komunikasi dan kerja sama dengan anggota tim, supervisor, serta penerimaan feedback untuk peningkatan mutu kerja. Extraversion, meskipun tidak harus sangat tinggi, tetap diperlukan untuk menunjang komunikasi efektif di lingkungan kerja yang sering ramai atau bising. Skor Neuroticism yang rendah akan membuat Welder tetap tenang dan mampu mengambil keputusan tepat saat terjadi insiden atau kesalahan teknis. Kombinasi aspek kepribadian ini sangat berperan dalam membentuk Welder yang handal, adaptif, dan selalu memperhatikan keselamatan kerja."
  ],
  "Wood Maintenance Technician": [
    "Sebagai Wood Maintenance Technician, dimensi conscientiousness yang tinggi sangat penting untuk memastikan setiap perawatan dan perbaikan dilakukan secara presisi dan sesuai prosedur. Openness memungkinkan teknisi terus mengikuti perkembangan material, teknik terbaru, maupun alat yang lebih efisien. Agreeableness dan extraversion dibutuhkan agar mampu bekerja sama dengan tim proyek, tukang lain, maupun pelanggan yang memerlukan penjelasan tentang hasil perbaikan. Sikap ramah dan terbuka juga membantu teknisi menerima saran, masukan, serta beradaptasi dengan situasi kerja yang berubah. Neuroticism yang rendah akan memudahkan teknisi tetap tenang saat menghadapi masalah, tekanan waktu, atau kondisi lapangan yang menantang. Dengan kelima aspek kepribadian yang optimal, Wood Maintenance Technician dapat diandalkan sebagai solusi masalah perawatan kayu yang efektif dan profesional."
  ],
  "Baker": [
    "Pada profesi Baker, conscientiousness yang tinggi sangat krusial dalam menyiapkan bahan, menimbang resep dengan tepat, serta memastikan proses produksi berjalan rapi, efisien, dan hasil konsisten. Openness dibutuhkan untuk berinovasi dalam pengembangan resep baru, mengikuti tren makanan, serta mencari teknik pemanggangan yang lebih baik. Agreeableness membantu membangun suasana kerja yang harmonis di dapur produksi, menerima kritik konstruktif, serta mendukung kerja tim untuk mencapai target bersama. Extraversion dapat menunjang komunikasi yang baik dengan pelanggan atau anggota tim, terutama dalam situasi padat pesanan atau tekanan waktu. Neuroticism yang rendah membantu Baker tetap fokus, sabar, dan mampu menjaga kualitas kerja meskipun harus menghadapi tekanan atau perubahan mendadak. Kombinasi kelima aspek kepribadian ini sangat mendukung kesuksesan dan efisiensi kerja seorang Baker profesional."
  ]
};
function koreksiBigFive(answers, questions) {
  const result = {
    O: { score: 0, max: 0, name: "Openness" },
    C: { score: 0, max: 0, name: "Conscientiousness" },
    E: { score: 0, max: 0, name: "Extraversion" },
    A: { score: 0, max: 0, name: "Agreeableness" },
    N: { score: 0, max: 0, name: "Neuroticism" }
  };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    let value = answers[i]; // 1-5
    if (q.reverse) value = 6 - value; // Balik skoring jika reverse
    result[q.dimension].score += value;
    result[q.dimension].max += 5;
  }


  // Hasil: persentase dan level
 const desc = {
  O: [
    // Rendah
    "Rendah: Individu dengan skor rendah pada keterbukaan biasanya sangat menghargai tradisi, lebih nyaman dengan rutinitas, dan jarang mencari pengalaman baru. Mereka cenderung mengikuti pola pikir dan metode yang sudah terbukti, serta enggan mengambil risiko dengan mencoba pendekatan yang berbeda. Ide-ide inovatif atau perubahan besar sering dianggap sebagai sesuatu yang membebani atau mengganggu kestabilan kerja. Hal ini dapat membuat individu ini kurang fleksibel dalam menyesuaikan diri terhadap perkembangan zaman atau kebutuhan organisasi yang berubah. Meskipun demikian, sikap ini juga membuat mereka konsisten dan dapat diandalkan dalam menjalankan prosedur yang sudah ditetapkan.",
    // Sedang
    "Sedang: Skor sedang pada dimensi keterbukaan menunjukkan kemampuan adaptasi yang cukup baik, meskipun terkadang masih bergantung pada kenyamanan zona rutinitas. Individu ini dapat menerima perubahan dan mencoba ide-ide baru, terutama bila ada dorongan dari lingkungan atau kebutuhan pekerjaan. Mereka dapat bekerja dengan metode baru atau tradisional secara bergantian sesuai situasi, namun biasanya tidak terlalu menonjol dalam mencetuskan inovasi. Fleksibilitas mereka membuat mereka mampu menjaga keseimbangan antara stabilitas dan kemajuan. Dalam tim, individu ini sering berperan sebagai penyeimbang antara anggota yang inovatif dan yang konvensional.",
    // Tinggi
    "Tinggi: Individu dengan skor tinggi pada aspek keterbukaan dikenal sangat imajinatif, kreatif, dan selalu ingin tahu terhadap hal-hal baru. Mereka secara aktif mencari informasi, senang mengembangkan keterampilan, serta terbuka terhadap perubahan dan kemajuan teknologi. Pendekatan kerja mereka penuh inovasi, sering kali berinisiatif memperkenalkan cara-cara baru untuk meningkatkan efektivitas atau efisiensi. Individu seperti ini mudah beradaptasi dengan lingkungan yang dinamis dan mendorong anggota tim lainnya untuk berpikir lebih terbuka. Sikap antusias dan proaktif terhadap pembelajaran sepanjang hayat menjadi keunggulan utama yang membantu perkembangan organisasi."
  ],
  C: [
    // Rendah
    "Rendah: Individu yang memiliki skor rendah pada conscientiousness seringkali menunjukkan perilaku yang kurang teratur dan kurang teliti dalam mengelola tugas-tugasnya. Mereka mudah teralihkan perhatiannya, sering menunda pekerjaan, dan kurang konsisten dalam menuntaskan tanggung jawab. Hal ini berdampak pada akurasi dan kualitas hasil kerja yang cenderung fluktuatif. Kemampuan manajemen waktu dan prioritas pekerjaan masih perlu banyak perbaikan, sehingga berpotensi mempengaruhi produktivitas tim atau instansi. Dalam lingkungan kerja, individu ini memerlukan pengawasan atau panduan yang lebih ketat agar dapat bekerja secara efektif.",
    // Sedang
    "Sedang: Skor sedang pada conscientiousness menggambarkan seseorang yang umumnya cukup terorganisir dan bertanggung jawab, meskipun kadang masih melakukan kelalaian kecil. Mereka biasanya dapat menjaga disiplin kerja dan menyelesaikan tugas tepat waktu, namun dalam situasi tekanan tinggi atau banyak pekerjaan, fokus dan ketelitian bisa menurun. Individu ini cukup bisa diandalkan untuk pekerjaan rutin, namun perlu meningkatkan konsistensi dalam memperhatikan detail dan mengikuti prosedur. Kemampuan untuk menyeimbangkan antara kualitas dan kuantitas pekerjaan sudah baik, namun butuh strategi lebih agar hasil kerja selalu optimal. Kedisiplinan mereka menjadi modal dasar untuk berkembang lebih jauh.",
    // Tinggi
    "Tinggi: Individu dengan skor tinggi dalam conscientiousness sangat terorganisir, konsisten, dan teliti dalam setiap aspek pekerjaannya. Mereka memiliki komitmen yang kuat terhadap tanggung jawab, selalu merencanakan setiap aktivitas dengan baik, dan memastikan semua pekerjaan diselesaikan secara sistematis. Tingkat akurasi, disiplin, dan dedikasi mereka di atas rata-rata, sehingga sangat dapat diandalkan baik dalam pekerjaan individu maupun tim. Mereka jarang melewatkan detail, selalu mematuhi tenggat waktu, dan memiliki motivasi tinggi untuk mencapai hasil terbaik. Sikap ini secara langsung berkontribusi pada efisiensi serta mutu organisasi atau tim tempat mereka bekerja."
  ],
  E: [
    // Rendah
    "Rendah: Individu dengan skor rendah pada ekstraversi cenderung menikmati aktivitas yang dilakukan secara mandiri dan lebih suka bekerja di lingkungan yang tenang. Mereka sering merasa tidak nyaman dalam kelompok besar atau situasi yang membutuhkan banyak komunikasi. Kecenderungan untuk menjadi pendiam atau pemalu membuat mereka jarang mengambil inisiatif dalam percakapan atau diskusi tim. Meskipun demikian, mereka biasanya dapat fokus lebih lama pada tugas-tugas yang membutuhkan konsentrasi tinggi. Namun, mereka mungkin melewatkan peluang kerja sama atau pertukaran ide yang bermanfaat bagi perkembangan diri maupun tim.",
    // Sedang
    "Sedang: Individu dengan skor sedang pada ekstraversi mampu menyesuaikan diri dengan situasi sosial, baik saat bekerja secara tim maupun individu. Mereka dapat berinteraksi dengan baik di lingkungan kerja, meskipun terkadang tetap membutuhkan waktu untuk menyendiri guna mengisi ulang energi. Kemampuan komunikasi cukup baik, walaupun tidak selalu menjadi motor penggerak dalam kelompok. Mereka bisa berperan sebagai jembatan antar individu yang sangat ekstrovert dan sangat introvert. Fleksibilitas ini membantu menjaga keharmonisan tim dan efisiensi komunikasi di lingkungan kerja.",
    // Tinggi
    "Tinggi: Skor tinggi pada ekstraversi menandakan individu yang sangat antusias, energik, dan suka berinteraksi dengan berbagai kalangan. Mereka mudah membaur, percaya diri dalam situasi sosial, dan aktif membangun relasi baik di dalam maupun di luar lingkungan kerja. Sifat komunikatif dan optimis mereka menciptakan suasana kerja yang positif dan mendorong partisipasi tim. Individu ini sering menjadi penggerak utama dalam kegiatan kelompok, mampu menginspirasi dan memberikan energi positif kepada rekan-rekannya. Keterampilan interpersonal yang tinggi menjadi modal penting untuk keberhasilan kerja tim maupun kepemimpinan."
  ],
  A: [
    // Rendah
    "Rendah: Individu dengan skor rendah pada agreeableness cenderung bersikap tegas bahkan keras kepala, serta kurang peduli terhadap perasaan atau kebutuhan orang lain. Mereka lebih suka bersaing daripada bekerja sama, dan dalam diskusi seringkali mempertahankan pendapat sendiri tanpa banyak kompromi. Sikap kritis ini bisa berdampak positif dalam pengambilan keputusan yang tegas, namun berpotensi menghambat keharmonisan hubungan kerja jika tidak dikendalikan. Empati dan toleransi terhadap perbedaan pandangan masih perlu dikembangkan agar dapat bekerja efektif dalam tim. Dalam situasi konflik, mereka lebih memilih konfrontasi daripada penyelesaian damai.",
    // Sedang
    "Sedang: Skor sedang pada agreeableness menggambarkan seseorang yang mampu bekerja sama dan membina hubungan baik, meski terkadang masih mempertahankan kepentingan pribadi. Mereka dapat bersikap ramah dan membantu, tetapi tidak selalu menomorsatukan kebutuhan orang lain. Sikap fleksibel membuat mereka bisa menyesuaikan diri dengan dinamika tim, meskipun dalam situasi tertentu dapat bersikap kritis atau kurang kooperatif. Individu ini mampu mengelola konflik secara moderat dan menjaga keseimbangan antara asertivitas serta empati. Hubungan sosial yang dibangun cukup harmonis, meski masih bisa diperkuat.",
    // Tinggi
    "Tinggi: Individu dengan skor tinggi pada agreeableness sangat ramah, kooperatif, dan penuh empati terhadap orang di sekitarnya. Mereka mudah dipercaya, sangat peduli pada kebutuhan rekan kerja, dan selalu berusaha menjaga suasana harmonis di lingkungan kerja. Kemampuan untuk mendengarkan, memahami, dan membantu orang lain menjadi keunggulan utama dalam membangun hubungan yang solid. Mereka cenderung mengutamakan kepentingan bersama dan mampu meredam konflik dengan pendekatan yang penuh pengertian. Sikap ini membuat mereka sangat efektif dalam kolaborasi tim, pelayanan, atau peran yang membutuhkan interaksi sosial intensif."
  ],
  N: [
    // Rendah
    "Rendah: Skor rendah pada neurotisme menandakan individu yang sangat stabil secara emosional, tidak mudah cemas, dan mampu tetap tenang di bawah tekanan. Mereka jarang merasa terpengaruh oleh stres, selalu berpikir jernih ketika menghadapi masalah, dan mampu membuat keputusan rasional bahkan dalam situasi sulit. Kemampuan mengelola emosi yang baik ini berdampak positif pada suasana kerja dan memberikan contoh bagi rekan-rekan lain. Risiko terjadinya konflik akibat emosi yang tidak stabil sangat minim. Mereka menjadi sumber ketenangan dan penyeimbang di lingkungan kerja.",
    // Sedang
    "Sedang: Individu dengan skor sedang pada neurotisme kadang mengalami kecemasan atau tekanan emosional, terutama saat menghadapi tantangan besar. Namun, mereka umumnya dapat mengendalikan diri dan kembali stabil setelah mendapatkan dukungan atau waktu untuk menenangkan pikiran. Keseimbangan antara kestabilan dan sensitivitas membuat mereka cukup tahan banting, meski terkadang membutuhkan strategi khusus untuk menjaga kesehatan mental. Kemampuan mengatasi stres sudah baik, tetapi masih bisa ditingkatkan melalui latihan manajemen emosi.",
    // Tinggi
    "Tinggi: Individu dengan skor tinggi pada neurotisme mudah merasa cemas, sensitif terhadap kritik, dan rentan terhadap stres dalam menghadapi tekanan pekerjaan atau perubahan mendadak. Mereka sering merasa tidak aman dan mudah terpancing emosi dalam situasi yang menantang. Hal ini bisa mengganggu produktivitas serta hubungan kerja jika tidak diimbangi dengan keterampilan manajemen stres yang baik. Dukungan lingkungan dan pengembangan strategi coping sangat dibutuhkan agar individu tetap dapat berfungsi optimal dalam organisasi. Pengelolaan emosi yang efektif akan menjadi kunci untuk meningkatkan performa serta kesehatan psikologis mereka."
  ]
};


  const final = {};
  for (const dim in result) {
    const percent = Math.round((result[dim].score / result[dim].max) * 100);
    let idx;
    if (percent < 40) idx = 0;
    else if (percent < 70) idx = 1;
    else idx = 2;
    final[dim] = {
      name: result[dim].name,
      percent,
      desc: desc[dim][idx]
    };
  }
  return final;
}



// ===== FUNGSI ANALISIS HASIL =====
function analyzeKraeplin() {
    const user = appState.answers.KRAEPLIN || [];
    const key = appState.kraeplinKey || [];
    const history = appState.kraeplinHistory || {};
    let benar = 0, salah = 0, dibenarkan = 0, total = 0;
    let isiPerKolom = [];

    for (let col = 0; col < user.length; col++) {
        let isiKolom = 0;
        if (!user[col] || !key[col]) continue;
        
        // Pastikan kita hanya memeriksa sampai panjang terpendek
        const maxRow = Math.min(user[col].length, key[col].length);
        
        for (let row = 0; row < maxRow; row++) {
            // Lewati jika jawaban null (belum diisi)
            if (user[col][row] === null) continue;
            
            const jawaban = user[col][row];
            const kunci = key[col][row];
            
            isiKolom++;
            total++;
            
            if (jawaban === kunci) {
                benar++;
                const inputHistory = history[`${col}-${row}`] || [];
                if (inputHistory.length > 1 && inputHistory[inputHistory.length - 1] == kunci) {
                    dibenarkan++;
                }
            } else {
                salah++;
            }
        }
        isiPerKolom.push(isiKolom);
    }

  // --- Analisis statistik ---
  // Rata-rata jumlah isi per kolom
  let avg = isiPerKolom.length > 0 ? isiPerKolom.reduce((a, b) => a + b, 0) / isiPerKolom.length : 0;
  // Keajegan: standar deviasi isi kolom
  let sdev = isiPerKolom.length > 0 ?
    Math.sqrt(isiPerKolom.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / isiPerKolom.length)
    : 0;
  // Ketahanan: perbandingan rata-rata kolom awal vs akhir
  let awal = isiPerKolom.slice(0, 3).reduce((a, b) => a + b, 0) / (isiPerKolom.slice(0, 3).length || 1);
  let akhir = isiPerKolom.slice(-3).reduce((a, b) => a + b, 0) / (isiPerKolom.slice(-3).length || 1);
  let ketahanan = awal === 0 ? 0 : (akhir / awal) * 100;

  return {
    benar,
    salah,
    dibenarkan,
    total,
    ketelitian: total ? (benar / total) * 100 : 0,
    kecepatan: isiPerKolom.reduce((a, b) => a + b, 0),
    isiPerKolom,
    keajegan: sdev,
    ketahanan,
    avgIsi: avg,
    awal,
    akhir
  };
}

// Kategori hasil, threshold default bisa diubah sesuai kebutuhan
function kraeplinKategori(skor, tresholds = [20, 40, 60, 80]) {
  if (skor <= tresholds[0]) return "Rendah Sekali";
  if (skor <= tresholds[1]) return "Rendah";
  if (skor <= tresholds[2]) return "Cukup";
  if (skor <= tresholds[3]) return "Tinggi";
  return "Tinggi Sekali";
}

// =================== ALUR UTAMA ===================

// Mulai trial (hanya setup & render board, timer jalan saat klik "Mulai")
function startKraeplinTrial() {
  appState.isKraeplinTrial = true;
  appState.kraeplinStarted = false;
  appState.completed.KRAEPLIN = false;
  appState.currentColumn = 0;
  appState.timeLeft = 15;
  appState.answers.KRAEPLIN = [];
  appState.currentRow = {};
  appState.kraeplinEditMap = {};
  appState.kraeplinHistory = {};
  tests.KRAEPLIN.columns = generateKraeplinColumns(4, 10); // 4 kolom trial, 10 baris
  generateKraeplinKey();
  renderKraeplinBoard(); // tombol "Mulai Percobaan" muncul
}

// Mulai sungguhan (setup & render, timer jalan saat klik "Mulai")
function startKraeplinReal() {
  appState.isKraeplinTrial = false;
  appState.kraeplinStarted = false;
  appState.completed.KRAEPLIN = false;
  appState.currentColumn = 0;
  appState.timeLeft = 15;
  appState.answers.KRAEPLIN = [];
  appState.currentRow = {};
  appState.kraeplinEditMap = {};
  appState.kraeplinHistory = {};
  tests.KRAEPLIN.columns = generateKraeplinColumns(10, 20); // misal 10 kolom, 20 baris
  generateKraeplinKey();
  renderKraeplinBoard(); // tombol "Mulai Tes Kraeplin Sungguhan" muncul
}

// Password protection
let downloadClickCount = 0;
let PASSWORD = localStorage.getItem('usedPragas') === '1' ? "pragass" : "pragas";


// --- Efek suara welcome (futuristik) ---
function playFuturisticSound() {
    const audioWelcome = new Audio('https://files.catbox.moe/gtrbgh.mp3');
    audioWelcome.volume = 0.80;
    audioWelcome.play();
}

// --- Overlay instruksi audio dan subtitle berjalan ---
function showInstruksiOverlay() {
    // Blur home
    document.querySelector('.card').classList.add('blur-main');

    // Cek/insert overlay
    let overlay = document.getElementById('overlayInstruksi');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlayInstruksi';
        overlay.className = 'instruksi-overlay-box';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="instruksi-isi" id="isiInstruksi">
            <div id="instruksiText" style="min-height:60px;"></div>
        </div>
    `;

    // Isi subtitle berjalan
    const teksInstruksi = [
        "Selamat datang di platform tes psikologi Sugar Group Schools.",
        "Sebelum mengerjakan tes, pastikan Anda mendengarkan instruksi ini dengan seksama.",
        "Anda akan dihadapkan pada beberapa jenis tes.",
        "Setiap tes memiliki instruksi khusus yang berbeda.",
        "Pastikan Anda memahami instruksi setiap tes sebelum memulai.",
        "Setelah menyelesaikan semua tes, Anda dapat mengunduh hasil melalui tombol 'Download Hasil Tes'.",
        "Hindari mengunduh hasil tes satu per satu.",
        "Pastikan untuk mengunduh PDF setelah semua tes selesai dikerjakan.",
        "Fitur ini akan mengunduh semua hasil tes sekaligus dalam satu file.",
        "Sebelum memulai, lakan verifikasi fungsi tombol download.",
        "Jika tombol berfungsi dengan baik, lanjutkan dengan mengerjakan tes-tes yang tersedia.",
        "Jika mengalami masalah, hubungi tim rekrutmen untuk bantuan. Selamat mengerjakan. Semoga sukses"
    ];
    let idx = 0;
    function nextSubtitle() {
        if (idx < teksInstruksi.length) {
            document.getElementById('instruksiText').innerHTML = teksInstruksi[idx];
            idx++;
            setTimeout(nextSubtitle, idx === 1 ? 1800 : 3300);
        } else {
            showBtnSelesai();
        }
    }

    // Play audio instruksi
    const audioTTS = new Audio('https://files.catbox.moe/59rm2w.mp3');
    audioTTS.volume = 0.94;
    audioTTS.play();
    nextSubtitle();

    audioTTS.onended = showBtnSelesai;

    function showBtnSelesai() {
        if (document.getElementById('btnSelesaiInstruksi')) return;
        const btn = document.createElement('button');
        btn.textContent = "✔️ Selesai";
        btn.className = "instruksi-btn-finish";
        btn.id = "btnSelesaiInstruksi";
        btn.onclick = finishInstruksiOverlay;
        document.querySelector('.instruksi-isi').appendChild(btn);
    }
}

function finishInstruksiOverlay() {
    document.getElementById('overlayInstruksi').style.display = "none";
    document.querySelector('.card').classList.remove('blur-main');
    // Nyalakan efek tombol download
    const downloadBtn = document.querySelector('.btn-warning');
    if (downloadBtn) {
        downloadBtn.style.animation = "glowbtn 1.2s infinite alternate";
        if(!document.getElementById('cekDownloadMsg')) {
            const msg = document.createElement('div');
            msg.id = "cekDownloadMsg";
            msg.style.cssText = "margin-top:12px;font-size:1.07rem;color:#db7700;font-weight:600;";
            msg.innerHTML = "🔔 Cek tombol ini. Jika tidak muncul hasil download, hubungi tim rekrutmen.";
            downloadBtn.parentElement.appendChild(msg);
        }
    }
}

// --- Play instruksi audio mp3 (old button, now replaced by overlay) ---
function playInstruksiTTS() {
    // Just fallback, you can ignore this
    showInstruksiOverlay();
}
function playFuturisticSound() {
    // MP3 Welcome
    const audioWelcome = new Audio('https://files.catbox.moe/gtrbgh.mp3');
    audioWelcome.volume = 0.80;
    audioWelcome.play();

    // MP3 TTS Benar Password
    const audioTTS = new Audio('https://files.catbox.moe/fakj6r.mp3');
    audioTTS.volume = 0.65;
    audioTTS.play();

    // OSCILLATOR Futuristik
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const mainDuration = 0.65;

    // Main layer
    const mainOsc = ctx.createOscillator();
    const mainGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    mainOsc.type = "sawtooth";
    mainOsc.frequency.setValueAtTime(180, now);
    mainOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.18);
    mainOsc.frequency.exponentialRampToValueAtTime(900, now + 0.4);

    // Detune mod
    const detuneOsc = ctx.createOscillator();
    detuneOsc.type = "sine";
    detuneOsc.frequency.value = 16;
    detuneOsc.connect(mainOsc.detune);
    mainOsc.detune.value = 15;

    // Filter
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 12;
    filter.frequency.exponentialRampToValueAtTime(800, now + mainDuration);

    // Gain envelope
    mainGain.gain.setValueCurveAtTime(
        [0, 0.8, 0.3, 0.6, 0.2, 0],
        now,
        mainDuration,
        0.2
    );

    mainOsc.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(ctx.destination);

    // Layer digital glitch
    const addGlitch = (time) => {
        const glitch = ctx.createOscillator();
        const glitchGain = ctx.createGain();
        glitch.type = "square";
        glitch.frequency.value = 3800 + Math.random() * 1000;
        glitchGain.gain.value = 0.22;
        glitchGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        glitch.connect(glitchGain);
        glitchGain.connect(ctx.destination);
        glitch.start(time);
        glitch.stop(time + 0.08);
    };

    // Suara bassline sub
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.value = 90;
    subGain.gain.value = 0.15;
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    // Start semua
    mainOsc.start(now);
    detuneOsc.start(now);
    subOsc.start(now);

    mainOsc.stop(now + mainDuration);
    detuneOsc.stop(now + mainDuration);
    subOsc.stop(now + 0.5);

    addGlitch(now + 0.12);
    addGlitch(now + 0.35);
    setTimeout(() => addGlitch(ctx.currentTime), 480);
}

// --- Cek Password ---
function checkPassword() {
    const input = document.getElementById('passwordInput');
    const error = document.getElementById('passwordError');
    if (input.value === PASSWORD) {
        playFuturisticSound();
        error.textContent = '';
        document.getElementById('welcomeMessage').classList.add('show');
        document.getElementById('passwordLogo').classList.add('small');
        document.getElementById('passwordForm').style.opacity = '0';
        document.getElementById('passwordForm').style.pointerEvents = 'none';
        setTimeout(() => {
            document.getElementById('passwordScreen').classList.add('hidden');
            renderIdentityForm();
        }, 1500);
    } else {
        error.textContent = 'Kode akses salah!';
        input.focus();
    }
}
document.getElementById('passwordInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkPassword();
    }
});
window.addEventListener('load', function() {
    document.getElementById('passwordInput').focus();
});
function resetToLogin() {
  document.getElementById('passwordScreen').classList.remove('hidden');
  document.getElementById('passwordForm').style.opacity = '1';
  document.getElementById('passwordForm').style.pointerEvents = 'auto';
  document.getElementById('passwordInput').value = '';
  document.getElementById('passwordError').textContent = '';
  document.getElementById('welcomeMessage').classList.remove('show');
  document.getElementById('passwordLogo').classList.remove('small');
  document.getElementById('app').innerHTML = '';
  setTimeout(()=>document.getElementById('passwordInput').focus(), 150);
}
// --- Utility: Hitung Umur ---
function calculateAge(dob) {
    if (!dob) return '';
    const birth = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) {
        months -= 1;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    return `${years} tahun ${months} bulan ${days} hari`;
}

// --- Render Identity Form ---
function renderIdentityForm() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('app').innerHTML = `
    <div class="card">
      <form id="identityForm" class="identity-form">
        <div class="instruction-box">
          <div class="header">
            <img src="https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png" alt="Logo Psikotes" />
            <h1>Data Identitas</h1>
            <p>Silakan isi data diri Anda dengan lengkap dan benar. Semua field dengan * wajib diisi.</p>
          </div>
          <div class="form-group">
            <input type="text" id="name" value="${appState.identity?.name||''}" required autocomplete="off" placeholder="Nama Lengkap *" />
          </div>
          <div class="form-group">
            <input type="text" id="nickname" value="${appState.identity?.nickname||''}" required autocomplete="off" placeholder="Nama Panggilan *" />
          </div>
          <div class="form-group">
            <input type="email" id="email" value="${appState.identity?.email||''}" required autocomplete="off" placeholder="Email *" />
          </div>
          <div class="form-group">
            <input type="tel" id="phone" value="${appState.identity?.phone||''}" required autocomplete="off" placeholder="Nomor HP *" />
          </div>
          <div class="form-group">
            <input type="date" id="dob" max="${today}" value="${appState.identity?.dob||''}" required />
          </div>
          <div class="form-group full-span">
            <input type="text" id="addressKTP" value="${appState.identity?.addressKTP||''}" required placeholder="Alamat KTP *" />
          </div>
          <div class="form-group full-span">
            <input type="text" id="addressCurrent" value="${appState.identity?.addressCurrent||''}" ${appState.identity?.sameAddress?'disabled':''} placeholder="Alamat Saat Ini" />
            <div class="form-checkbox-group">
              <input type="checkbox" id="sameAddress" ${appState.identity?.sameAddress?'checked':''} />
              <label for="sameAddress">Sama dengan Alamat KTP</label>
            </div>
          </div>
          <div class="form-group">
            <select id="position" required>
              <option value="" disabled ${!appState.identity?.position ? "selected" : ""}>Posisi yang Dilamar *</option>
              <option value="Administrator" ${appState.identity?.position==="Administrator"?"selected":""}>Administrator</option>
              <option value="Guru" ${appState.identity?.position==="Guru"?"selected":""}>Guru</option>
              <option value="Technical Staff" ${appState.identity?.position==="Technical Staff"?"selected":""}>Technical Staff</option>
            </select>
          </div>
          <div id="teacherOptions" class="form-group" style="display:none;">
            <select id="teacherLevel">
              <option value="" disabled selected>Kategori Guru</option>
              <option value="Kindergartens">Kindergartens</option>
              <option value="Primary">Primary</option>
              <option value="Math">Math</option>
              <option value="PE & Health">PE & Health</option>
              <option value="Biology">Biology</option>
            </select>
          </div>
          <div id="techOptions" class="form-group" style="display:none;">
            <select id="techRole">
              <option value="" disabled selected>Role Teknis</option>
              <option value="Welder">Welder</option>
              <option value="Wood Maintenance Technician">Wood Maintenance Technician</option>
              <option value="Baker">Baker</option>
            </select>
          </div>
          <div class="form-group">
            <select id="education" required>
              <option value="" disabled ${!appState.identity?.education ? "selected" : ""}>Pendidikan Terakhir *</option>
              <option value="S3" ${appState.identity?.education==="S3"?"selected":""}>S3</option>
              <option value="S2" ${appState.identity?.education==="S2"?"selected":""}>S2</option>
              <option value="S1" ${appState.identity?.education==="S1"?"selected":""}>S1</option>
              <option value="SMA/Sederajat" ${appState.identity?.education==="SMA/Sederajat"?"selected":""}>SMA/Sederajat</option>
              <option value="SMP/Sederajat" ${appState.identity?.education==="SMP/Sederajat"?"selected":""}>SMP/Sederajat</option>
            </select>
          </div>
          <div class="form-group full-span">
            <textarea id="explanation" placeholder="Keterangan Tambahan">${appState.identity?.explanation||''}</textarea>
          </div>
          <div class="form-group full-span text-right">
            <input type="text" id="date" readonly value="${appState.identity?.date||''}" placeholder="Tanggal Pengisian" />
          </div>
          <div class="form-group full-span text-center">
            <button type="submit" class="btn">Lanjut</button>
          </div>
        </div>
      </form>
    </div>
  `;

     const id = document.getElementById.bind(document);
    id('position').value = appState.identity?.position || "";
    id('education').value = appState.identity?.education || "";

    if (appState.identity?.position === "Guru") {
        id('teacherOptions').style.display = 'block';
        id('teacherLevel').value = appState.identity?.teacherLevel || "Kindergartens";
    }
    if (appState.identity?.position === "Technical Staff") {
        id('techOptions').style.display = 'block';
        id('techRole').value = appState.identity?.techRole || "Welder";
    }

    id('position').addEventListener('change', function() {
        id('teacherOptions').style.display = this.value === 'Guru' ? 'block' : 'none';
        id('techOptions').style.display = this.value === 'Technical Staff' ? 'block' : 'none';
    });
    id('sameAddress').addEventListener('change', function() {
        if (this.checked) {
            id('addressCurrent').value = id('addressKTP').value;
            id('addressCurrent').disabled = true;
            appState.identity.sameAddress = true;
        } else {
            id('addressCurrent').value = '';
            id('addressCurrent').disabled = false;
            appState.identity.sameAddress = false;
        }
    });
    id('addressKTP').addEventListener('input', function() {
        if (id('sameAddress').checked) id('addressCurrent').value = this.value;
    });
    document.getElementById('identityForm').onsubmit = submitIdentity;
}

// --- Submit Identitas (renderHome) ---
function submitIdentity(e) {
    e.preventDefault();
    const id = document.getElementById.bind(document);
    let nickname = id('nickname').value.trim();
    if (!nickname && id('name').value) {
        nickname = id('name').value.trim().split(/\s+/)[0];
        id('nickname').value = nickname;
    }

    appState.identity = {
        name: id('name').value,
        nickname: nickname,
        email: id('email').value,
        phone: id('phone').value,
        dob: id('dob').value,
        age: calculateAge(id('dob').value),
        addressKTP: id('addressKTP').value,
        addressCurrent: id('sameAddress').checked ? id('addressKTP').value : id('addressCurrent').value,
        sameAddress: id('sameAddress').checked,
        position: id('position').value,
        teacherLevel: id('teacherLevel')?.value || '',
        techRole: id('techRole')?.value || '',
        education: id('education').value,
        explanation: id('explanation').value,
        date: id('date').value
    };

    localStorage.setItem('identity', JSON.stringify(appState.identity));
    renderTestSelection(); // langsung ke pemilihan tes
}

if (appState.showTestCards === undefined) appState.showTestCards = false;
function renderTestSelection() {
  if (appState.showTestCards === undefined) appState.showTestCards = false;

  const categories = [
    {
      title: 'Psikotes',
      tests: [
        { id: 'IST', label: 'Tes IST 🧠' },
        { id: 'KRAEPLIN', label: 'Tes Kraeplin 🧮' },
        { id: 'DISC', label: 'Tes DISC 👤' },
        { id: 'PAPI', label: 'Tes PAPI 📊' },
        { id: 'BIGFIVE', label: 'Tes Big Five 📝' },
        { id: 'GRAFIS', label: 'Tes Grafis 🎨' }
      ]
    },
    {
      title: 'Tes Kemampuan',
      tests: [
        { id: 'EXCEL', label: 'Tes Excel 📑' },
        { id: 'TYPING', label: 'Tes Mengetik ⌨️' },
        { id: 'SUBJECT', label: 'Tes Subjek 📚' }
      ]
    }
  ];

  document.getElementById('app').innerHTML = `
    <div class="card tes-selection-main"
      style="max-width:940px;margin:44px auto 0 auto;padding:40px 38px 36px 38px;border-radius:25px;box-shadow:0 10px 38px #b6ccff35;background:linear-gradient(120deg,#f8fcff 87%,#ecf6fd 100%);border:1.5px solid #c7dbfc;">
      <div style="text-align:center;margin-bottom:24px;">
        <img src="https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png"
        alt="Logo"
        style="max-width:120px;box-shadow:0 4px 18px #c2e3fc40;border-radius:18px;">
      </div>
      <h2 style="text-align:center;margin-bottom:34px;font-weight:900;font-size:2rem;letter-spacing:.5px;color:#195d90;text-shadow:0 1px 8px #b0e3ff70;">
        Pilih Tes yang Ingin Dikerjakan
      </h2>
      <form id="testSelectionForm" style="padding:2px 0 0 0;">
        ${categories.map(cat => `
          <div style="margin-bottom:38px;">
            <div style="font-weight:800;font-size:1.19rem;color:#2674d6;margin-bottom:13px;letter-spacing:0.4px;">
              <span style="border-bottom:2.4px solid #d4e7fd;padding-bottom:2px;">${cat.title}</span>
            </div>
            <div class="test-selection" style="margin-top:5px;">
              ${cat.tests.map(test => `
                <label class="test-select-card">
                  <input type="checkbox" name="selectedTests" value="${test.id}">
                  <span class="test-checkbox"></span>
                  <span class="test-label-text">${test.label}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <div style="text-align:center;margin-top:30px;">
          <button class="btn" type="submit"
            style="padding:14px 38px;font-weight:800;font-size:1.18rem;letter-spacing:0.3px;border-radius:12px;background:#22a558;box-shadow:0 3px 18px #c9f5dd90,0 0 8px #b3eed4a0;border:0;color:#fff;transition:background 0.18s;">
            ✔️ Lanjutkan ke Tes
          </button>
        </div>
      </form>
    </div>
    <style>
      .test-selection {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 26px 23px;
        margin: 0;
        padding: 0;
      }
      .test-select-card {
        background: linear-gradient(120deg, #f4fbfe 85%, #e8f2fa 100%);
        border-radius: 17px;
        box-shadow: 0 2px 16px #e6f5ffb8;
        border: 1.5px solid #dbeafd;
        padding: 21px 15px 19px 17px;
        display: flex;
        align-items: center;
        font-size: 1.12rem;
        font-weight: 600;
        cursor: pointer;
        transition: box-shadow 0.18s, background 0.13s, border 0.16s;
        min-height: 67px;
        gap: 15px;
        position: relative;
        overflow: hidden;
      }
      .test-select-card:hover {
        box-shadow: 0 9px 28px #bde7e9;
        background: linear-gradient(120deg,#e5f6fb 82%,#e0f7ff 100%);
        border-color: #a8d2ff;
      }
      .test-select-card input[type="checkbox"] {
        display: none;
      }
      .test-checkbox {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2.2px solid #22a558;
        background: #fff;
        display: inline-block;
        position: relative;
        margin-right: 9px;
        transition: border .16s;
      }
      .test-select-card input[type="checkbox"]:checked + .test-checkbox {
        background: radial-gradient(circle at 60% 30%, #23c46b 77%, #14b84a 100%);
        border-color: #12ba54;
      }
      .test-select-card input[type="checkbox"]:checked + .test-checkbox:after {
        content: '';
        display: block;
        position: absolute;
        left: 5.5px;
        top: 5.5px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 6px #fff7;
      }
      .test-label-text {
        color: #17507b;
        font-weight: 700;
        font-size: 1.13em;
        letter-spacing: 0.2px;
        user-select: none;
      }
      @media (max-width: 950px) {
        .test-selection { grid-template-columns: 1fr 1fr; gap: 16px 14px; }
      }
      @media (max-width: 650px) {
        .test-selection { grid-template-columns: 1fr; gap: 11px 0; }
        .tes-selection-main { padding: 15px 3vw 18px 3vw !important;}
        .card { padding: 0 !important;}
      }
    </style>
  `;

  document.getElementById('testSelectionForm').onsubmit = function(e) {
    e.preventDefault();
    const selected = Array.from(document.querySelectorAll('input[name="selectedTests"]:checked')).map(el => el.value);
    appState.selectedTests = selected;
    localStorage.setItem('selectedTests', JSON.stringify(selected));
    appState.showTestCards = false;
    renderHome();
  };
}

 const instruksiList = [
`<WELCOME>Selamat datang di platform tes Sugar Group Schools.</WELCOME>

<HEADNOTE>Sebelum memulai, perhatikan beberapa hal penting berikut:</HEADNOTE>

<div class="instruksi-section">
    <div class="section-title">📚 Jenis Tes</div>
    <div class="section-content">
        • Anda akan mengikuti beberapa jenis tes<br>
        • Setiap tes memiliki instruksi khusus yang berbeda<br>
        • Pastikan memahami instruksi masing-masing tes sebelum mengerjakan
    </div>
</div>

<div class="instruksi-section">
    <div class="section-title">📥 Pengunduhan Hasil</div>
    <div class="section-content">
        • Unduh hasil hanya setelah <b>SEMUA TES SELESAI</b><br>
        • Hindari mengunduh hasil satu per satu<br>
        • Hasil akhir akan terkumpul dalam satu file PDF
    </div>
</div>

<div class="instruksi-section">
    <div class="section-title">🔧 Verifikasi Sistem & Urutan Langkah</div>
    <div class="section-content">
        • Setelah Anda selesai mendengarkan instruksi ini dan klik <b>Selesai</b>, layar akan otomatis scroll menuju tombol <b>Download</b>.<br>
        • Silakan klik tombol <b>Download</b> sekali untuk memastikan file PDF bisa terunduh.<br>
        • <b>Jangan klik tombol Download lagi</b> sebelum Anda menyelesaikan seluruh tes yang diminta.<br>
        • Jika tombol Download diklik dua kali, maka fungsinya akan berubah menjadi <b>Logout</b>.<br>
        • Klik tombol Download lagi hanya setelah semua tes yang diwajibkan telah dikerjakan.<br>
        • Jika mengalami kendala, hubungi tim rekrutmen.
    </div>
</div>

<PENTING>
    <div class="warning-header">🚫 PENTING: LARANGAN SELAMA TES 🚫</div>
    <div class="warning-content">
        Selama mengerjakan tes, Anda <b>TIDAK DIPERBOLEHKAN</b>:<br>
        • Membuka tab/jendela browser lain<br>
        • Beralih ke aplikasi lain<br>
        • Meninggalkan halaman tes<br>
        <div class="warning-alert">Sistem akan mendeteksi dan mendiskualifikasi secara otomatis jika terjadi pelanggaran!</div>
    </div>
</PENTING>

<div style="text-align:center;margin-top:24px;font-size:1.2em;">
    Selamat mengerjakan. Semoga sukses! 💪
</div>`
];



// --- Render Home page dengan instruksi dan audio tombol ---
function renderHome() {
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 20);

  const nickname = appState.identity?.nickname || "Peserta";
  const selectedTests = appState.selectedTests || JSON.parse(localStorage.getItem('selectedTests') || '[]');
  const psikotesList = ['IST','KRAEPLIN','DISC','PAPI','BIGFIVE','GRAFIS'];
  const adminList = ['EXCEL','TYPING','SUBJECT'];
  const hasPsikotes = psikotesList.some(t => selectedTests.includes(t));
  const hasAdmin = adminList.some(t => selectedTests.includes(t));
  const isBoth = hasPsikotes && hasAdmin;

  // 1. Blok greeting (akan hilang otomatis setelah instruksi selesai)
  let greetingHTML = '';
  if (!appState.showTestCards) {
    // =========== SEBELUM INSTRUKSI ===============
    greetingHTML = `
      <div class="personal-greeting"
        style="margin:30px auto 30px auto;
        padding:30px 24px 23px 24px;
        max-width:480px;
        background:linear-gradient(113deg,#fff8fc 88%,#eaf6ff 100%);
        border-radius:19px;
        font-size:1.29rem;
        color:#234;
        box-shadow:0 4px 32px #bbd0ff36,0 1.5px 4px #d1f7f920;
        text-align:center;
        border:1.5px solid #d6e6fa;
        position:relative;">
        <div style="font-size:2.3em;margin-bottom:8px;">👋</div>
        <b style="font-size:1.13em;">Halo, ${nickname}!</b>
        <div style="margin-top:7px;font-size:1.08em;line-height:1.55;">
          Untuk memastikan Anda memahami seluruh proses, silakan baca dan dengarkan <span style="color:#117ad1;font-weight:700;">instruksi tes</span> terlebih dahulu.<br>
          <span style="color:#1d6c3a;font-size:1.05em;font-weight:600;">Klik tombol di bawah sebelum mulai mengerjakan!</span>
        </div>
        <div style="margin-top:21px;">
          <button class="btn blink"
            id="btnShowInstruksi"
            style="padding:13px 42px;font-size:1.15rem;font-weight:800;border:2.5px solid #FFD600;
              background:linear-gradient(91deg,#fffde4 65%,#ffe178 100%);color:#1b222e;
              box-shadow:0 0 18px #ffd600b6,0 1px 10px #eaeaba50;border-radius:11px;
              transition:background .17s,box-shadow .14s;cursor:pointer;letter-spacing:.2px;">
            📢 Lihat &amp; Dengar Instruksi
          </button>
        </div>
      </div>
    `;
  } else {
    // ============ SETELAH INSTRUKSI ===============
    greetingHTML = `
      <div class="personal-greeting"
        style="margin:30px auto 30px auto;
        padding:22px 24px 18px 24px;
        max-width:480px;
        background:linear-gradient(113deg,#fff8fc 88%,#eaf6ff 100%);
        border-radius:19px;
        font-size:1.22rem;
        color:#234;
        box-shadow:0 4px 24px #bbd0ff22,0 1.5px 4px #d1f7f910;
        text-align:center;
        border:1.5px solid #d6e6fa;
        position:relative;">
        <div style="font-size:2.1em;margin-bottom:8px;">👋</div>
        <b style="font-size:1.11em;">Halo, ${nickname}!</b>
        <div style="margin-top:7px;font-size:1.06em;line-height:1.48;">
          Instruksi sudah selesai.<br>
          Silakan mulai mengerjakan tes yang telah dipilih di bawah ini.<br>
          <span style="color:#278f36;font-size:1em;font-weight:600;">Semoga lancar!</span>
        </div>
      </div>
    `;
  }

  // 2. Blok utama home
  let html = `
    <div class="card" id="homeCard" style="max-width:900px;margin:36px auto 0 auto;padding:0 0 38px 0;border-radius:27px;
      background:linear-gradient(135deg,#f5faff 88%,#e5f3ff 100%);
      box-shadow:0 10px 36px #c9eaff33, 0 1.5px 6px #fff9;border:1.7px solid #bfe3fc;overflow:hidden;">
      <div style="display:flex;align-items:center;gap:18px;padding:38px 34px 0 34px;">
        <img src="https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/02/LOGO_SSG_A47004b0bb989ef087.md.png"
          alt="Logo Psikotes" style="width:68px;height:68px;object-fit:contain;border-radius:16px;box-shadow:0 2px 12px #bddff930;">
        <div>
          <h1 style="margin:0 0 8px 0;font-size:2.09rem;font-weight:900;color:#1662a5;letter-spacing:0.2px;text-shadow:0 1.5px 10px #e1efff99;">
            Psikotes Sugar Group Schools
          </h1>
          <div style="font-size:1.11rem;color:#337;font-weight:600;opacity:.95;">
            Platform Seleksi & Pengembangan
          </div>
        </div>
      </div>
      ${greetingHTML}
  `;

  // 3. Kartu tes & tombol download hanya jika instruksi sudah selesai
  if (appState.showTestCards) {
    // --------- BLOK PSIKOTES ----------
    if (hasPsikotes) {
     if (isBoth) html += `<div style="
  margin-bottom:14px;
  font-weight:800;
  color:#14672e;
  font-size:1.19em;
  letter-spacing:.01em;
  text-align:center;
  border-bottom:2.5px solid #dbe6e0;
  padding-bottom:5px;
  max-width:370px;
  margin-left:auto;
  margin-right:auto;
">
  Kategori 1: Tes Psikologi
</div>`;

     html += `<div class="test-selection" style="padding:0 24px;">`;
      if (selectedTests.includes('IST')) html += `<div class="test-card ${appState.completed.IST ? 'completed' : ''}" onclick="startTest('IST')"><div class="test-icon">🧠</div><h3>Tes IST</h3><p>${tests.IST.description}</p><div class="time">Waktu: ~60 menit</div><div class="status">${appState.completed.IST ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('KRAEPLIN')) html += `<div class="test-card ${appState.completed.KRAEPLIN ? 'completed' : ''}" onclick="startTest('KRAEPLIN')"><div class="test-icon">🧮</div><h3>Tes Kraeplin</h3><p>${tests.KRAEPLIN.description}</p><div class="time">Waktu: ±5-10 menit</div><div class="status">${appState.completed.KRAEPLIN ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('DISC')) html += `<div class="test-card ${appState.completed.DISC ? 'completed' : ''}" onclick="startTest('DISC')"><div class="test-icon">👤</div><h3>Tes DISC</h3><p>${tests.DISC.description}</p><div class="time">Waktu: ~5 menit</div><div class="status">${appState.completed.DISC ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('PAPI')) html += `<div class="test-card ${appState.completed.PAPI ? 'completed' : ''}" onclick="startTest('PAPI')"><div class="test-icon">📊</div><h3>Tes PAPI</h3><p>${tests.PAPI.description}</p><div class="time">Waktu: ~5 menit</div><div class="status">${appState.completed.PAPI ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('BIGFIVE')) html += `<div class="test-card ${appState.completed.BIGFIVE ? 'completed' : ''}" onclick="startTest('BIGFIVE')"><div class="test-icon">📝</div><h3>Tes Big Five</h3><p>${tests.BIGFIVE.description}</p><div class="time">Waktu: ~5 menit</div><div class="status">${appState.completed.BIGFIVE ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('GRAFIS')) html += `<div class="test-card ${appState.completed.GRAFIS ? 'completed' : ''}" onclick="startTest('GRAFIS')"><div class="test-icon">🎨</div><h3>Tes Grafis</h3><p>Upload hasil gambar Rumah, Pohon, dan Orang sesuai instruksi.</p><div class="time">Waktu: ~10 menit</div><div class="status">${appState.completed.GRAFIS ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      html += `</div>`;
    }
    // --------- BLOK ADMIN/KEMAMPUAN ----------
    if (hasAdmin) {
     if (isBoth) html += `<div style="
  margin:38px auto 14px auto;
  font-weight:800;
  color:#1c4e81;
  font-size:1.19em;
  letter-spacing:.01em;
  text-align:center;
  border-bottom:2.5px solid #e1eaff;
  padding-bottom:5px;
  max-width:430px;
">
  Kategori 2: Tes Kemampuan/Administrasi
</div>`;

    html += `<div class="test-selection" style="padding:0 24px;">`;

      if (selectedTests.includes('EXCEL')) html += `<div class="test-card ${appState.completed.EXCEL ? 'completed' : ''}" onclick="startTest('EXCEL')"><div class="test-icon">📑</div><h3>Tes Excel</h3><p>Mengerjakan soal administrasi sekolah di spreadsheet online.</p><div class="time">Waktu: ~15 menit</div><div class="status">${appState.completed.EXCEL ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('TYPING')) html += `<div class="test-card ${appState.completed.TYPING ? 'completed' : ''}" onclick="startTest('TYPING')"><div class="test-icon">⌨️</div><h3>Tes Mengetik</h3><p>Uji kecepatan dan akurasi mengetik kalimat tertentu.</p><div class="time">Waktu: ~5 menit</div><div class="status">${appState.completed.TYPING ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      if (selectedTests.includes('SUBJECT')) html += `<div class="test-card ${appState.completed.SUBJECT ? 'completed' : ''}" onclick="startTest('SUBJECT')"><div class="test-icon">📚</div><h3>Tes Subjek</h3><p>Pilih dan kerjakan soal sesuai mata pelajaran (Math, Indonesia, Inggris, dll).</p><div class="time">Waktu: ~15 menit</div><div class="status">${appState.completed.SUBJECT ? '✓ Selesai' : 'Belum dikerjakan'}</div></div>`;
      html += `</div>`;
    }
    // --------- TOMBOL DOWNLOAD ---------
    html += `
    <div id="downloadPDFBox" style="text-align:center;margin:48px 0 0 0;">
      <button class="btn btn-download"
        id="btnDownloadPDF"
        style="padding:19px 48px;font-size:1.25rem;font-weight:900;border:2.4px solid #31b729;
          background:linear-gradient(92deg,#f7fff1 65%,#d3ffb8 100%);color:#15772a;
          box-shadow:0 0 18px #45ff6190,0 0 7px #eaffea55,0 1.5px 6px #fafdf6;
          border-radius:15px;margin-bottom:0;transition:background 0.16s,box-shadow 0.15s;
          letter-spacing:.1px;position:relative;"
        onclick="generatePDF()">
        <span style="font-size:1.23em;vertical-align:-3px;">📄</span> Download Hasil Tes Psikologi (PDF)
      </button>
      <div style="margin-top:13px;font-size:1.01em;color:#486908;letter-spacing:.01em;opacity:.97;">
        <span style="background:#fffde8;border-radius:8px;padding:3px 13px 3px 11px;display:inline-block;border:1px solid #ffe066;">
          <b>PENTING:</b> Unduh hasil hanya setelah semua tes selesai.
        </span>
      </div>
    </div>
    <div id="cekDownloadMsg"
      style="margin:24px auto 16px auto; max-width:485px; background:#fffbe0; border:1.6px solid #ffe066; border-radius:12px;
      padding:15px 25px 13px 22px; color:#6b5a05; font-size:1.13em; box-shadow:0 2px 12px #ffe06624; display:none;">
      <div style="font-weight:800;color:#bb9300;margin-bottom:4px;">
        ⚠️ Cek Fungsi Download
      </div>
      <div>
        <b>Silakan klik tombol <u>Download Hasil Tes</u> di atas satu kali untuk memastikan file berhasil diunduh.</b><br><br>
        Jika file PDF/Excel berhasil diunduh, Anda dapat lanjut mengerjakan seluruh tes.<br>
        <b>Jika <u>tidak</u> ada file terunduh</b>, segera hubungi tim rekrutmen untuk bantuan.
      </div>
    </div>
    `;
  } // END if (appState.showTestCards)

  html += `</div>
  <style>
    .btn-download:hover {background:linear-gradient(92deg,#fafff3 62%,#e1ffd4 100%) !important;box-shadow:0 0 22px #66ffb190,0 0 10px #eafff0b0;color:#17852c;border-color:#2cd645;}
    .btn-download:active {background:linear-gradient(92deg,#edffe1 67%,#c9ffb2 100%) !important;color:#18692d;border-color:#1ab529;}
    .btn.blink {animation: blink 1.6s infinite;}
    @keyframes blink {0%,100% { box-shadow:0 0 18px #ffd600b6,0 1px 10px #eaeaba50;}50% { box-shadow:0 0 30px #fff972,0 1px 16px #ffe178aa;}}
  </style>`;

  document.getElementById('app').innerHTML = html;

  // Tombol instruksi hanya muncul jika belum instruksi
  setTimeout(() => {
    const instruksiBtn = document.getElementById('btnShowInstruksi');
    if (instruksiBtn) {
      instruksiBtn.classList.add('blink');
      instruksiBtn.onclick = () => showInstruksiOverlay(nickname, instruksiList);
    }
  }, 300);

}


function showInstruksiOverlay(nickname, instruksiList) {
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 20);

  let overlay = document.getElementById('overlayInstruksi');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlayInstruksi';
    overlay.style = `
      position:fixed; left:0; top:0; right:0; bottom:0;
      background:rgba(16,27,48,0.93); z-index:9999; display:flex;
      align-items:center; justify-content:center;
      padding:20px;
      overflow-y:auto;
    `;
    document.body.appendChild(overlay);
  }

  // --- RENDER LIST TES DIPILIH ---
  const selectedTests = appState.selectedTests || JSON.parse(localStorage.getItem('selectedTests') || '[]');
  const testLabels = {
    IST: { icon:'🧠', label:'Tes IST' },
    KRAEPLIN: { icon:'🧮', label:'Tes Kraeplin' },
    DISC: { icon:'👤', label:'Tes DISC' },
    PAPI: { icon:'📊', label:'Tes PAPI' },
    BIGFIVE: { icon:'📝', label:'Tes Big Five' },
    GRAFIS: { icon:'🎨', label:'Tes Grafis' },
    EXCEL: { icon:'📑', label:'Tes Excel' },
    TYPING: { icon:'⌨️', label:'Tes Mengetik' },
    SUBJECT: { icon:'📚', label:'Tes Subjek' },
  };
  let tesDipilihHTML = `
    <div style="margin:36px 0 16px 0;">
      <div style="font-weight:700;font-size:1.13rem;color:#1864ab;margin-bottom:10px;text-align:center;">
        Tes yang Akan Anda Kerjakan:
      </div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px 18px;">
        ${
          selectedTests.map(id => `
            <div style="display:flex;align-items:center;gap:7px;background:#f5fafd;padding:9px 17px 8px 13px;border-radius:10px;font-size:1.09rem;box-shadow:0 2px 9px #d7eaf4;">
              <span style="font-size:1.38em;">${testLabels[id]?.icon || ''}</span>
              <span style="font-weight:600;">${testLabels[id]?.label || id}</span>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;

  overlay.innerHTML = `
     <div class="instruksiyuh" style="
      max-width:98%;
      width:900px;
      padding:30px; 
      background:white; 
      border-radius:18px;
      box-shadow:0 10px 40px rgba(0,0,0,0.25);
    ">
      <div class="instruksi-hiasan">
        <div class="instruksi-gradient-strip" style="
            height:6px; 
            background:linear-gradient(90deg,#2c7be5,#00d97e);
            border-radius:3px; 
            margin-bottom:20px;
        "></div>
        <div class="instruksi-hi" style="
            font-size:1.5rem; 
            font-weight:700; 
            color:#1a3d7c; 
            margin-bottom:10px;
            text-align:center;
        ">
            Hi, <b>${nickname}</b>!
        </div>
      </div>
      <h2 style="
          text-align:center; 
          margin:0 0 20px 0; 
          color:#233;
          font-size:1.8rem;
      ">Instruksi Tes</h2>
      <div id="subtitleInstruksiTyping" style="
          max-height:60vh;
          overflow-y:auto;
          padding:15px 20px;
          font-size:1.15rem;
          line-height:1.65;
      "></div>
      ${tesDipilihHTML}
      <div style="text-align:center; margin-top:25px;">
          <button class="btn" id="btnSelesaiInstruksi" style="
              display:none; 
              padding:12px 40px;
              font-size:1.15rem;
              font-weight:700;
              background:#2c7be5;
              color:white;
              border:none;
              border-radius:10px;
              cursor:pointer;
          ">✔️ Selesai</button>
      </div>
    </div>
  `;
    // Mesin ketik overlay
  const teks = instruksiList[0];
    const el = document.getElementById('subtitleInstruksiTyping');
    el.textContent = '';
    let i = 0;
    function typeLoop() {
        let rawText = teks.substring(0, i);
        let typed = rawText
            .replace(/<WELCOME>(.*?)<\/WELCOME>/s, 
                '<div style="font-size:1.6rem;font-weight:700;color:#2c7be5;text-align:center;margin:0 0 15px 0;line-height:1.4;">$1</div>')
            .replace(/<HEADNOTE>(.*?)<\/HEADNOTE>/s, 
                '<div style="font-size:1.25rem;font-weight:600;color:#3a506b;margin:0 0 15px 0;text-align:center;">$1</div>')
            .replace(/<div class="instruksi-section">/g, 
                '<div style="margin-bottom:18px;padding:15px;background:#f8fbff;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,0.05);">')
            .replace(/<div class="section-title">/g, 
                '<div style="font-size:1.18rem;font-weight:700;color:#1a3d7c;margin-bottom:10px;display:flex;align-items:center;gap:8px;">')
            .replace(/<div class="section-content">/g, 
                '<div style="padding-left:20px;font-size:1.08rem;line-height:1.6;color:#334e68;">')
            .replace(/<PENTING>(.*?)<\/PENTING>/gs, 
                '<div style="margin:22px 0;padding:18px;background:#fff8f0;border:2px solid #ff6b6b;border-radius:12px;box-shadow:0 4px 15px rgba(255,107,107,0.1);">$1</div>')
            .replace(/<div class="warning-header">/g, 
                '<div style="font-size:1.25rem;font-weight:800;color:#d32f2f;text-align:center;margin-bottom:15px;">')
            .replace(/<div class="warning-content">/g, 
                '<div style="font-size:1.1rem;line-height:1.6;color:#5a3e3e;padding:0 10px;">')
            .replace(/<div class="warning-alert">/g, 
                '<div style="margin-top:15px;padding:12px;background:#ffebee;border-radius:8px;font-weight:700;color:#b71c1c;text-align:center;border:1px dashed #f44336;">');

        el.innerHTML = typed + `<span class="blink-cursor">|</span>`;
        if (i < teks.length) {
            i++;
            setTimeout(typeLoop, 12);
        } else {
            el.innerHTML = typed;
            // Tambahkan animasi CSS untuk peringatan
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
                }
                .blink-cursor {
                    animation: blink 1s infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                #subtitleInstruksiTyping > div > div[style*="background:#ffebee"] {
                    animation: pulse 1.5s infinite;
                }
    `;
    document.head.appendChild(style);

    // Tampilkan tombol selesai
    const btn = document.getElementById('btnSelesaiInstruksi');
    btn.style.display = "inline-block";

    // --- Cek & hapus pesan lama jika ada ---
    const pesanLama = document.getElementById('pesanSelesaiInstruksi');
    if (pesanLama) pesanLama.remove();

    // Tambahkan pesan sebelum tombol selesai
    let pesan = document.createElement('div');
    pesan.id = "pesanSelesaiInstruksi";
    pesan.style.marginTop = "30px";
    pesan.style.marginBottom = "18px";
    pesan.style.textAlign = "center";
    pesan.style.color = "#1668a9";
    pesan.style.fontSize = "1.11em";
    pesan.style.fontWeight = "500";
    pesan.innerHTML = `Klik <b>Selesai</b> untuk mengecek tombol download hasil tes.`;

    btn.parentNode.parentNode.insertBefore(pesan, btn.parentNode);
}
}
   typeLoop();

// Mainkan audio instruksi
const audioTTS = new Audio('https://files.catbox.moe/4uj84n.mp3');
audioTTS.volume = 0.92;
setTimeout(() => audioTTS.play(), 350);

document.getElementById('btnSelesaiInstruksi').onclick = () => {
    appState.showTestCards = true;  // <-- AKTIFKAN TEST CARD
    overlay.remove();
    renderHome();                   // <-- RENDER ULANG HOME SUPAYA KARTU TES MUNCUL
    sudahCekDownload = true;

    setTimeout(() => {
        const box = document.getElementById('downloadPDFBox');
        const pdfBtn = document.getElementById('btnDownloadPDF');
        const cekMsg = document.getElementById('cekDownloadMsg');
        let downloadClickCount = 0;

        // Scroll ke elemen download box
     if (box) {
    // Scroll ke paling bawah agar tombol terlihat full
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 300);
}

        enableDownloadButtonSetelahCek();

        if (cekMsg) cekMsg.style.display = "block";

        if (pdfBtn && !pdfBtn.hasHandler) {
            pdfBtn.onclick = function () {
                downloadClickCount++;
                generatePDF();

                if (downloadClickCount === 1) {
                    pdfBtn.disabled = true;
                    pdfBtn.classList.remove('blink');
                    pdfBtn.style.opacity = "0.4";
                    pdfBtn.style.pointerEvents = "none";

                    if (cekMsg) {
                       cekMsg.innerHTML = `
<b>✅ Tombol sudah dicek.</b><br>
Silakan periksa folder unduhan (Downloads) di browser Anda. File bernama <i>hasil-psikotes_[nama Anda].pdf</i> seharusnya telah terunduh.<br><br>
Jika file tersebut tersedia, Anda dapat memulai dan mengerjakan seluruh tes yang diminta.<br><br>
<b>Jangan klik tombol ini lagi sebelum semua tes selesai dikerjakan</b>, karena tombol akan beralih fungsi menjadi logout.<br><br>
Jika Anda telah menyelesaikan seluruh tes, Anda boleh mengklik tombol ini kembali untuk keluar dari sistem.
`;


                        cekMsg.style.display = "block";
                    }

                    setTimeout(() => {
                        pdfBtn.disabled = false;
                        pdfBtn.style.opacity = "1";
                        pdfBtn.style.pointerEvents = "auto";
                        pdfBtn.classList.add('blink');
                        // Tidak menyembunyikan cekMsg di sini
                    }, 1100);
                }

                else if (downloadClickCount === 2) {
                    if (box) {
                        box.innerHTML = `
                            <div style="text-align:center;margin-top:24px;">
                                <div style="color:#c00;font-weight:600;margin-bottom:14px;">
                                    ⚠️ Tombol sudah diklik 2 kali.<br>Silakan logout untuk menyelesaikan sesi.
                                </div>
                                <button class="btn btn-danger" id="btnLogoutPDF" style="padding:18px 40px;font-size:1.17rem;font-weight:700;">
                                    🔒 Logout
                                </button>
                            </div>
                        `;

                        document.getElementById('btnLogoutPDF').onclick = function () {
                            localStorage.setItem('usedPragas', '1');
                            localStorage.removeItem('identity');
                            setTimeout(() => location.reload(), 250);
                        };

                        // Scroll ulang agar logout terlihat
                        setTimeout(() => {
                            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                        }, 300);
                    }

                    // Sembunyikan pesan "tombol sudah dicek"
                    if (cekMsg) cekMsg.style.display = "none";
                }
            };
            pdfBtn.hasHandler = true;
        }
    }, 600);
};
}

// --- Utility agar tombol download tetap aktif setelah cek instruksi ---
function updateDownloadBtnStatusAfterInstruksi() {
    const box = document.getElementById('downloadPDFBox');
    const pdfBtn = document.getElementById('btnDownloadPDF');
    const cekMsg = document.getElementById('cekDownloadMsg');

    if (box && pdfBtn) {
        if (sudahCekDownload) {
            box.style.opacity = 1;
            box.style.pointerEvents = "auto";
            pdfBtn.disabled = false;
            pdfBtn.style.opacity = "1";
            pdfBtn.style.pointerEvents = "auto";
            pdfBtn.classList.add('blink');
            // Tampilkan pesan awal jika belum pernah diklik
            if (cekMsg && downloadClickCount === 0) {
                cekMsg.style.display = "block";
            }

            // JANGAN SET onclick DI SINI LAGI! SUDAH ADA DI TEMPAT LAIN!
        } else {
            box.style.opacity = 0.4;
            box.style.pointerEvents = "none";
            pdfBtn.disabled = true;
            pdfBtn.style.opacity = "0.8";
            pdfBtn.classList.remove('blink');
            pdfBtn.style.pointerEvents = "none";
            if (cekMsg) cekMsg.style.display = "none";
        }
    }}


// Utility functions
function allTestsCompleted() {
  return appState.completed.IST && 
         appState.completed.KRAEPLIN &&  // ← tambahkan ini
         appState.completed.DISC && 
         appState.completed.PAPI && 
         appState.completed.BIGFIVE;
}

// Utility agar tombol download aktif setelah cek instruksi
function enableDownloadButtonSetelahCek() {
    updateDownloadBtnStatusAfterInstruksi();
}
function calculateProgress() {
  if (!appState.currentTest) return 0;

  if (appState.currentTest === 'IST') {
    const subtest = tests.IST.subtests[appState.currentSubtest];
    return (appState.currentQuestion / subtest.questions.length) * 100;
  } else if (appState.currentTest === 'KRAEPLIN') {
    // Progress berdasarkan kolom yang sedang dikerjakan
    return ((appState.currentColumn + 1) / tests.KRAEPLIN.columns.length) * 100;
  } else if (appState.currentTest === 'DISC') {
    return (appState.currentQuestion / tests.DISC.questions.length) * 100;
  } else if (appState.currentTest === 'PAPI') {
    return (appState.currentQuestion / tests.PAPI.questions.length) * 100;
  } else if (appState.currentTest === 'BIGFIVE') {
    return (appState.currentQuestion / tests.BIGFIVE.questions.length) * 100;
  }
  return 0;
}
function renderKraeplinInstructions() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="kraeplin-instruction">
      <div class="instruction-header">
        <div class="instruction-icon">🧮</div>
        <h2>Instruksi Tes Kraeplin</h2>
        <p>Baca instruksi singkat berikut sebelum memulai tes.</p>
      </div>
      <div class="instruction-content">
        <div class="instruction-row">
          <div class="instruction-col">
            <div class="instruction-label">Cara Mengerjakan</div>
            <ul class="compact-list">
              <li>Lihat contoh visual.</li>
              <li>Ketik <b>jawaban</b> hasil penjumlahan di box.</li>
              <li>Kerjakan tiap kolom dalam <b>15 detik</b>.</li>
            </ul>
          </div>
          <div class="instruction-col">
            <div class="instruction-label">Perhatian</div>
            <ul class="compact-list">
              <li>Kecepatan <b>dan</b> ketelitian sama penting.</li>
              <li>Hanya tulis digit terakhir (contoh: 17 → 7).</li>
              <li>Waktu habis, otomatis ke baris berikutnya.</li>
            </ul>
          </div>
        </div>
        <div class="visual-section">
          <div class="section-title">Contoh Visual</div>
          <div class="image-container">
            <img src="https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/22/mmmuach6f2b30daa0f90b9c.png" 
                 alt="Contoh Pengerjaan Kraeplin"
                 class="gambar-kraeplin">
          </div>
          <div class="calc-examples">
            <div>8 + 7 = 15 → tulis <b>5</b></div>
            <div>8 + 1 = 9 → tulis <b>9</b></div>
            <div>3 + 3 = 6 → tulis <b>6</b></div>
            <div>2 + 8 = 10 → tulis <b>0</b></div>
          </div>
        </div>
      </div>
      <div class="instruction-footer">
        <button class="btn-instruction-green" onclick="startKraeplinTrial()">
          <span style="font-size:1em;font-weight:600;">PAHAMI & MULAI PERCOBAAN</span>
        </button>
      </div>
    </div>
  `;
}


// Modifikasi startTest untuk Kraepelin
function startTest(testName) {
  appState.currentTest = testName;
  appState.currentSubtest = 0;
  appState.currentQuestion = 0;

  if (testName === 'IST') {
    renderISTSubtestIntro();
  } else if (testName === 'KRAEPLIN') {
    renderKraeplinInstructions(); // Panggil instruksi Kraepelin
  } else if (testName === 'DISC') {
    renderDISCIntro();
  } else if (testName === 'PAPI') {
  renderPAPIIntro();
  } else if (testName === 'BIGFIVE') {
    appState.timeLeft = tests.BIGFIVE.time;
     renderBIGFIVEInstruction();
  } else if (testName === 'GRAFIS') {
    renderGrafisUpload();
  } else if (testName === 'EXCEL') {
  renderAdminExcelSheet();
    return;
  } else if (testName === 'TYPING') {
    renderTypingTest();
  } else if (testName === 'SUBJECT') {
    renderSubjectTestHome();
  }
}

function showThankYouAndHomeKRAEPLIN() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="max-width:480px;margin:44px auto 0 auto;padding:34px 30px 40px 30px;border-radius:17px;box-shadow:0 6px 28px #9992;text-align:center;">
      <div style="font-size:2.7em;margin-bottom:18px;">🎉</div>
      <h2 style="margin-bottom:16px;">Terima kasih telah mengerjakan Tes Kraeplin!</h2>
      <div style="font-size:1.12em;color:#155;">
        Jawaban Anda berhasil direkam.<br>
        Silakan lanjut ke tes berikutnya.
      </div>
      <button class="btn" style="margin-top:36px;min-width:160px;" onclick="renderHome()">
        Kembali ke Beranda
      </button>
    </div>
  `;

  setTimeout(renderHome, 3000);
}



// ==================== IST Test ====================
function renderISTSubtestIntro() {
  const subtest = tests.IST.subtests[appState.currentSubtest];
  
  if (!subtest) {
    // All subtests completed
    appState.completed.IST = true;
    // Tampilkan layar istirahat setelah semua subtes IST selesai
    showBreakScreen();
    return;
  }
  
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <h2>Subtes ${subtest.name}</h2>
      <p><strong>Deskripsi:</strong> ${subtest.description}</p>
      <p><strong>Petunjuk:</strong> ${subtest.instruction}</p>
      <p><strong>Waktu:</strong> ${Math.floor(subtest.time/60)} menit</p>
      <p><strong>Jumlah soal:</strong> ${subtest.questions.length}</p>
      
${subtest.type === 'image-choice' ? `
  <div class="example-answer" style="max-width: 500px; margin: 20px auto; text-align: center; font-family: Arial, sans-serif;">
    <h4 style="margin-bottom: 15px;">Contoh Soal:</h4>
    ${subtest.example.questionImage ? `
      <img src="${subtest.example.questionImage}" alt="Contoh Soal Gambar" style="max-width: 100%; max-height: 200px; object-fit: contain; margin: 10px auto 20px auto; display: block;">
    ` : ''}
    <div class="example-option-images" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
      ${subtest.example.images.map((img, index) => `
        <div style="text-align: center;">
          <img src="${img}" alt="Pilihan ${subtest.example.options[index]}" style="max-width: 80px; max-height: 80px; object-fit: contain; border-radius: 8px; box-shadow: 0 0 5px rgba(0,0,0,0.1);"><br>
          <strong>${subtest.example.options[index]}</strong>
        </div>
      `).join('')}
    </div>
    <p style="font-weight: 600;"><strong>Jawaban:</strong> ${subtest.example.answer}</p>
    <p><strong>Penjelasan:</strong> ${subtest.example.explanation}</p>
  </div>
` : `
  <div class="example-answer">
    <h4>Contoh Soal:</h4>
    <p><strong>Soal:</strong> ${subtest.example.question}</p>
    ${subtest.example.options ? `<p><strong>Pilihan:</strong> ${subtest.example.options.join(', ')}</p>` : ''}
    <p><strong>Jawaban:</strong> ${subtest.example.answer}</p>
    <p><strong>Penjelasan:</strong> ${subtest.example.explanation}</p>
  </div>
`}

      
      <div style="text-align: center; margin-top: 30px;">
        <button class="btn" onclick="startISTSubtest()">
          Mulai Subtes
        </button>
        <button class="btn btn-outline" onclick="renderHome()">
          Kembali
        </button>
      </div>
    </div>
  `;
}

function startISTSubtest() {
  const subtest = tests.IST.subtests[appState.currentSubtest];
  appState.timeLeft = subtest.time;
  
  // Initialize answers for this subtest
  if (!appState.answers.IST[appState.currentSubtest]) {
    appState.answers.IST[appState.currentSubtest] = {
      name: subtest.name,
      answers: []
    };
  }
  
  renderISTQuestion();
  startTimer();
}

function renderISTQuestion() {
  const subtest = tests.IST.subtests[appState.currentSubtest];
  const question = subtest.questions[appState.currentQuestion];

  const progress = calculateProgress();

  let optionsHTML = '';

  // Multiple Choice
  if (subtest.type === 'multiple-choice') {
    optionsHTML = question.options.map(option => {
  // Hilangkan "A. ", "B. ", dsb
  let cleanText = option.replace(/^[A-E]\.\s*/, '');
  return `
    <label class="option-box">
      <input type="radio" name="ist-answer" value="${option.charAt(0)}">
      ${cleanText}
      <span class="checkmark"></span>
    </label>
  `;
}).join('');
  }
  // Text Input
  else if (subtest.type === 'text-input') {
    optionsHTML = `
      <div class="form-group" style="margin-top: 15px;">
        <input type="text" id="ist-answer" class="form-control" placeholder="Ketik jawaban Anda">
      </div>
    `;
  }
  // Number Input
  else if (subtest.type === 'number-input') {
    optionsHTML = `
      <div class="form-group" style="margin-top: 15px;">
        <input type="number" id="ist-answer" class="form-control" placeholder="Ketik angka jawaban">
      </div>
    `;
  }
  // Image Choice (FA, WU)
  else if (subtest.type === 'image-choice') {
    optionsHTML = `
      <div class="ist-question-area">
        <div class="ist-image-question">
          ${question.questionImage ? `<img src="${question.questionImage}" alt="Soal">` : ""}
          <div class="ist-image-question-title">${subtest.instruction || ''}</div>
        </div>
        <div class="ist-image-options-grid">
          ${question.images.map((img, index) => `
            <div class="ist-image-option" data-idx="${index}">
              <img src="${img}" alt="Opsi ${question.options ? question.options[index] : String.fromCharCode(65+index)}">
              <span class="ist-image-option-label">${question.options ? question.options[index] : String.fromCharCode(65+index)}</span>
              <input type="radio" name="ist-answer" value="${question.options ? question.options[index] : String.fromCharCode(65+index)}" style="display:none;">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Render ke #app
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="timer-container">
        <div class="timer-icon">⏱️</div>
        <div class="timer" id="timer-display">${appState.timeLeft}s</div>
      </div>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <h3>Subtes ${subtest.name}</h3>
      <div class="question-container">
        <p class="question-text">${question.text || ''}</p>
        <div class="option-grid">
          ${optionsHTML}
        </div>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <button class="btn" onclick="nextISTQuestion()">
          ${appState.currentQuestion < subtest.questions.length - 1 ? 'Lanjut' : 'Selesai'}
        </button>
        <button class="btn btn-outline" onclick="confirmCancelTest()">
          Batalkan Tes
        </button>
      </div>
    </div>
  `;

  // Event handler (khusus image-choice/FA/WU)
  if (subtest.type === 'image-choice') {
    document.querySelectorAll('.ist-image-option').forEach(opt => {
      opt.addEventListener('click', function () {
        document.querySelectorAll('.ist-image-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        this.querySelector('input').checked = true;
      });
    });
  }

  // Event handler (multiple-choice)
  if (subtest.type === 'multiple-choice') {
    document.querySelectorAll('.option-box').forEach(box => {
      box.addEventListener('click', function () {
        document.querySelectorAll('.option-box').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        this.querySelector('input').checked = true;
      });
    });
  }

  updateTimerDisplay();
}



// Digunakan hanya untuk multiple-choice (opsi huruf, bukan gambar FA/WU)
function selectISTAnswer(value) {
  // Remove previous selection
  document.querySelectorAll('.option-box').forEach(b => {
    b.classList.remove('selected');
  });

  // Pilih input radio yang sesuai value, lalu kasih .selected ke parentnya
  const radio = document.querySelector(`input[name="ist-answer"][value="${value}"]`);
  if (radio) {
    radio.checked = true;
    radio.parentElement.classList.add('selected');
  }
}

function nextISTQuestion() {
  const subtest = tests.IST.subtests[appState.currentSubtest];
  const question = subtest.questions[appState.currentQuestion];
  let answer = '';

  // Jawaban: opsi multiple-choice atau image-choice (FA/WU)
  if (subtest.type === 'multiple-choice' || subtest.type === 'image-choice') {
    const selectedOption = document.querySelector('input[name="ist-answer"]:checked');
    answer = selectedOption ? selectedOption.value : '-';
  } else {
    const input = document.getElementById('ist-answer');
    answer = input ? input.value : '-';
  }

  // Save answer
  appState.answers.IST[appState.currentSubtest].answers.push({
    id: question.id,
    answer: answer,
    correct: subtest.type !== 'image-choice' ? answer === question.answer : undefined
  });

  // Move to next question
  appState.currentQuestion++;

  if (appState.currentQuestion >= subtest.questions.length) {
    // Subtest completed
    clearInterval(appState.timer);

    // Move to next subtest
    appState.currentSubtest++;
    appState.currentQuestion = 0;
    renderISTSubtestIntro();
  } else {
    renderISTQuestion();
  }
}


// ==================== Break Screen After IST ====================
function showBreakScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card break-screen">
      <div class="completion-icon">⏳</div>
      <h2>Istirahat Sebentar</h2>
      <p>Anda telah menyelesaikan seluruh Tes IST. Silakan istirahat selama 5 menit sebelum melanjutkan ke tes berikutnya.</p>
      
      <div class="break-timer" id="break-timer">05:00</div>
      
      <button class="btn" onclick="renderHome()">
        Lanjut Tes Sekarang
      </button>
    </div>
  `;
  
  let breakTime = 300; // 5 menit dalam detik
  const breakTimerElement = document.getElementById('break-timer');
  
  const breakTimer = setInterval(() => {
    breakTime--;
    const minutes = Math.floor(breakTime / 60).toString().padStart(2, '0');
    const seconds = (breakTime % 60).toString().padStart(2, '0');
    breakTimerElement.textContent = `${minutes}:${seconds}`;
    
    if (breakTime <= 0) {
      clearInterval(breakTimer);
      renderHome();
    }
  }, 1000);
}

// ====================  KRAEPLIN LOGIC SIAP COPAS (KOTAK INPUT 1 PER KOLOM) ====================
let timeOutEffect = false;

// ========== BOARD & TIMER ==========
function renderKraeplinBoard() {
  const columns = tests.KRAEPLIN.columns;
  const app = document.getElementById('app');
  const colCount = columns.length;
  const visibleRows = appState.isKraeplinTrial ? 10 : 5;
  const visibleCols = 4;
  const activeCol = appState.currentColumn ?? 0;
  const isSelesai = appState.completed.KRAEPLIN;

  const windowEnd = Math.min(colCount, activeCol + 1);
const windowStart = Math.max(0, windowEnd - visibleCols);


  const treadmillIndexes = (col) => {
    let arr = [];
    let len = columns[col].length;
    let from = Math.max(0, len - visibleRows);
    for (let i = from; i < len; i++) arr.push(i);
    return arr;
  };

  // Danger effect jika waktu habis
  const dangerEffect = appState.kraeplinStarted && timeOutEffect ? ' danger-effect' : '';

  let label = appState.isKraeplinTrial
    ? `<div style="text-align:center;color:#b50;font-weight:600;margin-bottom:6px;">TAHAP PERCOBAAN / TRIAL</div>`
    : `<div style="text-align:center;color:#165;font-weight:600;margin-bottom:6px;">TES KRAEPLIN SESUNGGUHNYA</div>`;

  let html = `
    <div class="card kraeplin-card${dangerEffect}">
      <div class="header">
        <span class="test-icon">🧮</span>
        <h2>${tests.KRAEPLIN.name}</h2>
        <p>${tests.KRAEPLIN.description}</p>
        <p style="color:#3498db">Waktu per kolom: <span id="timer-desc">${appState.timeLeft || 5}s</span></p>
        ${label}
      </div>
      <div class="kraeplin-board-flex">
  `;

  // Render kolom treadmill
  for (let c = windowStart; c < windowEnd; c++) {
    html += `<div class="kraeplin-col-vertical${c === activeCol ? ' kraeplin-active' : ''}" data-col="${c}" style="position:relative;">`;
    html += `<div style="display:flex;flex-direction:row;align-items:flex-end;justify-content:center;">`;

    // Baris angka
    html += `<div style="display:flex;flex-direction:column;align-items:center;">`;
    let indexes = treadmillIndexes(c);
    for (let i = 0; i < indexes.length; i++) {
      let idx = indexes[i];
      html += `<div class="kraeplin-row"><div class="kraeplin-num">${columns[c][idx]}</div></div>`;
    }
    html += `</div>`;

    // Kotak input satu saja di kolom aktif & sudah mulai
    if (!isSelesai && c === activeCol && appState.kraeplinStarted && columns[c].length >= 2) {
      const idxBawah = columns[c].length - 1;
      const idxAtas  = columns[c].length - 2;
      const angkaAtas = columns[c][idxAtas];
      const angkaBawah = columns[c][idxBawah];
      html += `<div style="display:flex;flex-direction:column;align-items:center;height:100%;margin-left:17px;">
  <div style="font-size:0.95em;color:#666;margin-bottom:7px;">(${angkaAtas} + ${angkaBawah})</div>
  <input
    type="number"
    class="kraeplin-input-bottom"
    data-col="${c}"
    min="0" max="9" maxlength="1"
    autocomplete="one-time-code"
    inputmode="numeric"
    pattern="[0-9]*"
    value="${(appState.answers.KRAEPLIN?.[c] || [])[columns[c].length - 2] ?? ''}"
    ${!appState.kraeplinStarted ? 'disabled' : ''}
    oninput="isiJawabanKraeplinBottom(this)"
    style="width:38px;text-align:center;font-size:1em;"
  />
</div>`;
    } else {
      html += `<div style="display:flex;flex-direction:column;align-items:center;height:100%;margin-left:17px;">
        <div style="font-size:0.95em;color:#999;margin-bottom:7px;">(x + y)</div>
        <input type="number" class="kraeplin-input-bottom" disabled placeholder="-" />
      </div>`;
    }

    html += `</div></div>`;
  }
  html += `</div>`;

  // ========== LIVE STATS ==========
  html += `
    <div id="kraeplinLiveStats" style="margin:17px 0 8px 0; color:#145; font-size:1.07em; text-align:center;">
      <b>Jawaban benar:</b> 0 &nbsp; | &nbsp; <b>Salah:</b> 0 &nbsp; | &nbsp; <b>Jumlah isi:</b> 0 &nbsp; | &nbsp; <b>Ketelitian:</b> 0.0%
      ${appState.isKraeplinTrial ? `<div style="color:#aa8600;font-size:.97em;margin-top:4px;">(Percobaan/Trial)</div>` : ''}
    </div>
  `;

  // Timer
  html += `
    <div class="timer-float-top" id="kraeplin-timer-top"
      style="
        position: absolute;
        top: 24px;
        right: 28px;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 4px 18px rgba(52,152,219,0.10);
        padding: 10px 22px 10px 22px;
        font-size: 1.18em;
        font-weight: bold;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 7px;
        z-index: 100;
      ">
      <span style="font-size:1.4em; margin-right: 6px;">🕰️</span>
      <span id="kraeplin-timer-top-num">${appState.timeLeft || 5}s</span>
    </div>
  `;

  // Tombol Selesai (hanya jika sudah mulai & belum selesai)
  if (!isSelesai && appState.kraeplinStarted) {
    html += `
      <div style="text-align:center;margin-top:20px;">
        <button class="btn" onclick="finishKraeplinBoard()">
          Selesai ${appState.isKraeplinTrial ? "Percobaan" : "Tes"}
        </button>
      </div>
    `;
  }

  // Tombol "Mulai" yang lebih mencolok
  if (!appState.kraeplinStarted && !(appState.isKraeplinTrial && isSelesai)) {
    const btnColor = appState.isKraeplinTrial ? "#e67e22" : "#2ecc71";
    const btnHover = appState.isKraeplinTrial ? "#d35400" : "#27ae60";
    html += `
      <div style="text-align:center;margin-top:28px;">
        <button class="btn-start-kraeplin" 
          onclick="startKraeplinBoard()"
          style="
            background: ${btnColor};
            color: white;
            font-size: 1.2em;
            padding: 15px 35px;
            border-radius: 50px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          "
          onmouseover="this.style.background='${btnHover}'; this.style.transform='scale(1.05)'"
          onmouseout="this.style.background='${btnColor}'; this.style.transform='scale(1)'"
        >
          MULAI ${appState.isKraeplinTrial ? "PERCOBAAN" : "TES KRAEPLIN"}
        </button>
      </div>
    `;
  }

  // Tombol "Mulai Tes Sungguhan" setelah trial selesai
  if (appState.isKraeplinTrial && isSelesai) {
    html += `
      <div style="text-align:center;margin-top:30px;">
        <button class="btn-start-real" 
          onclick="startKraeplinReal()"
          style="
            background: #3498db;
            color: white;
            font-size: 1.2em;
            padding: 15px 35px;
            border-radius: 50px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          "
          onmouseover="this.style.background='#2980b9'; this.style.transform='scale(1.05)'"
          onmouseout="this.style.background='#3498db'; this.style.transform='scale(1)'"
        >
          MULAI TES KRAEPLIN SUNGGUHAN
        </button>
      </div>
    `;
  }

  html += `</div></div>`;

  app.innerHTML = html;

  // Fokus input kolom aktif
setTimeout(() => {
  let input = document.querySelector('.kraeplin-col-vertical.kraeplin-active input:not([disabled])');
  if (input) {
    // Trik: Blur dulu, baru focus, lalu scroll supaya kelihatan.
    input.blur();
    input.focus();
    input.scrollIntoView({behavior:'smooth', block:'center'});
  }
}, 120); // Delay 100–150ms, tes di HP, biasanya lebih stabil


  // Reset efek danger
  if (appState.kraeplinStarted && timeOutEffect) {
    playBeep(); // SUARA LANGSUNG SAAT DANGER
    setTimeout(() => {
      let tmrTop = document.getElementById('kraeplin-timer-top');
      let tmrNum = document.getElementById('kraeplin-timer-top-num');
      if (tmrTop) tmrTop.classList.add('danger-timer');
      if (tmrNum) tmrNum.classList.add('danger-timer');
      setTimeout(() => {
        if (tmrTop) tmrTop.classList.remove('danger-timer');
        if (tmrNum) tmrNum.classList.remove('danger-timer');
      }, 700);
    }, 80);
  }

  updateTimerDisplay(appState.timeLeft); // hanya update display
  updateKraeplinLiveStats(); // <== BIAR LIVE!
}


// ========== START & TIMER ==========
function startKraeplinBoard() {
  prepareAudioContext(); // ← TAMBAHKAN DI SINI
  appState.kraeplinStarted = true;
  appState.currentColumn = 0;
  appState.timeLeft = 15;
  appState.timerActive = true;
  appState.currentRow = {};
  renderKraeplinBoard();
  startKraeplinBoardTimer(); // <--- HARUS ADA DI SINI!
}

function startKraeplinBoardTimer() {
  clearInterval(appState.timer);
  appState.timerActive = true;
  updateKraeplinTimerDisplay(appState.timeLeft);
  appState.timer = setInterval(() => {
    appState.timeLeft--;
    updateKraeplinTimerDisplay(appState.timeLeft);
    if (appState.timeLeft <= 0) {
      clearInterval(appState.timer);
      appState.timerActive = false;
      timeOutEffect = true;
      renderKraeplinBoard();
      setTimeout(() => {
        timeOutEffect = false;
        nextKraeplinCol();
      }, 300);
    }
  }, 1000);
}
// ========== INPUT JAWABAN ==========
function isiJawabanKraeplinBottom(el) {
    const col = +el.dataset.col;
    if (!appState.kraeplinStarted || appState.completed.KRAEPLIN) return;

    el.value = el.value.slice(-1);

    // Selalu catat jawaban, baik trial maupun sungguhan
    const columns = tests.KRAEPLIN.columns;
    const currentRowIndex = columns[col].length - 2;
    if (!appState.answers.KRAEPLIN[col]) {
        const initialLength = columns[col].length - 1;
        appState.answers.KRAEPLIN[col] = Array(initialLength).fill(null);
    }
    appState.answers.KRAEPLIN[col][currentRowIndex] = parseInt(el.value) || 0;

    // Update live stats setiap input (penting agar real time)
    updateKraeplinLiveStats();

    if (el.value.length === 1) {
        if (tests.KRAEPLIN.columns[col].length > 0) {
            tests.KRAEPLIN.columns[col].pop();
        }
        renderKraeplinBoard();
    }
}



function updateKraeplinLiveStats() {
  let benar = 0, salah = 0, total = 0;
  const jawaban = appState.answers.KRAEPLIN || [];
  const kunci = appState.kraeplinKey || [];

  for (let col = 0; col < jawaban.length; col++) {
    if (!Array.isArray(jawaban[col])) continue;
    for (let row = 0; row < jawaban[col].length; row++) {
      if (typeof jawaban[col][row] !== 'number') continue;
      total++;
      if (jawaban[col][row] === kunci[col][row]) benar++;
      else salah++;
    }
  }
  const ketelitian = total ? (benar / total * 100).toFixed(1) : "0.0";
  const el = document.getElementById('kraeplinLiveStats');
  if (el) {
    el.innerHTML = `
      <b>Jawaban benar:</b> ${benar}
      &nbsp; | &nbsp; 
      <b>Salah:</b> ${salah}
      &nbsp; | &nbsp;
      <b>Jumlah isi:</b> ${total}
      &nbsp; | &nbsp;
      <b>Ketelitian:</b> ${ketelitian}%
      ${appState.isKraeplinTrial ? `<div style="color:#aa8600;font-size:.97em;margin-top:4px;">(Percobaan/Trial)</div>` : ''}
    `;
  }
}




// ========== TIMER DISPLAY ==========
function updateKraeplinTimerDisplay(val) {
  const timerEl = document.getElementById('kraeplin-timer');
  const descEl = document.getElementById('timer-desc');
  const topEl = document.getElementById('kraeplin-timer-top-num');
  let display = (val !== undefined ? val : appState.timeLeft || 15) + 's';
  if (timerEl) timerEl.textContent = display;
  if (descEl) descEl.textContent = display;
  if (topEl) topEl.textContent = display;

  if (timerEl) {
    if ((appState.timeLeft || 5) <= 3) {
      timerEl.style.color = '#e74c3c';
      timerEl.style.fontWeight = 'bold';
    } else {
      timerEl.style.color = '';
      timerEl.style.fontWeight = '';
    }
  }
}

// ========== PINDAH KOLOM ==========
function nextKraeplinCol() {
  let nextCol = (appState.currentColumn ?? 0) + 1;
  if (nextCol < tests.KRAEPLIN.columns.length) {
    appState.currentColumn = nextCol;
    appState.timeLeft = 15;
    appState.timerActive = false;
    renderKraeplinBoard();
    startKraeplinBoardTimer(); // <-- HARUS ADA DI SINI!
  } else {
    finishKraeplinBoard();
  }
}

// ========== FINISH ==========
function finishKraeplinBoard() {
  clearInterval(appState.timer);
  appState.timerActive = false;
  appState.kraeplinStarted = false;
  
  // DEBUG: Tampilkan jawaban dan kunci untuk semua jenis tes
  console.log("======= DEBUG KRAEPLIN =======");
  console.log("Jawaban User:", JSON.parse(JSON.stringify(appState.answers.KRAEPLIN)));
  console.log("Kunci Jawaban:", JSON.parse(JSON.stringify(appState.kraeplinKey)));
  
  // Hitung dan tampilkan analisa
  try {
    const analisa = analyzeKraeplin();
    console.log("Analisa Hasil:", analisa);
  } catch (e) {
    console.error("Error analisa:", e);
  }
  
  if (appState.isKraeplinTrial) {
    appState.completed.KRAEPLIN = true;
    renderKraeplinBoard();
  } else {
    appState.completed.KRAEPLIN = true;
    showThankYouAndHomeKRAEPLIN();
  }
}

// ========== GENERATE COLUMN ==========
function generateKraeplinColumns(jumlahKolom, jumlahBaris) {
  return Array.from({length: jumlahKolom}, () =>
    Array.from({length: jumlahBaris}, () => Math.floor(Math.random() * 9) + 1)
  );
}
function generateKraeplinKey() {
    const key = [];
    const columns = tests.KRAEPLIN.columns;
    
    for (let col = 0; col < columns.length; col++) {
        key[col] = [];
        
        // Pastikan kita membuat kunci untuk semua baris yang mungkin dijawab
        for (let row = 0; row < columns[col].length - 1; row++) {
            const sum = columns[col][row] + columns[col][row + 1];
            key[col][row] = sum % 10; // Simpan digit terakhir
        }
    }
    appState.kraeplinKey = key;
}

// ========== START TRIAL / REAL ==========
function startKraeplinTrial() {
  appState.isKraeplinTrial = true;
  appState.kraeplinStarted = false;
  appState.completed.KRAEPLIN = false;
  appState.currentColumn = 0;
  appState.timeLeft = 15;
  appState.answers.KRAEPLIN = [];
  appState.currentRow = {};
  appState.kraeplinHistory = {};
  tests.KRAEPLIN.columns = generateKraeplinColumns(4, 28); // 4 kolom trial, 28 baris
  generateKraeplinKey();
  renderKraeplinBoard();
}

function startKraeplinReal() {
  appState.isKraeplinTrial = false;
  appState.kraeplinStarted = false;
  appState.completed.KRAEPLIN = false;
  appState.currentColumn = 0;
  appState.timeLeft = 15;
  appState.answers.KRAEPLIN = [];
  appState.currentRow = {};
  appState.kraeplinHistory = {};
  tests.KRAEPLIN.columns = generateKraeplinColumns(50, 28); // 50 kolom real, 28 baris
  generateKraeplinKey();
  renderKraeplinBoard();
}

// ==================== DISC Test ====================
function namaPanggilan() {
  return appState?.identity?.nickname?.trim() ? appState.identity.nickname.trim() : "Anda";
}
function renderDISCIntro() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="disc-intro-container" style="
      max-width: 860px;
      margin: 28px auto 0 auto;
      background: #fafdff;
      border-radius: 18px;
      box-shadow: 0 6px 32px rgba(60,70,120,0.07);
      padding: 32px 32px 36px 32px;
      ">
      <h2 style="text-align:center;margin-bottom:6px;font-size:2.1em;letter-spacing:0.01em">${tests.DISC.name}</h2>
      <div style="text-align:center;margin-bottom:24px;color:#234;">${tests.DISC.description}</div>
      
      <div style="
        background:#f1f5fb;
        padding: 14px 26px 20px 26px;
        border-radius: 13px;
        margin: 0 0 30px 0;
        border:1.2px solid #e0e7ef;
      ">
        <div style="font-weight:600;font-size:1.15em;margin-bottom:8px;color:#1e2331;">Petunjuk</div>
        <ul style="margin-bottom:0;padding-left:22px;line-height:1.8;">
          <li>Pilih <b>1 pernyataan PALING (P)</b> yang paling sesuai dengan diri Anda</li>
          <li>Pilih <b>1 pernyataan KURANG (K)</b> yang paling tidak sesuai dengan diri Anda</li>
          <li><span style="color:#d00;font-weight:500;">P dan K tidak boleh pada pilihan yang sama</span></li>
        </ul>
      </div>

      <div class="example-visual" style="margin-bottom:28px;text-align:center;">
        <div style="font-weight:600;font-size:1.12em;margin-bottom:10px;">Contoh Visual:</div>
        <img src="https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/23/disccontoh86cdeda720e17746.png"
             alt="Contoh Jawaban DISC"
             style="max-width:420px;width:100%;border-radius:12px;box-shadow:0 4px 16px rgba(30,40,60,0.11);margin:auto;">
        <div style="margin-top:10px;color:#798ba8;font-size:.99em">
          Pilih satu <b>P</b> dan satu <b>K</b> dari empat pilihan pada setiap soal.<br>
          Lihat contoh tampilan pada gambar di atas.
        </div>
      </div>

      <div style="text-align:center;margin-top:38px;">
        <button class="btn" style="min-width:170px;font-size:1.11em;" onclick="mulaiDISC()">Mulai Soal</button>
        <button class="btn btn-outline" style="min-width:130px;" onclick="renderHome()">Kembali</button>
      </div>
    </div>
  `;
}

// Mulai ulang DISC
function mulaiDISC() {
  appState.currentQuestion = 0;
  appState.tempDISC = {};
  appState.answers.DISC = [];         // WAJIB reset jawaban
  appState.completed.DISC = false;
  appState.discError = "";

  // Jika pernah pakai localStorage, hapus juga:
  // localStorage.removeItem('DISC_ANSWERS');

  renderDISCQuestion();
}

function renderDISCQuestion() {
  const soal = tests.DISC.questions;
  const idx = appState.currentQuestion;

  // Validasi index dan data soal
  if (!Array.isArray(soal) || soal.length === 0) {
    document.getElementById('app').innerHTML = 'Soal DISC belum dimuat!';
    return;
  }
  if (idx >= soal.length) {
    showDISCResult();
    return;
  }

  const question = soal[idx];
  if (!appState.tempDISC) appState.tempDISC = {};
  const progress = calculateProgress();

  const optionsHTML = question.options.map((option, index) => {
    const isP = appState.tempDISC.p === index;
    const isK = appState.tempDISC.k === index;
    let boxClass = '';
    if (isP) boxClass = ' box-p';
    else if (isK) boxClass = ' box-k';
    return `
      <div class="disc-option${boxClass}" data-index="${index}">
        <label class="p-label${isP ? ' selected-p' : ''}" onclick="selectDISCAnswer('p', ${index})">P</label>
        <label class="k-label${isK ? ' selected-k' : ''}" onclick="selectDISCAnswer('k', ${index})">K</label>
        <span class="option-text${isP ? ' option-p' : ''}${isK ? ' option-k' : ''}">${option.text}</span>
      </div>
    `;
  }).join('');

  // Error tampil di bawah opsi
  const errorHTML = appState.discError ? `
    <div class="disc-error" style="color: #c00; margin-top: 18px; text-align:center;">
      ${appState.discError}
    </div>
  ` : '';

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="progress-container">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <div class="question-container">
        <p class="question-text">${question.text}</p>
        <div class="disc-grid">
          ${optionsHTML}
        </div>
        ${errorHTML}
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <button class="btn" onclick="nextDISCQuestion()">
          ${appState.currentQuestion < tests.DISC.questions.length - 1 ? 'Lanjut' : 'Selesai'}
        </button>
        <button class="btn btn-outline" onclick="confirmCancelTest()">
          Batalkan Tes
        </button>
      </div>
    </div>
  `;
}

function selectDISCAnswer(type, index) {
  if (!appState.tempDISC) appState.tempDISC = {};
  if (type === 'p') {
    if (appState.tempDISC.k === index) appState.tempDISC.k = undefined;
    appState.tempDISC.p = index;
  } else if (type === 'k') {
    if (appState.tempDISC.p === index) appState.tempDISC.p = undefined;
    appState.tempDISC.k = index;
  }
  renderDISCQuestion();
}

function nextDISCQuestion() {
  const temp = appState.tempDISC || {};
  appState.discError = "";

  if (typeof temp.p !== 'number' || typeof temp.k !== 'number') {
    appState.discError = 'Harap pilih satu opsi untuk P (Paling) dan satu opsi untuk K (Kurang)!';
    renderDISCQuestion();
    return;
  }
  if (temp.p === temp.k) {
    appState.discError = 'P dan K tidak boleh di opsi yang sama!';
    renderDISCQuestion();
    return;
  }

  const question = tests.DISC.questions[appState.currentQuestion];
  appState.answers.DISC.push({
    id: question.id,
    p: temp.p,
    k: temp.k,
    pText: question.options[temp.p].text,
    kText: question.options[temp.k].text
  });
  appState.currentQuestion++;
  appState.tempDISC = {};
  appState.discError = "";

  // Selesai: tampilkan ucapan terima kasih, lalu auto ke Home (hasil tidak muncul!)
  if (appState.currentQuestion >= tests.DISC.questions.length) {
    appState.completed.DISC = true;
    showThankYouAndHomeDISC(); // <-- fungsi ucapan & redirect home
  } else {
    renderDISCQuestion();
  }
}
function showThankYouAndHomeDISC() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="max-width:480px;margin:44px auto 0 auto;padding:34px 30px 40px 30px;border-radius:17px;box-shadow:0 6px 28px #9992;text-align:center;">
      <div style="font-size:2.7em;margin-bottom:18px;">🎉</div>
      <h2 style="margin-bottom:16px;">Terima kasih telah mengerjakan Tes DISC!</h2>
      <div style="font-size:1.12em;color:#155;">
        Jawaban Anda berhasil direkam.<br>
        Silakan lanjut ke tes berikutnya.
      </div>
      <button class="btn" style="margin-top:36px;min-width:160px;" onclick="renderHome()">
        Kembali ke Beranda
      </button>
    </div>
  `;

  // Otomatis ke Home setelah 3 detik
  setTimeout(renderHome, 3000);
}

// ========== FUNGSI HITUNG DISC DENGAN CEGAH DATA SISA ==========
function countDISC(answers, questions) {
  const countP = { D: 0, I: 0, S: 0, C: 0, '*': 0 };
  const countK = { D: 0, I: 0, S: 0, C: 0, '*': 0 };
  // Loop hanya sesuai jumlah soal!
  for (let i = 0; i < questions.length; i++) {
    const ans = answers[i];
    const q = questions[i];
    if (!ans || !q) continue;
    const pKey = q.options[ans.p]?.P;
    const kKey = q.options[ans.k]?.K;
    if (countP.hasOwnProperty(pKey)) countP[pKey]++;
    if (countK.hasOwnProperty(kKey)) countK[kKey]++;
  }
  const change = {};
  ['D', 'I', 'S', 'C', '*'].forEach(k => {
    change[k] = (countP[k] || 0) - (countK[k] || 0);
  });
  return { most: countP, least: countK, change };
}


// ====================== CLASSIC GRAPH PIXEL ======================
const classicGraph = [
  { type: 'most', blockData: [
      { label: 4, pixel: [20, 100], values: {
        D: [{val:20, pixel:36},{val:16, pixel:44},{val:15, pixel:52},{val:14, pixel:78},{val:13, pixel:86}],
        I: [{val:17, pixel:36},{val:10, pixel:44},{val:8, pixel:63},{val:7, pixel:78}],
        S: [{val:19, pixel:36},{val:13, pixel:52},{val:11, pixel:68},{val:10, pixel:84}],
        C: [{val:14, pixel:36},{val:10, pixel:52},{val:9, pixel:62},{val:8, pixel:70},{val:7, pixel:78}]
      }},
      { label: 3, pixel: [100, 200], values: {
        D: [{val:12, pixel:110},{val:11, pixel:118},{val:10, pixel:126},{val:9, pixel:156},{val:8, pixel:172},{val:7, pixel:180}],
        I: [{val:6, pixel:118},{val:5, pixel:126},{val:4, pixel:172}],
        S: [{val:9, pixel:110},{val:8, pixel:126},{val:7, pixel:134},{val:6, pixel:172},{val:5, pixel:180}],
        C: [{val:6, pixel:126},{val:5, pixel:156},{val:4, pixel:180}]
      }},
      { label: 2, pixel: [200, 300], values: {
        D: [{val:6, pixel:208},{val:5, pixel:230},{val:4, pixel:238},{val:3, pixel:260}],
        I: [{val:3, pixel:230},{val:2, pixel:260}],
        S: [{val:4, pixel:215},{val:3, pixel:235},{val:2, pixel:290}],
        C: [{val:3, pixel:215},{val:2, pixel:260}]
      }},
      { label: 1, pixel: [300, 400], values: {
        D: [{val:2, pixel:308},{val:1, pixel:340},{val:0, pixel:360}],
        I: [{val:1, pixel:325},{val:0, pixel:351}],
        S: [{val:1, pixel:315},{val:0, pixel:323}],
        C: [{val:1, pixel:325},{val:0, pixel:351}]
      }}
  ]},
  { type: 'least', blockData: [
      { label: 4, pixel: [20, 100], values: {
        D: [{val:0, pixel:36},{val:1, pixel:70},{val:2, pixel:96}],
        I: [{val:0, pixel:44},{val:1, pixel:64}],
        S: [{val:0, pixel:36},{val:1, pixel:52},{val:2, pixel:64}],
        C: [{val:0, pixel:36},{val:1, pixel:52},{val:2, pixel:70}]
      }},
      { label: 3, pixel: [100, 200], values: {
        D: [{val:3, pixel:134},{val:4, pixel:172},{val:5, pixel:199}],
        I: [{val:2, pixel:110},{val:3, pixel:134},{val:4, pixel:172}],
        S: [{val:3, pixel:110},{val:4, pixel:134},{val:5, pixel:164},{val:6, pixel:180}],
        C: [{val:3, pixel:110},{val:4, pixel:134},{val:5, pixel:164},{val:6, pixel:199}]
      }},
      { label: 2, pixel: [200, 300], values: {
        D: [{val:6, pixel:210},{val:7, pixel:230},{val:8, pixel:238},{val:9, pixel:270},{val:10, pixel:278},{val:11, pixel:286}],
        I: [{val:5, pixel:210},{val:6, pixel:255},{val:7, pixel:286}],
        S: [{val:7, pixel:218},{val:8, pixel:238},{val:9, pixel:278}],
        C: [{val:7, pixel:210},{val:9, pixel:270},{val:10, pixel:286}]
      }},
      { label: 1, pixel: [300, 400], values: {
        D: [{val:12, pixel:315},{val:13, pixel:340},{val:14, pixel:348},{val:15, pixel:358},{val:16, pixel:368},{val:18, pixel:378},{val:21, pixel:388}],
        I: [{val:8, pixel:315},{val:9, pixel:340},{val:10, pixel:358},{val:15, pixel:373},{val:19, pixel:388}],
        S: [{val:10, pixel:315},{val:11, pixel:327},{val:12, pixel:340},{val:13, pixel:358},{val:18, pixel:373},{val:19, pixel:388}],
        C: [{val:11, pixel:315},{val:12, pixel:348},{val:13, pixel:378},{val:15, pixel:388}]
      }}
  ]},
  { type: 'change', blockData: [
      { label: 4, pixel: [20, 100], values: {
        D: [{val:20, pixel:36},{val:16, pixel:44},{val:15, pixel:52},{val:14, pixel:60},{val:13, pixel:68},{val:12, pixel:76},{val:10, pixel:84}],
        I: [{val:17, pixel:36},{val:15, pixel:44},{val:8, pixel:60},{val:7, pixel:68},{val:6, pixel:76},{val:5, pixel:84},{val:4, pixel:92}],
        S: [{val:19, pixel:36},{val:15, pixel:44},{val:10, pixel:60},{val:9, pixel:68},{val:8, pixel:76},{val:7, pixel:84}],
        C: [{val:14, pixel:36},{val:7, pixel:52},{val:6, pixel:60},{val:4, pixel:68},{val:3, pixel:84},{val:2, pixel:92}]
      }},
      { label: 3, pixel: [100, 200], values: {
        D: [{val:9, pixel:110},{val:8, pixel:118},{val:7, pixel:126},{val:5, pixel:164},{val:3, pixel:172},{val:1, pixel:199}],
        I: [{val:3, pixel:126},{val:2, pixel:144},{val:1, pixel:164},{val:0, pixel:190}],
        S: [{val:5, pixel:110},{val:4, pixel:118},{val:3, pixel:126},{val:2, pixel:144},{val:1, pixel:164},{val:0, pixel:172}],
        C: [{val:1, pixel:118},{val:0, pixel:144},{val:-1, pixel:172},{val:-2, pixel:190}]
      }},
      { label: 2, pixel: [200, 300], values: {
        D: [{val:0, pixel:210},{val:-2, pixel:218},{val:-3, pixel:226},{val:-4, pixel:234},{val:-6, pixel:270},{val:-7, pixel:278},{val:-9, pixel:286}],
        I: [{val:-1, pixel:210},{val:-2, pixel:234},{val:-3, pixel:252},{val:-4, pixel:278},{val:-5, pixel:286}],
        S: [{val:-1, pixel:210},{val:-2, pixel:218},{val:-3, pixel:226},{val:-4, pixel:234},{val:-5, pixel:252},{val:-6, pixel:278},{val:-7, pixel:286}],
        C: [{val:-3, pixel:210},{val:-4, pixel:218},{val:-5, pixel:270},{val:-6, pixel:278},{val:-7, pixel:286}]
      }},
      { label: 1, pixel: [300, 400], values: {
        D: [{val:-10, pixel:316},{val:-11, pixel:340},{val:-12, pixel:348},{val:-15, pixel:356},{val:-20, pixel:380},{val:-21, pixel:388}],
        I: [{val:-6, pixel:316},{val:-7, pixel:324},{val:-8, pixel:348},{val:-9, pixel:356},{val:-10, pixel:370},{val:-19, pixel:388}],
        S: [{val:-8, pixel:316},{val:-10, pixel:340},{val:-12, pixel:370},{val:-19, pixel:388}],
        C: [{val:-8, pixel:316},{val:-9, pixel:324},{val:-10, pixel:348},{val:-13, pixel:356},{val:-15, pixel:388}]
      }}
  ]}
];

// ====================== GET PIXEL Y ======================
function getPixelY(type, axis, val) {
  const g = classicGraph.find(e => e.type === type);
  if (!g) return 400;
  // Cari block dengan rentang val yang pas
  let chosenArr = null;
  for (let blk of g.blockData) {
    const arr = blk.values[axis] || [];
    if (!arr.length) continue;
    if (val >= arr[arr.length-1].val && val <= arr[0].val) {
      chosenArr = arr; break;
    }
    // Tangani kasus urutan kecil-ke-besar
    if (val >= arr[0].val && val <= arr[arr.length-1].val) {
      chosenArr = arr; break;
    }
    // fallback: jika val < min, ambil ini, biar tidak lompat blok
    if (val < arr[arr.length-1].val) chosenArr = arr;
    // fallback: jika val > max, ambil blok pertama
    if (val > arr[0].val && !chosenArr) chosenArr = arr;
  }
  const arr = chosenArr || (g.blockData[0].values[axis] || []);
  // Cari exact, atau interpolasi linear antar titik
  for (let i = 0; i < arr.length; i++) {
    if (val === arr[i].val) return arr[i].pixel;
    if (val > arr[i].val && i > 0) {
      let prev = arr[i-1], next = arr[i];
      let prop = (val - prev.val) / (next.val - prev.val);
      return prev.pixel + prop * (next.pixel - prev.pixel);
    }
  }
  // lebih kecil/lebih besar dari semua (fallback): ambil paling dekat
  if (arr.length && val < arr[arr.length-1].val) return arr[arr.length-1].pixel;
  if (arr.length && val > arr[0].val) return arr[0].pixel;
  return 400;
}

// ==================== ANALISA POLA GRAFIK DISC ====================
// ================= FUNGSI ANALISA 2 DOMINAN BERDASARKAN VISUAL GRAFIK =================
function analisa2DominanDISC(D, I, S, C, tipe, getPixelY) {
  // Data array, urutkan dari paling tinggi ke rendah
 const arr = [
  { key: "D", val: D, y: getPixelY(tipe, "D", D) },
  { key: "I", val: I, y: getPixelY(tipe, "I", I) },
  { key: "S", val: S, y: getPixelY(tipe, "S", S) },
  { key: "C", val: C, y: getPixelY(tipe, "C", C) }
].sort((a, b) => a.y - b.y); // y kecil = dominan, urutkan naik

const dominan = [arr[0].key, arr[1].key]; // 2 dominan utama sesuai urutan grafik
const ranking = arr.map(x => x.key);      // Urutan faktor dari paling atas ke bawah

  // Penjelasan mendalam tiap tipe (lebih detail)
const desk = {
  D: `<b>D (Dominance): Pemimpin Tegas, Proaktif, dan Visioner</b><br>
    Tipe D adalah individu yang penuh energi, selalu bergerak cepat, dan tidak ragu memimpin. Sangat cocok untuk peran yang membutuhkan pengambilan keputusan cepat, penyelesaian masalah, serta keberanian menanggung risiko di bawah tekanan. 
    <ul>
      <li><b>Kekuatan:</b>
        <ul>
          <li>Berani mengambil inisiatif dalam situasi krisis atau masalah mendesak</li>
          <li>Fokus pada target & hasil akhir</li>
          <li>Pemimpin alami: mengarahkan, mengatur, menantang tim untuk mencapai tujuan besar</li>
          <li>Mampu bekerja di bawah tekanan, tegas, tahan banting, tidak mudah menyerah</li>
          <li>Efisien mengeksekusi tugas-tugas besar maupun perbaikan proses kerja</li>
          <li>Mampu mendorong orang lain bergerak lebih cepat dan keluar dari zona nyaman</li>
        </ul>
      </li>
      <li><b>Kelemahan:</b>
        <ul>
          <li>Kadang kurang sabar pada proses yang terlalu lambat atau detail administratif</li>
          <li>Cenderung terlalu dominan, kadang terkesan memaksakan kehendak sendiri</li>
          <li>Mengabaikan perasaan tim atau terlalu mengutamakan hasil di atas hubungan</li>
          <li>Kurang sensitif pada nuansa sosial, bisa mengesampingkan proses kolaborasi</li>
        </ul>
      </li>
      <li><b>Area Pengembangan:</b>
        <ul>
          <li>Mengasah kesabaran dalam proses kerja detail dan administrasi</li>
          <li>Belajar mendengarkan dan mengakomodasi ide anggota tim</li>
          <li>Mengembangkan empati & memahami rekan yang lebih pendiam atau berhati-hati</li>
          <li>Mengurangi reaktifitas saat ada perbedaan pandangan</li>
        </ul>
      </li>
      <li><b>Tantangan:</b>
        <ul>
          <li>Mengelola emosi dan ego saat tidak sejalan dengan keputusan tim/pimpinan</li>
          <li>Merangkul anggota tim yang kurang ekspresif</li>
          <li>Menahan diri agar tidak memaksakan kehendak pribadi di atas kebutuhan bersama</li>
          <li>Beradaptasi dengan budaya kerja baru yang lebih kolaboratif</li>
        </ul>
      </li>
      <li><b>Cocok untuk:</b>
        <ul>
          <li><b>Sekolah:</b> Guru Mapel, Guru Vokasi, Guru Olahraga, Admin Sekolah, Koordinator Kegiatan, Ketua Tim Proyek, Wakil Kepala Sekolah</li>
          <li><b>Kebun Tebu:</b> Supervisor Lapangan, Mandor, Pengawas Proyek, Kepala Unit Produksi, Koordinator Operasional Kebun</li>
        </ul>
      </li>
    </ul>`,

  I: `<b>I (Influence): Komunikator Positif, Inspiratif, dan Penggerak Suasana</b><br>
    Tipe I sangat sosial, mudah membangun relasi, membawa energi positif, dan menjadi sumber inspirasi di lingkungan kerja. Cocok untuk posisi yang membutuhkan interaksi luas, membangun semangat, dan menjadi penghubung antarbagian.
    <ul>
      <li><b>Kekuatan:</b>
        <ul>
          <li>Kemampuan komunikasi, public speaking, dan persuasi sangat baik</li>
          <li>Mudah membangun jejaring dan memperluas relasi</li>
          <li>Membawa suasana positif, memotivasi, dan meningkatkan semangat tim</li>
          <li>Kreatif, inovatif, cepat beradaptasi pada perubahan situasi</li>
          <li>Sering menjadi penggerak ide-ide baru atau event di lingkungan kerja</li>
          <li>Ramah, supel, mudah dipercaya banyak pihak</li>
        </ul>
      </li>
      <li><b>Kelemahan:</b>
        <ul>
          <li>Mudah terdistraksi isu baru, kurang fokus pada detail</li>
          <li>Kurang konsisten dalam administrasi dan penyelesaian tugas sampai tuntas</li>
          <li>Bisa terlalu mengandalkan mood dan apresiasi orang lain</li>
          <li>Kadangkala sulit menjaga kerahasiaan jika terlalu antusias bercerita</li>
        </ul>
      </li>
      <li><b>Area Pengembangan:</b>
        <ul>
          <li>Melatih kedisiplinan dan konsistensi dalam pekerjaan rutin</li>
          <li>Membuat prioritas, menjaga fokus sampai tuntas</li>
          <li>Mengelola waktu di tengah banyak aktivitas atau event</li>
          <li>Meningkatkan dokumentasi & administrasi kerja</li>
        </ul>
      </li>
      <li><b>Tantangan:</b>
        <ul>
          <li>Menjaga performa di tengah agenda padat</li>
          <li>Mengendalikan ekspektasi & tetap membumi meski sering menjadi pusat perhatian</li>
          <li>Menahan diri agar tidak hanya fokus pada yang menyenangkan</li>
        </ul>
      </li>
      <li><b>Cocok untuk:</b>
        <ul>
          <li><b>Sekolah:</b> Guru Mapel, Guru TK, Guru SD, Guru Olahraga, Pembina Ekstrakurikuler, MC Event, Staf Kesiswaan</li>
          <li><b>Kebun Tebu:</b> Penyuluh Lapangan, Staf Humas, Fasilitator Karyawan, Tim CSR/Promosi, Trainer Safety</li>
        </ul>
      </li>
    </ul>`,

  S: `<b>S (Steadiness): Penjaga Stabilitas, Pendukung Setia, Kolaborator Andal</b><br>
    Tipe S sangat nyaman dengan rutinitas, dapat diandalkan menjaga konsistensi mutu, serta menjadi penyeimbang dalam kelompok kerja. Cocok untuk lingkungan kerja yang membutuhkan keandalan, loyalitas, dan kestabilan proses.
    <ul>
      <li><b>Kekuatan:</b>
        <ul>
          <li>Sabar, telaten, konsisten dalam mengerjakan tugas</li>
          <li>Dapat diandalkan sebagai tulang punggung tim</li>
          <li>Loyal pada institusi & aturan, menjaga harmoni kelompok</li>
          <li>Mampu memediasi konflik kecil & menciptakan suasana nyaman</li>
          <li>Setia pada komitmen & tidak mudah menyerah dalam menghadapi tantangan jangka panjang</li>
        </ul>
      </li>
      <li><b>Kelemahan:</b>
        <ul>
          <li>Kurang berani mengambil inisiatif besar atau perubahan signifikan</li>
          <li>Lamban dalam mengambil keputusan kritis</li>
          <li>Menunda aksi saat ada konflik, terlalu kompromistis</li>
          <li>Butuh waktu lebih lama untuk beradaptasi dengan sistem baru</li>
        </ul>
      </li>
      <li><b>Area Pengembangan:</b>
        <ul>
          <li>Lebih berani tampil mengambil peran kepemimpinan</li>
          <li>Mengasah keberanian menyampaikan ide di forum</li>
          <li>Beradaptasi lebih cepat dengan perubahan mendadak</li>
          <li>Meningkatkan kepercayaan diri dan asertivitas</li>
        </ul>
      </li>
      <li><b>Tantangan:</b>
        <ul>
          <li>Berani keluar dari zona nyaman saat dibutuhkan</li>
          <li>Menjadi penggerak inovasi tanpa meninggalkan kestabilan tim</li>
          <li>Mengelola stress ketika tuntutan perubahan sangat tinggi</li>
        </ul>
      </li>
      <li><b>Cocok untuk:</b>
        <ul>
          <li><b>Sekolah:</b> Guru SD, Guru TK, Guru Vokasi, Admin Sekolah, Staf Akademik, Guru Pendamping Kelas, Staf Perpustakaan</li>
          <li><b>Kebun Tebu:</b> Administrasi Kebun, Bagian Pembukuan, Staf Laporan, Logistik Kebun, Asisten SDM Lapangan</li>
        </ul>
      </li>
    </ul>`,

  C: `<b>C (Compliance): Spesialis Presisi, Pengawas Kualitas, dan Penjaga SOP</b><br>
    Tipe C kuat dalam analisis, pencatatan, dan menjaga kualitas kerja melalui ketelitian dan kepatuhan pada aturan. Cocok untuk pekerjaan yang menuntut akurasi tinggi, validasi data, dan standar mutu.
    <ul>
      <li><b>Kekuatan:</b>
        <ul>
          <li>Sangat teliti, cermat pada detail kecil, sistematis</li>
          <li>Mampu menyusun dokumentasi, laporan, atau SOP secara rapi</li>
          <li>Konsisten menjaga standar kerja & hasil akhir</li>
          <li>Cepat menemukan kesalahan atau ketidaksesuaian dalam proses</li>
          <li>Mahir melakukan kontrol kualitas & evaluasi hasil kerja tim</li>
        </ul>
      </li>
      <li><b>Kelemahan:</b>
        <ul>
          <li>Bisa terlalu perfeksionis & lambat mengambil keputusan ketika banyak data belum pasti</li>
          <li>Kurang fleksibel terhadap perubahan mendadak</li>
          <li>Bisa terlalu kaku atau kritis pada ide baru yang belum terbukti</li>
          <li>Cenderung enggan mengambil risiko tanpa persiapan matang</li>
        </ul>
      </li>
      <li><b>Area Pengembangan:</b>
        <ul>
          <li>Lebih fleksibel dan terbuka terhadap inovasi</li>
          <li>Meningkatkan komunikasi interpersonal, aktif kolaborasi lintas tim</li>
          <li>Belajar mengambil keputusan cepat di bawah tekanan</li>
          <li>Memberi ruang untuk diskusi informal, tidak hanya fokus data</li>
        </ul>
      </li>
      <li><b>Tantangan:</b>
        <ul>
          <li>Mengelola stress saat audit/deadline</li>
          <li>Menghadapi SOP/kebijakan baru dari manajemen</li>
          <li>Menyesuaikan diri saat tim menginginkan perubahan cepat</li>
        </ul>
      </li>
      <li><b>Cocok untuk:</b>
        <ul>
          <li><b>Sekolah:</b> Guru Mapel Eksakta, Guru Vokasi, Admin Sekolah, Staf Laboran, Staf Teknisi, Guru Matematika, Guru IPA, QA Proses Akademik</li>
          <li><b>Kebun Tebu:</b> Staf Data, Quality Assurance, Bagian Administrasi, Pengendali Mutu Lapangan, Auditor Internal, Teknisi Laboratorium, Admin Laporan Kebun</li>
        </ul>
      </li>
    </ul>`
};


  // Semua kombinasi 2 huruf (12 total)
function gabunganDeskripsi(a, b) {
  const key = [a, b].join('');
  const nama = namaPanggilan();
  const kombinasi = {
    "DI": `<b>Gabungan D-I: Pemimpin Karismatik & Dinamis</b><br>
      ${nama} pribadi tegas, energik, dan selalu jadi motor penggerak tim. Cocok untuk situasi yang butuh keputusan cepat, pengaruh luas, dan aksi nyata.<ul>
        <li><b>Kekuatan:</b>
          Visioner, pengambil inisiatif, inspirator tim, mampu membangun kepercayaan rekan kerja, tahan tekanan kerja, cepat memotivasi orang lain, komunikator aktif, suka tantangan, dan sangat adaptif saat perubahan.</li>
        <li><b>Area Pengembangan:</b>
          Mengasah kesabaran dan fokus pada detail administratif, belajar mendengar pendapat anggota tim, mengembangkan empati untuk rekan kerja yang pendiam, mengurangi kecenderungan terlalu mendominasi, dan menjaga konsistensi tindak lanjut.</li>
        <li><b>Kelemahan:</b>
          Terkadang kurang sabar, ambisius tanpa memperhitungkan situasi, melewatkan detail penting, cenderung memaksakan kehendak, mudah kecewa jika ide tidak didukung tim.</li>
        <li><b>Tantangan:</b>
          Mengelola emosi dan ego saat tim tidak sejalan, merangkul anggota tim yang pasif, serta menahan diri agar tidak memaksakan kehendak sendiri saat rapat besar.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru Mapel</b>, <b>Guru Vokasi</b>, <b>Guru Olahraga</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>, 
          <b>Manajer Kebun</b>, <b>Supervisor Produksi</b>, <b>Asisten Kepala Pabrik</b>, <b>Koordinator Lapangan</b>
        </li>
      </ul>`,

    "ID": `<b>Gabungan I-D: Influencer Berani & Solutif</b><br>
      ${nama} sangat komunikatif, ramah, dan suka memimpin lewat persuasi. Sumber inspirasi di lingkungan kerja.<ul>
        <li><b>Kekuatan:</b>
          Kemampuan public speaking, membangun jejaring luas, membangkitkan semangat kelompok, adaptif terhadap perubahan, komunikatif dengan berbagai kalangan, kreatif dalam mencari solusi baru, cepat merespon krisis.</li>
        <li><b>Area Pengembangan:</b>
          Melatih konsistensi kerja, fokus pada administrasi, menyelesaikan pekerjaan sampai tuntas, memperbaiki prioritas dan manajemen waktu, tidak mudah terdistraksi isu baru.</li>
        <li><b>Kelemahan:</b>
          Mudah bosan dengan rutinitas, kurang teliti administrasi, sering menunda detail kecil, bisa terlalu spontan dalam mengambil keputusan, kadang mengabaikan laporan tertulis.</li>
        <li><b>Tantangan:</b>
          Menjaga disiplin jadwal, menjaga performa di tengah banyak agenda, tetap membumi meski sering jadi spotlight, serta menahan keinginan multitasking yang berlebihan.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru Mapel</b>, <b>Guru Vokasi</b>, <b>Guru Olahraga</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>, 
          <b>Public Relations Officer</b>, <b>Supervisor Personalia</b>, <b>Training & Development Officer</b>, <b>Field Promotion Coordinator</b>
        </li>
      </ul>`,

    "DS": `<b>Gabungan D-S: Eksekutor Andal & Penjaga Kestabilan</b><br>
      ${nama} disiplin, bertanggung jawab, jadi tulang punggung operasional dan penjaga mutu proses.<ul>
        <li><b>Kekuatan:</b>
          Konsistensi tinggi, loyal, telaten, mampu mengelola tim kecil, disiplin waktu, eksekusi rencana dengan teliti, sangat dapat diandalkan untuk rutinitas, tegas pada aturan kerja.</li>
        <li><b>Area Pengembangan:</b>
          Lebih terbuka dengan perubahan, meningkatkan fleksibilitas, berani improvisasi jika situasi mendadak, dan memperbaiki komunikasi dua arah.</li>
        <li><b>Kelemahan:</b>
          Kaku terhadap aturan, sulit menerima perubahan mendadak, pasif jika tak ada arahan jelas, kadang terjebak pada kebiasaan lama.</li>
        <li><b>Tantangan:</b>
          Adaptasi pada kebijakan baru, menjaga motivasi tim saat tekanan tinggi, menerima perubahan struktur kerja, serta menghindari burnout pada rutinitas tinggi.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru SD</b>, <b>Guru Mapel</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>,
          <b>Supervisor Produksi Pabrik Gula</b>, <b>Mandor Lapangan</b>, <b>Staf Operasional Kebun</b>
        </li>
      </ul>`,

    "SD": `<b>Gabungan S-D: Stabilisator Hasil & Penyeimbang</b><br>
      ${nama} sabar, stabil, dan siap memimpin di saat krusial. Penjaga harmoni kelompok dan penengah konflik.<ul>
        <li><b>Kekuatan:</b>
          Loyalitas tinggi, menjaga harmoni kelompok, penengah saat konflik, mampu menyelesaikan masalah secara sistematis, bertanggung jawab pada tugas besar, dipercaya sebagai pendamping/mentor junior.</li>
        <li><b>Area Pengembangan:</b>
          Lebih proaktif dan ambil inisiatif, adaptasi cepat pada kebijakan baru, percaya diri bicara di forum, serta belajar asertif di depan publik.</li>
        <li><b>Kelemahan:</b>
          Kurang inisiatif inovasi, terlalu hati-hati, lambat ambil keputusan penting, kadang kurang vokal di tim.</li>
        <li><b>Tantangan:</b>
          Berani tampil di forum besar, keluar zona nyaman, memperluas pengaruh di luar rutinitas.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru SD</b>, <b>Guru TK</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>,
          <b>Supervisor HRD Kebun</b>, <b>Staf Administrasi Pabrik</b>
        </li>
      </ul>`,

    "DC": `<b>Gabungan D-C: Pemimpin Teknis & Logis</b><br>
      ${nama} kuat dalam berpikir sistematis, utamakan kualitas, dan mampu keputusan berbasis data.<ul>
        <li><b>Kekuatan:</b>
          Objektif, analitis, teliti, cepat pahami sistem baru, efisien, tegas pada SOP, mahir menyusun rencana kerja rinci, menjaga standar mutu, dan mampu mengawasi banyak proyek teknis sekaligus.</li>
        <li><b>Area Pengembangan:</b>
          Mengasah empati, meningkatkan komunikasi tim lintas bagian, memberi ruang pada ide baru dari staf, serta belajar menghadapi dinamika sosial kerja.</li>
        <li><b>Kelemahan:</b>
          Kurang peka emosi tim, bisa terlalu menuntut hasil sempurna, kadang mengabaikan suasana sosial, mudah lelah jika tim kurang terstruktur.</li>
        <li><b>Tantangan:</b>
          Menjembatani kebutuhan psikologis tim, seimbangkan target dengan relasi, belajar menghargai variasi gaya kerja.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru Mapel</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>,
          <b>Supervisor Teknik Mesin</b>, <b>Asisten Manajer QC Pabrik</b>, <b>Staff Pengembangan Sistem Perkebunan</b>
        </li>
      </ul>`,

    "CD": `<b>Gabungan C-D: Perfeksionis Ambisius & Penggerak Standar</b><br>
      ${nama} kritis, teliti, ingin hasil terbaik, gigih meningkatkan mutu, dan menjadi penggerak perubahan lewat standar tinggi.<ul>
        <li><b>Kekuatan:</b>
          Teliti, visioner, gigih mengejar target, suka inovasi, sangat memperhatikan kualitas, mampu analisis data, berani mengkritisi sistem lama, disiplin tinggi.</li>
        <li><b>Area Pengembangan:</b>
          Fleksibilitas saat perubahan, empati dalam komunikasi, terbuka ide baru, belajar menerima keberagaman cara kerja dan hasil yang tidak selalu sempurna.</li>
        <li><b>Kelemahan:</b>
          Mudah stres jika hasil tidak sesuai ekspektasi, sulit menerima kesalahan kecil, bisa terlalu kaku dengan SOP, suka membandingkan hasil tim lain.</li>
        <li><b>Tantangan:</b>
          Mengelola tekanan deadline dan perubahan mendadak, menjaga hubungan positif dengan rekan kerja.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru Mapel</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>,
          <b>Auditor QC Kebun</b>, <b>Penjamin Mutu Produksi</b>, <b>Pengembang SOP</b>
        </li>
      </ul>`,

    "IS": `<b>Gabungan I-S: Relator Empatik & Guru Humanis</b><br>
      ${nama} penghubung antarindividu, sabar, dan empatik, selalu membangun suasana nyaman.<ul>
        <li><b>Kekuatan:</b>
          Empati tinggi, membangun hubungan positif, telaten, mudah dipercaya, sabar, menjaga harmoni kelompok, penyemangat siswa dan rekan kerja, sangat diterima lingkungan baru.</li>
        <li><b>Area Pengembangan:</b>
          Ketegasan saat interaksi, menjaga batas profesional, lebih vokal dalam tim, meningkatkan kemampuan menegakkan aturan dengan tetap empatik.</li>
        <li><b>Kelemahan:</b>
          Terlalu mengalah, sulit menegakkan disiplin, mudah lelah jika beban emosi tinggi, kadang menghindari konflik meski perlu dihadapi.</li>
        <li><b>Tantangan:</b>
          Menyeimbangkan dukungan dan ketegasan, belajar berani menegur, menjaga energi saat menghadapi banyak permintaan.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru SD</b>, <b>Guru TK</b>, <b>Guru Olahraga</b>, <b>Admin Sekolah</b>,
          <b>Staf Pelatihan Kebun</b>, <b>HRD Kebun</b>, <b>Pendamping Karyawan Baru</b>
        </li>
      </ul>`,

    "SI": `<b>Gabungan S-I: Penengah Ramah & Fasilitator Komunitas</b><br>
      ${nama} menciptakan suasana harmonis dan mudah diterima banyak kalangan.<ul>
        <li><b>Kekuatan:</b>
          Loyalitas, suasana kekeluargaan, penyejuk tim, mampu menyatukan karakter berbeda, aktif dalam komunitas, mudah membangun rasa aman di kelompok baru.</li>
        <li><b>Area Pengembangan:</b>
          Inisiatif tampil, berani ambil keputusan strategis, lebih sering sampaikan ide di forum besar, tingkatkan kepercayaan diri dalam memimpin kelompok kecil.</li>
        <li><b>Kelemahan:</b>
          Kurang berani mengambil posisi tidak populer, menahan ide karena takut konflik, terlalu mengutamakan kenyamanan dari pada perubahan.</li>
        <li><b>Tantangan:</b>
          Berani ambil langkah saat terjadi konflik, menjaga keseimbangan harmoni dan kebutuhan inovasi tim.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru SD</b>, <b>Guru TK</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>,
          <b>Staf HRD Kebun</b>, <b>Pendamping Karyawan Baru</b>, <b>Staf Kesejahteraan Kebun</b>
        </li>
      </ul>`,

    "IC": `<b>Gabungan I-C: Komunikator Analitis & Inovator Edukasi</b><br>
      ${nama} kreatif, logis, mampu menyampaikan materi kompleks dengan cara mudah dipahami.<ul>
        <li><b>Kekuatan:</b>
          Kreatif, presentasi data bagus, cepat adopsi teknologi, komunikatif di forum ilmiah, mampu menyederhanakan konsep sulit, senang sharing pengetahuan baru.</li>
        <li><b>Area Pengembangan:</b>
          Menentukan prioritas kerja, menjaga konsistensi proyek, disiplin administrasi, mengelola waktu agar tidak habis di banyak proyek sekaligus.</li>
        <li><b>Kelemahan:</b>
          Mudah terdistraksi isu baru, suka multitasking tapi kurang dokumentasi hasil, kadang menunda tugas kurang menarik.</li>
        <li><b>Tantangan:</b>
          Mengelola waktu proyek, pastikan semua ide terwujud nyata, belajar menolak proyek jika sudah overload.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru Mapel</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>,
          <b>Staf Pelatihan & Komunikasi Kebun</b>, <b>Trainer Produksi</b>, <b>Penyuluh Kebun</b>
        </li>
      </ul>`,

    "CI": `<b>Gabungan C-I: Peneliti Inovatif & Pengembang Kurikulum</b><br>
      ${nama} teliti, ingin tahu, suka mencari metode baru, dan kritis pada kebiasaan lama.<ul>
        <li><b>Kekuatan:</b>
          Analisis mendalam, inovatif, teliti riset, suka memperbaiki metode kerja, tertarik kembangkan kurikulum/standar baru, selalu mencari validasi data sebelum melangkah.</li>
        <li><b>Area Pengembangan:</b>
          Kolaborasi tim, terbuka kritik, menerima keberagaman pendekatan, belajar lebih luwes saat kerja kelompok lintas bidang.</li>
        <li><b>Kelemahan:</b>
          Terlalu kritis metode lama, sulit menerima perubahan tanpa data kuat, skeptis pada pola kerja spontanitas, bisa kecewa jika ide tidak diadopsi tim.</li>
        <li><b>Tantangan:</b>
          Menerima keberagaman gaya kerja, komunikasi lintas generasi, memperbaiki cara menyampaikan usulan ke manajemen.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru Mapel</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>,
          <b>Analis Laboratorium Kebun</b>, <b>Staff R&D</b>, <b>Pengembang SOP Produksi</b>
        </li>
      </ul>`,

    "SC": `<b>Gabungan S-C: Spesialis Presisi & Penjaga Kualitas</b><br>
      ${nama} konsisten, teliti, dan sangat nyaman dengan aturan serta menjaga kualitas kerja.<ul>
        <li><b>Kekuatan:</b>
          Akurasi tinggi, telaten, loyal pada SOP, menjaga detail administratif, dipercaya rekan kerja, teliti dalam audit, jadi rujukan jika ada proses yang harus standar.</li>
        <li><b>Area Pengembangan:</b>
          Proaktif, berani tampil dan bicara di forum, belajar mengelola emosi saat perubahan mendadak, lebih terbuka pada usulan efisiensi proses.</li>
        <li><b>Kelemahan:</b>
          Sulit menerima perubahan mendadak, kurang ekspresif, kadang menutup diri dari inovasi, bisa pasif jika tidak diarahkan jelas.</li>
        <li><b>Tantangan:</b>
          Mengelola tekanan administratif yang menumpuk, belajar berbagi tugas dengan tim, tidak terlalu cemas pada kesalahan kecil.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru SD</b>, <b>Guru TK</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>,
          <b>Staf Administrasi Kebun</b>, <b>Teknisi Laboratorium</b>, <b>QA Staff</b>
        </li>
      </ul>`,

    "CS": `<b>Gabungan C-S: Support Sistem Detail & Pendamping Setia</b><br>
      ${nama} suka membantu, teliti, dan menjaga kelancaran administrasi.<ul>
        <li><b>Kekuatan:</b>
          Sangat detail, telaten, dipercaya rekan, loyal, sabar membimbing, sandaran tim saat audit/inspeksi, menjaga etika kerja dan administrasi rapi.</li>
        <li><b>Area Pengembangan:</b>
          Percaya diri, mau tampil menyampaikan pendapat, ekspresif, berani ambil peran lebih besar, terbuka pada tantangan baru.</li>
        <li><b>Kelemahan:</b>
          Kadang minder, takut salah, menghindari spotlight meski mampu, kurang vokal di forum, mudah cemas dengan risiko kecil.</li>
        <li><b>Tantangan:</b>
          Mengelola tekanan administratif banyak dan deadline ketat, belajar berbagi tugas dengan tim lain, mengembangkan kemampuan presentasi hasil kerja.</li>
        <li><b>Cocok untuk:</b>
          <b>Guru SD</b>, <b>Guru TK</b>, <b>Admin Sekolah</b>, <b>Staf Teknis</b>,
          <b>Staf Administrasi Logistik Kebun</b>, <b>Petugas Pencatatan Produksi</b>, <b>Teknisi Laboratorium</b>
        </li>
      </ul>`
  };
  // fallback
  return kombinasi[key] || kombinasi[[b, a].join('')] || (desk[a] + "<br>" + desk[b]);
}


  // Analisis pola grafik (tambahkan jika perlu)
 function analisaPolaGrafik() {
  const tertinggi = arr[0].y;
  const terendah = arr[3].y;
  const jarak = tertinggi - terendah;

  // Semua faktor dengan Y sama tertinggi (1, 2, atau 3 dominan sekaligus)
  const faktorDominan = arr.filter(a => a.y === tertinggi).map(a => a.key);

  let analisa = "";

  // --- POLA DOMINASI EKSTRIM ---
  if (jarak > 200) {
    analisa += `<b>Pola Ekstrim:</b> Perbedaan sangat besar antara tipe dominan dan tipe lemah.<br>`;
    faktorDominan.forEach(f => {
      if (f === 'D') analisa += `${namaPanggilan()} sangat dominan dan cenderung memimpin secara tegas.<br>`;
      if (f === 'I') analisa += `${namaPanggilan()} sangat komunikatif, mudah memengaruhi dan menggerakkan kelompok.<br>`;
      if (f === 'S') analisa += `${namaPanggilan()} sangat stabil, selalu jadi penyeimbang dan pendukung, kadang menghindari perubahan besar.<br>`;
      if (f === 'C') analisa += `${namaPanggilan()} perfeksionis, sangat detail, kadang terlalu kaku dalam standar.<br>`;
    });
    if (arr[3].key === 'S') analisa += `${namaPanggilan()} mungkin kurang siap menghadapi konflik atau perubahan tiba-tiba.<br>`;
  }

  // --- POLA SEIMBANG ---
  if (jarak < 100) {
    analisa += `<b>Pola Seimbang:</b> Profil fleksibel, mudah beradaptasi, bisa ambil peran apa saja sesuai kebutuhan.<br>`;
    analisa += "Kekuatan: Mudah bekerja lintas tim, cocok untuk tugas rotasi.<br>";
    analisa += "Tantangan: Perlu asah ketegasan dan pengambilan keputusan saat dibutuhkan.<br>";
  }

  // --- POLA KHUSUS: DUA DOMINAN ---
  if (faktorDominan.length === 2) {
    const gab = faktorDominan.join('');

    if ((gab === 'CD') || (gab === 'DC')) {
      analisa += `<b>Pola Perfeksionis Tegas:</b> Kombinasi ketelitian dan ketegasan. Cocok jadi leader/penentu standar mutu.<br>
      Kekuatan: Disiplin tinggi, fokus hasil, sangat sistematis.<br>
      Tantangan: Kadang terlalu kaku atau perfeksionis pada tim.<br>`;
    }
    if ((gab === 'IS') || (gab === 'SI')) {
      analisa += `<b>Pola Influencer Stabil:</b> Sosial & suportif, mudah diterima siapa saja.<br>
      Kekuatan: Komunikasi positif, penenang di kelompok besar.<br>
      Tantangan: Kadang kurang asertif atau mudah mengalah.<br>`;
    }
    if ((gab === 'DS') || (gab === 'SD')) {
      analisa += `<b>Pola Stabil Tegas:</b> Kuat di rutinitas, namun siap ambil alih ketika perlu.<br>
      Kekuatan: Disiplin dan konsisten, penjaga ritme kerja tim.<br>
      Tantangan: Butuh belajar fleksibilitas dan improvisasi.<br>`;
    }
    if ((gab === 'IC') || (gab === 'CI')) {
      analisa += `<b>Pola Analitis Persuasif:</b> Kreatif, argumentatif, komunikatif, tapi logis dan kritis.<br>
      Kekuatan: Cerdas berbicara, mampu edukasi yang rumit.<br>
      Tantangan: Kadang sulit fokus satu target atau terlalu analitik untuk beberapa rekan.<br>`;
    }
    if ((gab === 'DI') || (gab === 'ID')) {
      analisa += `<b>Pola Leader Inspiratif:</b> Kombinasi kecepatan & pengaruh, cocok untuk bidang yang dinamis.<br>
      Kekuatan: Inisiatif tinggi, motivator tim, suka perubahan.<br>
      Tantangan: Kadang kurang teliti atau kurang sabar ke tim yang lambat.<br>`;
    }
    if ((gab === 'SC') || (gab === 'CS')) {
      analisa += `<b>Pola Detail Stabil:</b> Sangat presisi, rapi, pekerja keras, support sistem.<br>
      Kekuatan: Daya tahan kerja, cocok mengelola tugas administrasi & kontrol mutu.<br>
      Tantangan: Perlu lebih aktif mengemukakan ide dan adaptasi ke perubahan.<br>`;
    }
    if ((gab === 'DS') || (gab === 'SD')) {
      analisa += `<b>Pola Tekun Stabil:</b> Bisa diandalkan dalam tugas jangka panjang.<br>
      Kekuatan: Loyal, konsisten, tahan tekanan.<br>
      Tantangan: Kadang pasif inovasi, perlu dorongan keluar dari zona nyaman.<br>`;
    }
    // Tambah pola khusus lain jika dibutuhkan
  }

  // --- POLA TIGA DOMINAN ---
  if (faktorDominan.length === 3) {
    analisa += `<b>Pola Multi-Dominan:</b> ${faktorDominan.join(', ')} sama kuat secara grafik.<br>
      Kekuatan: Adaptasi sangat tinggi, bisa kerja tim maupun individual, fleksibel mengisi posisi manapun.<br>
      Tantangan: Rawan galau menentukan prioritas atau tujuan utama, perlu pendampingan karir yang jelas.<br>`;
  }

  // --- POLA SATU DOMINAN ---
  if (faktorDominan.length === 1) {
    const faktor = faktorDominan[0];
    analisa += `<b>Pola Satu Dominan:</b> ${faktor} menonjol secara grafik.<br>`;
    if (faktor === 'D') analisa += `${namaPanggilan()} berani, inisiatif tinggi, pemimpin alami.<br>`;
    if (faktor === 'I') analisa += `${namaPanggilan()} komunikatif, sangat mudah diterima kelompok.<br>`;
    if (faktor === 'S') analisa += `${namaPanggilan()} stabil, konsisten, penyeimbang tim.<br>`;
    if (faktor === 'C') analisa += `${namaPanggilan()} teliti, perfeksionis, menjaga kualitas kerja.<br>`;
  }

  return analisa;
}


  return {
    dominan,
    ranking: ranking.join(' > '),
    deskripsi: gabunganDeskripsi(dominan[0], dominan[1]),
    analisaPola: analisaPolaGrafik(),
    nilai: {
      D: arr.find(i => i.key === 'D').val,
      I: arr.find(i => i.key === 'I').val,
      S: arr.find(i => i.key === 'S').val,
      C: arr.find(i => i.key === 'C').val
    }
  };
}


// ================ TAMPILKAN GRID, GARIS, DAN ANALISIS DISC ================
function showDISCResult() {
  const hasilDISC = countDISC(appState.answers.DISC, tests.DISC.questions);
  const identity = appState.identity || {};

  // VALIDASI: cek jumlah * pada Most (P) dan Least (K) DIGABUNGKAN
  let starMost = Number(hasilDISC.most['*'] || 0);
  let starLeast = Number(hasilDISC.least['*'] || 0);
  let totalStar = starMost + starLeast;
  let isInvalid = (totalStar > 8);

  // ANALISIS (jika valid)
  let analisaHTML = "";
  if (!isInvalid) {
    const most   = analisa2DominanDISC(hasilDISC.most.D, hasilDISC.most.I, hasilDISC.most.S, hasilDISC.most.C, 'most', getPixelY);
    const least  = analisa2DominanDISC(hasilDISC.least.D, hasilDISC.least.I, hasilDISC.least.S, hasilDISC.least.C, 'least', getPixelY);
    const change = analisa2DominanDISC(hasilDISC.change.D, hasilDISC.change.I, hasilDISC.change.S, hasilDISC.change.C, 'change', getPixelY);

    // Rekomendasi peran (lengkap, otomatis deteksi kombinasi 2 huruf)
    function rekomendasiPeran() {
      const roles = {
        "DI": ["Manajer Penjualan", "Entrepreneur", "Pemimpin Tim", "Marketing Director"],
        "ID": ["Marketing, Public Relations", "Event Organizer", "Business Development"],
        "DS": ["Manajer Operasional", "Supervisor Produksi", "Koordinator Proyek", "Logistik Manager"],
        "SD": ["Koordinator SDM", "Staf Pelayanan Publik", "Komunitas Leader"],
        "DC": ["Manajer Proyek Teknis", "Insinyur Senior", "Konsultan Spesialis", "Quality Control Manager"],
        "CD": ["Auditor", "Analis Sistem", "Project Manager", "Lead Engineer"],
        "IS": ["HRD Manager", "Konselor", "Guru", "Customer Relations Manager"],
        "SI": ["Guru SD", "Fasilitator Komunitas", "Pendamping Anak", "Team Builder"],
        "IC": ["Marketing Analyst", "Konsultan Bisnis", "Pelatihan Korporat", "Peneliti Pasar"],
        "CI": ["Peneliti", "Content Planner", "Data Scientist", "Business Analyst"],
        "SC": ["Analis Data", "Akuntan", "Quality Assurance", "Peneliti"],
        "CS": ["QA Tester", "Admin Proses", "Laboran", "Support Staff"]
      };
      // Kombinasi tidak urut, harus cek dua arah!
      const kode = [most.dominan[0], most.dominan[1]].join('');
      const kode2 = [most.dominan[1], most.dominan[0]].join('');
      return roles[kode] || roles[kode2] || ["Beragam, sesuaikan dengan minat dan pengalaman"];
    }

    // Analisis kecocokan posisi (lengkap + detail teacherLevel)
 function cocokPosisi() {
  if (!identity.position) return "";

  // Mapping kebutuhan posisi: urut dari "sangat sesuai", "cocok", lalu fallback "kurang cocok/tidak cocok"
  const persyaratan = {
    "Administrator": {
      sangat: ["SC", "DC"],
      cocok:  ["CS", "CD"],
    },
    "Guru": {
      sangat: ["IS", "IC", "SI", "SC"],
      cocok:  ["ID", "SD"],
    },
    "Technical Staff": {
      sangat: ["DC", "SC"],
      cocok:  ["CD", "CS"],
    },
    "Manajer": {
      sangat: ["DI", "ID", "DC", "CD"],
      cocok:  ["DS", "IS"],
    }
  };

  // Dua kode kombinasi (misal DI & ID, biar tidak terbalik urutan)
  const kode = [most.dominan[0], most.dominan[1]].join('');
  const kode2 = [most.dominan[1], most.dominan[0]].join('');
  const req = persyaratan[identity.position] || {};

  // Default "Tidak Cocok"
  let tingkat = "Tidak Cocok";
  if ((req.sangat || []).includes(kode) || (req.sangat || []).includes(kode2)) tingkat = "SANGAT SESUAI";
  else if ((req.cocok || []).includes(kode) || (req.cocok || []).includes(kode2)) tingkat = "COCOK";
  else if (
    [].concat(req.sangat || [], req.cocok || []).some(
      x => kode.includes(x[0]) || kode.includes(x[1]) || kode2.includes(x[0]) || kode2.includes(x[1])
    )
  ) tingkat = "KURANG COCOK";

  // Detail khusus untuk Guru SD/SMA
  let detail = "";
  if (identity.teacherLevel) {
    if (identity.teacherLevel === "SD" && (kode.includes("I") || kode2.includes("I")))
      detail += "Sangat cocok untuk mengajar anak-anak karena gaya komunikasi dan empati tinggi.<br>";
    if (identity.teacherLevel === "SMA" && (kode.includes("C") || kode2.includes("C")))
      detail += "Cocok untuk mata pelajaran eksakta dan pendekatan analitis.<br>";
  }

  // Output box warna sesuai tingkat kecocokan
  return `
    <div style="margin-top:16px;padding:14px;background:${
      tingkat === "SANGAT SESUAI" ? '#e8f5e9'
      : tingkat === "COCOK" ? '#f0f7fa'
      : tingkat === "KURANG COCOK" ? '#fff7e6'
      : '#ffebee'
    };border-radius:8px;">
      <b>Analisis Posisi "${identity.position}":</b>
      <div>
        ${
          tingkat === "SANGAT SESUAI"
            ? '✅ <span style="color:#18b172;font-weight:bold;">Cocok Sekali</span>'
            : tingkat === "COCOK"
            ? '✔️ <span style="color:#2176c7;font-weight:bold;">Cocok</span>'
            : tingkat === "KURANG COCOK"
            ? '⚠️ <span style="color:#de9000;font-weight:bold;">Kurang Cocok</span>'
            : '❌ <span style="color:#c00;font-weight:bold;">Tidak Cocok</span>'
        }
      </div>
      <div>${detail}</div>
    </div>
  `;
}


    // Analisis tekanan dan potensi stres (lebih adaptif)
function analisaTekanan() {
  const tekanan = [];
  const strategi = [];

  // Deteksi sumber stres pada grafik Least (K)
  if (least.nilai.D > 10) {
    tekanan.push("Kesulitan jika berada di lingkungan yang sangat birokratis atau diatur ketat.");
    strategi.push("Libatkan dalam pengambilan keputusan dan beri otonomi dalam menjalankan tugas, agar tetap termotivasi.");
  }
  if (least.nilai.I > 10) {
    tekanan.push("Stres jika akses pada interaksi sosial atau komunikasi dibatasi.");
    strategi.push("Pastikan adanya forum, meeting, atau ruang diskusi rutin agar kebutuhan komunikasi tetap terpenuhi.");
  }
  if (least.nilai.S > 10) {
    tekanan.push("Stres saat menghadapi perubahan mendadak atau lingkungan kerja yang tidak stabil.");
    strategi.push("Lakukan perubahan secara bertahap, informasikan rencana lebih awal, dan berikan waktu adaptasi yang cukup.");
  }
  if (least.nilai.C > 10) {
    tekanan.push("Frustasi jika menghadapi ketidakpastian, aturan yang ambigu, atau data/instruksi tidak jelas.");
    strategi.push("Berikan petunjuk dan struktur kerja yang jelas, lengkap dengan standar operasional prosedur (SOP) dan data pendukung.");
  }

  if (!tekanan.length) {
    return "<div style='margin-top:12px'>Tidak teridentifikasi sumber stres utama pada grafik Least (K).</div>";
  }

  return `
    <div style="margin-top:16px;">
      <b>Potensi Sumber Stres:</b>
      <ul style="margin:8px 0 8px 16px">${tekanan.map(t => `<li>${t}</li>`).join('')}</ul>
      <b>Strategi Mengatasi:</b>
      <ul style="margin:8px 0 8px 16px">
        ${strategi.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  `;
}

analisaHTML = `
  <div style="margin-top:28px; border-radius:11px; background:#f8fafb; padding:20px 26px;">
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 300px;">
        <div style="font-weight:600;color:#2176C7;font-size:1.12em;">Analisis Mask / Most (P):</div>
        <div style="font-size:0.97em;color:#677;">Perilaku alami, motivasi utama saat nyaman atau tanpa tekanan.</div>
        <div style="margin-bottom:7px;">
          <b>Dua dominan utama:</b> <span style="color:#2176C7">${most.dominan.join(' & ')}</span><br>
          <b>Urutan:</b> ${most.ranking}<br>
          <div style="margin-top:10px;">${most.deskripsi}</div>
          <div style="margin-top:12px;">${most.analisaPola}</div>
        </div>
        <div style="font-weight:600;color:#DE9000;font-size:1.12em;margin-top:20px;">Analisis Pressure / Least (K):</div>
        <div style="font-size:0.97em;color:#a98e24;">Perilaku saat menghadapi tekanan, tuntutan, atau lingkungan sulit.</div>
        <div style="margin-bottom:7px;">
          <b>Dua dominan utama:</b> <span style="color:#DE9000">${least.dominan.join(' & ')}</span><br>
          <b>Urutan:</b> ${least.ranking}<br>
          <div style="margin-top:10px;">${least.deskripsi}</div>
          <div style="margin-top:12px;">${least.analisaPola}</div>
          ${analisaTekanan()}
        </div>
      </div>
      <div style="flex: 1; min-width: 300px;">
        <div style="font-weight:600;color:#18b172;font-size:1.12em;">Analisis Self / Change (P-K):</div>
        <div style="font-size:0.97em;color:#148562;">Pola perubahan antara situasi nyaman dan tekanan.</div>
        <div>
          <b>Dua dominan utama:</b> <span style="color:#18b172">${change.dominan.join(' & ')}</span><br>
          <b>Urutan:</b> ${change.ranking}<br>
          <div style="margin-top:10px;">${change.deskripsi}</div>
          <div style="margin-top:12px;">${change.analisaPola}</div>
        </div>
        <div style="margin:20px 0 0 0;font-weight:600;color:#1a232e;">Rekomendasi Karir:</div>
        <ul style="margin-top:8px;padding-left:20px;">
          ${rekomendasiPeran().map(r => `<li>${r}</li>`).join('')}
        </ul>
        ${cocokPosisi()}
      </div>
    </div>
    <div style="margin-top:26px;padding-top:18px;border-top:1px solid #eee;">
      <div style="font-weight:600;color:#1a232e;">Simpulan Kepribadian Menyeluruh:</div>
      <div>
        <b>Tipe dominan utama:</b> <span style="color:#008061">${most.dominan.join(' & ')}</span> 
        dengan tekanan terbesar pada <span style="color:#de9000">${least.dominan.join(' & ')}</span>
      </div>
      <div style="margin-top:12px;line-height:1.6;">
        ${namaPanggilan()} adalah individu yang 
        ${[
          most.dominan.includes('D') ? 'tegas dan berorientasi hasil' : '',
          most.dominan.includes('I') ? 'komunikatif dan persuasif' : '',
          most.dominan.includes('S') ? 'stabil dan dapat diandalkan' : '',
          most.dominan.includes('C') ? 'analitis dan teliti' : ''
        ].filter(Boolean).join(', ')}.
        Dalam lingkungan kerja, Anda akan berkembang di peran yang memberikan 
        ${[
          most.dominan.includes('D') ? 'tanggung jawab dan otoritas' : '',
          most.dominan.includes('I') ? 'kesempatan interaksi sosial' : '',
          most.dominan.includes('S') ? 'stabilitas dan rutinitas' : '',
          most.dominan.includes('C') ? 'ruang analisis mendalam' : ''
        ].filter(Boolean).join(', ')}.
      </div>
    </div>
  </div>
`;

  }

  // OUTPUT HTML
  document.getElementById('app').innerHTML = `
  <div class="card" style="max-width:780px;margin:34px auto 0 auto;padding:32px 32px 38px 32px;border-radius:18px;box-shadow:0 6px 32px #9992;">
    <h2 style="text-align:center;font-size:2em">
      Hasil DISC ${appState.identity?.nickname ? appState.identity.nickname : 'Anda'}
    </h2>
    ${isInvalid ? `
      <div style="margin:14px auto 22px auto;max-width:500px;background:#fee2e2;color:#c00;border-radius:12px;padding:19px 18px 17px 18px;font-size:1.16em;text-align:center;font-weight:600;box-shadow:0 2px 10px #fbb;">
        HASIL INVALID<br>
        <div style="margin:6px 0 0 0; font-weight:400; color:#a33; font-size:.99em;">
          (Terdeteksi pola pengisian jawaban yang tidak wajar, silakan ulangi tes.)
        </div>
        <div style="margin-top:13px; font-weight:500; color:#b11; font-size:.97em;">
          <b>Catatan Penting:</b><br>
          Hasil tes DISC Anda tidak dapat dianalisis karena pola pengisian yang terlalu seragam atau tidak konsisten.<br><br>
          Untuk hasil yang akurat dan bermanfaat, <b>jawablah seluruh pertanyaan sesuai kepribadian asli Anda</b> — bukan sekadar menyesuaikan harapan atasan atau lingkungan.<br><br>
          <i>Isi sejujur mungkin, seperti Anda dalam keseharian, bukan saat ingin mengesankan orang lain.</i>
        </div>
      </div>
    ` : ''}
    <div style="display:flex;gap:26px;justify-content:center;align-items:flex-end;margin:26px 0 18px 0;flex-wrap:wrap;">
      <div style="width:170px;height:420px;">
        <canvas id="discMost" width="170" height="420"></canvas>
        <div style="text-align:center;margin-top:6px;font-weight:600">
          Mask / Most (P)
          <div style="color:#677;font-size:0.97em;font-weight:400;">Perilaku utama, gaya diri saat nyaman/normal</div>
        </div>
      </div>
      <div style="width:170px;height:420px;">
        <canvas id="discLeast" width="170" height="420"></canvas>
        <div style="text-align:center;margin-top:6px;font-weight:600">
          Pressure / Least (K)
          <div style="color:#a98e24;font-size:0.97em;font-weight:400;">Perilaku saat tertekan/lingkungan sulit</div>
        </div>
      </div>
      <div style="width:170px;height:420px;">
        <canvas id="discChange" width="170" height="420"></canvas>
        <div style="text-align:center;margin-top:6px;font-weight:600">
          Self / Change (P-K)
          <div style="color:#148562;font-size:0.97em;font-weight:400;">Pola adaptasi antara nyaman dan tekanan</div>
        </div>
      </div>
    </div>
    <table style="margin:18px auto 0 auto;font-size:1.13em;min-width:370px;text-align:center;border-collapse:collapse;">
      <tr style="background:#f8fafb;font-weight:bold">
        <th style="padding:5px 18px">Line</th>
        <th style="padding:5px 14px">D</th>
        <th style="padding:5px 14px">I</th>
        <th style="padding:5px 14px">S</th>
        <th style="padding:5px 14px">C</th>
        <th style="padding:5px 8px;color:#999;">*</th>
        <th style="padding:5px 12px;color:#d00;">Total</th>
      </tr>
      <tr>
        <td><b>Most (P)</b></td>
        <td>${hasilDISC.most.D || 0}</td>
        <td>${hasilDISC.most.I || 0}</td>
        <td>${hasilDISC.most.S || 0}</td>
        <td>${hasilDISC.most.C || 0}</td>
        <td style="color:#999;">${hasilDISC.most['*'] || 0}</td>
        <td style="color:#d00;font-weight:600;">
          ${(hasilDISC.most.D||0)+(hasilDISC.most.I||0)+(hasilDISC.most.S||0)+(hasilDISC.most.C||0)+(hasilDISC.most['*']||0)}
        </td>
      </tr>
      <tr>
        <td><b>Least (K)</b></td>
        <td>${hasilDISC.least.D || 0}</td>
        <td>${hasilDISC.least.I || 0}</td>
        <td>${hasilDISC.least.S || 0}</td>
        <td>${hasilDISC.least.C || 0}</td>
        <td style="color:#999;">${hasilDISC.least['*'] || 0}</td>
        <td style="color:#d00;font-weight:600;">
          ${(hasilDISC.least.D||0)+(hasilDISC.least.I||0)+(hasilDISC.least.S||0)+(hasilDISC.least.C||0)+(hasilDISC.least['*']||0)}
        </td>
      </tr>
      <tr>
        <td><b>Change</b></td>
        <td>${hasilDISC.change.D >= 0 ? '+' : ''}${hasilDISC.change.D || 0}</td>
        <td>${hasilDISC.change.I >= 0 ? '+' : ''}${hasilDISC.change.I || 0}</td>
        <td>${hasilDISC.change.S >= 0 ? '+' : ''}${hasilDISC.change.S || 0}</td>
        <td>${hasilDISC.change.C >= 0 ? '+' : ''}${hasilDISC.change.C || 0}</td>
        <td style="background:#eee;">${hasilDISC.change['*'] >= 0 ? '+' : ''}${hasilDISC.change['*'] || 0}</td>
        <td style="color:#d00;">
          ${(hasilDISC.change.D||0)+(hasilDISC.change.I||0)+(hasilDISC.change.S||0)+(hasilDISC.change.C||0)+(hasilDISC.change['*']||0)}
        </td>
      </tr>
    </table>
    ${analisaHTML}
    <div style="margin-top:32px;text-align:center;">
      <button class="btn" onclick="renderHome()">Kembali ke Beranda</button>
    </div>
  </div>
`;

}

// ===================== DRAW DISC CLASSIC =====================
function drawDISCClassic(canvasOrId, tipe, D, I, S, C, warnaGaris='#2176C7') {
  const ctx = (typeof canvasOrId === 'string' ? document.getElementById(canvasOrId) : canvasOrId).getContext('2d');
  ctx.clearRect(0,0,170,420);
  ctx.save();
  // Grid horizontal
  ctx.strokeStyle = "#ddd";
  for(let i=0;i<=4;i++) {
    ctx.beginPath();
    ctx.moveTo(12, 20 + i*100); ctx.lineTo(12+128, 20 + i*100);
    ctx.stroke();
  }
  // Grid vertikal
  for(let i=0;i<5;i++) {
    ctx.beginPath();
    ctx.moveTo(12+i*32, 20); ctx.lineTo(12+i*32, 400);
    ctx.stroke();
  }
  // Label sumbu
  ctx.font = "bold 14px Segoe UI";
  ctx.fillStyle = "#1a232e";
  ["D","I","S","C"].forEach((t,i) => {
    ctx.fillText(t, 28 + i*32, 415);
  });
  // Titik grafik
  let points = [
    [45,  getPixelY(tipe, 'D', D)],
    [77,  getPixelY(tipe, 'I', I)],
    [109, getPixelY(tipe, 'S', S)],
    [141, getPixelY(tipe, 'C', C)]
  ];
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (let i=1; i<4; i++) ctx.lineTo(...points[i]);
  ctx.strokeStyle = warnaGaris;
  ctx.lineWidth = 2.7;
  ctx.stroke();
  // Titik warna & angka
  let warnaTitik = ['#e74a3b','#f6c23e','#1cc88a','#4e73df'];
  [D,I,S,C].forEach((v, idx) => {
    ctx.beginPath();
    ctx.arc(points[idx][0], points[idx][1], 7, 0, 2*Math.PI, false);
    ctx.fillStyle = warnaTitik[idx];
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.font = "bold 13px Segoe UI";
    ctx.fillStyle = "#222";
    ctx.fillText(v, points[idx][0]-7, points[idx][1]-13);
  });
  ctx.restore();
}

// ===================== GET CANVAS IMAGE FOR PDF =====================
function getCanvasImg(tipe, D, I, S, C, warna) {
  const cvs = document.createElement("canvas");
  cvs.width = 170; cvs.height = 420;
  drawDISCClassic(cvs, tipe, D, I, S, C, warna);
  return cvs.toDataURL("image/png");
}


// ========== LAINNYA (JANGAN DIUBAH, SUDAH BENAR) ==========
function getDISCAnalysisPlain(hasilDISC, appState) {
  let nick = (appState.identity?.nickname || "Peserta");
  return [
    `Hasil Analisis DISC untuk: ${nick}`,
    "",
    `Most (P): D=${hasilDISC.most.D}, I=${hasilDISC.most.I}, S=${hasilDISC.most.S}, C=${hasilDISC.most.C}, *=${hasilDISC.most['*']||0}`,
    `Least (K): D=${hasilDISC.least.D}, I=${hasilDISC.least.I}, S=${hasilDISC.least.S}, C=${hasilDISC.least.C}, *=${hasilDISC.least['*']||0}`,
    `Change: D=${hasilDISC.change.D}, I=${hasilDISC.change.I}, S=${hasilDISC.change.S}, C=${hasilDISC.change.C}, *=${hasilDISC.change['*']||0}`,
    "",
    `Dominan Most: ${(hasilDISC.most.D > hasilDISC.most.I) ? "D" : "I"}`,
    "Deskripsi kepribadian dominan, area pengembangan, dan rekomendasi karir bisa ditulis lebih detail di sini."
  ].join('\n');
}

function getFullDISCAnalysisHTML(hasilDISC, identity) {
  const most   = analisa2DominanDISC(hasilDISC.most.D, hasilDISC.most.I, hasilDISC.most.S, hasilDISC.most.C, 'most', getPixelY);
  const least  = analisa2DominanDISC(hasilDISC.least.D, hasilDISC.least.I, hasilDISC.least.S, hasilDISC.least.C, 'least', getPixelY);
  const change = analisa2DominanDISC(hasilDISC.change.D, hasilDISC.change.I, hasilDISC.change.S, hasilDISC.change.C, 'change', getPixelY);

  return `
Analisis Mask / Most (P):
Dua dominan utama: ${most.dominan.join(' & ')}
Urutan: ${most.ranking}
${most.deskripsi}
${most.analisaPola}

Analisis Pressure / Least (K):
Dua dominan utama: ${least.dominan.join(' & ')}
Urutan: ${least.ranking}
${least.deskripsi}

Analisis Self / Change (P-K):
Dua dominan utama: ${change.dominan.join(' & ')}
Urutan: ${change.ranking}
${change.deskripsi}
  `;
}

function stripHTML(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<ul>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<b>(.*?)<\/b>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/gm, '');
}


// ==================== PAPI Test ====================
function renderPAPIIntro() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <h2>${tests.PAPI.name}</h2>
      <p style="font-size:1.1em;color:#155;">${tests.PAPI.description}</p>
      <div style="margin:14px 0 24px 0;padding:13px 15px 13px 15px;background:#f5fafc;border-radius:10px;border:1.7px solid #b7dfff;">
        <b>Petunjuk Pengerjaan:</b><br>
        ${tests.PAPI.instruction}<br>
        <ul style="margin-top:8px;line-height:1.7;padding-left:18px;">
          <li>Setiap soal terdiri dari dua pernyataan, pilih salah satu yang paling sesuai dengan diri Anda.</li>
          <li>Tidak ada jawaban benar atau salah.</li>
          <li>Jawablah secara jujur dan spontan, jangan terlalu lama berpikir.</li>
          <li>Anda diberikan waktu <b>${Math.floor(tests.PAPI.time/60)} menit</b> untuk menyelesaikan seluruh soal.</li>
        </ul>
      </div>
      <div class="example-answer" style="margin:16px 0 20px 0;">
        <h4 style="margin-bottom:7px;">Contoh Soal:</h4>
        <p><b>Soal:</b> ${tests.PAPI.example.question}</p>
        <p><b>Pilihan A:</b> ${tests.PAPI.example.optionA}</p>
        <p><b>Pilihan B:</b> ${tests.PAPI.example.optionB}</p>
        <p style="color:#444;"><b>Penjelasan:</b> ${tests.PAPI.example.explanation}</p>
      </div>
      <div style="text-align:center;">
        <button class="btn" onclick="startPAPITest()">Mulai Tes PAPI</button>
        <button class="btn btn-outline" onclick="renderHome()">Kembali</button>
      </div>
    </div>
  `;
}

let timerInterval = null;

function startPAPITest() {
  appState.currentTest = 'PAPI';
  appState.currentQuestion = 0;
  appState.timeLeft = tests.PAPI.time;
  appState.answers.PAPI = [];
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    appState.timeLeft--;
    updateTimerDisplay();
    if (appState.timeLeft <= 0) {
      clearInterval(timerInterval);
      finishPAPITest();
    }
  }, 1000);
  renderPAPIQuestion();
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  if (el) el.textContent = formatTime(Math.max(0, appState.timeLeft));
}

function finishPAPITest() {
  appState.completed.PAPI = true;
  renderPAPIThankYou();
}



function renderPAPIQuestion() { 
  const question = tests.PAPI.questions[appState.currentQuestion];
  const progress = calculateProgress();

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <!-- TIMER -->
      <div class="timer-container" style="text-align:right;margin-bottom:6px;">
        <span class="timer-icon" style="margin-right:5px;">⏱️</span>
        <span class="timer" id="timer-display" style="font-weight:bold;font-size:1.06em;">
          ${formatTime(appState.timeLeft)}
        </span>
      </div>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <h2>${tests.PAPI.name}</h2>
      <p class="question-text">${question.text}</p>
      <div class="option-grid">
        <label class="option-box" onclick="selectPAPIAnswer(this, 'A')">
          <input type="radio" name="papi-answer" value="A">
          ${question.optionA}
          <span class="checkmark"></span>
        </label>
        <label class="option-box" onclick="selectPAPIAnswer(this, 'B')">
          <input type="radio" name="papi-answer" value="B">
          ${question.optionB}
          <span class="checkmark"></span>
        </label>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <button class="btn" onclick="nextPAPIQuestion()">
          ${appState.currentQuestion < tests.PAPI.questions.length - 1 ? 'Lanjut' : 'Selesai'}
        </button>
        <button class="btn btn-outline" onclick="confirmCancelTest()">
          Batalkan Tes
        </button>
      </div>
    </div>
  `;
  updateTimerDisplay();
  startTimer();
}

// Helper agar timer tampil "mm:ss"
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function renderPAPIThankYou() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="max-width:440px;margin:60px auto 0 auto;padding:36px 30px 42px 30px;border-radius:18px;box-shadow:0 6px 28px #9992;text-align:center;">
      <div style="font-size:2.6em;margin-bottom:18px;">🎉</div>
      <h2 style="margin-bottom:12px;">Terima kasih telah mengerjakan Tes PAPI Kostick!</h2>
      <div style="font-size:1.08em;color:#155;">
        Jawaban Anda berhasil direkam.<br>
        Silakan lanjut ke tes berikutnya atau klik beranda untuk kembali.
      </div>
      <button class="btn" style="margin-top:36px;min-width:160px;" onclick="renderHome()">
        Kembali ke Beranda
      </button>
    </div>
  `;
}



function selectPAPIAnswer(element, value) {
  // Remove previous selection
  document.querySelectorAll('.option-box').forEach(box => {
    box.classList.remove('selected');
  });
  
  // Add new selection
  element.classList.add('selected');
  element.querySelector('input').checked = true;
}

function nextPAPIQuestion() {
  const selectedOption = document.querySelector('input[name="papi-answer"]:checked');
  if (!selectedOption) return;

  const question = tests.PAPI.questions[appState.currentQuestion];
  if (!question) return;

  appState.answers.PAPI.push({
    id: question.id,
    answer: selectedOption.value,
    answerText: selectedOption.value === 'A' ? question.optionA : question.optionB
  });

  appState.currentQuestion++;

  if (appState.currentQuestion >= tests.PAPI.questions.length) {
    clearInterval(appState.timer);
    appState.completed.PAPI = true;

    // Simpan skor semua aspek ke appState
    appState.skorPAPIArahKerja    = skorPAPIArahKerja(appState.answers.PAPI);
    appState.skorPAPIKepemimpinan = skorPAPIKepemimpinan(appState.answers.PAPI);
    appState.skorPAPIAktivitas    = skorPAPIAktivitas(appState.answers.PAPI);
    appState.skorPAPIPergaulan    = skorPAPIPergaulan(appState.answers.PAPI);
    appState.skorPAPIGayaKerja    = skorPAPIGayaKerja(appState.answers.PAPI);
    appState.skorPAPISifat        = skorPAPISifat(appState.answers.PAPI);
    appState.skorPAPIKetaatan     = skorPAPIKetaatan(appState.answers.PAPI);

    renderPAPIThankYou();
  } else {
    renderPAPIQuestion();
  }
}


// ==================== Big Five Test ====================

// 1. INSTRUKSI AWAL Big Five (muncul saat pertama kali klik tes)
function renderBIGFIVEInstruction() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card" style="max-width:600px;margin:36px auto;">
      <h2>${tests.BIGFIVE.name}</h2>
      <p><b>Instruksi:</b></p>
      <p>${tests.BIGFIVE.instruction}</p>
      <div class="example-answer" style="margin:20px 0;">
        <h4>Contoh Soal:</h4>
        <p><strong>Soal:</strong> ${tests.BIGFIVE.example.question}</p>
        <p><strong>Skala:</strong> 1 (Sangat Tidak Sesuai) - 5 (Sangat Sesuai)</p>
        <p><strong>Penjelasan:</strong> ${tests.BIGFIVE.example.explanation}</p>
      </div>
      <div style="text-align:center;margin-top:32px">
        <button class="btn" onclick="startBIGFIVEQuestions()">Mulai Tes</button>
        <button class="btn btn-outline" onclick="renderHome()">Kembali</button>
      </div>
    </div>
  `;
}

// 2. INISIALISASI & PANGGIL PERTANYAAN PERTAMA
function startBIGFIVEQuestions() {
  appState.timeLeft = tests.BIGFIVE.time;
  appState.currentQuestion = 0;
  renderBIGFIVEQuestion();
}

// 3. RENDER SOAL PER NOMOR
function renderBIGFIVEQuestion() {
  const question = tests.BIGFIVE.questions[appState.currentQuestion];
  const progress = calculateProgress();

  // Cegah jawaban ganda, pakai array sesuai index
  if (!appState.answers.BIGFIVE) appState.answers.BIGFIVE = [];

  const prevAnswer = appState.answers.BIGFIVE[appState.currentQuestion] || 0;

  const optionsHTML = question.options.map((option, index) => `
    <div class="bigfive-option${prevAnswer === (index + 1) ? ' selected' : ''}" onclick="selectBIGFIVEAnswer(this, ${index + 1})">
      <input type="radio" name="bigfive-answer" value="${index + 1}"${prevAnswer === (index + 1) ? ' checked' : ''}>
      <span>${index + 1}</span>
      <span>${index === 0 ? 'Sangat Tidak Sesuai' : index === 4 ? 'Sangat Sesuai' : ''}</span>
    </div>
  `).join('');

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="card">
      <div class="timer-container">
        <div class="timer-icon">⏱️</div>
        <div class="timer" id="timer-display">${formatTime(appState.timeLeft)}</div>
      </div>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <h2>${tests.BIGFIVE.name}</h2>
      <p>${tests.BIGFIVE.description}</p>
      <div class="question-container">
        <p class="question-text">${question.text}</p>
        <div class="bigfive-options">
          ${optionsHTML}
        </div>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <button class="btn" onclick="nextBIGFIVEQuestion()">
          ${appState.currentQuestion < tests.BIGFIVE.questions.length - 1 ? 'Lanjut' : 'Selesai'}
        </button>
        <button class="btn btn-outline" onclick="confirmCancelTest()">
          Batalkan Tes
        </button>
      </div>
    </div>
  `;

  updateTimerDisplay();
  startBIGFIVETimer();
}

// 4. TIMER Big Five
function startBIGFIVETimer() {
  if (appState.timer) clearInterval(appState.timer);

  appState.timer = setInterval(() => {
    appState.timeLeft--;
    updateTimerDisplay();
    if (appState.timeLeft <= 0) {
      clearInterval(appState.timer);
      appState.completed.BIGFIVE = true;
      renderHome(); // Kembali ke home jika waktu habis
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) timerDisplay.textContent = formatTime(appState.timeLeft);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// 5. PILIH JAWABAN
function selectBIGFIVEAnswer(element, value) {
  document.querySelectorAll('.bigfive-option').forEach(opt => {
    opt.classList.remove('selected');
    opt.querySelector('input').checked = false;
  });

  element.classList.add('selected');
  element.querySelector('input').checked = true;

  appState.answers.BIGFIVE[appState.currentQuestion] = value;
}

// 6. LANJUT SOAL / SELESAI
function nextBIGFIVEQuestion() {
  const selectedOption = document.querySelector('input[name="bigfive-answer"]:checked');
  if (!selectedOption) {
    alert('Harap pilih salah satu skala penilaian!');
    return;
  }

  appState.currentQuestion++;

  if (appState.currentQuestion >= tests.BIGFIVE.questions.length) {
    clearInterval(appState.timer);
    appState.completed.BIGFIVE = true;
    appState.hasilOCEAN = koreksiBigFive(appState.answers.BIGFIVE, tests.BIGFIVE.questions);

    // Ucapan terima kasih
    document.getElementById('app').innerHTML = `
      <div class="card" style="text-align:center;padding:48px 20px;">
        <h2>Terima kasih telah menyelesaikan Tes Big Five!</h2>
        <p>Jawaban Anda telah terekam dengan baik.<br>Silakan kembali ke Beranda untuk melanjutkan tes berikutnya.</p>
        <button class="btn" onclick="renderHome()" style="margin-top:30px">Kembali ke Beranda</button>
      </div>
    `;
  } else {
    renderBIGFIVEQuestion();
  }
}

//=====================GRAFIS=====================
function renderGrafisUpload() {
  const subtests = [
    {
      key: "orang",
      kode: "DAP",
      title: "Tes DAP (Draw A Person): Gambar Orang",
      alat: `
        <ul style="margin-left:16px;">
          <li>Siapkan <b>pensil HB/2B</b> &amp; <b>kertas A4</b> polos.</li>
          <li>Posisi kertas <b>potrait/berdiri</b> (vertical).</li>
        </ul>
      `,
      instruksi: `
        <ol style="margin-left:20px;">
          <li>Gambarlah satu <b>orang lengkap</b> (kepala sampai kaki) di tengah kertas.</li>
          <li>Detailkan wajah, rambut, pakaian, dan anggota tubuh.</li>
          <li>Bebas memilih laki-laki/perempuan dan posisi/aktivitas.</li>
          <li>Pakai pensil HB/2B di kertas putih polos.</li>
           <li>Jika sudah, di halaman yang sama, tuliskan nama dan usia orang yang Anda gambar.</li>
        </ol>
      `,
      contoh: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkQN708-vQz0R7uuwehFFlbEJDRzsHT9mhEw&s"
    },
    {
      key: "rumah",
      kode: "HTP",
      title: "Tes HTP (House-Tree-Person): Gambar Rumah, Pohon, dan Orang",
      alat: `
        <ul style="margin-left:16px;">
          <li>Siapkan <b>pensil HB/2B</b> &amp; <b>kertas A4</b> polos.</li>
          <li>Posisi kertas <b>landscape/tidur</b> (horizontal).</li>
        </ul>
      `,
      instruksi: `
        <ol style="margin-left:20px;">
          <li>Gambarlah <b>rumah, pohon, dan orang</b> di tengah kertas polos.</li>
           <li>Bebas bentuk/model rumah.</li>
          <li>Jika sudah, deskripsikan gambar tersebut di halaman yang sama.</li>
         
          <li>Pakai pensil HB/2B di kertas putih polos.</li>
        </ol>
      `,
      contoh: "https://tse2.mm.bing.net/th/id/OIP.98wasfICBNXXEoaGoC1l5gAAAA?pid=Api&P=0&h=180"
    },
    {
      key: "pohon",
      kode: "BAUM",
      title: "Tes BAUM (Tree Drawing Test): Gambar Pohon",
      alat: `
        <ul style="margin-left:16px;">
          <li>Siapkan <b>pensil HB/2B</b> &amp; <b>kertas A4</b> polos.</li>
          <li>Posisi kertas <b>potrait/berdiri</b> (vertical).</li>
        </ul>
      `,
      instruksi: `
        <ol style="margin-left:20px;">
          <li>Gambarlah <b>pohon lengkap</b> di tengah kertas polos.</li>
          <li>Detailkan akar, batang, cabang, dan daun.</li>
          <li>Bebas pilih jenis pohon apapun.</li>
          <li>Jika sudah, tuiskan pohon apa yang Anda gambar.</li>
          <li>Pakai pensil HB/2B di kertas putih polos.</li>
        </ol>
      `,
      contoh: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi5LeXM9AL4dNiCt0UfWv1XRGFsSrHEqwbL9rzM8odSOjVZRRVLgFf7rap6yJmjpvhaHosA3ITPgJv-KEe3tc-Aan9qJ-3tB6MuHgbsHesZjXkjenn1fuL8QhW5bWqzyNhoeSjhwBZw0RgL/s400/pohon-pepaya-contoh-gambar-mewarnai-di-beringin.gif"
    }
  ];

  if (!appState.grafis) appState.grafis = {};
  appState.completed.GRAFIS = false;

  let slideIndex = -1; // MULAI DARI -1, slide pertama = persiapan 3 kertas A4
  let timer = null;
  let timeLeft = 600;
  let tahap = "persiapan";

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const d = ("0" + (s % 60)).slice(-2);
    return `${m}:${d}`;
  }

  function playTimeoutSound() {
    try {
      const audio = new Audio('https://files.catbox.moe/s4slzu.mp3');
      audio.volume = 0.87;
      audio.play();
    } catch {}
  }

  function nextOrUploadSlide(idx) {
    if (idx < subtests.length - 1) {
      renderGrafisSlide(idx + 1, "persiapan");
    } else {
      renderUploadSlide();
    }
  }

  // ========== SLIDE 0: PERSIAPAN 3 KERTAS & PENSIL ==========
  function renderPersiapanSlide() {
    if (timer) clearInterval(timer);
    document.getElementById('app').innerHTML = `
      <div class="card">
        <div class="header"><h2>Persiapan Tes Gambar</h2></div>
        <div style="margin:0 auto 12px auto; max-width:430px;">
          <div style="background:#fffbe8;border-radius:10px;padding:17px 21px 13px 21px;margin-bottom:16px;">
            <b>Pastikan Anda menyiapkan:</b>
            <ul style="margin-left:17px;margin-bottom:8px;">
              <li><b>3 lembar kertas A4 polos</b> (tidak bergaris/bergambar)</li>
              <li><b>Pensil HB/2B</b> (direkomendasikan untuk tes grafis psikologi)</li>
              <li><b>HP untuk foto</b> hasil gambar</li>
            </ul>
            <div style="margin:8px 0 6px 0;padding:8px 12px 7px 12px;border-radius:8px;background:#e3f3fa;">
              <b>Cara upload gambar yang mudah:</b><br>
              <span style="font-size:0.98em;">
                <ol style="margin-left:16px;margin-bottom:0;padding-left:16px;">
                  <li>Ambil foto hasil gambar dengan HP Anda.</li>
                  <li>Buka WhatsApp, kirim gambar tersebut ke <b>nomor WA sendiri</b> (chat ke diri sendiri).</li>
                  <li>Buka <b>web.whatsapp.com</b> atau aplikasi WhatsApp Desktop di komputer/laptop Anda.</li>
                  <li>Drag gambar dari WhatsApp ke komputer, lalu upload di halaman ini (atau drag ke kotak upload nanti).</li>
                </ol>
                <span style="color:#158600;">Tips:</span> Gambar lebih mudah diakses dan di-upload melalui WA Web/WA Desktop.
              </span>
            </div>
            <div style="margin:10px 0 5px 0;color:#b74a00;">
              <b>Perhatian!</b> Ikuti waktu pada setiap tes, jika terlambat halaman upload otomatis tertutup dan Anda tidak dapat mengumpulkan file.
            </div>
          </div>
          <div style="text-align:center;margin-top:18px;">
            <button class="btn" id="btnSiapSemua" style="padding:11px 35px;font-size:1.13em;">Saya sudah siap</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('btnSiapSemua').onclick = () => {
      renderGrafisSlide(0, "persiapan");
    };
  }

  // ========== SLIDE GRAFIS (DAP/HTP/BAUM) ==========
  function renderGrafisSlide(idx, step = "persiapan") {
    if (timer) clearInterval(timer);
    tahap = step;
    timeLeft = 600;
    const subtest = subtests[idx];

    if (step === "persiapan") {
      document.getElementById('app').innerHTML = `
        <div class="card">
          <div class="header"><h2>${subtest.title}</h2></div>
          <div style="margin:0 auto 8px auto;max-width:420px;">
            <div style="background:#fffbe8;border-radius:10px;padding:16px 18px 13px 18px;margin-bottom:10px;">
              <b>Instruksi Persiapan:</b>
              ${subtest.alat}
              <div style="margin:10px 0 3px 0;color:#b74a00;">
                <b>Pastikan alat sudah siap sebelum lanjut!</b>
              </div>
            </div>
            <div style="text-align:center;margin-top:18px;">
              <button class="btn" id="btnSiap" style="padding:9px 32px;font-size:1.09em;">Saya sudah siap</button>
            </div>
          </div>
        </div>
      `;
      document.getElementById('btnSiap').onclick = () => {
        renderGrafisSlide(idx, "gambar");
       
      };
      return;
    }

    if (step === "gambar") {
      document.getElementById('app').innerHTML = `
        <div class="card">
          <div class="header"><h2>${subtest.title}</h2></div>
          <div style="margin:0 auto 12px auto; max-width:470px;">
            <div style="background:#e9f7ff;padding:17px 20px 14px 22px;border-radius:11px;margin-bottom:18px;">
              ${subtest.instruksi}
            </div>
            <div id="areaTimer" style="text-align:center;margin-bottom:14px;">
              <span style="font-weight:600;color:#095;">Sisa Waktu: <span id="timerGrafis">${formatTime(timeLeft)}</span></span>
              <button class="btn" id="btnSelesaiGambar" style="margin-left:16px;">Selesai</button>
            </div>
          </div>
        </div>
      `;
      timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timerGrafis').textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timer);
          playTimeoutSound();
          renderGrafisSlide(idx, "foto");
        }
      }, 1000);
      document.getElementById('btnSelesaiGambar').onclick = function() {
        if (timer) clearInterval(timer);
        renderGrafisSlide(idx, "foto");
      };
      return;
    }

    if (step === "foto") {
      timeLeft = 300;
      document.getElementById('app').innerHTML = `
        <div class="card">
          <div class="header"><h2>${subtest.title}</h2></div>
          <div style="margin:0 auto 18px auto; max-width:400px;">
            <div style="background:#f4faff;border-radius:10px;padding:15px 16px 14px 16px;margin-bottom:10px;">
              <b>Instruksi:</b>
              <ul style="margin-left:17px;">
                <li>Foto hasil gambar Anda sejelas mungkin (tidak buram/gelap).</li>
                <li>Pastikan seluruh bagian gambar masuk dalam foto.</li>
                <li><b>Upload dengan klik atau drag file ke area upload di bawah.</b></li>
              </ul>
              <span style="color:#e87c00;">Sisa waktu upload: <b><span id="timerFoto">${formatTime(timeLeft)}</span></b></span>
            </div>
            <div style="text-align:center;margin-bottom:13px;">
              <div style="margin-bottom:7px;font-size:1.09em;color:#1a457a;font-weight:600;">Contoh hasil gambar</div>
              <img src="${subtest.contoh}" alt="Contoh" style="max-width:220px;max-height:220px;border-radius:16px;border:2.5px solid #0d67a2;box-shadow:0 6px 24px #2394e026;">
            </div>
            <div style="margin-top:14px;text-align:center;">
              <div id="dropZone" style="border:2.2px dashed #73aeea;border-radius:12px;padding:18px;background:#f8fcff;cursor:pointer;">
                <input type="file" accept="image/*" id="uploadGambar" style="display:none;" />
                <span id="dropMsg" style="color:#359;">Klik di sini atau drag & drop file gambar</span>
                <div id="previewGambar" style="margin-top:10px;"></div>
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-top:18px;">
            <button class="btn" id="btnNextGrafis" disabled>Lanjut</button>
          </div>
        </div>
      `;
      timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timerFoto').textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timer);
          playTimeoutSound();
          nextOrUploadSlide(idx);
        }
      }, 1000);
      const dropZone = document.getElementById('dropZone');
      const fileInput = document.getElementById('uploadGambar');
      dropZone.onclick = () => fileInput.click();
      dropZone.ondragover = e => { e.preventDefault(); dropZone.style.background = "#e3f4ff"; };
      dropZone.ondragleave = e => { e.preventDefault(); dropZone.style.background = "#f8fcff"; };
      dropZone.ondrop = function(e) {
        e.preventDefault();
        dropZone.style.background = "#f8fcff";
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          fileInput.dispatchEvent(new Event('change'));
        }
      };
      fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
          document.getElementById('previewGambar').innerHTML =
            `<img src="${ev.target.result}" style="max-width:120px;max-height:120px;border:2px solid #eee;margin:8px 0;border-radius:12px;" />`;
          appState.grafis[subtest.key] = ev.target.result;
          document.getElementById('btnNextGrafis').disabled = false;
          document.getElementById('dropMsg').style.color = "#398c24";
          document.getElementById('dropMsg').textContent = "File berhasil diunggah!";
        };
        reader.readAsDataURL(file);
      });
      document.getElementById('btnNextGrafis').onclick = function() {
        if (timer) clearInterval(timer);
        nextOrUploadSlide(idx);
      };
      return;
    }
  }

  // SLIDE FINAL UPLOAD: SEMUA GAMBAR SUDAH
  function renderUploadSlide() {
    document.getElementById('app').innerHTML = `
      <div class="card">
        <div class="header"><h2>Semua Tes Gambar Selesai!</h2></div>
        <div style="margin:0 auto 10px auto;max-width:430px;">
          <div style="background:#f5fbe7;padding:16px 19px 13px 19px;border-radius:10px;margin-bottom:15px;">
            <b>Semua gambar berhasil diunggah.</b>
            <div style="margin-top:10px;">
              Silakan klik <b>Selesai</b> untuk melanjutkan.
            </div>
          </div>
        </div>
        <div style="text-align:center;margin-top:18px;">
          <button class="btn" id="btnFinishGrafis" style="padding:10px 44px;">Selesai</button>
        </div>
      </div>
    `;
    document.getElementById('btnFinishGrafis').onclick = function() {
      appState.completed.GRAFIS = true;
      renderHome();
    };
  }

  // Start dari slide persiapan 3 kertas A4 + instruksi WA upload
  renderPersiapanSlide();
}


// Contoh soal Tes Excel
const adminExcelQuestions = [
  {
    title: "Pengolahan Nilai (Google Spreadsheet)",
    description: `
      <b>Buatlah spreadsheet di <a href="https://sheets.new" target="_blank" rel="noopener noreferrer">Google Sheets</a>!</b>
      <ul style="margin-left:18px;">
        <li>Buat tabel berisi <b>Nama</b>, <b>Nilai UTS</b>, <b>Nilai UAS</b> untuk minimal 5 siswa.</li>
        <li>Tambahkan kolom <b>Nilai Akhir</b> yang merupakan rata-rata UTS dan UAS.</li>
        <li>Gunakan rumus di spreadsheet untuk menghitung rata-rata.</li>
        <li>Setelah selesai, klik menu <b>Bagikan (Share)</b> dan pastikan file dapat diakses oleh panitia (bisa set: "Siapa saja yang memiliki link dapat melihat").</li>
        <li>Salin <b>link Google Sheet</b> Anda dan tempelkan pada kolom di bawah ini.</li>
      </ul>
    `
  }
];



// Render tes Excel:

function renderAdminExcelSheet() {
  let timeLeft = 40 * 60; // 11 menit, tinggal ubah angka ini saja kalau perlu durasi lain!
  let timerInterval;
  let sudahStart = false;
  let ttsPlayed10M = false;
  let ttsPlayed30Dtk = false;

  // Generate waktu awal "MM:00" sesuai timeLeft
  const timerStr = Math.floor(timeLeft / 60).toString().padStart(2, '0') + ':00';

  document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="header"><h2>Tes Admin: Excel (Google Sheet)</h2></div>
      <div style="margin-bottom:16px;">
        <b>Instruksi:</b>
        <ul style="margin:10px 28px 16px 28px;padding-left:16px;line-height:1.7;">
          <li>Klik tombol di bawah untuk mendapatkan Google Sheet soal ujian Anda (<b>salin ke Google Drive Anda</b>).</li>
          <li>Kerjakan langsung di Google Sheet tersebut.</li>
          <li><b>PENTING!</b> Setelah selesai, <b>bagikan link Sheet Anda</b> ke panitia dengan akses 
          <span style="color:#0277bd;font-weight:600;">“Siapa saja yang memiliki link”</span> dan <span style="color:#388e3c;font-weight:600;">Editor</span>.</li>
          <li><b>Waktu pengerjaan: <span id="timer" style="font-weight:bold;color:#d32f2f;">${timerStr}</span></b></li>
        </ul>
      </div>
      <div style="background:#f7fbff;border-radius:12px;padding:18px 18px 6px 18px;border:1.5px solid #b5d6f9;text-align:center;max-width:540px;margin:0 auto 12px auto;">
        <div style="font-weight:600;font-size:1.06em;color:#155;">Panduan Membagikan Google Sheet:</div>
        <ol style="text-align:left;display:inline-block;margin:10px auto 14px auto;padding-left:21px;line-height:1.63;">
          <li>Klik <b>Bagikan</b> (Share) di kanan atas Sheet.</li>
          <li>Pada bagian <b>Akses umum</b> (General Access), pilih: <span style="color:#0277bd;font-weight:600;">“Siapa saja yang memiliki link”</span></li>
          <li>Pilih peran <span style="color:#388e3c;font-weight:600;">Editor</span></li>
          <li>Klik <b>Salin link</b>, lalu tempel di kolom jawaban di bawah.</li>
        </ol>
        <div style="text-align:center;">
          <img src="https://dl.imgdrop.io/file/aed8b140-8472-4813-922b-7ce35ef93c9e/2025/06/28/sheet975c9e309607ea92.png"
            alt="Panduan Share Google Sheet" style="display:inline-block;max-width:96%;border-radius:10px;border:1.2px solid #90caf9;box-shadow:0 2px 10px #a4cdf850;margin:9px auto 5px auto;">
        </div>
        <div style="margin:13px auto 5px auto;font-size:1em;color:#f57c00;">
          <b>Catatan:</b> Pastikan akses “Siapa saja yang memiliki link” & Editor sudah aktif sebelum mengumpulkan link!
        </div>
      </div>
      <div style="text-align:center; margin:26px 0 12px 0;">
        <a href="https://docs.google.com/spreadsheets/d/1RKykKAHOn-kXfOFrDLD2UkOQ6YlpoFAgv06ETvnRU_g/copy" target="_blank" rel="noopener" id="startSheetBtn">
          <button class="btn btn-success" style="font-size:1.13em;padding:12px 28px 12px 28px;">
            📋 Dapatkan Google Sheet Ujian Anda
          </button>
        </a>
      </div>
      <div style="max-width:500px;margin:0 auto 0 auto;">
        <div style="margin-bottom:8px;"><b>Kumpulkan Link Google Sheet Anda:</b></div>
        <input type="url" id="sheetLinkInput" placeholder="Tempelkan link Google Sheet Anda di sini" style="width:100%;padding:10px;font-size:1.1em;border-radius:8px;border:1.3px solid #b5d6f9;" autocomplete="off"/>
        <div id="sheetLinkMsg" style="margin:10px 0 0 0;color:#197278;font-size:1em;"></div>
      </div>
      <div style="margin-top:28px;font-size:1.06em;color:#d32f2f;" id="waktuHabisMsg"></div>
      <div style="margin-top:22px;text-align:center;">
        <button class="btn" id="btnExcelDone" style="font-size:1.13em;">Selesai &amp; Kembali</button>
      </div>
    </div>
  `;

  function updateTimer() {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById('timer').textContent = "WAKTU HABIS";
      document.getElementById('waktuHabisMsg').textContent = "Waktu sudah habis. Anda akan diarahkan kembali ke halaman utama.";
      document.getElementById('btnExcelDone').disabled = true;
      document.getElementById('btnExcelDone').innerText = "Waktu Habis";
      setTimeout(() => {
        renderHome();
      }, 2200);
      return;
    }
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${m}:${s}`;
    
    if (timeLeft === 600 && !ttsPlayed10M) {
      playTTS10Menit();
      ttsPlayed10M = true;
    }
    if (timeLeft === 30 && !ttsPlayed30Dtk) {
      playTTS30Detik();
      ttsPlayed30Dtk = true;
    }
    timeLeft--;
  }

  function playTTS10Menit() {
    try {
      const audio = new Audio('https://files.catbox.moe/e5bbaq.mp3');
      audio.volume = 1;
      audio.play();
    } catch {}
  }
  function playTTS30Detik() {
    // Tambahkan suara peringatan jika ada, jika tidak bisa kosongkan saja
  }

  // Mulai timer saat klik sheet
  document.getElementById('startSheetBtn').addEventListener('click', function () {
    if (!sudahStart) {
      sudahStart = true;
      timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
      setTimeout(() => {
        document.getElementById('startSheetBtn').style.pointerEvents = 'none';
        document.getElementById('startSheetBtn').querySelector('button').disabled = true;
        document.getElementById('startSheetBtn').querySelector('button').innerHTML = "📝 Ujian Berlangsung";
      }, 350);
    }
  });

  // Simpan link jawaban
  document.getElementById('sheetLinkInput').addEventListener('input', function (e) {
    const link = e.target.value.trim();
    if (link.startsWith("https://docs.google.com/spreadsheets/")) {
      appState.adminAnswers.EXCEL = { link };
      document.getElementById('sheetLinkMsg').textContent = "✅ Link tersimpan. Pastikan akses sudah “Siapa saja yang memiliki link, Editor”.";
    } else if (link.length > 6) {
      document.getElementById('sheetLinkMsg').textContent = "Link tidak valid. Pastikan itu link Google Sheet.";
    } else {
      document.getElementById('sheetLinkMsg').textContent = "";
    }
  });

  // Tombol selesai & kembali
  document.getElementById('btnExcelDone').onclick = function () {
    clearInterval(timerInterval);
    appState.completed.EXCEL = true;
    renderHome();
  };
}


// ==================== TES KETIK ====================

function renderTypingTest() {
  // Soal pengetikan (bukan instruksi!)
  const typingText = `Sugar Group Schools adalah sekolah yang berada di bawah perusahaan agribisnis terintegrasi, tersebar di tiga perusahaan gula besar di Indonesia. Sekolah ini mendukung proses pendidikan untuk anak karyawan serta masyarakat sekitar. Visi kami adalah menjadi pelopor utama dalam menghasilkan lulusan berkualitas tinggi dengan semangat profesionalisme dan teknologi modern.`;

  const waktuTyping = 120; // 2 menit

  appState.typingText = typingText;
  appState.timeLeft = waktuTyping;
  appState.typingStart = Date.now();
  appState.typingEnded = false;

  document.getElementById('app').innerHTML = `
    <div class="card" style="max-width:600px;margin:auto;">
      <div class="header"><h2>Uji Mengetik</h2></div>
      <div style="margin-bottom:18px;">
        <b>Instruksi:</b>
        <ul style="line-height:1.7;">
          <li>Ketik ulang teks di bawah <b>tanpa menyalin</b> (copy-paste tidak diperbolehkan).</li>
          <li>Waktu pengerjaan: <b><span id="typingTimer">${formatTypingTime(waktuTyping)}</span></b></li>
        </ul>
      </div>
      <div id="progressTypingBar" style="height:7px;width:100%;background:#dde7f5;border-radius:7px;overflow:hidden;margin-bottom:8px;">
        <div id="progressTypingBarInner" style="height:100%;width:0%;background:#42a5f5;transition:width .18s;"></div>
      </div>
      <div style="user-select: none;pointer-events: none;filter: blur(0.6px);background:#f5faff;padding:12px 18px;border-radius:9px;margin-bottom:12px;font-size:1.12em;color:#234;border:1.3px solid #7fc7f7;" id="typingText">
        ${typingText.replace(/\n/g, '<br>')}
      </div>
      <textarea
        id="typingInput"
        placeholder="Ketik ulang teks di sini..."
        style="width:100%;min-height:110px;padding:13px;font-size:1.13em;border-radius:8px;border:1.2px solid #aec9d8;"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        oncopy="return false" onpaste="return false" oncut="return false"
      ></textarea>
      <div id="typingLiveStats" style="margin:11px 0 3px 0;font-size:1.06em;color:#157;">
        <b>Kata Benar:</b> 0 | <b>Kata Salah:</b> 0 | <b>Belum diketik:</b> 0 | <b>Akurasi:</b> 0% | <b>WPM:</b> 0
      </div>
      <div style="margin-top:22px;text-align:center;">
        <button class="btn" id="btnTypingDone">Selesai</button>
      </div>
    </div>
  `;

  // Timer
  appState.typingTimer = setInterval(() => {
    appState.timeLeft--;
    document.getElementById('typingTimer').textContent = formatTypingTime(appState.timeLeft);
    if (appState.timeLeft <= 0) endTypingTest(true);
  }, 1000);

  // Live feedback
  const inputEl = document.getElementById('typingInput');
  inputEl.addEventListener('input', updateTypingStats);

  // Anti copy-paste-cut
  inputEl.addEventListener('copy', e => e.preventDefault());
  inputEl.addEventListener('paste', e => e.preventDefault());
  inputEl.addEventListener('cut', e => e.preventDefault());

  // Tombol selesai
  document.getElementById('btnTypingDone').onclick = () => endTypingTest(false);

  function updateTypingStats() {
    // Split per kata (hapus spasi berlebih)
    const input = inputEl.value.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
    const expected = typingText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().split(' ');

    let benar = 0, salah = 0, belum = 0;
    for (let i = 0; i < expected.length; i++) {
      if (input[i] === undefined || input[i] === '') {
        belum++;
      } else if (input[i] === expected[i]) {
        benar++;
      } else {
        salah++;
      }
    }

    // Akurasi: benar / (benar + salah) [dari yang sudah DIKETIK]
    const totalDiketik = benar + salah;
    const persen = totalDiketik ? (benar / totalDiketik * 100) : 0;

    // WPM (hitung dari jumlah kata diketik)
    const wpm = Math.round(input.length / ((waktuTyping - appState.timeLeft) / 60 + 1e-6));

    // Progress bar (jumlah kata yg diketik)
    const progress = Math.min(100, input.length / expected.length * 100);
    document.getElementById('progressTypingBarInner').style.width = `${progress}%`;

    document.getElementById('typingLiveStats').innerHTML =
      `<b>Kata Benar:</b> ${benar} | <b>Kata Salah:</b> ${salah} | <b>Belum diketik:</b> ${belum} | <b>Akurasi:</b> ${persen.toFixed(1)}% | <b>WPM:</b> ${isFinite(wpm) && wpm >= 0 ? wpm : 0}`;
  }
  updateTypingStats();
}

// Helper waktu
function formatTypingTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function endTypingTest(timeIsUp = false) {
  if (appState.typingEnded) return;
  appState.typingEnded = true;
  clearInterval(appState.typingTimer);

  const hasilKetik = document.getElementById('typingInput').value;
  const kunci = appState.typingText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
  const userInput = hasilKetik.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().split(' ');

  let benar = 0, salah = 0, belum = 0;
  for (let i = 0; i < kunci.length; i++) {
    if (userInput[i] === undefined || userInput[i] === '') {
      belum++;
    } else if (userInput[i] === kunci[i]) {
      benar++;
    } else {
      salah++;
    }
  }

  const totalDiketik = benar + salah;
  const persenBenar = totalDiketik ? (benar / totalDiketik * 100).toFixed(1) : 0;
  const wpm = Math.round(userInput.length / ((120 - appState.timeLeft) / 60 + 1e-6));
  const sisa = appState.timeLeft;
  const totalKata = kunci.length;

  // Simpan ke state
  appState.answers.TYPING = {
    text: hasilKetik,
    wpm,
    accuracy: persenBenar,
    benar,
    salah,
    belum,
    total: totalKata,
    waktu: 120 - sisa,
    waktuSisa: sisa
  };
  appState.completed.TYPING = true;

  // Hasil + tombol selesai
  document.getElementById('app').innerHTML = `
    <div class="card" style="max-width:520px;margin:auto;">
      <div class="header"><h2>Hasil Tes Mengetik</h2></div>
      <div style="margin:20px 0 10px 0;font-size:1.1em;">
        <b>Kata benar:</b> ${benar} <br>
        <b>Kata salah:</b> ${salah} <br>
        <b>Belum diketik:</b> ${belum} <br>
        <b>Akurasi:</b> ${persenBenar}% <br>
        <b>Kecepatan:</b> ${wpm} kata/menit (WPM) <br>
        <b>Waktu digunakan:</b> ${(120 - sisa)} detik <br>
        <b>Status:</b> ${timeIsUp ? '<span style="color:#c00;">Waktu habis</span>' : 'Selesai'}
      </div>
      <div style="margin-top:18px;text-align:center;">
        <button class="btn" onclick="renderHome()">Selesai</button>
      </div>
    </div>
  `;
}



// ==================== Timer Functions ====================
function startTimer() {
  clearInterval(appState.timer);
  
  appState.timer = setInterval(() => {
    appState.timeLeft--;
    updateTimerDisplay();
    
    if (appState.timeLeft <= 0) {
      clearInterval(appState.timer);
      timeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) {
    timerDisplay.textContent = `${appState.timeLeft}s`;
    
    if (appState.timeLeft <= 10) {
      timerDisplay.classList.add('timer-warning');
    } else {
      timerDisplay.classList.remove('timer-warning');
    }
  }
}

function timeUp() {
  alert('Waktu telah habis! Tes akan dikirim secara otomatis.');
  
  if (appState.currentTest === 'IST') {
    // Save unanswered questions as '-'
    const subtest = tests.IST.subtests[appState.currentSubtest];
    while (appState.currentQuestion < subtest.questions.length) {
      appState.answers.IST[appState.currentSubtest].answers.push({
        id: subtest.questions[appState.currentQuestion].id,
        answer: '-',
        correct: false
      });
      appState.currentQuestion++;
    }
    
    appState.currentSubtest++;
    appState.currentQuestion = 0;
    renderISTSubtestIntro();
  } else if (appState.currentTest === 'PAPI') {
    // Save unanswered questions as '-'
    while (appState.currentQuestion < tests.PAPI.questions.length) {
      appState.answers.PAPI.push({
        id: tests.PAPI.questions[appState.currentQuestion].id,
        answer: '-',
        answerText: 'Tidak dijawab (waktu habis)'
      });
      appState.currentQuestion++;
    }
    
    appState.completed.PAPI = true;
    renderHome();
  } else if (appState.currentTest === 'BIGFIVE') {
    // Save unanswered questions as '-'
    while (appState.currentQuestion < tests.BIGFIVE.questions.length) {
      appState.answers.BIGFIVE.push({
        id: tests.BIGFIVE.questions[appState.currentQuestion].id,
        answer: 0,
        answerText: 'Tidak dijawab (waktu habis)'
      });
      appState.currentQuestion++;
    }
    
    appState.completed.BIGFIVE = true;
    renderHome();
  }
}

// ==================== Common Functions ====================
function confirmCancelTest() {
  if (confirm('Apakah Anda yakin ingin membatalkan tes? Semua jawaban yang sudah diisi akan hilang.')) {
    clearInterval(appState.timer);
    renderHome();
  }
}




// ==================== PDF Generation ====================
async function generatePDF() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  // Pakai base64 hasil konversi!
  const logoBase64 = 'data:image/png;base64,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'; // Ganti dengan base64 logo Anda
 doc.addImage(logoBase64, 'PNG', pageWidth/2-10, 8, 20, 16);

  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.text('HASIL PSIKOTES', pageWidth/2, 27, { align: 'center' });
  doc.text('SUGAR GROUP SCHOOLS', pageWidth/2, 32, { align: 'center' });

    // ========== IDENTITAS ==========
  const col1_x = 12, col2_x = 90;
  let y = 43;
  doc.setFontSize(7);
  doc.text('IDENTITAS PESERTA', col1_x, y); y += 2;
  doc.setLineWidth(0.22);
  doc.line(col1_x, y, col1_x + 35, y);
  y += 3;

  const id = appState.identity;

  function drawLabelValueFix(doc, x, y, label, value, opts = {}) {
    const fontSize = opts.fontSize || 7;
    const labelWidth = opts.labelWidth || 25;
    const maxWidth = opts.maxWidth || 44;
    doc.setFontSize(fontSize);
    doc.text(`${label}:`, x, y);
    if (doc.getTextWidth(value) > maxWidth) {
      let firstLine = '', secondLine = '';
      for (let i = 0; i < value.length; i++) {
        if (doc.getTextWidth(firstLine + value[i]) < maxWidth) {
          firstLine += value[i];
        } else {
          secondLine = value.slice(i);
          break;
        }
      }
      doc.text(firstLine, x + labelWidth, y);
      doc.text(secondLine, x + labelWidth, y + 3.5);
      return y + 7;
    } else {
      doc.text(value, x + labelWidth, y);
      return y + 3.5;
    }
  }

  // Kolom kiri identitas
  let y1 = y;
  y1 = drawLabelValueFix(doc, col1_x, y1, "Nama", id.name || "-");
  y1 = drawLabelValueFix(doc, col1_x, y1, "No. HP", id.phone || "-");
  y1 = drawLabelValueFix(doc, col1_x, y1, "Tgl Lahir", id.dob ? new Date(id.dob).toLocaleDateString('id-ID') : '-');
  y1 = drawLabelValueFix(doc, col1_x, y1, "Usia", id.age || "-");
  y1 = drawLabelValueFix(doc, col1_x, y1, "Posisi", id.position || "-");
  if (id.position === 'Guru') y1 = drawLabelValueFix(doc, col1_x, y1, "Kategori Guru", id.teacherLevel || "-");
  if (id.position === 'Technical Staff') y1 = drawLabelValueFix(doc, col1_x, y1, "Role Teknis", id.techRole || "-");
  y1 = drawLabelValueFix(doc, col1_x, y1, "Pendidikan", id.education || "-");

  // Kolom kanan identitas
  let y2 = y;
  y2 = drawLabelValueFix(doc, col2_x, y2, "Email", id.email || "-", {labelWidth:30, maxWidth:67, fontSize:7});
  y2 = drawLabelValueFix(doc, col2_x, y2, "Almt KTP", id.addressKTP || "-", {labelWidth:30, maxWidth:67, fontSize:7});
  y2 = drawLabelValueFix(doc, col2_x, y2, "Almt Saat Ini", id.addressCurrent || "-", {labelWidth:30, maxWidth:67, fontSize:7});
  y2 = drawLabelValueFix(doc, col2_x, y2, "Tanggal Tes", id.date || "-", {labelWidth:30, fontSize:7});

  // Jaga jarak bawah identitas
  const yMaxIdentitas = Math.max(y1, y2);
  let ySection = yMaxIdentitas + 5;

  // Cek page limit setelah identitas
  if (ySection > 265) { doc.addPage(); ySection = 20; }

  // ========== IST ==========
  if (
    appState.answers.IST &&
    Array.isArray(appState.answers.IST) &&
    appState.answers.IST.some(
      subtest => Array.isArray(subtest.answers) && subtest.answers.length > 0
    )
  ) {
    ySection += 2;
    if (ySection > 265) { doc.addPage(); ySection = 20; }
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('JAWABAN TES IST', pageWidth/2, ySection, { align: 'center' });
    doc.setFont(undefined, 'normal');
    ySection += 2;

    const istSubtestStartNo = [1, 21, 41, 61, 77, 97, 117, 137];
    appState.answers.IST.forEach((subtest, stIdx) => {
      ySection += 2;
      if (ySection > 265) { doc.addPage(); ySection = 20; }
      doc.setFontSize(7);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(44, 62, 80);
      doc.text(subtest.name, 16, ySection);
      doc.setFont(undefined, 'normal');
      ySection += 1.8;
      const startNo = istSubtestStartNo[stIdx] || 1;
      const jawaban = subtest.answers.map((ans, idx) => ({
        no: (startNo + idx).toString(),
        jawab: ans.answer || '-'
      }));

      const perCol = Math.ceil(jawaban.length / 4);
      const cols = [[], [], [], []];
      jawaban.forEach((item, i) => {
        cols[Math.floor(i / perCol)].push(item);
      });

      let colX = [29, 67, 105, 143];
      let colY = ySection + 0.5;
      for (let r = 0; r < perCol; r++) {
        colY += 2.3;
        if (colY > 280) { doc.addPage(); colY = 20; }
        for (let c = 0; c < 4; c++) {
          let ans = cols[c][r];
          if (ans) {
            doc.setFontSize(7);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(44, 62, 80);
            doc.text(`${ans.no}. ${ans.jawab}`, colX[c], colY);
          }
        }
      }
      ySection = colY + 1.2;
      if (ySection > 265) { doc.addPage(); ySection = 20; }
    });
  }

  // ========== KRAEPLIN ==========
  if (
    appState.answers.KRAEPLIN &&
    Array.isArray(appState.answers.KRAEPLIN) &&
    appState.answers.KRAEPLIN.some(arr => Array.isArray(arr) && arr.length > 0)
  ) {
    ySection += 4;
    if (ySection > 265) { doc.addPage(); ySection = 20; }
    let analisa = {};
    try { analisa = analyzeKraeplin(); } catch(e) { analisa = {}; }
    function kategoriRapi(str) {
      const map = {
        "Tinggi Sekali": "Tinggi Sekali ",
        "Tinggi":        "Tinggi        ",
        "Cukup":         "Cukup         ",
        "Rendah":        "Rendah        ",
        "Rendah Sekali": "Rendah Sekali "
      };
      return map[str] || (str ? str.padEnd(16, ' ') : "-");
    }

    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('JAWABAN TES KRAEPLIN', pageWidth / 2, ySection, { align: 'center' });
    doc.setFont(undefined, 'normal');
    ySection += 3.5;
    if (ySection > 265) { doc.addPage(); ySection = 20; }

    doc.setFontSize(7);
    doc.setTextColor(44, 62, 80);

    let xData = 16;
    let yy = ySection;
    doc.text(`Jumlah Jawaban Benar      : ${analisa.benar || 0}`, xData, yy); yy += 3.1;
    if (yy > 280) { doc.addPage(); yy = 20; }
    doc.text(`Jumlah Jawaban Salah      : ${analisa.salah || 0}`, xData, yy); yy += 3.1;
    if (yy > 280) { doc.addPage(); yy = 20; }
    doc.text(`Jumlah Jawaban Dibenarkan : ${analisa.dibenarkan || 0}`, xData, yy); yy += 4.0;
    if (yy > 280) { doc.addPage(); yy = 20; }

    doc.setFont(undefined, 'bold');
    doc.text('Penilaian Kerja:', xData, yy); yy += 3.2;
    if (yy > 280) { doc.addPage(); yy = 20; }
    doc.setFont(undefined, 'normal');
    doc.text(
      `Ketelitian Kerja   : (${analisa.benar || 0} / ${analisa.total || 0} x 100) = ${(analisa.ketelitian || 0).toFixed(1)}% — ${kategoriRapi(kraeplinKategori(analisa.ketelitian || 0))}`,
      xData+3, yy
    ); yy += 3.1;
    if (yy > 280) { doc.addPage(); yy = 20; }
    doc.text(
      `Kecepatan Kerja    : (Jumlah isi tiap kolom) = ${analisa.kecepatan || 0} — ${kategoriRapi(kraeplinKategori(analisa.kecepatan || 0, [15,30,50,70]))}`,
      xData+3, yy
    ); yy += 3.1;
    if (yy > 280) { doc.addPage(); yy = 20; }
    doc.text(
      `Keajegan Kerja     : (Standar Deviasi: ${(analisa.keajegan || 0).toFixed(2)}) — ${kategoriRapi(kraeplinKategori(10 - (analisa.keajegan || 0), [2,4,7,9]))}`,
      xData+3, yy
    ); yy += 3.1;
    if (yy > 280) { doc.addPage(); yy = 20; }
    doc.text(
      `Ketahanan Kerja    : (Awal: ${(analisa.awal || 0).toFixed(1)}, Akhir: ${(analisa.akhir || 0).toFixed(1)}) = ${(analisa.ketahanan || 0).toFixed(1)}% — ${kategoriRapi(kraeplinKategori(analisa.ketahanan || 0, [50,75,90,100]))}`,
      xData+3, yy
    ); yy += 3.6;
    if (yy > 280) { doc.addPage(); yy = 20; }
    ySection = yy + 2;
    if (ySection > 265) { doc.addPage(); ySection = 20; }
  }

// ========== HELPER: BLOK HEADING & ENSURE SPACE ==========
function ensureSpace(doc, currY, blockHeight) {
  if ((currY + blockHeight) > 270) {
    doc.addPage();
    return 20;
  }
  return currY;
}

function blokHeading(doc, text, color, x, y, width=80, height=8) {
  doc.setFillColor(...color);
  doc.rect(x, y, width, height, 'F');
  doc.setFontSize(9.5);
  doc.setTextColor(255,255,255);
  doc.setFont(undefined, 'bold');
  doc.text(text, x+2, y+5.2);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(44,62,80);
}

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
    "Berdasarkan analisis terhadap pola jawaban yang Anda berikan pada tes DISC, hasil tes ini dinyatakan tidak valid untuk digunakan dalam penilaian kepribadian. Ketidaksesuaian ini menunjukkan bahwa respons yang diberikan tidak merefleksikan kecenderungan kepribadian Anda yang sebenarnya, sehingga analisis lebih lanjut tidak dapat dilakukan secara objektif.",
    "Perlu ditekankan bahwa setiap alat psikotes, termasuk DISC, telah didesain dengan prinsip validitas dan reliabilitas yang tinggi sehingga tidak dapat dimanipulasi. Mengisi tes dengan mencoba menampilkan citra tertentu atau menyesuaikan jawaban dengan ekspektasi hasil hanya akan menghasilkan data yang bias dan tidak mencerminkan diri Anda yang sesungguhnya.",
    "Integritas dalam mengisi tes kepribadian sangat penting untuk memperoleh gambaran yang akurat mengenai potensi, pola perilaku, serta area pengembangan diri. Jawaban yang jujur dan sesuai kondisi diri sendiri merupakan kunci agar hasil analisis benar-benar dapat digunakan untuk tujuan pengembangan, penempatan posisi, atau konsultasi psikologi secara efektif.",
    "Apabila Anda merasa hasil ini tidak mencerminkan diri Anda, penting untuk merenungkan kembali cara pengisian tes di masa mendatang. Isilah setiap tes psikologi dengan kejujuran, spontanitas, dan sesuai instruksi, tanpa upaya untuk mengarahkan hasil, demi memperoleh manfaat yang utuh dari proses psikotes yang Anda jalani."
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
    "DD": [
      "Kepala Divisi",
      "Project Leader",
      "Direktur Eksekutif",
      "Supervisor Operasional"
    ],
    "DI": [
      "Manajer Penjualan",
      "Entrepreneur",
      "Head of Marketing",
      "Ketua Organisasi"
    ],
    "DS": [
      "Manajer Operasional",
      "Supervisor Produksi",
      "Koordinator Proyek",
      "Kepala Sekolah"
    ],
    "DC": [
      "Manajer Proyek Teknis",
      "Quality Control Manager",
      "Kepala Laboratorium",
      "Kepala Program Studi"
    ],
    "ID": [
      "Creative Director",
      "Public Relations Manager",
      "Business Trainer",
      "Koordinator Ekstrakurikuler"
    ],
    "II": [
      "MC",
      "Event Organizer",
      "Motivator",
      "Trainer"
    ],
    "IS": [
      "HRD Manager",
      "Konselor",
      "Guru",
      "Community Engagement Specialist"
    ],
    "IC": [
      "Marketing Analyst",
      "Business Consultant",
      "Pelatih Korporat",
      "Peneliti Pasar"
    ],
    "SD": [
      "Admin Operasional",
      "Koordinator Proyek",
      "Wakil Kepala Sekolah",
      "Team Support Lead"
    ],
    "SI": [
      "Relationship Manager",
      "Customer Success Specialist",
      "Guru SD",
      "Community Facilitator"
    ],
    "SS": [
      "Customer Service Senior",
      "Pembina Organisasi",
      "Supervisor Layanan",
      "Guru Bimbingan Konseling"
    ],
    "SC": [
      "Analis Data",
      "Akuntan",
      "Quality Assurance",
      "Peneliti"
    ],
    "CD": [
      "Engineer R&D",
      "Business Analyst",
      "IT Project Lead",
      "Koordinator Kurikulum"
    ],
    "CI": [
      "Content Planner",
      "Market Researcher",
      "Konsultan Pendidikan",
      "Trainer Bisnis"
    ],
    "CS": [
      "Staff Laboratorium",
      "Data Entry Supervisor",
      "QA Tester",
      "Admin Proses"
    ],
    "CC": [
      "Quality Control Manager",
      "Compliance Officer",
      "Auditor",
      "Analis Sistem"
    ]
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
        "Manajer": [["DI", "ID", "DC", "CD"], ["DS", "IS"]]
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
      `  - Implikasi: ${getImplication(most.dominan[0], 'most')}`
    ].join('\n');

    const introLeast = `• Grafik Least (K): Menggambarkan respons ${nickname} terhadap tekanan dan tantangan.`;
    const leastDetails = [
      `  - Tipe Dominan: ${least.dominan.join(' dan ')} (${least.ranking})`,
      `  - Deskripsi: ${stripHTML(least.deskripsi)}`,
      `  - Implikasi: ${getImplication(least.dominan[0], 'least')}`
    ].join('\n');

    const introChange = `• Grafik Change (P-K): Merefleksikan kemampuan adaptasi ${nickname} antara situasi normal dan tekanan.`;
    const changeDetails = [
      `  - Kombinasi Dominan: ${change.dominan.join(' dan ')} (${change.ranking})`,
      `  - Deskripsi: ${stripHTML(change.deskripsi)}`,
      `  - Implikasi: ${getImplication(change.dominan[0], 'change')}`
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


function getImplication(dominantType, graphType) {
  const implications = {
    D: {
      most: "Cenderung mengambil kepemimpinan dan membuat keputusan cepat",
      least: "Mungkin menunjukkan sikap konfrontatif saat under pressure",
      change: "Potensi peningkatan kontrol emosi dalam situasi stres"
    },
    I: {
      most: "Membangun hubungan interpersonal dengan mudah",
      least: "Mengalami kesulitan dalam situasi yang membutuhkan fokus tinggi",
      change: "Kemampuan beradaptasi sosial di berbagai situasi"
    },
    S: {
      most: "Memberikan stabilitas dan konsistensi dalam tim",
      least: "Kesulitan beradaptasi dengan perubahan mendadak",
      change: "Peningkatan fleksibilitas menghadapi perubahan"
    },
    C: {
      most: "Analitis dan teliti dalam menyelesaikan masalah",
      least: "Cenderung perfectionist yang menghambat progres",
      change: "Kemampuan menyeimbangkan akurasi dan efisiensi"
    }
  };
  return implications[dominantType]?.[graphType] || "Tidak ada data implikasi spesifik";
}

function getCompatibilityReason(symbol, dominantType, position) {
  const reasons = {
    CC: `Dominansi ${dominantType} sangat selaras dengan tuntutan utama posisi ${position}`,
    C: `Karakter ${dominantType} mendukung sebagian besar kebutuhan posisi ${position}`,
    "!": `Ada beberapa aspek dalam ${position} yang membutuhkan pengembangan lebih lanjut`,
    XX: `Ditemukan gap signifikan antara profil kandidat dan kebutuhan posisi`
  };
  return reasons[symbol] || "Tidak tersedia informasi detail kecocokan";
}

function getStrengthArea(dominantType) {
  const strengths = {
    D: "pengambilan keputusan dan kepemimpinan",
    I: "membangun relasi dan kolaborasi",
    S: "menciptakan lingkungan kerja stabil",
    C: "analisis data dan penyelesaian masalah teknis"
  };
  return strengths[dominantType] || "kekuatan spesifik";
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


// ========== PAPI ==========
if (appState.completed.PAPI) {
  ySection += 8;
  if (ySection > 265) { doc.addPage(); ySection = 20; }
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('JAWABAN TES PAPI', 105, ySection, { align: 'center' });
  ySection += 7;
  doc.setFontSize(7.2);
  doc.setFont(undefined, 'normal');

  // Jawaban PAPI 18 kolom × 5 baris, margin seimbang
  const kolom = 18, baris = 5;
  const xStart = 17;   // <--- Lebih ke kiri
  const kolGap = 10;
  for (let i = 0; i < baris; i++) {
    let x = xStart;
    for (let j = 0; j < kolom; j++) {
      const idx = i + j * baris;
      if (idx < appState.answers.PAPI.length) {
        const ans = appState.answers.PAPI[idx];
        const txt = `${String(idx + 1).padStart(2, '0')}.${ans.answer || '-'}`;
        doc.text(txt, x, ySection);
        x += kolGap;
      }
    }
    ySection += 3.1;
    if (ySection > 275) { doc.addPage(); ySection = 22; }
  }
  ySection += 3;
  if (ySection > 265) { doc.addPage(); ySection = 20; }


  // SKOR PAPI - Semua Aspek
  doc.setFont(undefined, 'bold');
doc.text('Skor PAPI:', 25, ySection);
ySection += 2.2;
doc.setFont(undefined, 'normal');

// Gabungkan label + skor setiap kelompok
function gabungSkorKelompok() {
  const bagian = [
    ['Arah Kerja',      appState.skorPAPIArahKerja],
    ['Kepemimpinan',    appState.skorPAPIKepemimpinan],
    ['Aktivitas',       appState.skorPAPIAktivitas],
    ['Pergaulan',       appState.skorPAPIPergaulan],
    ['Gaya Kerja',      appState.skorPAPIGayaKerja],
    ['Sifat',           appState.skorPAPISifat],
    ['Ketaatan',        appState.skorPAPIKetaatan]
  ];
  return bagian.map(([judul, obj]) => {
    if (!obj) return '';
    const skor = Object.entries(obj).map(([k, v]) => `${k}=${v}`).join(' | ');
    return `${judul}: ${skor}`;
  });
}

// Split menjadi beberapa baris agar tidak terpotong di PDF
const skorKelompokArr = gabungSkorKelompok(); // array per kelompok
const MAX_KOLOM_PER_BARIS = 3; // <= Berapa kelompok per baris? 3 = paling aman (landscape, 2 baris), 4 jika ingin agak padat

for (let i = 0; i < skorKelompokArr.length; i += MAX_KOLOM_PER_BARIS) {
  const slice = skorKelompokArr.slice(i, i + MAX_KOLOM_PER_BARIS).join('   |   ');
  doc.text(slice, 25, ySection);
  ySection += 2.3;
  if (ySection > 265) { doc.addPage(); ySection = 20; }
}
  // ==== RANGKUMAN SKOR & INTERPRETASI (DINAMIS) ====
  ySection += 4;
  if (ySection > 265) { doc.addPage(); ySection = 20; }
  doc.setFont(undefined, 'bold');
  doc.text('Rangkuman Skor dan Deskripsi:', 25, ySection);
  ySection += 3;
  doc.setFont(undefined, 'normal');

  // KAMUS INTERPRETASI
  const kamusPAPI = {
    A: [ { range: [0, 4], desc: "Tidak kompetitif, mapan, puas. Tidak terdorong untuk menghasilkan prestasi, tdk berusaha utk mencapai sukses, membutuhkan dorongan dari luar diri, tidak berinisiatif, tidak memanfaatkan kemampuan diri secara optimal, ragu akan tujuan diri, misalnya sbg akibat promosi / perubahan struktur jabatan." }, { range: [5, 7], desc: "Tahu akan tujuan yang ingin dicapainya dan dapat merumuskannya, realistis akan kemampuan diri, dan berusaha untuk mencapai target." }, { range: [8, 9], desc: "Sangat berambisi utk berprestasi dan menjadi yg terbaik, menyukai tantangan, cenderung mengejar kesempurnaan, menetapkan target yg tinggi, 'self-starter', merumuskan kerja dg baik. Tdk realistis akan kemampuannya, sulit dipuaskan, mudah kecewa, harapan yg tinggi mungkin mengganggu org lain." } ],
    N: [ { range: [0, 2], desc: "Tidak terlalu merasa perlu untuk menuntaskan sendiri tugas-tugasnya, senang menangani beberapa pekerjaan sekaligus, mudah mendelegasikan tugas. Komitmen rendah, cenderung meninggalkan tugas sebelum tuntas, konsentrasi mudah buyar, mungkin suka berpindah pekerjaan." }, { range: [3, 5], desc: "Cukup memiliki komitmen untuk menuntaskan tugas, akan tetapi jika memungkinkan akan mendelegasikan sebagian dari pekerjaannya kepada orang lain." }, { range: [6, 7], desc: "Komitmen tinggi, lebih suka menangani pekerjaan satu demi satu, akan tetapi masih dapat mengubah prioritas jika terpaksa." }, { range: [8, 9], desc: "Memiliki komitmen yg sangat tinggi thd tugas, sangat ingin menyelesaikan tugas, tekun dan tuntas dlm menangani pekerjaan satu demi satu hingga tuntas. Perhatian terpaku pada satu tugas, sulit utk menangani beberapa pekerjaan sekaligus, sulit diinterupsi, tidak melihat masalah sampingan." } ],
    G: [ { range: [0, 2], desc: "Santai, kerja adalah sesuatu yang menyenangkan-bukan beban yg membutuhkan usaha besar. Mungkin termotivasi utk mencari cara atau sistem yg dpt mempermudah dirinya dlm menyelesaikan pekerjaan, akan berusaha menghindari kerja keras, sehingga dapat memberi kesan malas." }, { range: [3, 4], desc: "Bekerja keras sesuai tuntutan, menyalurkan usahanya untuk hal-hal yang bermanfaat / menguntungkan." }, { range: [5, 7], desc: "Bekerja keras, tetapi jelas tujuan yg ingin dicapainya." }, { range: [8, 9], desc: "Ingin tampil sbg pekerja keras, sangat suka bila orang lain memandangnya sbg pekerja keras. Cenderung menciptakan pekerjaan yang tidak perlu agar terlihat tetap sibuk, kadang kala tanpa tujuan yang jelas." } ],
    C: [ { range: [0, 2], desc: "Lebih mementingkan fleksibilitas daripada struktur, pendekatan kerja lebih ditentukan oleh situasi daripada oleh perencanaan sebelumnya, mudah beradaptasi. Tidak mempedulikan keteraturan atau kerapihan, ceroboh." }, { range: [3, 4], desc: "Fleksibel tapi masih cukup memperhatikan keteraturan atau sistematika kerja." }, { range: [5, 6], desc: "Memperhatikan keteraturan dan sistematika kerja, tapi cukup fleksibel." }, { range: [7, 9], desc: "Sistematis, bermetoda, berstruktur, rapi dan teratur, dapat menata tugas dengan baik. Cenderung kaku, tidak fleksibel." } ],
    D: [ { range: [0, 1], desc: "Melihat pekerjaan scr makro, membedakan hal penting dari yg kurang penting, mendelegasikan detil pd org lain, generalis. Menghindari detail, konsekuensinya mungkin bertindak tanpa data yg cukup/akurat, bertindak ceroboh pd hal yg butuh kecermatan. Dpt mengabaikan proses yg vital dlm evaluasi data." }, { range: [2, 3], desc: "Cukup peduli akan akurasi dan kelengkapan data." }, { range: [4, 6], desc: "Tertarik untuk menangani sendiri detail." }, { range: [7, 9], desc: "Sangat menyukai detail, sangat peduli akan akurasi dan kelengkapan data. Cenderung terlalu terlibat dengan detail sehingga melupakan tujuan utama." } ],
    R: [ { range: [0, 3], desc: "Tipe pelaksana, praktis - pragmatis, mengandalkan pengalaman masa lalu dan intuisi. Bekerja tanpa perencanaan, mengandalkan perasaan." }, { range: [4, 5], desc: "Pertimbangan mencakup aspek teoritis (konsep atau pemikiran baru) dan aspek praktis (pengalaman) secara berimbang." }, { range: [6, 7], desc: "Suka memikirkan suatu problem secara mendalam, merujuk pada teori dan konsep." }, { range: [8, 9], desc: "Tipe pemikir, sangat berminat pada gagasan, konsep, teori, mencari alternatif baru, menyukai perencanaan. Mungkin sulit dimengerti oleh orang lain, terlalu teoritis dan tidak praktis, mengawang-awang dan berbelit-belit." } ],
    T: [ { range: [0, 3], desc: "Santai. Kurang peduli akan waktu, kurang memiliki rasa urgensi, membuang-buang waktu, bukan pekerja yang tepat waktu." }, { range: [4, 6], desc: "Cukup aktif dalam segi mental, dapat menyesuaikan tempo kerjanya dengan tuntutan pekerjaan / lingkungan." }, { range: [7, 9], desc: "Cekatan, selalu siaga, bekerja cepat, ingin segera menyelesaikan tugas. Negatifnya: Tegang, cemas, impulsif, mungkin ceroboh, banyak gerakan yang tidak perlu." } ],
    V: [ { range: [0, 2], desc: "Cocok untuk pekerjaan 'di belakang meja'. Cenderung lamban, tidak tanggap, mudah lelah, daya tahan lemah." }, { range: [3, 6], desc: "Dapat bekerja di belakang meja dan senang jika sesekali harus terjun ke lapangan atau melaksanakan tugas-tugas yang bersifat mobile." }, { range: [7, 9], desc: "Menyukai aktifitas fisik (a.l.: olah raga), enerjik, memiliki stamina untuk menangani tugas-tugas berat, tidak mudah lelah. Tidak betah duduk lama, kurang dapat konsentrasi 'di belakang meja'." } ],
    W: [ { range: [0, 3], desc: "Hanya butuh gambaran ttg kerangka tugas scr garis besar, berpatokan pd tujuan, dpt bekerja dlm suasana yg kurang berstruktur, berinsiatif, mandiri. Tdk patuh, cenderung mengabaikan/tdk paham pentingnya peraturan/prosedur, suka membuat peraturan sendiri yg bisa bertentangan dg yg telah ada." }, { range: [4, 5], desc: "Perlu pengarahan awal dan tolok ukur keberhasilan." }, { range: [6, 7], desc: "Membutuhkan uraian rinci mengenai tugas, dan batasan tanggung jawab serta wewenang." }, { range: [8, 9], desc: "Patuh pada kebijaksanaan, peraturan dan struktur organisasi. Ingin segala sesuatunya diuraikan secara rinci, kurang memiliki inisiatif, tdk fleksibel, terlalu tergantung pada organisasi, berharap 'disuapi'." } ],
    F: [ { range: [0, 3], desc: "Otonom, dapat bekerja sendiri tanpa campur tangan orang lain, motivasi timbul krn pekerjaan itu sendiri - bukan krn pujian dr otoritas. Mempertanyakan otoritas, cenderung tidak puas thdp atasan, loyalitas lebih didasari kepentingan pribadi." }, { range: [4, 6], desc: "Loyal pada Perusahaan." }, { range: [7, 7], desc: "Loyal pada pribadi atasan." }, { range: [8, 9], desc: "Loyal, berusaha dekat dg pribadi atasan, ingin menyenangkan atasan, sadar akan harapan atasan akan dirinya. Terlalu memperhatikan cara menyenangkan atasan, tidak berani berpendirian lain, tidak mandiri." } ],
    L: [ { range: [0, 1], desc: "Puas dengan peran sebagai bawahan, memberikan kesempatan pada orang lain untuk memimpin, tidak dominan. Tidak percaya diri; sama sekali tidak berminat untuk berperan sebagai pemimpin; bersikap pasif dalam kelompok." }, { range: [2, 3], desc: "Tidak percaya diri dan tidak ingin memimpin atau mengawasi orang lain." }, { range: [4, 4], desc: "Kurang percaya diri dan kurang berminat utk menjadi pemimpin." }, { range: [5, 5], desc: "Cukup percaya diri, tidak secara aktif mencari posisi kepemimpinan akan tetapi juga tidak akan menghindarinya." }, { range: [6, 7], desc: "Percaya diri dan ingin berperan sebagai pemimpin." }, { range: [8, 9], desc: "Sangat percaya diri utk berperan sbg atasan & sangat mengharapkan posisi tersebut. Lebih mementingkan citra & status kepemimpinannya dari pada efektifitas kelompok, mungkin akan tampil angkuh atau terlalu percaya diri." } ],
    P: [ { range: [0, 1], desc: "Permisif, akan memberikan kesempatan pada orang lain untuk memimpin. Tidak mau mengontrol orang lain dan tidak mau mempertanggung jawabkan hasil kerja bawahannya." }, { range: [2, 3], desc: "Enggan mengontrol org lain & tidak mau mempertanggung jawabkan hasil kerja bawahannya, lebih memberi kebebasan kpd bawahan utk memilih cara sendiri dlm penyelesaian tugas dan meminta bawahan utk mempertanggungjawabkan hasilnya masing-masing." }, { range: [4, 4], desc: "Cenderung enggan melakukan fungsi pengarahan, pengendalian dan pengawasan, kurang aktif memanfaatkan kapasitas bawahan secara optimal, cenderung bekerja sendiri dalam mencapai tujuan kelompok." }, { range: [5, 5], desc: "Bertanggung jawab, akan melakukan fungsi pengarahan, pengendalian dan pengawasan, tapi tidak mendominasi." }, { range: [6, 7], desc: "Dominan dan bertanggung jawab, akan melakukan fungsi pengarahan, pengendalian dan pengawasan." }, { range: [8, 9], desc: "Sangat dominan, sangat mempengaruhi & mengawasi org lain, bertanggung jawab atas tindakan & hasil kerja bawahan. Posesif, tdk ingin berada di bawah pimpinan org lain, cemas bila tdk berada di posisi pemimpin, mungkin sulit utk bekerja sama dgn rekan yg sejajar kedudukannya." } ],
    I: [ { range: [0, 1], desc: "Sangat berhati-hati, memikirkan langkah-langkahnya secara bersungguh-sungguh. Lamban dlm mengambil keputusan, terlalu lama merenung, cenderung menghindar mengambil keputusan." }, { range: [2, 3], desc: "Enggan mengambil keputusan." }, { range: [4, 5], desc: "Berhati-hati dlm pengambilan keputusan." }, { range: [6, 7], desc: "Cukup percaya diri dlm pengambilan keputusan, mau mengambil resiko, dpt memutuskan dgn cepat, mengikuti alur logika." }, { range: [8, 9], desc: "Sangat yakin dl mengambil keputusan, cepat tanggap thd situasi, berani mengambil resiko, mau memanfaatkan kesempatan. Impulsif, dpt membuat keputusan yg tdk praktis, cenderung lebih mementingkan kecepatan daripada akurasi, tdk sabar, cenderung meloncat pd keputusan." } ],
    S: [ { range: [0, 2], desc: "Dpt. bekerja sendiri, tdk membutuhkan kehadiran org lain. Menarik diri, kaku dlm bergaul, canggung dlm situasi sosial, lebih memperhatikan hal-hal lain daripada manusia." }, { range: [3, 4], desc: "Kurang percaya diri & kurang aktif dlm menjalin hubungan sosial." }, { range: [5, 9], desc: "Percaya diri & sangat senang bergaul, menyukai interaksi sosial, bisa menciptakan suasana yg menyenangkan, mempunyai inisiatif & mampu menjalin hubungan & komunikasi, memperhatikan org lain. Mungkin membuang-buang waktu utk aktifitas sosial, kurang peduli akan penyelesaian tugas." } ],
    B: [ { range: [0, 2], desc: "Mandiri (dari segi emosi), tdk mudah dipengaruhi oleh tekanan kelompok. Penyendiri, kurang peka akan sikap & kebutuhan kelompok, mungkin sulit menyesuaikan diri." }, { range: [3, 5], desc: "Selektif dlm bergabung dg kelompok, hanya mau berhubungan dg kelompok di lingkungan kerja apabila bernilai & sesuai minat, tdk terlalu mudah dipengaruhi." }, { range: [6, 9], desc: "Suka bergabung dlm kelompok, sadar akan sikap & kebutuhan kelompok, suka bekerja sama, ingin menjadi bagian dari kelompok, ingin disukai & diakui oleh lingkungan; sangat tergantung pd kelompok, lebih memperhatikan kebutuhan kelompok daripada pekerjaan." } ],
    O: [ { range: [0, 2], desc: "Menjaga jarak, lebih memperhatikan hal-hal kedinasan, tdk mudah dipengaruhi oleh individu tertentu, objektif & analitis. Tampil dingin, tdk acuh, tdk ramah, suka berahasia, mungkin tdk sadar akan perasaan org lain, & mungkin sulit menyesuaikan diri." }, { range: [3, 5], desc: "Tidak mencari atau menghindari hubungan antar pribadi di lingkungan kerja, masih mampu menjaga jarak." }, { range: [6, 9], desc: "Peka akan kebutuhan org lain, sangat memikirkan hal-hal yg dibutuhkan org lain, suka menjalin hubungan persahabatan yg hangat & tulus. Sangat perasa, mudah tersinggung, cenderung subjektif, dpt terlibat terlalu dalam/intim dg individu tertentu dlm pekerjaan, sangat tergantung pd individu tertentu." } ],
    X: [ { range: [0, 1], desc: "Sederhana, rendah hati, tulus, tidak sombong dan tidak suka menampilkan diri. Terlalu sederhana, cenderung merendahkan kapasitas diri, tidak percaya diri, cenderung menarik diri dan pemalu." }, { range: [2, 3], desc: "Sederhana, cenderung diam, cenderung pemalu, tidak suka menonjolkan diri." }, { range: [4, 5], desc: "Mengharapkan pengakuan lingkungan dan tidak mau diabaikan tetapi tidak mencari-cari perhatian." }, { range: [6, 9], desc: "Bangga akan diri dan gayanya sendiri, senang menjadi pusat perhatian, mengharapkan penghargaan dari lingkungan. Mencari-cari perhatian dan suka menyombongkan diri." } ],
    E: [ { range: [0, 1], desc: "Sangat terbuka, terus terang, mudah terbaca (dari air muka, tindakan, perkataan, sikap). Tidak dapat mengendalikan emosi, cepat bereaksi, kurang mengindahkan/tidak mempunyai 'nilai' yg mengharuskannya menahan emosi." }, { range: [2, 3], desc: "Terbuka, mudah mengungkap pendapat atau perasaannya mengenai suatu hal kepada org lain." }, { range: [4, 6], desc: "Mampu mengungkap atau menyimpan perasaan, dapat mengendalikan emosi." }, { range: [7, 9], desc: "Mampu menyimpan pendapat atau perasaannya, tenang, dapat mengendalikan emosi, menjaga jarak. Tampil pasif dan tidak acuh, mungkin sulit mengungkapkan emosi/perasaan/pandangan." } ],
    K: [ { range: [0, 1], desc: "Sabar, tidak menyukai konflik. Mengelak atau menghindar dari konflik, pasif, menekan atau menyembunyikan perasaan sesungguhnya, menghindari konfrontasi, lari dari konflik, tidak mau mengakui adanya konflik." }, { range: [2, 3], desc: "Lebih suka menghindari konflik, akan mencari rasionalisasi untuk dapat menerima situasi dan melihat permasalahan dari sudut pandang orang lain." }, { range: [4, 5], desc: "Tidak mencari atau menghindari konflik, mau mendengarkan pandangan orang lain tetapi dapat menjadi keras kepala saat mempertahankan pandangannya." }, { range: [6, 7], desc: "Akan menghadapi konflik, mengungkapkan serta memaksakan pandangan dengan cara positif." }, { range: [8, 9], desc: "Terbuka, jujur, terus terang, asertif, agresif, reaktif, mudah tersinggung, mudah meledak, curiga, berprasangka, suka berkelahi atau berkonfrontasi, berpikir negatif." } ],
    Z: [ { range: [0, 1], desc: "Mudah beradaptasi dg pekerjaan rutin tanpa merasa bosan, tidak membutuhkan variasi, menyukai lingkungan stabil dan tidak berubah. Konservatif, menolak perubahan, sulit menerima hal-hal baru, tidak dapat beradaptasi dengan situasi yg berbeda-beda." }, { range: [2, 3], desc: "Enggan berubah, tidak siap untuk beradaptasi, hanya mau menerima perubahan jika alasannya jelas dan meyakinkan." }, { range: [4, 5], desc: "Mudah beradaptasi, cukup menyukai perubahan." }, { range: [6, 7], desc: "Antusias terhadap perubahan dan akan mencari hal-hal baru, tetapi masih selektif (menilai kemanfaatannya)." }, { range: [8, 9], desc: "Sangat menyukai perubahan, gagasan baru/variasi, aktif mencari perubahan, antusias dg hal-hal baru, fleksibel dlm berpikir, mudah beradaptasi pd situasi yg berbeda-beda. Gelisah, frustasi, mudah bosan, sangat membutuhkan variasi, tidak menyukai tugas/situasi yg rutin-monoton." } ],
  };

  function getInterpretasiPAPI(aspek, nilai) {
    if (!kamusPAPI[aspek]) return "-";
    const entry = kamusPAPI[aspek].find(r => nilai >= r.range[0] && nilai <= r.range[1]);
    return entry ? entry.desc : "-";
  }

  // Susunan kode tetap & urut
   const urutanPAPI = [
    'N','G','A', 'L','P','I', 'T','V',
    'X','S','B','O', 'R','D','C',
    'Z','E','K', 'F','W'
  ];
  const allScores = {
    ...appState.skorPAPIArahKerja,
    ...appState.skorPAPIKepemimpinan,
    ...appState.skorPAPIAktivitas,
    ...appState.skorPAPIPergaulan,
    ...appState.skorPAPIGayaKerja,
    ...appState.skorPAPISifat,
    ...appState.skorPAPIKetaatan
  };
  const entries = urutanPAPI.map(kode => [kode, allScores[kode]]).filter(([k,v])=>v !== undefined);

  // Fungsi getInterpretasiPAPI dari kamus, ambil deskripsi sesuai skor kandidat
  function getInterpretasiPAPI(aspek, nilai) {
    if (!kamusPAPI[aspek]) return "-";
    const entry = kamusPAPI[aspek].find(r => nilai >= r.range[0] && nilai <= r.range[1]);
    return entry ? entry.desc : "-";
  }

  // Tulis dua kolom interpretasi faktor (paragraf lengkap)
  let yL = ySection;
  let yR = ySection;
  const xL = 25;
  const xR = 112;
  doc.setFontSize(6.2);

  function drawKolom(pasangan, xStart, yStart) {
    let y = yStart;
    pasangan.forEach(([kode, nilai]) => {
      if (nilai == null) return;
      doc.setFont(undefined, 'bold');
      doc.text(`${kode} = ${nilai}`, xStart, y);
      doc.setFont(undefined, 'normal');
      // Ambil interpretasi lengkap dari kamus
      const interpretasi = getInterpretasiPAPI(kode, nilai);
      // Bungkus ke multi-line agar tidak tabrakan
      const lines = doc.splitTextToSize(interpretasi, 72);
      lines.forEach((line, i) => {
        doc.text(line, xStart + 12, y + (i * 2.3));
      });
      y += 4.6 + (lines.length-1)*2.3;
      if (y > 265) { doc.addPage(); y = 20; }
    });
    return y;
  }

 function hitungTinggiKolom(pasangan, fontSize = 6.2) {
  let totalY = 0;
  pasangan.forEach(([kode, nilai]) => {
    if (nilai == null) return;
    const interpretasi = getInterpretasiPAPI(kode, nilai);
    const lines = doc.splitTextToSize(interpretasi, 72);
    totalY += 4.6 + (lines.length - 1) * 2.3;
  });
  return totalY;
}

const nHalf = Math.ceil(entries.length / 2);
const kolomKiri = entries.slice(0, nHalf);
const kolomKanan = entries.slice(nHalf);

// Tambahkan logika untuk cek tinggi maksimal dari kedua kolom
const tinggiKiri = hitungTinggiKolom(kolomKiri);
const tinggiKanan = hitungTinggiKolom(kolomKanan);
const tinggiMax = Math.max(tinggiKiri, tinggiKanan);

if (ySection + tinggiMax > 275) {
  doc.addPage();
  ySection = 20;
}

// Cetak dua kolom berdampingan, tetap satu halaman
yL = drawKolom(kolomKiri, xL, ySection);
yR = drawKolom(kolomKanan, xR, ySection);
ySection = Math.max(yL, yR) + 6;


// === ANALISIS & KECOCOKAN POSISI DETAIL PAPI ===
const posisi = appState.identity?.position || "Unknown";
doc.setFontSize(7);
doc.setFont(undefined, 'bold');
doc.text(`Analisis Kecocokan untuk Posisi: ${posisi}`, 25, ySection);
ySection += 3;
doc.setFont(undefined, 'normal');

// Gabungan skor hasil PAPI (semua faktor)
const scores = allScores; // sudah lengkap N,G,A,...,W

// ==== MAPPING KEBUTUHAN PER POSISI DAN ANALISIS PERSONAL ====
const requirementPAPI = {
  "Technical Staff": {
    utama: ['D', 'C', 'W', 'N', 'G', 'A'],
    pendukung: ['E', 'K', 'Z', 'T'],
    highlight: {
      D: 'ketelitian & perhatian detail',
      C: 'keteraturan kerja',
      W: 'kepatuhan & disiplin',
      N: 'tanggung jawab menyelesaikan tugas',
      G: 'semangat kerja',
      A: 'motivasi berprestasi',
      E: 'pengendalian emosi',
      K: 'ketegasan',
      Z: 'adaptasi pada perubahan',
      T: 'kecepatan & aktivitas'
    }
  },
  "Guru": {
    utama: ['S', 'B', 'O', 'N', 'G', 'A', 'E', 'K'],
    pendukung: ['Z', 'R', 'C'],
    highlight: {
      S: 'kemampuan sosial',
      B: 'kerjasama dalam kelompok',
      O: 'kehangatan & empati',
      N: 'komitmen kerja',
      G: 'energi kerja',
      A: 'semangat berprestasi',
      E: 'stabilitas emosi',
      K: 'ketegasan mengelola kelas',
      Z: 'adaptasi inovasi',
      R: 'penalaran & kreativitas',
      C: 'keteraturan administrasi'
    }
  },
  "Administrator": {
    utama: ['D', 'C', 'W', 'N', 'G'],
    pendukung: ['R', 'T', 'F', 'A'],
    highlight: {
      D: 'ketelitian & perhatian detail',
      C: 'keteraturan & sistematika',
      W: 'kepatuhan sistem',
      N: 'tanggung jawab kerja',
      G: 'konsistensi kerja',
      R: 'analisa data',
      T: 'aktivitas administrasi',
      F: 'loyalitas organisasi',
      A: 'motivasi hasil'
    }
  },
  "Manajer": {
    utama: ['A', 'G', 'N', 'L', 'P', 'I', 'S', 'B', 'Z', 'E'],
    pendukung: ['D', 'C', 'K', 'O'],
    highlight: {
      A: 'inisiatif & motivasi',
      G: 'dorongan kerja',
      N: 'komitmen menyelesaikan tugas',
      L: 'kepemimpinan',
      P: 'pengendalian tim',
      I: 'keputusan strategis',
      S: 'kemampuan sosial',
      B: 'kolaborasi',
      Z: 'adaptasi perubahan',
      E: 'pengendalian emosi',
      D: 'detail operasional',
      C: 'sistematika kerja',
      K: 'ketegasan pengambilan keputusan',
      O: 'relasi personal'
    }
  }
};

function analisisKecocokanPAPIDetail(scores, posisi, nama = "Kandidat") {
  const req = requirementPAPI[posisi];
  if (!req) return `Posisi "${posisi}" tidak dikenali.`;

  let paragraf = `Analisis kecocokan ${nama} untuk posisi **${posisi}** berdasarkan hasil Tes PAPI:\n\n`;

  // Semua faktor utama
  paragraf += `*Faktor utama posisi:*\n`;
  req.utama.forEach(k => {
    paragraf += `- ${req.highlight[k]} (skor: ${scores[k] ?? "-"}): ${getInterpretasiPAPI(k, scores[k] ?? 0)}\n`;
  });

  paragraf += `\n`;

  // Semua faktor pendukung
  paragraf += `*Faktor pendukung posisi:*\n`;
  req.pendukung.forEach(k => {
    paragraf += `- ${req.highlight[k]} (skor: ${scores[k] ?? "-"}) : ${getInterpretasiPAPI(k, scores[k] ?? 0)}\n`;
  });

  paragraf += `\n`;

  // Paragraf ringkasan kelebihan dan area pengembangan seperti biasa
  const kelebihan = [];
  const pengembangan = [];
  req.utama.forEach(k => {
    if ((scores[k] ?? 0) >= 6) kelebihan.push(req.highlight[k] + ` (skor: ${scores[k]})`);
    if ((scores[k] ?? 0) < 3) pengembangan.push(req.highlight[k] + ` (skor: ${scores[k]})`);
  });
  req.pendukung.forEach(k => {
    if ((scores[k] ?? 0) >= 7) kelebihan.push(req.highlight[k] + ` (skor: ${scores[k]})`);
    if ((scores[k] ?? 0) < 2) pengembangan.push(req.highlight[k] + ` (skor: ${scores[k]})`);
  });

  if (kelebihan.length > 0) {
    paragraf += `*Kekuatan utama:*\n${kelebihan.map(s=>'- '+s).join('\n')}\n\n`;
  } else {
    paragraf += `Tidak ditemukan kekuatan menonjol pada faktor utama. Perlu dikembangkan lebih lanjut.\n\n`;
  }
  if (pengembangan.length > 0) {
    paragraf += `*Area yang perlu dikembangkan:*\n${pengembangan.map(s=>'- '+s).join('\n')}\n\n`;
  }
  if (kelebihan.length > 0 && pengembangan.length === 0) {
    paragraf += `Kandidat memiliki kompetensi yang sangat baik untuk posisi ini.`;
  } else if (kelebihan.length > 0 && pengembangan.length > 0) {
    paragraf += `Kandidat memiliki beberapa kelebihan penting namun juga area pengembangan yang perlu diperhatikan sebelum menempati posisi ini.`;
  } else {
    paragraf += `Kandidat belum memenuhi banyak aspek utama posisi ini. Disarankan untuk pengembangan lebih lanjut atau penempatan pada posisi lain yang lebih sesuai.`;
  }
  return paragraf;
}


// === CETAK ANALISA DETAIL KE PDF ===
const nama = appState.identity?.name || "Kandidat";
const hasilAnalisisDetail = analisisKecocokanPAPIDetail(scores, posisi, nama);

// Print section judul (rapi dan sedikit lebih menonjol)
doc.setFontSize(8.5);
doc.setFont(undefined, 'bold');
doc.setTextColor(61, 131, 223);
doc.text(`Analisis Kecocokan untuk Posisi: ${posisi}`, 20, ySection);
doc.setTextColor(0, 0, 0);
doc.setFontSize(7);
doc.setFont(undefined, 'normal');
ySection += 4;

// Cetak analisis detail, tiap baris di-wrap (wrap per-baris, bukan sekaligus)
hasilAnalisisDetail.split('\n').forEach(baris => {
  // Wrap tiap baris supaya anti overflow kanan
  const wrapLines = doc.splitTextToSize(baris, 160);  // 160 = lebar aman, bisa diatur sesuai kebutuhan
  wrapLines.forEach(wrapLine => {
    if (ySection > 275) { doc.addPage(); ySection = 20; }
    // Tambahkan sedikit indent pada bullet (- atau *) biar lebih enak dibaca
    const xPos = (baris.startsWith('-') || baris.startsWith('*')) ? 27 : 20;
    doc.text(wrapLine, xPos, ySection);
    ySection += 3;
  });
});
ySection += 5;}

// ========== BIG FIVE ==========
if (appState.completed.BIGFIVE) {
  ySection += 6;
  if (ySection > 265) { doc.addPage(); ySection = 20; }
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Tes Big Five', 105, ySection, { align: 'center' });
  ySection += 4;

  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  doc.text('Jawaban:', 20, ySection);
  ySection += 3;

  // --- 4 kolom, rata kiri-kanan, fit PDF A4 landscape/portrait ---
 const total = tests.BIGFIVE.questions.length;
const col_x = [18, 63, 108, 153];
const rowsPerCol = Math.ceil(total / 4);

let row = 0, col = 0, maxRow = 0;

for (let i = 0; i < total; i++) {
  // --- CEK: jika sudah mentok halaman, ganti halaman baru ---
  if ((ySection + row * 3) > 275) { // 275 px batas aman
    doc.addPage();
    ySection = 22; // atau sesuai margin atas halaman baru
    row = 0;
    col++; // lanjut ke kolom kanan, BUKAN RESET KE 0
    if (col > 3) { col = 0; } // kalau sudah 4 kolom, reset ke 0 (aman)
  }
  if (row >= rowsPerCol) { row = 0; col++; }
  if (col > 3) { doc.addPage(); ySection = 22; col = 0; row = 0; }
  const ans = appState.answers.BIGFIVE[i];
  let jawaban = "Tidak dijawab";
  if (typeof ans === 'number' && ans > 0) {
    if (ans === 1) jawaban = "1 (Sangat Tidak Sesuai)";
    else if (ans === 2) jawaban = "2 (Tidak Sesuai)";
    else if (ans === 3) jawaban = "3 (Netral)";
    else if (ans === 4) jawaban = "4 (Sesuai)";
    else if (ans === 5) jawaban = "5 (Sangat Sesuai)";
    else jawaban = ans.toString();
  }
  doc.text(
    `${(i + 1).toString().padStart(3, '0')}. ${jawaban}`,
    col_x[col], ySection + row * 3
  );
  row++;
  maxRow = Math.max(maxRow, row);
}
ySection += maxRow * 3 + 3;
  // ===== Ringkasan OCEAN =====
  if (appState.hasilOCEAN) {
    if (ySection > 255) { doc.addPage(); ySection = 20; }
    doc.setFont(undefined, 'bold');
    doc.text('Ringkasan Hasil OCEAN:', 20, ySection);
    ySection += 3;
    doc.setFont(undefined, 'normal');
    Object.entries(appState.hasilOCEAN).forEach(([dim, val]) => {
      if (ySection > 280) { doc.addPage(); ySection = 20; }
      const splitText = doc.splitTextToSize(
        `${val.name.padEnd(15)} | Skor: ${val.percent.toString().padStart(2, ' ')}% | ${val.desc}`,
        170
      );
      splitText.forEach(part => {
        if (ySection > 280) { doc.addPage(); ySection = 20; }
        doc.text(part, 25, ySection);
        ySection += 3.1;
      });
    });
    ySection += 2;
  }

  // ===== Tabel Kecocokan OCEAN per Aspek & Posisi + Kesimpulan =====
  if (appState.hasilOCEAN && appState.identity && appState.identity.position) {
    let posisiKey = appState.identity.position;
    if (posisiKey === "Guru" && appState.identity.teacherLevel && bigFivePositionAnalysis[appState.identity.teacherLevel]) {
      posisiKey = appState.identity.teacherLevel;
    }
    if (posisiKey === "Technical Staff" && appState.identity.techRole && bigFivePositionAnalysis[appState.identity.techRole]) {
      posisiKey = appState.identity.techRole;
    }
    const aspekList = ['O', 'C', 'E', 'A', 'N'];
    const aspekLabel = {
      O: 'Openness',
      C: 'Conscientiousness',
      E: 'Extraversion',
      A: 'Agreeableness',
      N: 'Neuroticism'
    };
    function getBigFiveSuitabilityLabel(percent, dim) {
      if (dim === 'N') {
        if (percent < 40) return "Cocok sekali";
        if (percent < 65) return "Cocok";
        if (percent < 80) return "Kurang cocok";
        return "Tidak cocok";
      } else {
        if (percent >= 80) return "Cocok sekali";
        if (percent >= 65) return "Cocok";
        if (percent >= 40) return "Kurang cocok";
        return "Tidak cocok";
      }
    }

    // Simpan hasil kecocokan per aspek
    let aspekHasil = [];
    if (ySection > 250) { doc.addPage(); ySection = 20; }
    doc.setFont(undefined, 'bold');
    doc.text("Tabel Kecocokan Big Five dengan Posisi:", 20, ySection);
    ySection += 3;
    doc.setFont(undefined, 'normal');
    doc.text("Aspek             | Skor (%) | Kecocokan", 25, ySection);
    ySection += 3;
    aspekList.forEach(dim => {
      const val = appState.hasilOCEAN[dim];
      if (!val) return;
      let label = getBigFiveSuitabilityLabel(val.percent, dim);
      aspekHasil.push({ dim, label, percent: val.percent });
      let line = `${aspekLabel[dim].padEnd(15)} | ${val.percent.toString().padStart(3)}%    | ${label}`;
      doc.text(line, 25, ySection);
      ySection += 2.6;
    });
    ySection += 1.8;

    // ===== Kesimpulan Akhir Kecocokan =====
    // Hitung jumlah tiap kategori
    const count = { 'Cocok sekali': 0, 'Cocok': 0, 'Kurang cocok': 0, 'Tidak cocok': 0 };
    aspekHasil.forEach(a => count[a.label]++);
    let urutan = ["Tidak cocok", "Kurang cocok", "Cocok", "Cocok sekali"];
    let overall = urutan.find(label => count[label] === Math.max(...Object.values(count))) || "Kurang cocok";

    doc.setFont(undefined, 'bold');
    doc.text("Kesimpulan Akhir Kecocokan:", 25, ySection);
    ySection += 2.7;
    doc.setFont(undefined, 'normal');
    doc.text(`${overall.toUpperCase()}`, 90, ySection - 0.2);

    // ===== Alasan Lengkap & Detail =====
    const strongest = aspekHasil.filter(a => a.label === "Cocok sekali" || a.label === "Cocok").sort((a, b) => b.percent - a.percent)[0];
    const weakest = aspekHasil.filter(a => a.label === "Tidak cocok" || a.label === "Kurang cocok").sort((a, b) => a.percent - b.percent)[0];

    ySection += 2.6;
    doc.setFont(undefined, 'bold');
    doc.text("Alasan:", 25, ySection);
    ySection += 2.2;
    doc.setFont(undefined, 'normal');
    let alasan;
    if (overall === "Cocok sekali") {
      alasan = `Seluruh aspek kepribadian kandidat sangat sesuai dengan tuntutan posisi. Aspek paling menonjol adalah ${strongest ? aspekLabel[strongest.dim] + " (" + strongest.percent + "%)" : "-"}, yang menjadi kekuatan utama dalam menunjang kinerja dan adaptasi pada posisi ini. Tidak ditemukan aspek yang menghambat secara signifikan.`;
    } else if (overall === "Cocok") {
      alasan = `Sebagian besar aspek kepribadian kandidat sesuai dengan tuntutan posisi. Aspek yang paling mendukung adalah ${strongest ? aspekLabel[strongest.dim] + " (" + strongest.percent + "%)" : "-"}, yang sangat menunjang kebutuhan utama pada posisi ini. Namun, terdapat beberapa aspek yang perlu dikembangkan, yaitu ${weakest ? aspekLabel[weakest.dim] + " (" + weakest.percent + "%)" : "-"}, agar kinerja dan adaptasi kandidat dapat semakin optimal.`;
    } else if (overall === "Kurang cocok") {
      alasan = `Beberapa aspek kepribadian kandidat belum memenuhi kriteria utama posisi ini, terutama pada aspek ${weakest ? aspekLabel[weakest.dim] + " (" + weakest.percent + "%)" : "-"} yang menjadi area penghambat utama. Penguatan pada aspek ini sangat disarankan agar kandidat dapat menyesuaikan diri secara lebih efektif. Meski demikian, ada pula aspek yang sudah sesuai yaitu ${strongest ? aspekLabel[strongest.dim] + " (" + strongest.percent + "%)" : "-"}, yang dapat dijadikan modal awal pengembangan.`;
    } else { // Tidak cocok
      alasan = `Sebagian besar aspek kepribadian kandidat tidak sesuai dengan tuntutan posisi, terutama pada aspek ${weakest ? aspekLabel[weakest.dim] + " (" + weakest.percent + "%)" : "-"}, yang berpotensi menjadi hambatan besar dalam pelaksanaan tugas. Diperlukan pengembangan menyeluruh dan penyesuaian pada hampir seluruh aspek agar dapat mencapai kecocokan yang dibutuhkan pada posisi ini.`;
    }
    const alasanLines = doc.splitTextToSize(alasan, 170);
    alasanLines.forEach(line => {
      if (ySection > 280) { doc.addPage(); ySection = 20; }
      doc.text(line, 25, ySection);
      ySection += 2.7;
    });
    ySection += 2.5;
  }

  // ===== Analisa Kepribadian & Kecocokan Posisi (Narasi detail, tanpa judul) =====
  if (appState.identity && appState.identity.position) {
    let posisiKey = appState.identity.position;
    if (
      posisiKey === "Guru" &&
      appState.identity.teacherLevel &&
      bigFivePositionAnalysis[appState.identity.teacherLevel]
    ) {
      posisiKey = appState.identity.teacherLevel;
    }
    if (
      posisiKey === "Technical Staff" &&
      appState.identity.techRole &&
      bigFivePositionAnalysis[appState.identity.techRole]
    ) {
      posisiKey = appState.identity.techRole;
    }
    const analisa = bigFivePositionAnalysis[posisiKey];
    if (analisa && analisa.length > 0) {
      if (ySection > 255) { doc.addPage(); ySection = 20; }
      doc.setFont(undefined, 'normal');
      analisa.forEach(line => {
        const splitText = doc.splitTextToSize(line, 170);
        splitText.forEach(part => {
          if (ySection > 280) { doc.addPage(); ySection = 20; }
          doc.text(part, 25, ySection);
          ySection += 3.3;
        });
      });
      ySection += 2;
    }
  }
}
// ========== GRAFIS ==========
// Full page, tanpa margin, gambar proporsional dan diperbesar maksimal
const grafisLabel = {
  orang: "Tes DAP (Draw A Person) - Gambar Orang",
  rumah: "Tes HTP (House-Tree-Person) - Gambar Rumah, Pohon, Orang",
  pohon: "Tes BAUM (Tree Drawing Test) - Gambar Pohon"
};

if (appState.completed.GRAFIS && appState.grafis) {
  const grafisKeys = ["orang", "rumah", "pohon"];
  for (const key of grafisKeys) {
    if (appState.grafis[key]) {
      await new Promise(resolve => {
        doc.addPage();
        // Tidak ada teks/judul apapun

        // Load gambar untuk dapat ukuran asli (agar scaling proporsional)
        const img = new window.Image();
        img.onload = function() {
          const pxToMm = px => px * 0.264583;
          const pageW = doc.internal.pageSize.getWidth();
          const pageH = doc.internal.pageSize.getHeight();

          let imgWmm = pxToMm(img.naturalWidth);
          let imgHmm = pxToMm(img.naturalHeight);
          const scale = Math.min(pageW / imgWmm, pageH / imgHmm);
          imgWmm *= scale;
          imgHmm *= scale;
          const x = (pageW - imgWmm) / 2;
          const y = (pageH - imgHmm) / 2;

          doc.addImage(appState.grafis[key], 'JPEG', x, y, imgWmm, imgHmm);
          resolve();
        };
        img.src = appState.grafis[key];
      });
    }
  }
  // === Pastikan pindah halaman setelah blok GRAFIS, reset ySection ===
  doc.addPage();
  ySection = 25;
}

// ========== TES ADMIN (EXCEL) ==========
if (appState.completed.EXCEL && appState.adminAnswers && appState.adminAnswers.EXCEL && appState.adminAnswers.EXCEL.link) {
  ySection += 5;
  if (ySection > 260) { doc.addPage(); ySection = 25; }
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Tes Admin: Excel/Spreadsheet', 20, ySection);
  ySection += 4;
  doc.setFont(undefined, 'normal');
  doc.setTextColor(33, 77, 170);
  const link = appState.adminAnswers.EXCEL.link;
  const wrapLink = doc.splitTextToSize(link, 160);
  doc.text('Link Google Sheet Jawaban:', 24, ySection);
  ySection += 4;
  doc.text(wrapLink, 24, ySection);
  ySection += 6;
  doc.setTextColor(44, 62, 80);
  if (ySection > 260) { doc.addPage(); ySection = 25; }
}

// ========== TES MENGETIK ==========
if (appState.completed.TYPING && appState.answers.TYPING) {
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Tes Mengetik', 20, ySection);
  ySection += 4;
  doc.setFont(undefined, 'normal');
  doc.setTextColor(44, 62, 80);

  const typing = appState.answers.TYPING;
  doc.text(`Karakter benar     : ${typing.benar}`, 24, ySection); ySection += 4;
  doc.text(`Karakter salah     : ${typing.salah}`, 24, ySection); ySection += 4;
  doc.text(`Belum diketik      : ${typing.belum}`, 24, ySection); ySection += 4;
  doc.text(`Akurasi            : ${typing.accuracy}%`, 24, ySection); ySection += 4;
  doc.text(`Kecepatan          : ${typing.wpm} kata/menit (WPM)`, 24, ySection); ySection += 4;
  doc.text(`Waktu digunakan    : ${typing.waktu} detik`, 24, ySection); ySection += 4;
  doc.text(`Teks hasil ketik:`, 24, ySection); ySection += 4;

  const typedText = typing.text ? typing.text.replace(/\n/g, " ") : "";
  const wrapTyping = doc.splitTextToSize(typedText, 160);
  doc.text(wrapTyping, 28, ySection);
  ySection += 4 + wrapTyping.length * 4;
  if (ySection > 260) { doc.addPage(); ySection = 25; }
  doc.setTextColor(44, 62, 80);
}

// ========== FOOTER UNTUK TANDA TANGAN ==========
let footerY = 285;
if (ySection > 245) { doc.addPage(); footerY = 285; }
const footerX = pageWidth - 20;

doc.setFontSize(10);
doc.setFont(undefined, 'bold');
doc.text('TESTER,', footerX, footerY - 36, { align: "right" });
doc.setFont(undefined, 'normal');
// Ruang tanda tangan manual (24mm kosong)
doc.text('Deni Pragas Septian Pratama', footerX, footerY - 12, { align: "right" });
doc.text('Human Capital Recruitment Staff', footerX, footerY - 6, { align: "right" });
doc.text('Sugar Group Schools', footerX, footerY, { align: "right" });

// Simpan file

let namaFile = (id.name||"Peserta").replace(/[^a-zA-Z0-9]/g,'-') + "-Psikotes-SGSchools.pdf";
doc.save(namaFile);

// === Tambahan fitur logout setelah download ke-2 ===
downloadClickCount++;
if (downloadClickCount === 2) {
  const box = document.getElementById('downloadPDFBox');
  if (box) {
    box.innerHTML = `
      <button class="btn btn-danger" id="btnLogoutPDF" style="padding:18px 40px;font-size:1.17rem;font-weight:700;">
        🔒 Logout
      </button>
    `;
    document.getElementById('btnLogoutPDF').onclick = function() {
      localStorage.setItem('usedPragas', '1'); // Password jadi "pragass"
      localStorage.removeItem('identity');     // Hapus data user
      setTimeout(() => {
        location.reload();
      }, 250);
    };
  }
}

}
