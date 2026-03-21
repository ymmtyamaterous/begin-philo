import { db, runMigrations } from "./index";
import {
  article,
  articleTheme,
  course,
  glossaryTerm,
  lesson,
  philosopher,
  quote,
  theme,
  userBookmark,
  userLessonProgress,
} from "./schema";

const asJson = (value: string[]) => JSON.stringify(value);
const at = (value: string) => new Date(value);

const philosophers = [
  {
    id: "phil-socrates",
    slug: "socrates",
    name: "ソクラテス",
    nameEn: "Socrates",
    initial: "Σ",
    era: "紀元前470頃 – 399",
    birthYear: -470,
    deathYear: -399,
    region: "古代ギリシャ",
    shortBio: "『無知の知』で知られる、対話を通じて人に問いを返した哲学者。",
    biography: `# ソクラテスとは誰か

ソクラテスは、自分で本を書き残さなかった哲学者です。にもかかわらず、哲学史の出発点としてたびたび語られます。

彼の特徴は、**答えを先に与えるのではなく、問いを深めること**にありました。市場や広場で人々と対話し、「あなたの言う正義とは何か」「善く生きるとは何か」を追いかけました。

## 無知の知

ソクラテスの代表的な態度として知られるのが**無知の知**です。これは「私は何も知らない」と投げやりになることではありません。

むしろ、**自分が十分には分かっていないと自覚することこそ、考える出発点である**という意味です。

## 対話の哲学

ソクラテスは、相手の考えを丁寧にたどりながら、矛盾や曖昧さを明らかにしました。この方法はのちに**問答法**と呼ばれます。

その姿勢は、哲学を知識の集積ではなく、**生き方に関わる実践**として位置づけた点で非常に重要です。`,
    keyIdeas: asJson(["無知の知", "問答法", "徳", "自己吟味"]),
    majorWorks: asJson(["『ソクラテスの弁明』", "『クリトン』", "『パイドン』"]),
  },
  {
    id: "phil-plato",
    slug: "plato",
    name: "プラトン",
    nameEn: "Plato",
    initial: "Π",
    era: "紀元前427 – 347",
    birthYear: -427,
    deathYear: -347,
    region: "古代ギリシャ",
    shortBio: "イデア論を展開し、哲学を体系化した対話篇の哲学者。",
    biography: `# プラトンとは誰か

プラトンはソクラテスの弟子であり、西洋哲学の基礎を築いた人物のひとりです。彼はアカデメイアを開き、哲学を継続的に学ぶ場を整えました。

## イデア論

プラトンは、私たちが日常で目にするものは移ろいやすく不完全であり、その背後に**真に変わらない本質**があると考えました。これが**イデア**です。

たとえば「美しいもの」はたくさんありますが、それらを美しいと判断できるのは、私たちが何らかの**美そのもの**を思い描けるからだ、という発想です。

## 国家と魂

プラトンは人間の魂の秩序と国家の秩序を重ねて考えました。理性・気概・欲望が調和するとき、個人も共同体も良くなると考えます。`,
    keyIdeas: asJson(["イデア論", "魂の三分説", "哲人政治", "洞窟の比喩"]),
    majorWorks: asJson(["『国家』", "『饗宴』", "『パイドン』"]),
  },
  {
    id: "phil-aristotle",
    slug: "aristotle",
    name: "アリストテレス",
    nameEn: "Aristotle",
    initial: "Α",
    era: "紀元前384 – 322",
    birthYear: -384,
    deathYear: -322,
    region: "古代ギリシャ",
    shortBio: "経験世界を重視し、倫理学・政治学・形而上学を広く論じた哲学者。",
    biography: `# アリストテレスとは誰か

アリストテレスはプラトンの弟子ですが、師とは異なり、**現実の世界を丁寧に観察すること**を重視しました。

## 形相と質料

彼は、ものごとは単なる素材ではなく、**どのようなあり方をしているか**という形相を持つと考えました。

## 徳の中庸

倫理学では、勇気は無謀と臆病のあいだにあるように、徳とは極端を避けた**中庸**だとします。

善く生きるとは、一度の感情ではなく、習慣を通じて徳を身につけることだと考えました。`,
    keyIdeas: asJson(["中庸", "形相と質料", "目的論", "幸福"]),
    majorWorks: asJson(["『ニコマコス倫理学』", "『形而上学』", "『政治学』"]),
  },
  {
    id: "phil-confucius",
    slug: "confucius",
    name: "孔子",
    nameEn: "Confucius",
    initial: "孔",
    era: "紀元前551 – 479",
    birthYear: -551,
    deathYear: -479,
    region: "古代中国",
    shortBio: "仁と礼を中心に、人が人らしく生きる道を説いた思想家。",
    biography: `# 孔子とは誰か

孔子は中国思想の中心に位置する思想家で、社会の秩序と人間の徳を深く結びつけて考えました。

## 仁

孔子の思想の核にあるのは**仁**です。仁は単なる優しさではなく、他者を思いやりながら、自分の振る舞いを整えていく姿勢です。

## 礼

孔子は、心だけでなく、社会の中でのふるまいを整える**礼**を重視しました。礼は窮屈な形式ではなく、関係を壊さず、互いを尊重するための知恵でもあります。

## 学び続けること

孔子は学びを一度きりの知識獲得ではなく、**生涯を通じて自分を修める営み**としてとらえました。`,
    keyIdeas: asJson(["仁", "礼", "修己", "学而時習之"]),
    majorWorks: asJson(["『論語』"]),
  },
  {
    id: "phil-descartes",
    slug: "descartes",
    name: "デカルト",
    nameEn: "René Descartes",
    initial: "D",
    era: "1596 – 1650",
    birthYear: 1596,
    deathYear: 1650,
    region: "近世フランス",
    shortBio: "方法的懐疑から『我思う、ゆえに我あり』へ至った近代哲学の出発点。",
    biography: `# デカルトとは誰か

デカルトは近代哲学の出発点として知られます。彼は、確実な知識を得るために、疑えるものを徹底して疑う**方法的懐疑**を行いました。

## 我思う、ゆえに我あり

すべてを疑っても、**いま疑っている自分がいること**だけは疑えない。この確実性を表したのが「我思う、ゆえに我あり」です。

## 心身二元論

デカルトは、考える精神と広がりを持つ物体を区別しました。この区別は近代科学や心の哲学に大きな影響を与えました。`,
    keyIdeas: asJson(["方法的懐疑", "コギト", "心身二元論", "明証性"]),
    majorWorks: asJson(["『方法序説』", "『省察』"]),
  },
  {
    id: "phil-nietzsche",
    slug: "nietzsche",
    name: "ニーチェ",
    nameEn: "Friedrich Nietzsche",
    initial: "N",
    era: "1844 – 1900",
    birthYear: 1844,
    deathYear: 1900,
    region: "近代ドイツ",
    shortBio: "既成道徳を問い直し、自分の価値を創ることを促した哲学者。",
    biography: `# ニーチェとは誰か

ニーチェは、近代社会の価値観を根本から問い直した哲学者です。とくに、当たり前とされてきた善悪の基準がどのように作られたのかを厳しく検討しました。

## 神は死んだ

有名な「神は死んだ」という言葉は、単純な無神論の宣言ではありません。かつて世界を支えていた絶対的価値が力を失い、人間が**自分で価値を引き受けなければならなくなった**ことを示します。

## 自己超克

ニーチェは、自分を固定したものとして守るより、つねに乗り越えていく**自己超克**を重視しました。哲学は生を弱めるものではなく、生を強めるものだと考えたのです。`,
    keyIdeas: asJson(["神は死んだ", "価値の再評価", "永劫回帰", "自己超克"]),
    majorWorks: asJson(["『ツァラトゥストラはこう語った』", "『善悪の彼岸』", "『道徳の系譜』"]),
  },
];

