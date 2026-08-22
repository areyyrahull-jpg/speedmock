// hindiLessonData.js
// Hindi finger-placement course. Built directly from this product's own
// verified keymaps (fingerMap / krutiMap / mangalMap — copied exactly from
// hinditypingtips.jsx) so it stays consistent with the rest of the app,
// rather than an independently-reconstructed Inscript chart.
//
// IMPORTANT — flagged for confirmation, see chat: mangalMap (as shipped)
// has no Halant (्) anywhere, unlike krutiMap (D key). Real Unicode
// Inscript normally puts Halant on D in both modes. This file does not
// invent one — Home Row Lesson 3's Halant framing only fully applies in
// "kruti" mode until that's resolved.

export const FINGER_COLORS = {
  left_pinky:   "#ef4444",
  left_ring:    "#f97316",
  left_middle:  "#eab308",
  left_index:   "#22c55e",
  right_index:  "#06b6d4",
  right_middle: "#3b82f6",
  right_ring:   "#8b5cf6",
  right_pinky:  "#ec4899",
};
export const FINGER_LABELS = {
  left_pinky:"Left Pinky", left_ring:"Left Ring", left_middle:"Left Middle", left_index:"Left Index",
  right_index:"Right Index", right_middle:"Right Middle", right_ring:"Right Ring", right_pinky:"Right Pinky",
};
const FINGER_BY_INDEX = ["left_pinky","left_ring","left_middle","left_index","right_index","right_middle","right_ring","right_pinky"];

// ── exact copies from hinditypingtips.jsx ──────────────────────────
export const KB_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L",";"],
  ["Z","X","C","V","B","N","M",",",".","/"],
];

const FINGER_INDEX_MAP = {
  Q:0,A:0,Z:0, W:1,S:1,X:1, E:2,D:2,C:2,
  R:3,F:3,V:3,T:3,G:3, Y:4,H:4,B:4,U:4,J:4,N:4,M:4,
  I:5,K:5,",":5, O:6,L:6,".":6, P:7,";":7,"/":7,
};
export const KEY_FINGER_MAP = Object.fromEntries(
  Object.entries(FINGER_INDEX_MAP).map(([k, i]) => [k, FINGER_BY_INDEX[i]])
);
export const KEYBOARD_LAYOUT = { rows: KB_ROWS, keyFinger: KEY_FINGER_MAP };

export const KRUTI_MAP = {
  Q:"ौ", W:"ै", E:"ा", R:"ी", T:"ू", Y:"ब", U:"ह", I:"ग", O:"द", P:"ज",
  A:"ो", S:"े", D:"्", F:"ि", G:"ु", H:"प", J:"र", K:"क", L:"त", ";":"च",
  Z:".", X:"थ", C:"म", V:"न", B:"व", N:"ल", M:"स", ",":",",
};
export const MANGAL_MAP = {
  Q:"औ", W:"ऐ", E:"आ", R:"ई", T:"ऊ", Y:"भ", U:"ङ", I:"घ", O:"ध", P:"झ",
  A:"ओ", S:"ए", D:"अ", F:"इ", G:"उ", H:"फ", J:"ड", K:"ख", L:"थ", ";":"छ",
  Z:"'", X:"ठ", C:"ण", V:"ञ", B:"ब", N:"ळ", M:"श", ",":":",
};

// Converts a physical-key sequence (e.g. "AAA SSS") into the Devanagari
// (or fallback literal) string for the active layout.
export function renderHindi(keys, layout) {
  const map = layout === "mangal" ? MANGAL_MAP : KRUTI_MAP;
  return keys.split("").map(ch => {
    if (ch === " ") return " ";
    const upper = ch.toUpperCase();
    return map[upper] !== undefined ? map[upper] : ch; // fallback: literal key (matches app's own ||k pattern)
  }).join("");
}

const UNLOCK = { wpm: 0, accuracy: 80 };

