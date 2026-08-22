// englishLessonData.js
// Full key-by-key finger-placement course for English (QWERTY).
// Pacing model: 2 new keys per lesson, always drilled together with
// everything learned so far. Order follows proven touch-typing pedagogy
// (home row first, then vowel-rich top row so real words unlock early,
// then bottom row, then shift/punctuation/numbers, then speed building).

export const FINGER_COLORS = {
  left_pinky:   "#ef4444",
  left_ring:    "#f97316",
  left_middle:  "#eab308",
  left_index:   "#22c55e",
  right_index:  "#06b6d4",
  right_middle: "#3b82f6",
  right_ring:   "#8b5cf6",
  right_pinky:  "#ec4899",
  thumbs:       "#9ca3af",
};

export const FINGER_LABELS = {
  left_pinky:   "Left Pinky",
  left_ring:    "Left Ring",
  left_middle:  "Left Middle",
  left_index:   "Left Index",
  right_index:  "Right Index",
  right_middle: "Right Middle",
  right_ring:   "Right Ring",
  right_pinky:  "Right Pinky",
  thumbs:       "Thumbs",
};

// Full keyboard → finger map (used to render the on-screen guide keyboard)
export const KEY_FINGER_MAP = {
  "`":"left_pinky","1":"left_pinky","2":"left_ring","3":"left_middle","4":"left_index","5":"left_index",
  "6":"right_index","7":"right_index","8":"right_middle","9":"right_ring","0":"right_pinky","-":"right_pinky","=":"right_pinky",
  "q":"left_pinky","w":"left_ring","e":"left_middle","r":"left_index","t":"left_index",
  "y":"right_index","u":"right_index","i":"right_middle","o":"right_ring","p":"right_pinky","[":"right_pinky","]":"right_pinky",
  "a":"left_pinky","s":"left_ring","d":"left_middle","f":"left_index","g":"left_index",
  "h":"right_index","j":"right_index","k":"right_middle","l":"right_ring",";":"right_pinky","'":"right_pinky",
  "z":"left_pinky","x":"left_ring","c":"left_middle","v":"left_index","b":"left_index",
  "n":"right_index","m":"right_index",",":"right_middle",".":"right_ring","/":"right_pinky",
  " ":"thumbs",
};

const KB_ROWS = [
  ["`","1","2","3","4","5","6","7","8","9","0","-","="],
  ["q","w","e","r","t","y","u","i","o","p","[","]"],
  ["a","s","d","f","g","h","j","k","l",";","'"],
  ["z","x","c","v","b","n","m",",",".","/"],
];
export const KEYBOARD_LAYOUT = { rows: KB_ROWS, keyFinger: KEY_FINGER_MAP };

const UNLOCK = { wpm: 0, accuracy: 85 };

export const TIERS = [
  { id: "beginner",     label: "Beginner",     blurb: "Learn every key, finger by finger" },
  { id: "intermediate", label: "Intermediate", blurb: "Bottom row, capitals & punctuation" },
  { id: "advanced",     label: "Advanced",     blurb: "Numbers and real-world speed" },
];