const themes = [
  {
    id: "theme-ontology",
    slug: "ontology",
    number: 1,
    name: "存在とは何か",
    description: "世界に『ある』とはどういうことかを考える、存在論の入口。",
  },
  {
    id: "theme-epistemology",
    slug: "epistemology",
    number: 2,
    name: "私たちは何を知れるのか",
    description: "知識・真理・疑いの問題を扱う認識論のテーマ。",
  },
  {
    id: "theme-ethics",
    slug: "ethics",
    number: 3,
    name: "善く生きるとは何か",
    description: "幸福、徳、善悪をめぐる倫理学の中心問題。",
  },
  {
    id: "theme-politics",
    slug: "politics",
    number: 4,
    name: "社会と正義",
    description: "個人と共同体、秩序と自由の関係を考えるテーマ。",
  },
  {
    id: "theme-self",
    slug: "self",
    number: 5,
    name: "自己とは何か",
    description: "主体・心・アイデンティティをめぐる問い。",
  },
  {
    id: "theme-meaning",
    slug: "meaning-of-life",
    number: 6,
    name: "人生の意味を問う",
    description: "不安、虚無、希望のなかで生の意味を考えるテーマ。",
  },
];

const articles = [
  {
    id: "article-what-is-philosophy",
    slug: "what-is-philosophy",
    title: "哲学って結局、何をする学問なのか",
    description: "哲学を『正解を覚える学問』ではなく『問いを深める営み』として捉え直します。",
    content: `# 哲学は「答えの一覧」ではない

哲学というと、難しい用語や偉人の名前を覚える学問だと思われがちです。けれど本質は、**問いを引き受ける力を育てること**にあります。

## すぐに答えが出ない問いに向き合う

「善く生きるとは何か」「本当に知っていると言えるのか」といった問いには、簡単な正解がありません。哲学は、そうした問いから目をそらさず、考え続ける練習です。

## 哲学史を学ぶ意味

過去の哲学者を学ぶのは、権威を暗記するためではありません。**自分では思いつけない視点に出会うため**です。

哲学史は、問いの歴史でもあります。`,
    tag: "入門",
    readingTime: 7,
    featured: true,
    philosopherId: null,
    publishedAt: at("2025-01-05T09:00:00.000Z"),
    themeSlugs: ["epistemology", "meaning-of-life"],
  },
  {
    id: "article-socratic-ignorance",
    slug: "socratic-ignorance",
    title: "『無知の知』とは、知らないことを誇ることではない",
    description: "ソクラテスの『無知の知』を、学びの姿勢としてやさしく解説します。",
    content: `# 無知の知とは何か

ソクラテスの「無知の知」は、何も知らないままでいいという意味ではありません。

## 知っているつもりを疑う

むしろ重要なのは、**自分が本当に理解しているかを疑うこと**です。分かったつもりでいると、問いは止まります。

## 学びの入口としての自覚

自分の理解の限界を知ることで、人は他者の言葉を聞けるようになります。そこから対話が始まり、考えが深まります。`,
    tag: "認識論",
    readingTime: 6,
    featured: true,
    philosopherId: "phil-socrates",
    publishedAt: at("2025-01-10T09:00:00.000Z"),
    themeSlugs: ["epistemology", "self"],
  },
  {
    id: "article-cave-allegory",
    slug: "cave-allegory",
    title: "プラトンの洞窟の比喩を、現代のSNS時代に読む",
    description: "見えているものが本当とは限らない。洞窟の比喩を現代的に読み直します。",
    content: `# 洞窟の比喩とは

プラトンは、人間が影だけを見て本物だと思い込んでいる状態を洞窟の比喩で表しました。

## 私たちは何を見ているのか

現代でも、切り取られた情報や短い刺激だけで世界を判断してしまうことがあります。哲学は、**見えているものの前提を疑う**訓練になります。

## 外へ出る勇気

洞窟の外へ出ることは楽ではありません。しかし本当に考えるとは、慣れた見方から一歩外へ出ることでもあります。`,
    tag: "存在論",
    readingTime: 8,
    featured: true,
    philosopherId: "phil-plato",
    publishedAt: at("2025-01-18T09:00:00.000Z"),
    themeSlugs: ["ontology", "epistemology", "politics"],
  },
  {
    id: "article-virtue-ethics",
    slug: "virtue-ethics-intro",
    title: "善い行為より先に、善い人を考える——徳倫理学入門",
    description: "アリストテレスの徳倫理学を手がかりに、人格と習慣の大切さを考えます。",
    content: `# 徳倫理学の視点

『何をすれば正しいか』だけでなく、『どんな人になるべきか』を問うのが徳倫理学です。

## 徳は習慣で身につく

アリストテレスは、勇気や節度のような徳は、生まれつき完成しているものではなく、**繰り返しの行為によって形づくられる**と考えました。

## 幸福とは活動である

幸福は、気分の良さではなく、徳にかなった活動を続けることの中にあります。`,
    tag: "倫理学",
    readingTime: 7,
    featured: false,
    philosopherId: "phil-aristotle",
    publishedAt: at("2025-01-24T09:00:00.000Z"),
    themeSlugs: ["ethics", "self"],
  },
  {
    id: "article-confucius-ren-li",
    slug: "confucius-ren-li",
    title: "孔子の『仁』と『礼』は、なぜ今も生き方のヒントになるのか",
    description: "人を思いやることと、ふるまいを整えることの関係を孔子から学びます。",
    content: `# 仁と礼

孔子の思想では、内面の思いやりである**仁**と、外面のふるまいを整える**礼**が結びついています。

## 気持ちだけでは足りない

良い心があっても、伝わり方を誤れば関係は壊れます。礼は、相手への敬意を社会のなかで形にする知恵です。

## 社会のなかの自己修養

孔子にとって学びは個人の趣味ではなく、共同体のなかで人が成熟するための実践でした。`,
    tag: "東洋哲学",
    readingTime: 6,
    featured: false,
    philosopherId: "phil-confucius",
    publishedAt: at("2025-01-29T09:00:00.000Z"),
    themeSlugs: ["ethics", "politics", "self"],
  },
  {
    id: "article-cogito",
    slug: "cogito-intro",
    title: "『我思う、ゆえに我あり』は何を確かにしたのか",
    description: "デカルトのコギトを、疑いと確実性の関係から読み解きます。",
    content: `# コギトの意味

デカルトは、感覚も常識も夢かもしれないと疑いました。それでも、**疑っている私がいる**という一点だけは確かだと考えました。

## 確実性の土台

ここから近代哲学は、どのように確実な知識を組み立てられるかを強く意識するようになります。

## 自己の発見と孤独

同時にこの考えは、世界より先に自己の確実性を置くという、近代的な主体の感覚も生み出しました。`,
    tag: "近代哲学",
    readingTime: 6,
    featured: true,
    philosopherId: "phil-descartes",
    publishedAt: at("2025-02-03T09:00:00.000Z"),
    themeSlugs: ["epistemology", "self"],
  },
  {
    id: "article-nietzsche-god-is-dead",
    slug: "god-is-dead",
    title: "ニーチェの『神は死んだ』は、絶望の言葉ではない",
    description: "既成の価値が揺らいだ時代に、人はどう生きるかを考えるための言葉です。",
    content: `# 神は死んだ

この言葉は、信仰の有無をめぐる単純な宣言ではありません。ニーチェが言いたかったのは、**社会を支えてきた絶対的な意味づけが機能しなくなった**ということです。

## 虚無をどう越えるか

古い価値が崩れた後、人は虚無に直面します。そこで必要なのは、誰かに与えられた価値ではなく、自分で引き受ける価値です。

## 生を肯定する

ニーチェの哲学は厳しいですが、最終的には生をより深く肯定しようとする試みでもあります。`,
    tag: "近現代",
    readingTime: 7,
    featured: true,
    philosopherId: "phil-nietzsche",
    publishedAt: at("2025-02-09T09:00:00.000Z"),
    themeSlugs: ["meaning-of-life", "ethics", "self"],
  },
  {
    id: "article-justice-intro",
    slug: "justice-intro",
    title: "正義とは、みんなに同じものを配ることなのか",
    description: "正義の問題を、平等・役割・共同体という観点から整理します。",
    content: `# 正義を考える

正義という言葉は日常でもよく使われますが、その意味は一つではありません。

## 平等と公平は同じか

全員に同じものを与えることが正しい場合もありますが、状況や役割に応じて配分を変える方が公平なこともあります。

## 共同体の視点

哲学は、個人の自由だけでなく、**社会全体の秩序や信頼**の観点からも正義を考えます。`,
    tag: "政治哲学",
    readingTime: 5,
    featured: false,
    philosopherId: null,
    publishedAt: at("2025-02-15T09:00:00.000Z"),
    themeSlugs: ["politics", "ethics"],
  },
];