export const TIERS = [
  { id: "beginner",     label: "Beginner",     blurb: "हर matra और consonant की सही उंगली सीखें" },
  { id: "intermediate", label: "Intermediate", blurb: "Bottom row, Halant और Conjuncts" },
  { id: "advanced",     label: "Advanced",     blurb: "Combos और real typing की रफ़्तार" },
];

export const HINDI_MODULES = [
  {
    id: "home-row", title: "Home Row Foundation", icon: "🏠", color: "#22c55e", tier: "beginner",
    blurb: "हर keystroke यहीं से शुरू और यहीं ख़त्म होता है।",
    lessons: [
      {
        id: "hr-1", title: "A और ; (Pinky)", newKeys: ["A",";"],
        instruction: "बाईं पिंकी A पर, दाईं पिंकी ; पर रखें। ये आपकी सबसे कमज़ोर उंगलियाँ हैं — हल्के स्पर्श से टाइप करें।",
        drills: [
          { type:"single", label:"Warm-up", keys:"AAA ;;; AAA ;;; A;A; ;A;A" },
          { type:"alt", label:"Alternating", keys:"A; ;A A; ;A AS ;L AS ;L" },
          { type:"review", label:"Review", keys:"A; ;A AAA ;;; A;A; ;A;A A; ;A" },
        ],
      },
      {
        id: "hr-2", title: "S और L (Ring)", newKeys: ["S","L"],
        instruction: "रिंग फिंगर — बाईं S पर, दाईं L पर। Home row के पास ही रखें, ज़्यादा मत खींचें।",
        drills: [
          { type:"single", label:"Warm-up", keys:"SSS LLL SSS LLL SLSL LSLS" },
          { type:"alt", label:"Alternating", keys:"SL LS SL LS SA L; SA L;" },
          { type:"review", label:"Review", keys:"A; S L AS L; SLSL A;SL" },
        ],
      },
      {
        id: "hr-3", title: "D और K (Middle) — हलन्त", newKeys: ["D","K"],
        instruction: "मिडिल फिंगर सबसे मज़बूत होती है। D कुंजी पर हलन्त (्) है — Kruti Dev में हिंदी टाइपिंग की सबसे ज़रूरी कुंजी, क्योंकि यही दो व्यंजनों को जोड़कर संयुक्ताक्षर (conjunct) बनाती है।",
        drills: [
          { type:"single", label:"Warm-up", keys:"DDD KKK DDD KKK DKDK KDKD" },
          { type:"alt", label:"Alternating", keys:"DK KD DK KD DS KL DS KL" },
          { type:"review", label:"Review", keys:"A; SL DK ASDK ;LKD DKDK" },
        ],
      },
      {
        id: "hr-4", title: "F और J (Index)", newKeys: ["F","J"],
        instruction: "इंडेक्स फिंगर — बाईं F पर, दाईं J पर। दोनों कुंजियों पर उभरी हुई पट्टी महसूस करें, यही आपके anchor points हैं।",
        drills: [
          { type:"single", label:"Warm-up", keys:"FFF JJJ FFF JJJ FJFJ JFJF" },
          { type:"alt", label:"Alternating", keys:"FJ JF FJ JF FD JK FD JK" },
          { type:"review", label:"Review", keys:"AS DF ;L KJ ASDF ;LKJ" },
        ],
      },
      {
        id: "hr-5", title: "G और H (Index Stretch)", newKeys: ["G","H"],
        instruction: "इंडेक्स फिंगर बीच की दो कुंजियों तक पहुँचती है — बाईं से G, दाईं से H। Home row अब पूरी हो गई।",
        drills: [
          { type:"single", label:"Warm-up", keys:"GGG HHH GGG HHH GHGH HGHG" },
          { type:"alt", label:"Alternating", keys:"GH HG GH HG GF HJ GF HJ" },
          { type:"review", label:"Review", keys:"ASDFGH ;LKJHG ASDFGHJKL;" },
        ],
      },
      {
        id: "hr-6", title: "Home Row Review", newKeys: [],
        instruction: "पूरी home row सीख ली — 10 कुंजियाँ। इनमें कई ज़रूरी मात्राएं (े, ो) और हलन्त भी शामिल हैं जो हिंदी text का बड़ा हिस्सा बनते हैं।",
        drills: [
          { type:"review", label:"Combos", keys:"ASDFGH ;LKJHG GHFJ DKSL A;SLDK" },
          { type:"review", label:"Timed Review", keys:"ASDF JKL; GHFJ DKSL A;SLDK ASDFGHJKL;" },
        ],
      },
    ],
  },
  {
    id: "top-row", title: "Top Row", icon: "⬆️", color: "#4db6f7", tier: "beginner",
    blurb: "ज़्यादातर मात्राएं यहीं मिलती हैं — ा, ी, ू जैसी बेहद common मात्राएं।",
    lessons: [
      {
        id: "tr-1", title: "Q और P (Pinky)", newKeys: ["Q","P"],
        instruction: "पिंकी ऊपर की ओर बढ़ती है — बाईं Q तक, दाईं P तक।",
        drills: [
          { type:"single", label:"Warm-up", keys:"QQQ PPP QQQ PPP QPQP PQPQ" },
          { type:"alt", label:"Alternating", keys:"QP PQ QP PQ QA P; QA P;" },
          { type:"review", label:"Review", keys:"AQ ;P AQ;P QPQP" },
        ],
      },
      {
        id: "tr-2", title: "W और O (Ring)", newKeys: ["W","O"],
        instruction: "रिंग फिंगर ऊपर — बाईं W तक, दाईं O तक।",
        drills: [
          { type:"single", label:"Warm-up", keys:"WWW OOO WWW OOO WOWO OWOW" },
          { type:"alt", label:"Alternating", keys:"WO OW WO OW WS OL WS OL" },
          { type:"review", label:"Review", keys:"QW PO QWPO SWLO" },
        ],
      },
      {
        id: "tr-3", title: "E और I (Middle) — मात्राएं", newKeys: ["E","I"],
        instruction: "E और I दोनों बहुत common मात्राएं देती हैं — इन्हें बिना देखे टाइप करना ज़रूरी है।",
        drills: [
          { type:"single", label:"Warm-up", keys:"EEE III EEE III EIEI IEIE" },
          { type:"alt", label:"Alternating", keys:"EI IE EI IE ED IK ED IK" },
          { type:"review", label:"Review", keys:"QWE POI QWEPOI EIEI" },
        ],
      },
      {
        id: "tr-4", title: "R और U (Index)", newKeys: ["R","U"],
        instruction: "इंडेक्स फिंगर ऊपर — बाईं R तक, दाईं U तक।",
        drills: [
          { type:"single", label:"Warm-up", keys:"RRR UUU RRR UUU RURU URUR" },
          { type:"alt", label:"Alternating", keys:"RU UR RU UR RF UJ RF UJ" },
          { type:"review", label:"Review", keys:"QWER POIU QWERPOIU" },
        ],
      },
      {
        id: "tr-5", title: "T और Y (Index Stretch)", newKeys: ["T","Y"],
        instruction: "सबसे कठिन तिरछी पहुँच — बाईं इंडेक्स T तक, दाईं इंडेक्स Y तक। धीरे शुरू करें।",
        drills: [
          { type:"single", label:"Warm-up", keys:"TTT YYY TTT YYY TYTY YTYT" },
          { type:"alt", label:"Alternating", keys:"TY YT TY YT TF YJ TF YJ" },
          { type:"review", label:"Full Top Row", keys:"QWERTY POIUY QWERTYUIOP" },
        ],
      },
      {
        id: "tr-6", title: "Top Row Review", newKeys: [],
        instruction: "Top row पूरी — अब आपके पास 9 सबसे ज़रूरी मात्राओं में से ज़्यादातर आ चुकी हैं।",
        drills: [
          { type:"review", label:"Combos", keys:"QWERTYUIOP ASDFGHJKL; QPWOEIRUTY" },
          { type:"review", label:"Timed Review", keys:"QWERTYUIOP ASDFGHJKL; ZXCVBNM," },
        ],
      },
    ],
  },
  {
    id: "bottom-row", title: "Bottom Row", icon: "⬇️", color: "#9c27b0", tier: "intermediate",
    blurb: "सबसे कम practice होने वाली row — यहीं सबसे ज़्यादा ग़लतियाँ होती हैं।",
    lessons: [
      {
        id: "br-1", title: "Z और / (Pinky)", newKeys: ["Z","/"],
        instruction: "पिंकी नीचे की ओर — बाईं Z तक, दाईं / तक। ध्यान दें: / कुंजी दोनों layout में सीधे \"/\" ही रहती है।",
        drills: [
          { type:"single", label:"Warm-up", keys:"ZZZ /// ZZZ /// Z/Z/ /Z/Z" },
          { type:"alt", label:"Alternating", keys:"Z/ /Z Z/ /Z ZA /; ZA /;" },
          { type:"review", label:"Review", keys:"AZ ;/ AZ;/ Z/Z/" },
        ],
      },
      {
        id: "br-2", title: "X और . (Ring)", newKeys: ["X","."],
        instruction: "रिंग फिंगर नीचे — बाईं X तक, दाईं . तक। . कुंजी भी दोनों layout में सीधे पूर्ण-विराम जैसी ही रहती है।",
        drills: [
          { type:"single", label:"Warm-up", keys:"XXX ... XXX ... X.X. .X.X" },
          { type:"alt", label:"Alternating", keys:"X. .X X. .X XS .L XS .L" },
          { type:"review", label:"Review", keys:"ZX ./ ZX./ X.X." },
        ],
      },
      {
        id: "br-3", title: "C और , (Middle)", newKeys: ["C",","],
        instruction: "मिडिल फिंगर नीचे — बाईं C तक, दाईं , तक।",
        drills: [
          { type:"single", label:"Warm-up", keys:"CCC ,,, CCC ,,, C,C, ,C,C" },
          { type:"alt", label:"Alternating", keys:"C, ,C C, ,C CD ,K CD ,K" },
          { type:"review", label:"Review", keys:"ZXC ./, ZXC./, C,C," },
        ],
      },
      {
        id: "br-4", title: "V और B (Index)", newKeys: ["V","B"],
        instruction: "दोनों इंडेक्स फिंगर से — बाईं V, दाईं B। ध्यान दें: इस layout में B भी दाईं इंडेक्स से ही टाइप होता है।",
        drills: [
          { type:"single", label:"Warm-up", keys:"VVV BBB VVV BBB VBVB BVBV" },
          { type:"alt", label:"Alternating", keys:"VB BV VB BV VF BJ VF BJ" },
          { type:"review", label:"Review", keys:"ZXCV ./,B ZXCV./,B" },
        ],
      },
      {
        id: "br-5", title: "N और M (Index) + Review", newKeys: ["N","M"],
        instruction: "N और M भी दाईं इंडेक्स फिंगर से ही आते हैं — इस उंगली पर सबसे ज़्यादा कुंजियाँ हैं। पूरी bottom row अब complete।",
        drills: [
          { type:"single", label:"Warm-up", keys:"NNN MMM NNN MMM NMNM MNMN" },
          { type:"alt", label:"Alternating", keys:"NM MN NM MN NJ MK NJ MK" },
          { type:"review", label:"Full Bottom Row", keys:"ZXCVBNM, ./ ZXCVBNM,./" },
        ],
      },
    ],
  },
  {
    id: "halant-conjuncts", title: "हलन्त और संयुक्ताक्षर", icon: "्", color: "#f59e0b", tier: "intermediate",
    blurb: "Halant ही असली चुनौती है — यहीं ज़्यादातर शुरुआती अटकते हैं।",
    lessons: [
      {
        id: "hc-1", title: "हलन्त की बुनियाद", newKeys: ["D"],
        instruction: "किसी व्यंजन के बाद D (हलन्त) दबाने से वह अगले व्यंजन से जुड़ जाता है। यहाँ तीन सबसे common संयोजन हैं: क्त, स्त, न्त — इनकी key sequence याद रखें: [consonant] + D + [consonant]।",
        drills: [
          { type:"combo", label:"क्त (K+D+L)", keys:"KDL KDL KDL" },
          { type:"combo", label:"स्त (M+D+L)", keys:"MDL MDL MDL" },
          { type:"combo", label:"न्त (V+D+L)", keys:"VDL VDL VDL" },
          { type:"review", label:"Review", keys:"KDL MDL VDL KDL MDL VDL" },
        ],
      },
      {
        id: "hc-2", title: "और संयोजन", newKeys: ["D"],
        instruction: "और भी संयोजन बनाकर हलन्त की गति बढ़ाएं — त्र, न्न, स्व जैसे combinations बहुत आम हैं।",
        drills: [
          { type:"combo", label:"त्र (L+D+J)", keys:"LDJ LDJ LDJ" },
          { type:"combo", label:"न्न (V+D+V)", keys:"VDV VDV VDV" },
          { type:"combo", label:"स्व (M+D+B)", keys:"MDB MDB MDB" },
          { type:"review", label:"Review", keys:"LDJ VDV MDB KDL MDL VDL" },
        ],
      },
      {
        id: "hc-3", title: "संयुक्ताक्षर अभ्यास", newKeys: [],
        instruction: "सभी संयोजनों को एक साथ, बिना रुके टाइप करें।",
        drills: [
          { type:"review", label:"Mixed Practice", keys:"KDL MDL VDL LDJ VDV MDB" },
          { type:"review", label:"Timed Review", keys:"KDL MDL VDL LDJ VDV MDB KDL MDL" },
        ],
      },
    ],
  },
  {
    id: "speed", title: "Speed & Fluency", icon: "🚀", color: "#e91e8c", tier: "advanced",
    blurb: "अब तक सीखा सब कुछ, असली रफ़्तार पर।",
    lessons: [
      {
        id: "sf-1", title: "Matra Combos I", newKeys: [],
        instruction: "मात्राओं और व्यंजनों को मिलाकर लगातार अभ्यास करें, बिना रुके।",
        drills: [
          { type:"combo", label:"Set 1", keys:"KE KI KA KO SE SI SA SO" },
          { type:"combo", label:"Set 2", keys:"JE JI JA JO LE LI LA LO" },
          { type:"review", label:"Timed", keys:"KE KI KA KO SE SI SA SO JE JI" },
        ],
      },
      {
        id: "sf-2", title: "Matra Combos II", newKeys: [],
        instruction: "एक और सेट — गति बनाए रखें, हर keystroke के बाद home row पर वापस लौटें।",
        drills: [
          { type:"combo", label:"Set 1", keys:"HE HI HA HO PE PI PA PO" },
          { type:"combo", label:"Set 2", keys:"VE VI VA VO BE BI BA BO" },
          { type:"review", label:"Timed", keys:"HE HI HA HO PE PI PA PO VE VI" },
        ],
      },
      {
        id: "sf-3", title: "Conjunct Practice Passage", newKeys: [],
        instruction: "अब तक सीखे सारे संयोजन और मात्राएं मिलाकर एक लंबा अभ्यास — असली परीक्षा जैसी गति के लिए।",
        drills: [
          { type:"paragraph", label:"Passage", keys:"KDL MDL VDL LDJ VDV MDB KE KI KA KO SE SI SA SO HE HI HA HO" },
          { type:"review", label:"Timed Review", keys:"KDL MDL VDL KE KI KA KO HE HI HA HO" },
        ],
      },
    ],
  },
];

export function flattenLessons(modules = HINDI_MODULES) {
  const flat = [];
  modules.forEach(m => m.lessons.forEach(l => flat.push({ moduleId: m.id, moduleColor: m.color, ...l })));
  return flat;
}

export const UNLOCK_THRESHOLD = UNLOCK;
