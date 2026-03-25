export interface DailyQuestion {
  /** 問いの文章 */
  question: string;
  /** 補足テキスト（誰の問いか、どのテーマか） */
  subtitle: string;
  /** 関連テーマのスラッグ（存在する場合） */
  themeSlug?: string;
  /** 関連哲学者のスラッグ（存在する場合） */
  philosopherSlug?: string;
}

export const DAILY_QUESTIONS: DailyQuestion[] = [
  {
    question: "善い人生とは何か？",
    subtitle: "アリストテレスが問い続けたテーマ",
    themeSlug: "ethics",
    philosopherSlug: "aristotle",
  },
  {
    question: "知ることができるとはどういうことか？",
    subtitle: "認識論の根本問題",
    themeSlug: "epistemology",
  },
  {
    question: "自由意志は存在するか？",
    subtitle: "自由と必然の哲学的対立",
    themeSlug: "free-will",
  },
  {
    question: "死を恐れる必要はあるか？",
    subtitle: "エピクロスの問い——「死はわれわれにとって何ものでもない」",
    philosopherSlug: "epicurus",
  },
  {
    question: "美しいとはどういう状態か？",
    subtitle: "美学の問い——美は見る者の目に宿るのか",
    themeSlug: "aesthetics",
  },
  {
    question: "正義は相対的か、普遍的か？",
    subtitle: "倫理学の核心——プラトン『国家』から",
    themeSlug: "ethics",
    philosopherSlug: "plato",
  },
  {
    question: "言語がなければ思考できるか？",
    subtitle: "言語哲学の問い——ウィトゲンシュタインが切り開いた地平",
    themeSlug: "language",
    philosopherSlug: "wittgenstein",
  },
  {
    question: "時間は流れるものか、それとも存在するものか？",
    subtitle: "時間の哲学——アウグスティヌスから現代物理まで",
    themeSlug: "ontology",
  },
  {
    question: "他者の心を知ることはできるか？",
    subtitle: "「他我問題」——心の哲学の古典的難問",
    themeSlug: "epistemology",
  },
  {
    question: "自分とは何か？",
    subtitle: "個人同一性の問題——「テセウスの船」から始まる問い",
    themeSlug: "ontology",
  },
  {
    question: "なぜ何もないのではなく、何かがあるのか？",
    subtitle: "ライプニッツの問い——存在論の究極の問い",
    themeSlug: "ontology",
    philosopherSlug: "leibniz",
  },
  {
    question: "道徳は感情か、理性か？",
    subtitle: "ヒュームとカントの対立——道徳哲学の核心",
    themeSlug: "ethics",
  },
  {
    question: "神は存在するか？",
    subtitle: "神の存在証明——哲学と宗教の交差点",
    themeSlug: "metaphysics",
  },
  {
    question: "人はなぜ社会を形成するのか？",
    subtitle: "社会契約論の問い——ホッブズ、ロック、ルソー",
    themeSlug: "politics",
  },
  {
    question: "真理は一つか、複数あるか？",
    subtitle: "真理の哲学——プラグマティズムから相対主義まで",
    themeSlug: "epistemology",
  },
  {
    question: "人間は本質的に善か、悪か？",
    subtitle: "性善説と性悪説——孟子と荀子の対立",
    themeSlug: "ethics",
  },
  {
    question: "意識はどこから生まれるか？",
    subtitle: "心身問題——デカルトの「心と身体」から現代神経科学まで",
    themeSlug: "mind",
    philosopherSlug: "descartes",
  },
  {
    question: "何が行為を正しくするのか？",
    subtitle: "規範倫理学の三大立場——功利主義・義務論・徳倫理学",
    themeSlug: "ethics",
  },
  {
    question: "芸術に価値はあるか？",
    subtitle: "美学の問い——芸術の意義と存在",
    themeSlug: "aesthetics",
  },
  {
    question: "幸福とは何か？",
    subtitle: "幸福論の系譜——エウダイモニアからウェルビーイングまで",
    themeSlug: "ethics",
    philosopherSlug: "aristotle",
  },
  {
    question: "私たちは本当に「自由」に選択できるか？",
    subtitle: "自由の哲学——サルトルの実存主義的問い",
    philosopherSlug: "sartre",
    themeSlug: "free-will",
  },
  {
    question: "知識の限界はどこにあるか？",
    subtitle: "カントの批判哲学——認識の条件を問う",
    philosopherSlug: "kant",
    themeSlug: "epistemology",
  },
  {
    question: "「我思う、ゆえに我あり」とはどういう意味か？",
    subtitle: "デカルトの哲学の第一原理——確実なものは何か",
    philosopherSlug: "descartes",
    themeSlug: "epistemology",
  },
  {
    question: "人はなぜ苦しむのか？",
    subtitle: "仏教哲学の根本問題——苦の原因と解脱",
    themeSlug: "buddhism",
  },
  {
    question: "言葉はものを正確に表現できるか？",
    subtitle: "記号と意味の哲学——ソシュールからデリダまで",
    themeSlug: "language",
  },
  {
    question: "歴史には法則があるか？",
    subtitle: "歴史哲学の問い——ヘーゲルとマルクスの弁証法",
    themeSlug: "politics",
    philosopherSlug: "hegel",
  },
  {
    question: "ニヒリズムを乗り越えられるか？",
    subtitle: "ニーチェの問い——「神の死」の後に何が来るか",
    philosopherSlug: "nietzsche",
    themeSlug: "existentialism",
  },
  {
    question: "無為自然とはどういう生き方か？",
    subtitle: "老子の道徳経——「道」に従うとはいかなることか",
    philosopherSlug: "laozi",
    themeSlug: "taoism",
  },
  {
    question: "知ることは徳か？",
    subtitle: "ソクラテスの問い——「無知の知」から始まる哲学",
    philosopherSlug: "socrates",
    themeSlug: "ethics",
  },
  {
    question: "存在とは何か？",
    subtitle: "ハイデガーの根本問題——「存在と時間」への問い",
    philosopherSlug: "heidegger",
    themeSlug: "ontology",
  },
];

/**
 * 今日の問いを返す（日付ベースで毎日自動更新）
 */
export function getTodayQuestion(): DailyQuestion {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return DAILY_QUESTIONS[dayIndex % DAILY_QUESTIONS.length];
}