const courses = [
  {
    id: "course-philosophy-basics",
    slug: "philosophy-basics",
    number: 1,
    title: "哲学のはじめかた",
    description: "哲学を学ぶ前に知っておきたい、問い方・読み方・考え方の基本。",
    difficulty: "beginner" as const,
    estimatedMinutes: 45,
    lessons: [
      {
        id: "lesson-questioning",
        slug: "questioning",
        number: 1,
        title: "問いを持つことから始める",
        description: "哲学が日常の違和感から始まることを学ぶ。",
        estimatedMinutes: 12,
        content: `# 問いは遠くにない

哲学は特別な人だけのものではありません。

- なぜ働くのか
- 幸せとは何か
- 正しいとは何か

こうした問いを真剣に考え始めるところから哲学は始まります。`,
      },
      {
        id: "lesson-reading-philosophy",
        slug: "reading-philosophy",
        number: 2,
        title: "哲学書を読むときのコツ",
        description: "結論だけでなく、問いと理由の流れを追う。",
        estimatedMinutes: 15,
        content: `# 読むときに意識したいこと

哲学書は、名言集として読むより、**問い・理由・結論**の順に追うと理解しやすくなります。

## コツ

1. 何を問うているか
2. どんな前提に立っているか
3. どう結論づけたか`,
      },
      {
        id: "lesson-dialogue-thinking",
        slug: "dialogue-thinking",
        number: 3,
        title: "対話として考える",
        description: "自分の考えを他者とのやりとりで磨く。",
        estimatedMinutes: 18,
        content: `# 対話の力

哲学は一人で黙って考えるだけではありません。対話を通じて、自分の前提や思い込みに気づけます。

> 自分の考えを言葉にして初めて、曖昧さが見えてくることがあります。`,
      },
    ],
  },
  {
    id: "course-ethics-and-life",
    slug: "ethics-and-life",
    number: 2,
    title: "善く生きるための倫理学",
    description: "徳・幸福・責任を軸に、倫理学の入口を歩くコース。",
    difficulty: "intermediate" as const,
    estimatedMinutes: 58,
    lessons: [
      {
        id: "lesson-what-is-good",
        slug: "what-is-good",
        number: 1,
        title: "善とは何か",
        description: "善悪の判断がなぜ難しいのかを整理する。",
        estimatedMinutes: 18,
        content: `# 善の問い

善は単なる好みではありません。しかし、すべての場面で同じ答えが通用するわけでもありません。

倫理学は、判断の基準そのものを考えます。`,
      },
      {
        id: "lesson-virtue-and-habit",
        slug: "virtue-and-habit",
        number: 2,
        title: "徳と習慣",
        description: "人格と反復行為の関係を学ぶ。",
        estimatedMinutes: 20,
        content: `# 徳は練習される

アリストテレスは、善い行為を繰り返すことで徳が身につくと考えました。

- 一度だけの勇気
- 習慣としての勇気

この違いが重要です。`,
      },
      {
        id: "lesson-happiness-and-purpose",
        slug: "happiness-and-purpose",
        number: 3,
        title: "幸福と人生の目的",
        description: "快楽と幸福の違いを考える。",
        estimatedMinutes: 20,
        content: `# 幸福は気分だけではない

幸福をその場の満足だけで考えると、長い目で見た善い生き方を見失うことがあります。

倫理学は、人生全体のかたちとして幸福を考えます。`,
      },
    ],
  },
  {
    id: "course-modern-self",
    slug: "modern-self",
    number: 3,
    title: "近代哲学と自己",
    description: "デカルトからニーチェまで、近代における主体のゆらぎを追うコース。",
    difficulty: "advanced" as const,
    estimatedMinutes: 64,
    lessons: [
      {
        id: "lesson-methodic-doubt",
        slug: "methodic-doubt",
        number: 1,
        title: "方法的懐疑",
        description: "疑うことがなぜ知識の土台になるのか。",
        estimatedMinutes: 20,
        content: `# まず疑う

デカルトは、疑えるものをいったん保留することで、確実な知識の出発点を探しました。`,
      },
      {
        id: "lesson-cogito-subject",
        slug: "cogito-subject",
        number: 2,
        title: "コギトと主体",
        description: "考える自己の確実性を読む。",
        estimatedMinutes: 22,
        content: `# 主体の発見

『我思う、ゆえに我あり』によって、世界認識の中心に主体が据えられます。`,
      },
      {
        id: "lesson-beyond-nihilism",
        slug: "beyond-nihilism",
        number: 3,
        title: "虚無を超えて",
        description: "ニーチェの価値の再評価を概観する。",
        estimatedMinutes: 22,
        content: `# 新しい価値へ

古い価値が崩れたあと、何を拠り所に生きるのか。ニーチェはこの問いを鋭く突きつけました。`,
      },
    ],
  },
];

