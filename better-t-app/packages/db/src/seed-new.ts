import { db } from "./index";
import { articleSeries, articleSeriesItem, quiz, quizOption } from "./schema";

async function seedNewTables() {
  console.log("🌱 Seeding new tables (quiz / article_series)...");

  // quiz / quizOption
  const quizData = [
    {
      id: "quiz-questioning-1",
      lessonId: "lesson-questioning",
      question: "哲学的な問いの特徴として最も適切な説明はどれですか？",
      explanation: "哲学的な問いは、単純な事実確認ではなく、存在や善さや知識の本質に迫る「根本的な問い」です。簡単に答えられないからこそ、深める価値があります。",
      order: 1,
      options: [
        { id: "quiz-q1-o1", text: "事実関係を導き、明確な答えを得る", isCorrect: false, order: 1 },
        { id: "quiz-q1-o2", text: "存在や善さなど変わらぬ問題に勇気をもって向き合う", isCorrect: true, order: 2 },
        { id: "quiz-q1-o3", text: "科学的データで裏付けられた事実だけを受け入れる", isCorrect: false, order: 3 },
        { id: "quiz-q1-o4", text: "指導者が提示する答えを正確に未わる", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "quiz-questioning-2",
      lessonId: "lesson-questioning",
      question: "ソクラテスの「無知の知」とはどういう意味ですか？",
      explanation: "無知の知は「何も知らない」と投げやりになることではなく、「自分が十分には理解できていないと自覚することで、考える出発点に立つ」という意味です。",
      order: 2,
      options: [
        { id: "quiz-q2-o1", text: "すべての知識を捨てて無知に返ること", isCorrect: false, order: 1 },
        { id: "quiz-q2-o2", text: "自分の理解の限界を自覚し、問いを深める姿勢", isCorrect: true, order: 2 },
        { id: "quiz-q2-o3", text: "専門家の言葉を盲目に信じること", isCorrect: false, order: 3 },
        { id: "quiz-q2-o4", text: "学びをやめて知識を捨てること", isCorrect: false, order: 4 },
      ],
    },
    // コース: 善く生きる・レッスン2: 徳と習慣
    {
      id: "quiz-virtue-1",
      lessonId: "lesson-virtue-and-habit",
      question: "アリストテレスは徳をどのように身につけると考えましたか？",
      explanation: "アリストテレスにとって徳は生まれつきの資質ではなく、繰り返しの行為と習慣が徳を形成すると考えました。",
      order: 1,
      options: [
        { id: "quiz-v1-o1", text: "生まれながらに徳を持って産まれる", isCorrect: false, order: 1 },
        { id: "quiz-v1-o2", text: "繰り返しの行為と習慣を通じて形成される", isCorrect: true, order: 2 },
        { id: "quiz-v1-o3", text: "年齢を重ねることで自然に身につく", isCorrect: false, order: 3 },
        { id: "quiz-v1-o4", text: "知識を学んだ後に特別な訓練で得る", isCorrect: false, order: 4 },
      ],
    },
    // コース: 近代の自己・レッスン1: 方法的懐疑
    {
      id: "quiz-doubt-1",
      lessonId: "lesson-methodic-doubt",
      question: "デカルトの「方法的懐疑」の目的は何ですか？",
      explanation: "方法的懐疑は、不断の疑いを推し進めても一度も生じることのない、小さいけれども完全に確実な知識の土台を見つけるための方法です。",
      order: 1,
      options: [
        { id: "quiz-d1-o1", text: "すべての存在を否定する虚無主義を導くため", isCorrect: false, order: 1 },
        { id: "quiz-d1-o2", text: "確実な知識の土台を見つけるため", isCorrect: true, order: 2 },
        { id: "quiz-d1-o3", text: "信仰を否定する無神論を証明するため", isCorrect: false, order: 3 },
        { id: "quiz-d1-o4", text: "夢の中のみ真実が存在することを示すため", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "quiz-doubt-2",
      lessonId: "lesson-methodic-doubt",
      question: "『我思う、ゆえに我あり』は何を確かにしたのですか？",
      explanation: "すべてを疑っても、そのいま疑っている私が存在することだけは疑えない、という推論です。思考する自己の存在がすべての小提になります。",
      order: 2,
      options: [
        { id: "quiz-d2-o1", text: "肉体を持つ人間の存在", isCorrect: false, order: 1 },
        { id: "quiz-d2-o2", text: "神の存在", isCorrect: false, order: 2 },
        { id: "quiz-d2-o3", text: "思考する自己の存在", isCorrect: true, order: 3 },
        { id: "quiz-d2-o4", text: "外界の実在性", isCorrect: false, order: 4 },
      ],
    },
  ];

  for (const q of quizData) {
    const existing = await db.select().from(quiz).where(
      (await import("drizzle-orm")).eq(quiz.id, q.id)
    ).get();
    if (existing) {
      console.log(`⏭️  quiz ${q.id} already exists`);
      continue;
    }
    const { options, ...quizRow } = q;
    await db.insert(quiz).values(quizRow);
    await db.insert(quizOption).values(
      options.map((opt) => ({ ...opt, quizId: q.id })),
    );
    console.log(`✅ Inserted quiz ${q.id}`);
  }

  // 記事シリーズ
  const seriesData = [
    {
      id: "series-know-thyself",
      slug: "know-thyself",
      title: "自己を知る哲学——ソクラテスからデカルトへ",
      description: "自己認識をテーマに、古代から近代までの哲学者がどう問いかけたかを追うシリーズ。",
      items: [
        { articleId: "article-socratic-ignorance", order: 1 },
        { articleId: "article-cogito", order: 2 },
      ],
    },
    {
      id: "series-ethics-intro",
      slug: "ethics-intro",
      title: "善く生きるための哲学入門",
      description: "徳倫理学から孔子の仁礼、ニーチェの価値論まで、善く生きることを探る入門シリーズ。",
      items: [
        { articleId: "article-virtue-ethics", order: 1 },
        { articleId: "article-confucius-ren-li", order: 2 },
        { articleId: "article-nietzsche-god-is-dead", order: 3 },
      ],
    },
  ];

  for (const s of seriesData) {
    const existing = await db.select().from(articleSeries).where(
      (await import("drizzle-orm")).eq(articleSeries.id, s.id)
    ).get();
    if (existing) {
      console.log(`⏭️  series ${s.id} already exists`);
      continue;
    }
    const { items, ...seriesRow } = s;
    await db.insert(articleSeries).values(seriesRow);
    await db.insert(articleSeriesItem).values(
      items.map((item) => ({ ...item, seriesId: s.id })),
    );
    console.log(`✅ Inserted series ${s.id}`);
  }

  console.log("🎉 New table seeding completed.");
  process.exit(0);
}

seedNewTables().catch((e) => {
  console.error(e);
  process.exit(1);
});
