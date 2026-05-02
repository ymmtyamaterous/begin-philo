import { sql } from "drizzle-orm";
import { db, runMigrations } from "./index";
import {
  article,
  articleSeries,
  articleSeriesItem,
  articleTheme,
  course,
  glossaryTerm,
  lesson,
  philosopher,
  quiz,
  quizOption,
  quote,
  theme,
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
  {
    id: "phil-wittgenstein",
    slug: "wittgenstein",
    name: "ヴィトゲンシュタイン",
    nameEn: "Ludwig Wittgenstein",
    initial: "W",
    era: "1889 – 1951",
    birthYear: 1889,
    deathYear: 1951,
    region: "現代オーストリア・イギリス",
    shortBio: "言語と世界の限界を問い、哲学の問題の多くを言語の混乱として捉え直した20世紀最大の哲学者の一人。",
    biography: `# ヴィトゲンシュタインとは誰か

ルートヴィヒ・ヴィトゲンシュタインは、20世紀の哲学に最も大きな影響を与えた人物のひとりです。ウィーン生まれの彼は、最初は工学を学びましたが、やがて論理学と哲学に転じ、ラッセルのもとでケンブリッジ大学に学びました。

## 前期と後期——二つの哲学

ヴィトゲンシュタインの哲学は、大きく前期と後期に分かれます。

**前期**の代表作『論理哲学論考』（1921年）では、言語が世界を映し出す**写像**であると考えました。言語で表現できることと、表現できないこと（語りえないもの）の境界を引くことが目標でした。

**後期**の代表作『哲学的探究』（1953年、没後刊行）では、前期の立場を自ら批判し、言語の意味は固定した対応関係にあるのではなく、**実際の使われ方（使用）によって決まる**と考えるようになりました。

## 語りえないもの

「語りえないことについては、沈黙しなければならない」という言葉は、哲学の多くの問いが言語の限界を超えていることを示しています。これは哲学の放棄ではなく、**何が言語で扱えるかを明確にすること**が哲学の仕事だという主張です。

## 言語ゲーム

後期ヴィトゲンシュタインは、言語を一つの統一したシステムとして見るのをやめました。言語はさまざまな**ゲーム**の集まりであり、それぞれが異なるルールと文脈を持っています。意味とは、言葉が実際に使われる文脈の中にある、と考えたのです。`,
    keyIdeas: asJson(["言語ゲーム", "写像理論", "語りえないもの", "家族的類似性"]),
    majorWorks: asJson(["『論理哲学論考』", "『哲学的探究』"]),
  },
  {
    id: "phil-heidegger",
    slug: "heidegger",
    name: "ハイデガー",
    nameEn: "Martin Heidegger",
    initial: "H",
    era: "1889 – 1976",
    birthYear: 1889,
    deathYear: 1976,
    region: "現代ドイツ",
    shortBio: "「存在とは何か」を根本から問い直し、現存在・世界内存在・死への存在といった概念で20世紀哲学に革命をもたらした哲学者。",
    biography: `# ハイデガーとは誰か

マルティン・ハイデガーは、20世紀最大の哲学者のひとりです。ドイツ南部の小村メスキルヒに生まれ、フライブルク大学でエドムント・フッサールに師事しました。主著『存在と時間』（1927年）は、現代哲学の方向を大きく変えた書です。

## 存在の問いの復活

ハイデガーは、哲学の歴史全体が**存在忘却**に陥っていると診断しました。私たちは「存在するもの（存在者）」については語りますが、「存在するとはそもそもどういうことか」という問い——**存在の問い**——を忘れてしまっています。

ハイデガーの哲学は、この忘れられた問いを取り戻すための試みです。

## 現存在（Dasein）

ハイデガーは人間を「現存在（Dasein）」と呼びます。これは「そこに在ること」を意味し、人間が**世界のなかで状況に巻き込まれながら存在している**ことを強調します。

## 世界内存在

現存在は、まず理論的に世界を観察するのではなく、**道具を使い、他者とともに、気遣いながら**世界に関わっています。この関わりの構造を「世界内存在（In-der-Welt-sein）」と呼びます。

私たちが使うハンマーは、叩いているときには「手元にある（手前に在る）」存在で、理論的な対象としてではなく機能として現れます。

## 死への存在

ハイデガーにとって、死は避けられない「固有の可能性」です。死をあらかじめ引き受けることで、現存在は本来の自分自身に戻ることができます。

日常の「ひと（das Man）」の流れに流されず、自分の存在を引き受けて生きること——これが**本来性**です。`,
    keyIdeas: asJson(["現存在", "世界内存在", "死への存在", "本来性", "存在忘却"]),
    majorWorks: asJson(["『存在と時間』", "『技術への問い』", "『形而上学とは何か』"]),
  },
  {
    id: "phil-kant",
    slug: "kant",
    name: "カント",
    nameEn: "Immanuel Kant",
    initial: "K",
    era: "1724 – 1804",
    birthYear: 1724,
    deathYear: 1804,
    region: "近代ドイツ",
    shortBio: "「批判哲学」によって認識論と道徳論を刷新し、近代哲学の転換点を画した哲学者。定言命法と物自体の概念で知られる。",
    biography: `# カントとは誰か

イマヌエル・カントは、近代哲学において最も重要な転換点を作った哲学者のひとりです。プロイセンのケーニヒスベルク（現ロシア・カリーニングラード）に生まれ、生涯その地を離れることなく哲学を深め続けました。

## コペルニクス的転回

カントは認識の問題を根本から問い直しました。伝統的な哲学は「認識が対象に合わせる」と考えていましたが、カントはこれを逆転させました——**対象が認識の形式に合わせる**のです。

これをカントは「コペルニクス的転回」と呼びます。時間・空間・因果といったカテゴリーは、外の世界から学ぶのではなく、私たちの認識能力が世界に投げかける**アプリオリ（先験的）な形式**です。

## 現象と物自体

私たちが認識できるのは**現象**（感性と悟性によって構成された世界）のみです。その背後にある**物自体**（Ding an sich）は、原理的に認識できません。

これは懐疑論ではなく、認識の限界と可能性を同時に明確にする試みです。

## 定言命法

道徳においてカントは、感情や利益に基づく命令（仮言命法）を退け、**無条件に従うべき道徳の命令**を「定言命法」として定式化しました。

その代表的な表現が「あなたの行為の格率が、同時に普遍的法則となりうるように行為せよ」です。

カントにとって道徳的であることは、自分の理性によって自らに法則を与える**自律（Autonomie）**の実践です。`,
    keyIdeas: asJson(["定言命法", "物自体", "アプリオリ", "自律", "コペルニクス的転回"]),
    majorWorks: asJson(["『純粋理性批判』", "『実践理性批判』", "『道徳の形而上学の基礎づけ』"]),
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
  {
    id: "article-wittgenstein-tractatus",
    slug: "wittgenstein-tractatus",
    title: "「語りえないことについては、沈黙しなければならない」——ヴィトゲンシュタインと言語の限界",
    description: "前期ヴィトゲンシュタインの主著『論理哲学論考』を手がかりに、言語が世界を映す写像理論と「語りえないもの」の意味を読み解きます。",
    content: `# 言語はどこまで届くのか

ヴィトゲンシュタインの『論理哲学論考』は、哲学書のなかでも極めて独特の形式を持っています。命題を番号で整理し、最後のひとことで締め括ります。

「語りえないことについては、沈黙しなければならない。」

## 写像理論とは何か

前期ヴィトゲンシュタインは、言語が世界の**写像**（うつし）であると考えました。意味のある命題は、世界の事実の状態を映し出しています。たとえば「リンゴが机の上にある」という文は、実際に起こりうる事実の構造を映しています。言語と世界は、同じ**論理的形式**を共有しているのです。

## 語りえないもの

ところが、倫理や美、神について語る文は、この写像の構造に収まりません。これらは事実を述べるのではなく、何か別の次元に属しています。ヴィトゲンシュタインはこれを「語りえないもの」と呼び、沈黙を勧めました。

しかしこれは、これらのことが**重要ではない**という意味ではありません。むしろ、語りえないものこそが最も大切なのかもしれない、というニュアンスを含んでいます。

## 哲学の仕事とは

前期ヴィトゲンシュタインにとって、哲学の仕事は新しい真理を発見することではありません。言語を明確にし、どの問いが意味を持ち、どの問いが無意味な混乱から来ているかを見極めることでした。`,
    tag: "言語哲学",
    readingTime: 8,
    featured: true,
    philosopherId: "phil-wittgenstein",
    publishedAt: at("2025-02-20T09:00:00.000Z"),
    themeSlugs: ["epistemology", "ontology"],
  },
  {
    id: "article-wittgenstein-language-games",
    slug: "wittgenstein-language-games",
    title: "意味とは使用である——言語ゲームと後期ヴィトゲンシュタイン",
    description: "後期ヴィトゲンシュタインの中心概念「言語ゲーム」を通じて、言葉の意味が実際の使われ方のなかにあるという考え方を探ります。",
    content: `# 「意味とは使用だ」とはどういうことか

後期ヴィトゲンシュタインは、前期の自分を批判しました。言語を単なる写像と見ることは、言語の豊かさを見逃すと考えたのです。

## 言語ゲームという発想

『哲学的探究』でヴィトゲンシュタインが提示したのは、**言語ゲーム**という概念です。言語は、ひとつの統一されたシステムではありません。命令する、約束する、冗談を言う、祈る——これらはすべて違うルールで動く「ゲーム」です。

「善い」という言葉も、料理を評価するときと、倫理的な判断を下すときとでは、異なるゲームに属しています。意味は、文脈と使用の中にあるのです。

## 家族的類似性

ヴィトゲンシュタインは「ゲーム」という言葉自体も分析しました。チェスもサッカーも「ゲーム」ですが、共通の本質はありません。それでも同じ語を使えるのは、**家族の顔立ちのような重なり合う類似性**（家族的類似性）があるからです。

## 哲学の問題はどこから来るか

後期ヴィトゲンシュタインの診断によると、哲学の問題の多くは、**言葉がひとつのゲームから別のゲームに持ち込まれる**ときに生まれます。

「時間とは何か」「心とは何か」——これらは日常の使用文脈を外れた問いです。哲学の仕事は答えを出すことより、言語がどのように機能しているかを示すことです。`,
    tag: "言語哲学",
    readingTime: 7,
    featured: false,
    philosopherId: "phil-wittgenstein",
    publishedAt: at("2025-02-27T09:00:00.000Z"),
    themeSlugs: ["epistemology", "self"],
  },
  {
    id: "article-heidegger-being-in-world",
    slug: "heidegger-being-in-world",
    title: "私たちはまず「世界のなかに」いる——ハイデガーの世界内存在",
    description: "ハイデガーの『存在と時間』を手がかりに、人間が理論より先に世界への関わりのなかにあるという「世界内存在」の考え方を解説します。",
    content: `# 道具から始まる哲学

哲学の伝統では、人間はまず世界を「観察する主体」として描かれてきました。デカルトの「我思う」がその典型です。

しかしハイデガーは問います——本当に私たちは、まず世界を外側から眺めているのでしょうか？

## 手元性とは何か

ハンマーで釘を打っているとき、私たちはハンマーを「意識」していません。ハンマーは手の延長として機能しており、**道具として透明に使われています**。これをハイデガーは「手元にある存在（手前性）」と呼びます。

道具が壊れてはじめて、私たちはそれを対象として意識します。つまり「観察する主体と対象」という関係は、もともとの関わりが崩れたときに生じる**派生的な構造**です。

## 世界内存在の構造

現存在は、まず気遣いながら、道具を使い、他者とともに世界にいます。この関わりの全体構造を、ハイデガーは**世界内存在（In-der-Welt-sein）**と呼びます。

「世界の中に」という言い方は、単に空間的な意味ではありません。世界とは、意味の網の目——何がどんな目的のためにあるか、誰と何をするかという関係の全体です。

## 現存在は「そこに投げ込まれている」

私たちは、時代・言語・文化・身体を自分で選んでこの世界に来たわけではありません。ハイデガーはこれを**被投性**と呼びます。

しかしその被投性のなかで、私たちは可能性へと向かって自分を投企します。この張力こそが人間存在の構造です。`,
    tag: "存在論",
    readingTime: 9,
    featured: true,
    philosopherId: "phil-heidegger",
    publishedAt: at("2025-03-05T09:00:00.000Z"),
    themeSlugs: ["ontology", "self"],
  },
  {
    id: "article-heidegger-death-authenticity",
    slug: "heidegger-death-authenticity",
    title: "死を引き受けることで、自分らしく生きられる——ハイデガーの本来性",
    description: "ハイデガーの「死への存在」と「本来性」の概念を通じて、日常性の流れに飲み込まれない生き方を考えます。",
    content: `# 「ひと（das Man）」の支配

日常生活において、私たちはほとんどの場合、「ひと（das Man）」として生きています。「ひと」とは、誰でもない匿名の存在——「みんなそうしているから」「世間ではそうなっている」という流れです。

ハイデガーは、この日常性のなかでは、現存在は自分固有の存在可能性から引き離されてしまうと考えました。

## 死という固有の可能性

死だけは、誰にも代わってもらえません。私の死は絶対に私自身のものです。

ハイデガーは、死を「可能性の不可能性」——すべての可能性が奪われる究極の可能性——として捉えます。この死をあらかじめ引き受けること（**先駆的決意性**）によって、現存在は日常性から覚め、自分固有の存在可能性に立ち返ります。

## 本来性と非本来性

本来性とは、英雄的な孤独を生きることではありません。ひとの流れに流されながらも、自分の存在を見失わずに関わること——それが**本来的な生き方**です。

非本来性も本来性も、同じ日常のなかにあります。違いは、自分の有限性を引き受けているかどうかです。

## 不安という気分

ハイデガーは「不安」を重要な気分として取り上げます。不安において、現存在は日常性の意味から切り離され、**自分の存在そのものへと向き合わされます**。

不安は病ではなく、本来性への入口です。`,
    tag: "存在論",
    readingTime: 8,
    featured: false,
    philosopherId: "phil-heidegger",
    publishedAt: at("2025-03-12T09:00:00.000Z"),
    themeSlugs: ["ontology", "self", "meaning-of-life"],
  },
  {
    id: "article-kant-critique",
    slug: "kant-critique-of-pure-reason",
    title: "私たちは世界を「ありのまま」に見ているのか——カントの認識論",
    description: "カントの『純粋理性批判』を手がかりに、認識がどのように世界を構成するかという「コペルニクス的転回」を解説します。",
    content: `# 認識は対象に合わせるのか、対象が認識に合わせるのか

デカルト以来、哲学者たちは「いかにして私たちは外の世界を正確に知れるのか」を問い続けました。カントはこの問いを根本から組み替えます。

## コペルニクス的転回

カントの発想の転換は、天文学のコペルニクスに喩えられます。

かつて天文学は「天が地球の周りを回る」と考えていました。コペルニクスはこれを逆転させ「地球が太陽の周りを回る」と主張しました。

カントも同様に言います——認識が対象に合わせるのではなく、**対象が私たちの認識の形式に合わせる**のです。

## アプリオリな形式

私たちが世界を「時間の中に」「空間の中に」「原因と結果として」経験するのは、外の世界がそうなっているからではありません。それは**私たちの認識能力が世界に投げかける先験的（アプリオリ）な形式**です。

時間・空間は感性の形式であり、因果・実体などのカテゴリーは悟性の形式です。これらがなければ、私たちは経験を統一的に把握できません。

## 現象と物自体

こうして私たちが認識できるのは、これらの形式を通じて構成された**現象**だけです。その背後にある**物自体**（Ding an sich）——ありのままの現実——は認識の届かない領域にあります。

これは「何も知れない」という虚無主義ではありません。むしろ、**知識が成立する条件を明確にすること**によって、科学的認識の信頼性を根拠づけようとした試みです。`,
    tag: "認識論",
    readingTime: 8,
    featured: true,
    philosopherId: "phil-kant",
    publishedAt: at("2025-03-20T09:00:00.000Z"),
    themeSlugs: ["epistemology", "ontology"],
  },
  {
    id: "article-kant-categorical-imperative",
    slug: "kant-categorical-imperative",
    title: "「普遍的法則となれるか」——カントの定言命法と自律の倫理学",
    description: "カントの道徳哲学の中心「定言命法」を解説し、自律に基づく倫理とはどのようなものかを考えます。",
    content: `# 感情や利益に頼らない道徳

カントは、感情に基づく道徳や利益に基づく善意を根本的な道徳とは認めませんでした。なぜなら、感情も利益も状況によって変わりうるからです。

では、どんな状況でも成立する道徳の根拠とは何でしょうか。

## 仮言命法と定言命法

カントは命令を二種類に分けます。

**仮言命法**（hypothetical imperative）：「もし〜したいなら、〜せよ」という条件付きの命令。目的が変われば命令も変わります。

**定言命法**（categorical imperative）：条件なしに従うべき命令。「〜せよ」とだけ言います。

道徳的な命令は定言命法でなければならない、とカントは主張します。

## 普遍化の定式

定言命法の代表的な表現は次のとおりです。

> あなたの行為の格率が、同時に普遍的な法則となりうるように行為せよ。

「格率」とは、行為の主観的なルールです。自分の行動指針が、もし誰もが同様に行動したとしても矛盾が生じないか——これが道徳的かどうかの判断基準です。

## 自律——自分の理性で法則を与える

カントの倫理の核心は**自律（Autonomie）**です。道徳は外から与えられる規則ではなく、自分の理性が自分自身に与える法則です。

他律（感情・権威・利益への従属）ではなく、理性による自律こそが道徳の本質です。`,
    tag: "倫理学",
    readingTime: 7,
    featured: false,
    philosopherId: "phil-kant",
    publishedAt: at("2025-03-27T09:00:00.000Z"),
    themeSlugs: ["ethics", "self"],
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
  {
    id: "course-language-and-philosophy",
    slug: "language-and-philosophy",
    number: 4,
    title: "言語と哲学——ヴィトゲンシュタインから学ぶ",
    description: "言語が哲学にとってなぜ重要なのかを、ヴィトゲンシュタインの前期・後期の思想を通じて探るコース。",
    difficulty: "intermediate" as const,
    estimatedMinutes: 56,
    lessons: [
      {
        id: "lesson-language-and-world",
        slug: "language-and-world",
        number: 1,
        title: "言語は世界を映す",
        description: "前期ヴィトゲンシュタインの写像理論と語りえないものを学ぶ。",
        estimatedMinutes: 18,
        content: `# 言語と世界の対応

前期ヴィトゲンシュタインは、意味のある文は世界の事実の構造を映していると考えました。この考えによれば、倫理や神について語る文は事実を映せないため、「語りえない」領域に属します。

> 語りえないことについては、沈黙しなければならない。`,
      },
      {
        id: "lesson-meaning-as-use",
        slug: "meaning-as-use",
        number: 2,
        title: "意味は使用にある",
        description: "後期ヴィトゲンシュタインの言語ゲームと意味の使用説を学ぶ。",
        estimatedMinutes: 20,
        content: `# 使用の中に意味がある

後期ヴィトゲンシュタインは、言葉の意味はその使われ方のなかにあると考えました。

- 命令する言語ゲーム
- 報告する言語ゲーム
- 冗談を言う言語ゲーム

それぞれのゲームには異なるルールがあり、意味はそのルールのなかで決まります。`,
      },
      {
        id: "lesson-philosophy-as-therapy",
        slug: "philosophy-as-therapy",
        number: 3,
        title: "哲学という治療",
        description: "ヴィトゲンシュタインが哲学の問題をどう解消しようとしたかを学ぶ。",
        estimatedMinutes: 18,
        content: `# 哲学の問題を解消する

ヴィトゲンシュタインにとって哲学の問題の多くは、言語の混乱から生まれます。

言葉が本来の使用文脈を離れて使われるとき、混乱が起きます。哲学の仕事は、その混乱を解きほぐし、言葉を正しい文脈に戻すことです。

> 哲学とは、言葉というハエ取り壺からハエを逃す道を示すことだ。`,
      },
    ],
  },
  {
    id: "course-heidegger-existence",
    slug: "heidegger-existence",
    number: 5,
    title: "存在を問う——ハイデガーの哲学",
    description: "現存在・世界内存在・死への存在という概念を通じて、ハイデガーの実存哲学の核心に迫るコース。",
    difficulty: "advanced" as const,
    estimatedMinutes: 62,
    lessons: [
      {
        id: "lesson-dasein",
        slug: "dasein",
        number: 1,
        title: "現存在とは何か",
        description: "ハイデガーが人間存在をなぜ「現存在」と呼んだかを学ぶ。",
        estimatedMinutes: 20,
        content: `# 存在の問いを問い直す

ハイデガーは哲学史全体が「存在者」を論じながら「存在そのもの」を問わずにきたと批判しました。

現存在（Dasein）とは、「そこに在ること」を意味し、自分の存在を問題にできる唯一の存在者です。

- 石は存在するが、石は自分の存在を問いません
- 動物は存在するが、死を見越して生きることはしません
- 人間（現存在）だけが、存在を問題にしながら生きています`,
      },
      {
        id: "lesson-being-in-world",
        slug: "being-in-world",
        number: 2,
        title: "世界内存在の構造",
        description: "ハイデガーの世界内存在と道具的存在の概念を学ぶ。",
        estimatedMinutes: 22,
        content: `# まず世界の中にいる

私たちは最初から世界のなかに投げ込まれています。ハンマーを使うとき、ハンマーは対象ではなく道具として「消えて」います。

世界内存在とは、この関わりの全体構造です。`,
      },
      {
        id: "lesson-death-and-authenticity",
        slug: "death-and-authenticity",
        number: 3,
        title: "死への存在と本来性",
        description: "死を引き受けることがなぜ本来性につながるかを学ぶ。",
        estimatedMinutes: 20,
        content: `# 死という固有の可能性

死だけは誰にも代わってもらえません。ハイデガーはこの事実を、現存在が本来性に目覚める契機として捉えます。

「ひと（das Man）」の流れに乗って生きることは非本来的な生き方です。死への先駆的決意性が、本来の自己への道を開きます。`,
      },
    ],
  },
  {
    id: "course-kant-philosophy",
    slug: "kant-philosophy",
    number: 6,
    title: "カントの批判哲学——認識と道徳の革命",
    description: "『純粋理性批判』の認識論から『実践理性批判』の道徳論まで、カント哲学の核心を学ぶコース。",
    difficulty: "advanced" as const,
    estimatedMinutes: 60,
    lessons: [
      {
        id: "lesson-kant-copernican",
        slug: "kant-copernican",
        number: 1,
        title: "コペルニクス的転回",
        description: "カントが認識論においてどのような革命を起こしたかを学ぶ。",
        estimatedMinutes: 20,
        content: `# 認識が世界を構成する

カントは「認識が対象に合わせる」という従来の考えを逆転させました。対象が私たちの認識の形式に合わせるのです。

時間・空間は感性のアプリオリな形式であり、因果・実体などのカテゴリーは悟性のアプリオリな形式です。これらが経験を可能にしています。`,
      },
      {
        id: "lesson-kant-phenomenon",
        slug: "kant-phenomenon",
        number: 2,
        title: "現象と物自体",
        description: "私たちが認識できる「現象」と、認識の届かない「物自体」の区別を学ぶ。",
        estimatedMinutes: 20,
        content: `# 私たちは何を知れるのか

カントによれば、認識できるのは感性と悟性の形式を通じて構成された**現象**だけです。

その背後にある**物自体**（Ding an sich）は、原理的に認識不可能です。これは懐疑論ではなく、知識の条件を明確にすることで科学的認識を根拠づける試みです。`,
      },
      {
        id: "lesson-kant-moral",
        slug: "kant-moral",
        number: 3,
        title: "定言命法と自律",
        description: "カントの道徳哲学における定言命法と自律の概念を学ぶ。",
        estimatedMinutes: 20,
        content: `# 条件なき道徳の命令

カントは感情や利益に基づく道徳を退け、理性による無条件の命令——**定言命法**——を道徳の基礎とします。

「あなたの行為の格率が普遍的法則となりうるように行為せよ」——これが自律の道徳です。外から与えられるのではなく、自分の理性が自分に与える法則に従うことが、真の道徳的行為です。`,
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
  {
    id: "quote-wittgenstein-1",
    text: "語りえないことについては、沈黙しなければならない。",
    source: "『論理哲学論考』",
    philosopherId: "phil-wittgenstein",
  },
  {
    id: "quote-wittgenstein-2",
    text: "私の言語の限界は、私の世界の限界を意味する。",
    source: "『論理哲学論考』",
    philosopherId: "phil-wittgenstein",
  },
  {
    id: "quote-heidegger-1",
    text: "現存在の本質は、その実存にある。",
    source: "『存在と時間』",
    philosopherId: "phil-heidegger",
  },
  {
    id: "quote-heidegger-2",
    text: "死は、現存在が引き受けなければならない最も固有の可能性である。",
    source: "『存在と時間』",
    philosopherId: "phil-heidegger",
  },
  {
    id: "quote-kant-1",
    text: "二つのものが私の心をつねに新たな、ますます増大する驚きと畏敬で満たす。それは私の上なる星空と、私の内なる道徳法則とである。",
    source: "『実践理性批判』",
    philosopherId: "phil-kant",
  },
  {
    id: "quote-kant-2",
    text: "あなたの人格や他のすべての人の人格に宿る人間性を、つねに同時に目的として扱い、決して単なる手段としてのみ扱わないように行為せよ。",
    source: "『道徳の形而上学の基礎づけ』",
    philosopherId: "phil-kant",
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
  {
    id: "glossary-language-game",
    term: "言語ゲーム",
    reading: "げんごげーむ",
    definition: "言語をさまざまな規則に従った活動（ゲーム）の集合として捉えるヴィトゲンシュタインの概念。",
    detail: "後期ヴィトゲンシュタインが提示した考え方。意味は固定した本質ではなく、言葉が実際に使われる文脈と実践（使用）のなかにあると主張する。",
    philosopherId: "phil-wittgenstein",
    themeId: "theme-epistemology",
  },
  {
    id: "glossary-picture-theory",
    term: "写像理論",
    reading: "しゃぞうりろん",
    definition: "言語の命題は世界の事実の論理的構造を映し出すという、前期ヴィトゲンシュタインの言語論。",
    detail: "『論理哲学論考』で展開された考え方。言語と世界は同じ論理形式を共有しており、意味ある命題は世界の可能な状態を写像する。",
    philosopherId: "phil-wittgenstein",
    themeId: "theme-ontology",
  },
  {
    id: "glossary-family-resemblance",
    term: "家族的類似性",
    reading: "かぞくてきるいじせい",
    definition: "概念が共通の本質ではなく、重なり合う類似性によってまとめられるというヴィトゲンシュタインの考え方。",
    detail: "後期ヴィトゲンシュタインが『哲学的探究』で示した。例えば「ゲーム」という語で呼ばれるものに共通の本質はないが、家族の顔立ちのような部分的な類似性が複数重なり合っている。",
    philosopherId: "phil-wittgenstein",
    themeId: "theme-epistemology",
  },
  {
    id: "glossary-dasein",
    term: "現存在",
    reading: "げんそんざい",
    definition: "ハイデガーが人間存在を指して用いた概念。「そこに在る（Da-sein）」ことを意味し、世界へと開かれた存在のあり方を示す。",
    detail: "単なる物体や動物と異なり、現存在は自分の存在を問題にできる存在者である。ハイデガーの実存分析の出発点。",
    philosopherId: "phil-heidegger",
    themeId: "theme-ontology",
  },
  {
    id: "glossary-being-in-the-world",
    term: "世界内存在",
    reading: "せかいないそんざい",
    definition: "現存在が道具・他者・文脈とともに世界に関わりながら存在しているという、ハイデガーの根本構造。",
    detail: "「世界の中に入れられた主体」ではなく、気遣い・道具使用・他者との共存が不可分に結びついた存在のあり方を指す。",
    philosopherId: "phil-heidegger",
    themeId: "theme-ontology",
  },
  {
    id: "glossary-authenticity",
    term: "本来性",
    reading: "ほんらいせい",
    definition: "日常の匿名的な「ひと（das Man）」の流れに流されず、自分固有の存在可能性を引き受けて生きること。",
    detail: "死への先駆的決意性によって開かれる生き方。非本来性（ひとの流れへの埋没）との対比で理解される。",
    philosopherId: "phil-heidegger",
    themeId: "theme-self",
  },
  {
    id: "glossary-categorical-imperative",
    term: "定言命法",
    reading: "ていげんめいほう",
    definition: "カントが定式化した、条件なしに従うべき道徳の命令。「あなたの行為の格率が普遍的法則となりうるように行為せよ」が代表的表現。",
    detail: "仮言命法（条件付き命令）と対比される。感情や利益ではなく純粋な理性から導かれ、自律的な道徳行為の基礎となる。",
    philosopherId: "phil-kant",
    themeId: "theme-ethics",
  },
  {
    id: "glossary-thing-in-itself",
    term: "物自体",
    reading: "ものじたい",
    definition: "カントにおける、人間の認識能力の外にある現実そのもの。私たちは現象のみを認識でき、物自体には原理的に届かない。",
    detail: "『純粋理性批判』の核心概念。現象（人間の認識形式を通じて構成されたもの）と物自体を区別することで、認識の可能性と限界を同時に確定する。",
    philosopherId: "phil-kant",
    themeId: "theme-epistemology",
  },
  {
    id: "glossary-autonomy",
    term: "自律",
    reading: "じりつ",
    definition: "外からの命令や感情・利益ではなく、自分の理性が自分に法則を与えること。カント倫理学の中心概念。",
    detail: "他律（感情・権威・利益への従属）と対比される。道徳的行為は自律に基づく場合のみ真に道徳的とみなされる。",
    philosopherId: "phil-kant",
    themeId: "theme-ethics",
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // マイグレーションを実行（未適用のもののみ・冪等）
  await runMigrations();

  // ジャンクションテーブルをクリア（ユーザーデータなし・再構築のため）
  await db.delete(articleTheme);
  await db.delete(articleSeriesItem);

  await db.insert(philosopher).values(philosophers).onConflictDoUpdate({
    target: philosopher.id,
    set: {
      slug: sql`excluded.slug`,
      name: sql`excluded.name`,
      nameEn: sql`excluded.name_en`,
      initial: sql`excluded.initial`,
      era: sql`excluded.era`,
      birthYear: sql`excluded.birth_year`,
      deathYear: sql`excluded.death_year`,
      region: sql`excluded.region`,
      shortBio: sql`excluded.short_bio`,
      biography: sql`excluded.biography`,
      keyIdeas: sql`excluded.key_ideas`,
      majorWorks: sql`excluded.major_works`,
    },
  });
  await db.insert(theme).values(themes).onConflictDoUpdate({
    target: theme.id,
    set: {
      slug: sql`excluded.slug`,
      number: sql`excluded.number`,
      name: sql`excluded.name`,
      description: sql`excluded.description`,
    },
  });

  await db.insert(article).values(
    articles.map(({ themeSlugs, ...item }) => item),
  ).onConflictDoUpdate({
    target: article.id,
    set: {
      slug: sql`excluded.slug`,
      title: sql`excluded.title`,
      description: sql`excluded.description`,
      content: sql`excluded.content`,
      tag: sql`excluded.tag`,
      readingTime: sql`excluded.reading_time`,
      featured: sql`excluded.featured`,
      philosopherId: sql`excluded.philosopher_id`,
      publishedAt: sql`excluded.published_at`,
    },
  });

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
  ).onConflictDoUpdate({
    target: course.id,
    set: {
      slug: sql`excluded.slug`,
      number: sql`excluded.number`,
      title: sql`excluded.title`,
      description: sql`excluded.description`,
      difficulty: sql`excluded.difficulty`,
      estimatedMinutes: sql`excluded.estimated_minutes`,
    },
  });

  await db.insert(lesson).values(
    courses.flatMap((courseItem) =>
      courseItem.lessons.map((lessonItem) => ({
        ...lessonItem,
        courseId: courseItem.id,
      })),
    ),
  ).onConflictDoUpdate({
    target: lesson.id,
    set: {
      slug: sql`excluded.slug`,
      courseId: sql`excluded.course_id`,
      number: sql`excluded.number`,
      title: sql`excluded.title`,
      description: sql`excluded.description`,
      content: sql`excluded.content`,
      estimatedMinutes: sql`excluded.estimated_minutes`,
    },
  });

  // クイズデータ
  const quizData = [
    // コース: 哲学の基礎・レッスン1: 問いかけるには
    {
      id: "quiz-questioning-1",
      lessonId: "lesson-questioning",
      question: "哲学的な問いの特徴として最も適切な説明はどれですか？",
      explanation: "哲学的な問いは、単純な事実確認ではなく、存在や善さや知識の本質に迂る「根本的な問い」です。簡単に答えられないからこそ、深める価値があります。",
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
      explanation: "無知の知は「何も知らない」と投げやりなことではなく、「自分が十分には理解できていないと自覚することで、考える出発点に立つ」という意味です。",
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
      explanation: "方法的懐疑は、不指の疑いを推山しても畵1度も生じることのない、小さいけれども完全に確実な知識の土台を見つけるための方法です。",
      order: 1,
      options: [
        { id: "quiz-d1-o1", text: "すべての存在を否定する虚無主義を導くため", isCorrect: false, order: 1 },
        { id: "quiz-d1-o2", text: "確実な知識の土台を見つけるため", isCorrect: true, order: 2 },
        { id: "quiz-d1-o3", text: "信仰を否定する無神論を証明するため", isCorrect: false, order: 3 },
        { id: "quiz-d1-o4", text: "孯の中のみ真実が存在することを示すため", isCorrect: false, order: 4 },
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
    {
      id: "quiz-language-world-1",
      lessonId: "lesson-language-and-world",
      question: "前期ヴィトゲンシュタインの写像理論では、言語の意味はどのように成立すると考えましたか？",
      explanation: "写像理論では、意味のある命題は世界の事実の構造を論理的に映し出すものです。言語と世界は同じ論理形式を共有します。",
      order: 1,
      options: [
        { id: "quiz-lw1-o1", text: "言葉は慣習的に意味を持ち、文化によって決まる", isCorrect: false, order: 1 },
        { id: "quiz-lw1-o2", text: "命題は世界の事実の構造を論理的に映し出す", isCorrect: true, order: 2 },
        { id: "quiz-lw1-o3", text: "言語は感情を表現するための道具である", isCorrect: false, order: 3 },
        { id: "quiz-lw1-o4", text: "意味は神から与えられた固定した本質に基づく", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "quiz-meaning-use-1",
      lessonId: "lesson-meaning-as-use",
      question: "後期ヴィトゲンシュタインが「意味とは使用だ」と述べたとき、最も近い意味はどれですか？",
      explanation: "後期ヴィトゲンシュタインは、言葉の意味はその言葉が実際にどのように使われているかという文脈と実践の中にあると考えました。",
      order: 1,
      options: [
        { id: "quiz-mu1-o1", text: "言葉は辞書に載っている定義がその意味である", isCorrect: false, order: 1 },
        { id: "quiz-mu1-o2", text: "言葉の意味は実際の使われ方と文脈のなかにある", isCorrect: true, order: 2 },
        { id: "quiz-mu1-o3", text: "言葉の意味は話者の意図によってのみ決まる", isCorrect: false, order: 3 },
        { id: "quiz-mu1-o4", text: "言葉の意味は世界の物事との対応関係にある", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "quiz-dasein-1",
      lessonId: "lesson-dasein",
      question: "ハイデガーが「現存在（Dasein）」という言葉で強調したことは何ですか？",
      explanation: "現存在とは「そこに在ること」を意味し、人間が世界のなかに状況として巻き込まれながら存在しており、かつ自分の存在を問題にできる唯一の存在者であることを示します。",
      order: 1,
      options: [
        { id: "quiz-da1-o1", text: "人間が純粋な思考主体として世界を認識すること", isCorrect: false, order: 1 },
        { id: "quiz-da1-o2", text: "人間が世界のなかに巻き込まれながら自分の存在を問える存在者であること", isCorrect: true, order: 2 },
        { id: "quiz-da1-o3", text: "人間が神の似姿として作られた存在であること", isCorrect: false, order: 3 },
        { id: "quiz-da1-o4", text: "人間が理性によって動物と区別される存在であること", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "quiz-authenticity-1",
      lessonId: "lesson-death-and-authenticity",
      question: "ハイデガーにおける「本来性」の説明として最も適切なものはどれですか？",
      explanation: "本来性とは「ひと（das Man）」の匿名的な流れに飲み込まれず、死という固有の可能性を先駆的に引き受けることで自分固有の存在可能性に立ち返ることです。",
      order: 1,
      options: [
        { id: "quiz-au1-o1", text: "社会のルールに従って模範的な生き方をすること", isCorrect: false, order: 1 },
        { id: "quiz-au1-o2", text: "死という固有の可能性を引き受け、自分の存在可能性に立ち返ること", isCorrect: true, order: 2 },
        { id: "quiz-au1-o3", text: "日常から離れて孤独に哲学を実践すること", isCorrect: false, order: 3 },
        { id: "quiz-au1-o4", text: "本能のままに自然な欲求に従って生きること", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "quiz-kant-copernican-1",
      lessonId: "lesson-kant-copernican",
      question: "カントの「コペルニクス的転回」とはどのような発想を指しますか？",
      explanation: "コペルニクス的転回とは、認識が対象に合わせるのではなく、対象が私たちの認識のアプリオリな形式に合わせるという発想です。",
      order: 1,
      options: [
        { id: "quiz-kc1-o1", text: "天文学の理論を哲学に応用したこと", isCorrect: false, order: 1 },
        { id: "quiz-kc1-o2", text: "認識が対象に合わせるのではなく、対象が認識の形式に合わせるという発想の転換", isCorrect: true, order: 2 },
        { id: "quiz-kc1-o3", text: "道徳が宗教ではなく理性に基づくこと", isCorrect: false, order: 3 },
        { id: "quiz-kc1-o4", text: "物自体が認識できるという主張", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "quiz-kant-moral-1",
      lessonId: "lesson-kant-moral",
      question: "カントの定言命法の特徴として最も適切な説明はどれですか？",
      explanation: "定言命法は感情や利益ではなく純粋な理性から導かれる無条件の道徳的命令です。普遍化可能性が判断基準になります。",
      order: 1,
      options: [
        { id: "quiz-km1-o1", text: "最大多数の幸福を生む行為を指定する命令", isCorrect: false, order: 1 },
        { id: "quiz-km1-o2", text: "純粋な理性から導かれる無条件の道徳的命令", isCorrect: true, order: 2 },
        { id: "quiz-km1-o3", text: "幸福を得るために必要な条件付きの担事", isCorrect: false, order: 3 },
        { id: "quiz-km1-o4", text: "宗教的権威に従って補完される道徳規範", isCorrect: false, order: 4 },
      ],
    },
  ];

  // 記事シリーズデータ
  const seriesData = [
    {
      id: "series-know-thyself",
      slug: "know-thyself",
      title: "自己を知る哲学—ソクラテスからデカルトへ",
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
      description: "徳倫理学から孯の値劃まで、善く生きることを探る入門シリーズ。",
      items: [
        { articleId: "article-virtue-ethics", order: 1 },
        { articleId: "article-confucius-ren-li", order: 2 },
        { articleId: "article-nietzsche-god-is-dead", order: 3 },
      ],
    },
    {
      id: "series-wittgenstein",
      slug: "wittgenstein-philosophy",
      title: "ヴィトゲンシュタインの哲学を読む",
      description: "前期の写像理論から後期の言語ゲームへと、ヴィトゲンシュタインの思想の転回を追うシリーズ。",
      items: [
        { articleId: "article-wittgenstein-tractatus", order: 1 },
        { articleId: "article-wittgenstein-language-games", order: 2 },
      ],
    },
    {
      id: "series-heidegger",
      slug: "heidegger-philosophy",
      title: "ハイデガーの実存哲学を読む",
      description: "世界内存在から死への存在・本来性まで、ハイデガーの思想の核心を追うシリーズ。",
      items: [
        { articleId: "article-heidegger-being-in-world", order: 1 },
        { articleId: "article-heidegger-death-authenticity", order: 2 },
      ],
    },
    {
      id: "series-kant",
      slug: "kant-philosophy",
      title: "カントの批判哲学を読む",
      description: "認識論のコペルニクス的転回から定言命法による道徳哲学まで、カント哲学の全体像を追うシリーズ。",
      items: [
        { articleId: "article-kant-critique", order: 1 },
        { articleId: "article-kant-categorical-imperative", order: 2 },
      ],
    },
  ];

  // クイズ插入
  for (const q of quizData) {
    const { options, ...quizRow } = q;
    await db.insert(quiz).values(quizRow).onConflictDoUpdate({
      target: quiz.id,
      set: {
        lessonId: sql`excluded.lesson_id`,
        question: sql`excluded.question`,
        explanation: sql`excluded.explanation`,
        order: sql`excluded."order"`,
      },
    });
    await db.insert(quizOption).values(
      options.map((opt) => ({ ...opt, quizId: q.id })),
    ).onConflictDoUpdate({
      target: quizOption.id,
      set: {
        text: sql`excluded.text`,
        isCorrect: sql`excluded.is_correct`,
        order: sql`excluded."order"`,
      },
    });
  }

  // 記事シリーズ插入
  for (const s of seriesData) {
    const { items, ...seriesRow } = s;
    await db.insert(articleSeries).values(seriesRow).onConflictDoUpdate({
      target: articleSeries.id,
      set: {
        slug: sql`excluded.slug`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
      },
    });
    await db.insert(articleSeriesItem).values(
      items.map((item) => ({ ...item, seriesId: s.id })),
    ).onConflictDoNothing();
  }

  await db.insert(quote).values(quotes).onConflictDoUpdate({
    target: quote.id,
    set: {
      text: sql`excluded.text`,
      source: sql`excluded.source`,
      philosopherId: sql`excluded.philosopher_id`,
    },
  });
  await db.insert(glossaryTerm).values(glossaryTerms).onConflictDoUpdate({
    target: glossaryTerm.id,
    set: {
      term: sql`excluded.term`,
      reading: sql`excluded.reading`,
      definition: sql`excluded.definition`,
      detail: sql`excluded.detail`,
      philosopherId: sql`excluded.philosopher_id`,
      themeId: sql`excluded.theme_id`,
    },
  });

  console.log(`✅ Seeded ${philosophers.length} philosophers`);
  console.log(`✅ Seeded ${themes.length} themes`);
  console.log(`✅ Seeded ${articles.length} articles`);
  console.log(`✅ Seeded ${courses.length} courses`);
  console.log(`✅ Seeded ${courses.reduce((sum, item) => sum + item.lessons.length, 0)} lessons`);
  console.log(`✅ Seeded ${quizData.length} quizzes`);
  console.log(`✅ Seeded ${seriesData.length} article series`);
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