const quotes = [
  {
    id: "quote-socrates-1",
    text: "吟味されない生は、人間にとって生きるに値しない。",
    source: "『ソクラテスの弁明』",
    philosopherId: "phil-socrates",
  },
  {
    id: "quote-plato-1",
    text: "驚きは哲学の始まりである。",
    source: "『テアイテトス』",
    philosopherId: "phil-plato",
  },
  {
    id: "quote-aristotle-1",
    text: "われわれは繰り返し行うことの結果である。ゆえに卓越性は行為ではなく習慣である。",
    source: "『ニコマコス倫理学』由来の要約表現",
    philosopherId: "phil-aristotle",
  },
  {
    id: "quote-confucius-1",
    text: "学びて時にこれを習う、また説ばしからずや。",
    source: "『論語』",
    philosopherId: "phil-confucius",
  },
  {
    id: "quote-descartes-1",
    text: "我思う、ゆえに我あり。",
    source: "『方法序説』",
    philosopherId: "phil-descartes",
  },
  {
    id: "quote-nietzsche-1",
    text: "怪物と戦う者は、自らが怪物とならぬよう気をつけよ。",
    source: "『善悪の彼岸』",
    philosopherId: "phil-nietzsche",
  },
];

const glossaryTerms = [
  {
    id: "glossary-idea",
    term: "イデア",
    reading: "いであ",
    definition: "プラトンが考えた、変わらない本質的なあり方。",
    detail: "個々の美しいものの背後にある『美そのもの』のように、感覚世界を超えて成立する本質。",
    philosopherId: "phil-plato",
    themeId: "theme-ontology",
  },
  {
    id: "glossary-cogito",
    term: "コギト",
    reading: "こぎと",
    definition: "『我思う、ゆえに我あり』で示される、思考する自己の確実性。",
    detail: "すべてを疑っても、疑っている主体の存在だけは否定できないというデカルトの発見。",
    philosopherId: "phil-descartes",
    themeId: "theme-self",
  },
  {
    id: "glossary-virtue",
    term: "徳",
    reading: "とく",
    definition: "善く生きるための優れた性質や習慣。",
    detail: "アリストテレスでは、行為の反復を通じて形成される人格的な力として理解される。",
    philosopherId: "phil-aristotle",
    themeId: "theme-ethics",
  },
  {
    id: "glossary-ren",
    term: "仁",
    reading: "じん",
    definition: "孔子思想の中心概念で、他者を思いやる人間らしさ。",
    detail: "抽象的な愛情ではなく、関係の中で具体的に発揮される思いやり。",
    philosopherId: "phil-confucius",
    themeId: "theme-ethics",
  },
  {
    id: "glossary-li",
    term: "礼",
    reading: "れい",
    definition: "社会の中でふるまいを整え、敬意を形にする規範。",
    detail: "形式だけでなく、人間関係を保つための実践的知恵として重視される。",
    philosopherId: "phil-confucius",
    themeId: "theme-politics",
  },
  {
    id: "glossary-methodic-doubt",
    term: "方法的懐疑",
    reading: "ほうほうてきかいぎ",
    definition: "確実な知識の基礎を見つけるため、疑えるものを徹底して疑う方法。",
    detail: "デカルトが採用した思考法で、懐疑それ自体が目的ではない。",
    philosopherId: "phil-descartes",
    themeId: "theme-epistemology",
  },
  {
    id: "glossary-nihilism",
    term: "虚無主義",
    reading: "きょむしゅぎ",
    definition: "価値や意味の根拠が失われた状態、またはその立場。",
    detail: "ニーチェは虚無主義を乗り越えるために、価値の再評価を試みた。",
    philosopherId: "phil-nietzsche",
    themeId: "theme-meaning",
  },
  {
    id: "glossary-midpoint",
    term: "中庸",
    reading: "ちゅうよう",
    definition: "極端を避け、状況に応じた適切さを保つこと。",
    detail: "アリストテレス倫理学では、徳は過剰と不足のあいだにある。",
    philosopherId: "phil-aristotle",
    themeId: "theme-ethics",
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // マイグレーションを実行（未適用のもののみ・冪等）
  await runMigrations();

  // 既にデータが存在する場合はスキップ（冪等性の確保）
  const existing = await db.select().from(philosopher).limit(1);
  if (existing.length > 0) {
    console.log("⏭️  既にシードデータが存在します。スキップします。");
    return;
  }

  await db.delete(userBookmark);
  await db.delete(userLessonProgress);
  await db.delete(quote);
  await db.delete(glossaryTerm);
  await db.delete(articleTheme);
  await db.delete(lesson);
  await db.delete(article);
  await db.delete(course);
  await db.delete(theme);
  await db.delete(philosopher);

  await db.insert(philosopher).values(philosophers);
  await db.insert(theme).values(themes);

  await db.insert(article).values(
    articles.map(({ themeSlugs, ...item }) => item),
  );

  await db.insert(articleTheme).values(
    articles.flatMap((item) =>
      item.themeSlugs.map((themeSlug) => ({
        articleId: item.id,
        themeId: themes.find((entry) => entry.slug === themeSlug)!.id,
      })),
    ),
  );

  await db.insert(course).values(
    courses.map(({ lessons: courseLessons, ...item }) => item),
  );

  await db.insert(lesson).values(
    courses.flatMap((courseItem) =>
      courseItem.lessons.map((lessonItem) => ({
        ...lessonItem,
        courseId: courseItem.id,
      })),
    ),
  );

  await db.insert(quote).values(quotes);
  await db.insert(glossaryTerm).values(glossaryTerms);

  console.log(`✅ Seeded ${philosophers.length} philosophers`);
  console.log(`✅ Seeded ${themes.length} themes`);
  console.log(`✅ Seeded ${articles.length} articles`);
  console.log(`✅ Seeded ${courses.length} courses`);
  console.log(`✅ Seeded ${courses.reduce((sum, item) => sum + item.lessons.length, 0)} lessons`);
  console.log(`✅ Seeded ${quotes.length} quotes`);
  console.log(`✅ Seeded ${glossaryTerms.length} glossary terms`);
}

seed()
  .then(() => {
    console.log("🎉 Database seeding completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Database seeding failed.");
    console.error(error);
    process.exit(1);
  });