export const ENGLISH_MODULES = [
  {
    id: "home-row", title: "Home Row Foundation", icon: "🏠", color: "#22c55e", tier: "beginner",
    blurb: "Every key starts and ends here. Master this and everything else is just a short reach away.",
    lessons: [
      {
        id: "hr-1", title: "F, J & Space", newKeys: ["f","j"," "],
        instruction: "Rest your left index finger on F and right index finger on J — feel the small bumps under your fingertips. These are your anchor keys: every reach to another key returns here. Use either thumb for space.",
        drills: [
          { type:"single", label:"Warm-up", content:"fff jjj fff jjj fjf jfj fjf jfj fff jjj" },
          { type:"alt", label:"Alternating", content:"fj jf fj jf ff jj fj jf ff jj fj jf ff jj" },
          { type:"combo", label:"Combos", content:"ff jj fj jf jjf ffj fjf jfj ff jj fj jf jjf" },
          { type:"review", label:"Review", content:"fj jf ff jj fjf jfj jjf ffj fj jf ff jj fjf jfj" },
        ],
      },
      {
        id: "hr-2", title: "D & K", newKeys: ["d","k"],
        instruction: "Add your middle fingers — left middle to D, right middle to K. Keep your index fingers resting lightly on F and J between reaches.",
        drills: [
          { type:"single", label:"Warm-up", content:"ddd kkk ddd kkk dkd kdk dkd kdk ddd kkk" },
          { type:"alt", label:"Alternating", content:"dk kd dk kd fd jk fd jk dk kd fd jk" },
          { type:"combo", label:"Combos", content:"fdj kfd jkd dfk fjkd dkjf jdfk kfdj fdj kfd" },
          { type:"review", label:"Review", content:"fj dk jf kd fd jk df kj fjdk kdjf djfk kfjd" },
        ],
      },
      {
        id: "hr-3", title: "S & L", newKeys: ["s","l"],
        instruction: "Ring fingers next — left ring to S, right ring to L. Small, controlled movements; don't let the other fingers drift.",
        drills: [
          { type:"single", label:"Warm-up", content:"sss lll sss lll slsl lsls sss lll slsl" },
          { type:"alt", label:"Alternating", content:"sl ls sl ls sk lj sk lj sl ls sk lj" },
          { type:"combo", label:"Combos", content:"sdf jkl fjs kls slj lfk sdk jls sdf jkl" },
          { type:"review", label:"Review", content:"fj dk sl fjdksl lkjsdf sldkfj jlksdf fj dk sl" },
        ],
      },
      {
        id: "hr-4", title: "A & ;", newKeys: ["a",";"],
        instruction: "Pinky fingers reach the outer keys — left pinky to A, right pinky to semicolon. All eight side-by-side home keys are now yours.",
        drills: [
          { type:"single", label:"Warm-up", content:"aaa ;;; aaa ;;; a;a; ;a;a aaa ;;; a;a;" },
          { type:"alt", label:"Alternating", content:"a; ;a a; ;a as lk as lk a; ;a as lk" },
          { type:"combo", label:"Combos", content:"asdf jkl; fdsa ;lkj asdf jkl; a;sldkfj" },
          { type:"review", label:"Review", content:"asdf jkl; fdsa ;lkj asdf jkl; fdsa ;lkj" },
        ],
      },
      {
        id: "hr-5", title: "G & H", newKeys: ["g","h"],
        instruction: "The two keys in the middle of the home row — left index stretches right to G, right index stretches left to H. These complete the full home row.",
        drills: [
          { type:"single", label:"Warm-up", content:"ggg hhh ggg hhh ghgh hghg ggg hhh ghgh" },
          { type:"alt", label:"Alternating", content:"gh hg gh hg fg jh fg jh gh hg fg jh" },
          { type:"combo", label:"Combos", content:"gash hash flag glass halfgash gash flags" },
          { type:"review", label:"Review", content:"asdfgh jkl; hgfdsa ;lkjhg asdfghjkl;" },
        ],
      },
      {
        id: "hr-6", title: "Home Row Words", newKeys: [],
        instruction: "All ten home-row keys are learned. Now put them together into real words — no other row needed yet.",
        drills: [
          { type:"word", label:"Words", content:"a all ask sad lads flask salad adds add gash" },
          { type:"word", label:"More Words", content:"a sad lad asks all salads fall add a flask hash" },
          { type:"sentence", label:"Sentence", content:"a sad lad asks; all salads fall; glass flasks fall; add a flag" },
          { type:"review", label:"Timed Review", content:"asdf jkl; a sad lad asks all salads fall add a flask gash hash flag glass" },
        ],
      },
    ],
  },
  {
    id: "top-row", title: "Top Row", icon: "⬆️", color: "#4db6f7", tier: "beginner",
    blurb: "Reach up, strike, return home. Vowels live here — real vocabulary opens up fast.",
    lessons: [
      {
        id: "tr-1", title: "U & R", newKeys: ["u","r"],
        instruction: "Right index reaches up from J to U. Left index reaches up from F to R. Snap back to home row after every stroke.",
        drills: [
          { type:"single", label:"Warm-up", content:"uuu rrr uuu rrr uru rur uru rur uuu rrr" },
          { type:"alt", label:"Alternating", content:"ur ru ur ru uj rf uj rf ur ru uj rf" },
          { type:"word", label:"Words", content:"far jar lard dark fur ajar sure rural" },
          { type:"review", label:"Review", content:"far jar dark lard fur ajar rural surf jar far" },
        ],
      },
      {
        id: "tr-2", title: "I & E", newKeys: ["i","e"],
        instruction: "Right middle finger reaches up to I, left middle finger reaches up to E. Two of the most common letters in English — real words open up here.",
        drills: [
          { type:"single", label:"Warm-up", content:"iii eee iii eee ieie eiei iii eee ieie" },
          { type:"alt", label:"Alternating", content:"ie ei ie ei ik ed ik ed ie ei ik ed" },
          { type:"word", label:"Words", content:"read said fire like idea fear sea leaf real desk" },
          { type:"review", label:"Review", content:"read said fire like idea fear real desk sea leaf" },
        ],
      },
      {
        id: "tr-3", title: "O & W", newKeys: ["o","w"],
        instruction: "Right ring finger reaches up to O, left ring finger reaches up to W.",
        drills: [
          { type:"single", label:"Warm-up", content:"ooo www ooo www owow woow ooo www owow" },
          { type:"alt", label:"Alternating", content:"ow wo ow wo ol ws ol ws ow wo ol ws" },
          { type:"word", label:"Words", content:"word world slow flow low row wide wise flew" },
          { type:"review", label:"Review", content:"word world slow flow row wide wise flew low" },
        ],
      },
      {
        id: "tr-4", title: "P & Q", newKeys: ["p","q"],
        instruction: "Right pinky reaches up to P, left pinky reaches up to Q — the two furthest top-row keys.",
        drills: [
          { type:"single", label:"Warm-up", content:"ppp qqq ppp qqq pqpq qpqp ppp qqq pqpq" },
          { type:"alt", label:"Alternating", content:"pq qp pq qp p; qa p; qa pq qp p; qa" },
          { type:"word", label:"Words", content:"quiet quick pair pale spark quest quake" },
          { type:"review", label:"Review", content:"quiet quick pair pale spark quest quake pals" },
        ],
      },
      {
        id: "tr-5", title: "T & Y", newKeys: ["t","y"],
        instruction: "The trickiest reaches — left index stretches diagonally up-right to T, right index stretches diagonally up-left to Y. Take it slow.",
        drills: [
          { type:"single", label:"Warm-up", content:"ttt yyy ttt yyy tyty ytyt ttt yyy tyty" },
          { type:"alt", label:"Alternating", content:"ty yt ty yt tf yj tf yj ty yt tf yj" },
          { type:"word", label:"Words", content:"they try style yearly steady tidy toy" },
          { type:"review", label:"Full Top Row Review", content:"they try the early riser waters a garden style yearly toy" },
        ],
      },
    ],
  },
  {
    id: "bottom-row", title: "Bottom Row", icon: "⬇️", color: "#9c27b0", tier: "intermediate",
    blurb: "The most-neglected row. Slow and deliberate here pays off more than anywhere else.",
    lessons: [
      {
        id: "br-1", title: "V & N", newKeys: ["v","n"],
        instruction: "Left index reaches down to V, right index reaches down to N.",
        drills: [
          { type:"single", label:"Warm-up", content:"vvv nnn vvv nnn vnvn nvnv vvv nnn vnvn" },
          { type:"alt", label:"Alternating", content:"vn nv vn nv vf nj vf nj vn nv vf nj" },
          { type:"word", label:"Words", content:"van nine save nine river vent nation" },
          { type:"review", label:"Review", content:"van nine save nation river vent nine van" },
        ],
      },
      {
        id: "br-2", title: "B & M", newKeys: ["b","m"],
        instruction: "Left index reaches down to B, right index reaches down to M.",
        drills: [
          { type:"single", label:"Warm-up", content:"bbb mmm bbb mmm bmbm mbmb bbb mmm bmbm" },
          { type:"alt", label:"Alternating", content:"bm mb bm mb bf mj bf mj bm mb bf mj" },
          { type:"word", label:"Words", content:"member number began bring same time member" },
          { type:"review", label:"Review", content:"member number began bring same time nine van" },
        ],
      },
      {
        id: "br-3", title: "C & ,", newKeys: ["c",","],
        instruction: "Left middle finger reaches down to C, right middle finger reaches down to comma.",
        drills: [
          { type:"single", label:"Warm-up", content:"ccc ,,, ccc ,,, c,c, ,c,c ccc ,,, c,c," } ,
          { type:"alt", label:"Alternating", content:"c, ,c c, ,c cd k, cd k, c, ,c cd k," } ,
          { type:"word", label:"Words", content:"come, said, care, race, since, voice," } ,
          { type:"review", label:"Review", content:"come, said, care, race, since, voice, member," } ,
        ],
      },
      {
        id: "br-4", title: "X & .", newKeys: ["x","."],
        instruction: "Left ring finger reaches down to X, right ring finger reaches down to period.",
        drills: [
          { type:"single", label:"Warm-up", content:"xxx ... xxx ... x.x. .x.x xxx ... x.x." },
          { type:"alt", label:"Alternating", content:"x. .x x. .x xs l. xs l. x. .x xs l." },
          { type:"word", label:"Words", content:"next. exam. fix it. six boxes. text." },
          { type:"review", label:"Review", content:"next exam. fix it. six boxes. text expert." },
        ],
      },
      {
        id: "br-5", title: "Z & /", newKeys: ["z","/"],
        instruction: "Left pinky reaches down to Z, right pinky reaches down to the slash. That's the full keyboard — every letter key is now yours.",
        drills: [
          { type:"single", label:"Warm-up", content:"zzz /// zzz /// z/z/ /z/z zzz /// z/z/" },
          { type:"alt", label:"Alternating", content:"z/ /z z/ /z za l/ za l/ z/ /z za l/" },
          { type:"word", label:"Words", content:"zone size amaze buzz prize maze zebra" },
          { type:"review", label:"Full Alphabet Review", content:"the quick brown fox jumps over a lazy dog next to a big van" },
        ],
      },
    ],
  },
  {
    id: "shift-punct", title: "Shift & Punctuation", icon: "⇧", color: "#f59e0b", tier: "intermediate",
    blurb: "Capitals and punctuation turn key-mashing into real writing.",
    lessons: [
      {
        id: "sp-1", title: "Shift — Right Hand Letters", newKeys: ["shift"],
        instruction: "To capitalize a left-hand letter, hold the RIGHT shift with your right pinky, then strike the letter with your left hand. Never use the same hand for both.",
        drills: [
          { type:"single", label:"Warm-up", content:"Aa Ss Dd Ff Gg Aa Ss Dd Ff Gg" },
          { type:"word", label:"Words", content:"Asha Sarah Fresh Grass Adam Sam Gas Dave" },
          { type:"sentence", label:"Sentence", content:"Sarah asked Dave for a fresh glass. Adam saw Asha at Grass Lake." },
          { type:"review", label:"Review", content:"Sarah asked Dave for a fresh glass. Adam saw Asha." },
        ],
      },
      {
        id: "sp-2", title: "Shift — Left Hand Letters", newKeys: ["shift"],
        instruction: "Now the mirror: hold LEFT shift with your left pinky, strike right-hand letters with your right hand.",
        drills: [
          { type:"single", label:"Warm-up", content:"Jj Kk Ll Hh Nn Jj Kk Ll Hh Nn" },
          { type:"word", label:"Words", content:"John Kelly Holly Nina Jack Nolan Hunt" },
          { type:"sentence", label:"Sentence", content:"John and Kelly met Holly near the Union Hall." },
          { type:"review", label:"Review", content:"John and Kelly met Holly. Nina joined Jack and Nolan." },
        ],
      },
      {
        id: "sp-3", title: "Period, Comma & Apostrophe", newKeys: [".",",","'"],
        instruction: "Right ring finger for period, right middle for comma, right pinky for apostrophe. These three punctuation marks cover most everyday writing.",
        drills: [
          { type:"single", label:"Warm-up", content:"., ., ., '.' '.' ,'. ,'. ., '.'" },
          { type:"word", label:"Words", content:"don't, can't, it's fine, she's here, we're set." },
          { type:"sentence", label:"Sentence", content:"It's fine, she said, we're ready. Don't worry, it can't wait." },
          { type:"review", label:"Review", content:"It's fine, she's here, we're ready. Don't worry, it can't wait." },
        ],
      },
      {
        id: "sp-4", title: "Capitals in Sentences", newKeys: [],
        instruction: "Combine everything — capital letters at the start of sentences, proper nouns, and punctuation, all in flowing text.",
        drills: [
          { type:"sentence", label:"Sentence 1", content:"Ravi and Meena went to Delhi last week. They saw the Red Fort and India Gate." },
          { type:"sentence", label:"Sentence 2", content:"The Ganga flows through several states. It is considered sacred by many." },
          { type:"sentence", label:"Sentence 3", content:"SSC exams require speed and accuracy. Practice daily to build both skills." },
          { type:"review", label:"Timed Review", content:"Ravi and Meena went to Delhi. The Ganga flows through several states. SSC exams require speed and accuracy." },
        ],
      },
    ],
  },
  {
    id: "numbers", title: "Numbers", icon: "🔢", color: "#14b8a6", tier: "advanced",
    blurb: "The number row, for dates, figures, and data-entry heavy exam content.",
    lessons: [
      {
        id: "num-1", title: "1 – 5", newKeys: ["1","2","3","4","5"],
        instruction: "Each finger stretches straight up from its home key: pinky→1, ring→2, middle→3, index→4 and 5.",
        drills: [
          { type:"single", label:"Warm-up", content:"111 222 333 444 555 12345 54321" },
          { type:"word", label:"In Context", content:"There are 12 states. It costs 45 rupees. Room 231." },
          { type:"review", label:"Review", content:"12 states, 45 rupees, room 231, page 15" },
        ],
      },
      {
        id: "num-2", title: "6 – 0", newKeys: ["6","7","8","9","0"],
        instruction: "Right hand covers the rest: index→6 and 7, middle→8, ring→9, pinky→0.",
        drills: [
          { type:"single", label:"Warm-up", content:"666 777 888 999 000 67890 09876" },
          { type:"word", label:"In Context", content:"The year 2024 had 365 days. Score: 89 out of 100." },
          { type:"review", label:"Full Number Row", content:"2024, 365 days, 89 out of 100, 1234567890" },
        ],
      },
    ],
  },
  {
    id: "speed", title: "Speed & Fluency", icon: "🚀", color: "#e91e8c", tier: "advanced",
    blurb: "Everything you've learned, at real sentence and paragraph pace.",
    lessons: [
      {
        id: "sf-1", title: "Common Words I", newKeys: [],
        instruction: "These words make up roughly half of everyday English text. Type them fluently, without hesitating between words.",
        drills: [
          { type:"word", label:"Set 1", content:"the and for are but not you all can had her was one our out" },
          { type:"word", label:"Set 2", content:"day get has him his how man new now old see two way who" },
          { type:"review", label:"Timed", content:"the and for are but not you all can had her was one our out day get has him his how" },
        ],
      },
      {
        id: "sf-2", title: "Common Words II", newKeys: [],
        instruction: "A second batch of high-frequency words. Keep your eyes off the keyboard — trust your fingers to find the keys.",
        drills: [
          { type:"word", label:"Set 1", content:"time work first also after back other many than then them these" },
          { type:"word", label:"Set 2", content:"could water long down side been call word each does more find" },
          { type:"review", label:"Timed", content:"time work first also after back other many could water long down side call word find" },
        ],
      },
      {
        id: "sf-3", title: "Word Endings & Blends", newKeys: [],
        instruction: "Common suffixes and letter blends show up constantly in real text. Practicing them as units — not letter by letter — is a big speed unlock.",
        drills: [
          { type:"word", label:"-ing / -tion", content:"working reading typing running station action nation motion" },
          { type:"word", label:"-ed / -er / -ly", content:"worked asked typed faster better quickly slowly quietly" },
          { type:"word", label:"th / ch / sh / wh", content:"three chair shape white think chase share where" },
          { type:"review", label:"Timed", content:"working reading typing station action faster better quickly three chair shape white" },
        ],
      },
      {
        id: "sf-4", title: "Sentence Fluency I", newKeys: [],
        instruction: "Full sentences, mixed case and punctuation. Focus on rhythm — steady pace beats bursts of speed.",
        drills: [
          { type:"sentence", label:"Sentence 1", content:"Practice a little every day, and your speed will grow without you noticing." },
          { type:"sentence", label:"Sentence 2", content:"Good typists don't look at the keyboard; they trust their fingers completely." },
          { type:"review", label:"Timed", content:"Practice a little every day, and your speed will grow. Good typists trust their fingers." },
        ],
      },
      {
        id: "sf-5", title: "Sentence Fluency II", newKeys: [],
        instruction: "Longer sentences with numbers and varied punctuation mixed in — closer to what a real exam passage looks like.",
        drills: [
          { type:"sentence", label:"Sentence 1", content:"In 2023, over 12,000 candidates appeared for the exam; only 450 were selected." },
          { type:"sentence", label:"Sentence 2", content:"\"Speed matters,\" she said, \"but accuracy matters more — always double-check your work.\"" },
          { type:"sentence", label:"Sentence 3", content:"The office opens at 9:30 a.m. and closes at 6:00 p.m., Monday through Friday." },
          { type:"review", label:"Timed", content:"In 2023, over 12,000 candidates appeared; only 450 were selected. Speed matters, but accuracy matters more." },
        ],
      },
      {
        id: "sf-6", title: "Short Paragraph I", newKeys: [],
        instruction: "Your first full paragraph. This is foundation-level difficulty — the Exam section has real exam-grade passages once you're ready.",
        drills: [
          { type:"paragraph", label:"Paragraph", content:"Typing well is a skill that pays off for life. It saves time on every letter, form, and message you write. The secret is not raw speed but steady, accurate practice. Start slow, keep your eyes off the keyboard, and let your fingers learn the way on their own." },
          { type:"review", label:"Timed Review", content:"Typing well is a skill that pays off for life. It saves time on every letter, form, and message you write." },
        ],
      },
      {
        id: "sf-7", title: "Short Paragraph II", newKeys: [],
        instruction: "A slightly longer paragraph, closer to exam length. Keep a steady pace rather than rushing the first line and slowing down later.",
        drills: [
          { type:"paragraph", label:"Paragraph", content:"Every government exam that tests typing rewards the same two things: speed and accuracy. Most candidates focus only on speed and ignore accuracy, which costs them far more in the final score. A steady 30 words per minute with almost no errors will always beat a rushed 45 words per minute full of mistakes. Build accuracy first; speed follows naturally with practice." },
          { type:"review", label:"Timed Review", content:"Every exam that tests typing rewards speed and accuracy. A steady 30 words per minute with no errors beats a rushed 45 full of mistakes." },
        ],
      },
    ],
  },
];

export const UNLOCK_THRESHOLD = UNLOCK;

// Flat ordered list of lesson refs (module id + lesson) — used for sequencing/unlocking
export function flattenLessons(modules = ENGLISH_MODULES) {
  const flat = [];
  modules.forEach(m => m.lessons.forEach(l => flat.push({ moduleId: m.id, moduleColor: m.color, ...l })));
  return flat;
}
