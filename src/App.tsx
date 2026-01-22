type Post = {
  title: string
  date: string
  tag: string
  readTime: string
  excerpt: string
  slug: string
}

type Frontmatter = Partial<
  Pick<Post, 'title' | 'date' | 'tag' | 'readTime' | 'excerpt'>
>

// Keep parsing minimal to avoid adding markdown dependencies.
const parseFrontmatter = (raw: string) => {
  if (!raw.startsWith('---')) {
    return { frontmatter: {}, body: raw }
  }

  const parts = raw.split('\n')
  const frontmatterLines: string[] = []
  let bodyStartIndex = 0

  for (let i = 1; i < parts.length; i += 1) {
    const line = parts[i]
    if (line.trim() === '---') {
      bodyStartIndex = i + 1
      break
    }
    frontmatterLines.push(line)
  }

  const frontmatter = frontmatterLines.reduce<Frontmatter>((acc, line) => {
    const [key, ...valueParts] = line.split(':')
    if (!key || valueParts.length === 0) {
      return acc
    }
    acc[key.trim() as keyof Frontmatter] = valueParts.join(':').trim()
    return acc
  }, {})

  return { frontmatter, body: parts.slice(bodyStartIndex).join('\n').trim() }
}

// Format dates in Japanese without pulling in external date libraries.
const formatDate = (value: Date) =>
  value.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

// Build a short excerpt while staying dependency-free.
const getExcerpt = (raw: string) => {
  const paragraph = raw.split(/\n\s*\n/).find(Boolean)
  if (!paragraph) {
    return ''
  }
  return paragraph
    .replace(/[#>*_`[\]-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const rawPosts = import.meta.glob('./content/posts/*.md', {
  eager: true,
  as: 'raw',
}) as Record<string, string>

const posts = Object.entries(rawPosts)
  .map(([path, raw]) => {
    const { frontmatter, body } = parseFrontmatter(raw)
    const slug = path.split('/').pop()?.replace('.md', '') ?? 'post'
    const dateValue = new Date(`${frontmatter.date ?? '2026-01-01'}T00:00:00`)
    const excerpt = frontmatter.excerpt ?? getExcerpt(body)

    return {
      title: frontmatter.title ?? 'Untitled',
      date: frontmatter.date ?? '2026-01-01',
      tag: frontmatter.tag ?? 'ジャーナル',
      readTime: frontmatter.readTime ?? '5分',
      excerpt,
      slug,
      body,
      dateValue,
    }
  })
  .sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime())

const featured = posts[0]
const latestPosts = posts.slice(1, 4)

const highlights = [
  {
    title: '古書の装丁に学ぶ、落ち着いた配色メモ',
    tag: '色彩',
  },
  {
    title: 'ページの余白を支える小さな挿絵',
    tag: '挿絵',
  },
  {
    title: '静かな体験のためのパフォーマンス設計',
    tag: '設計',
  },
]

const topics = ['エッセイ', 'フィールドノート', '対談', '実験記録', 'アーカイブ']

function App() {
  return (
    <div className="min-h-screen text-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-lg font-semibold text-accent shadow-soft">
            S
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg uppercase tracking-[0.24em] text-ink">
              Sand & Ink
            </p>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              モダンジャーナル
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.2em] text-muted md:flex">
          {topics.map((topic) => (
            <a key={topic} className="transition hover:text-ink" href="#">
              {topic}
            </a>
          ))}
        </nav>
        <button className="rounded-full border border-ink/10 bg-paper/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ink shadow-soft transition hover:-translate-y-0.5 hover:border-ink/30">
          購読する
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
        <section className="relative overflow-hidden rounded-[32px] border border-ink/10 bg-paper/70 p-8 shadow-soft md:p-12">
          <div className="absolute -left-20 top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-72 w-72 animate-pulse-soft rounded-full bg-accent2/20 blur-3xl" />
          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted animate-fade-up">
                第14号 - 1月
              </p>
              <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl animate-fade-up [animation-delay:120ms]">
                静けさと余白に惚れたスタジオの制作ノート。
              </h1>
              <p className="max-w-xl text-base text-muted md:text-lg animate-fade-up [animation-delay:200ms]">
                モダンなプロダクトデザインの静かな側面を掘り下げる、
                エッセイと対談と実験の記録。今月の特集か、人気記事へ。
              </p>
              <div className="flex flex-wrap gap-3 animate-fade-up [animation-delay:300ms]">
                <button className="rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-paper transition hover:-translate-y-0.5">
                  特集を読む
                </button>
                <button className="rounded-full border border-ink/20 bg-paper/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40">
                  アーカイブへ
                </button>
              </div>
              <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-muted animate-fade-up [animation-delay:380ms]">
                <span>週刊エッセイ</span>
                <span>広告なし</span>
                <span>選書とプレイリスト</span>
              </div>
            </div>
            {featured ? (
              <div className="rounded-3xl border border-ink/10 bg-gradient-to-br from-paper via-surface to-paper p-7 shadow-soft animate-fade-up [animation-delay:240ms]">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
                  特集
                </p>
                <h2 className="mt-4 font-display text-2xl text-ink">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm text-muted">{featured.excerpt}</p>
                <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-accent">
                    {featured.tag}
                  </span>
                  <span>
                    {formatDate(featured.dateValue)} - {featured.readTime}
                  </span>
                </div>
                <button className="mt-6 w-full rounded-full border border-ink/10 bg-paper/80 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ink transition hover:-translate-y-0.5 hover:border-ink/30">
                  続きを読む
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl text-ink">最新記事</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
                毎週更新
              </span>
            </div>
            <div className="grid gap-6">
              {latestPosts.map((post, index) => (
                <article
                  key={post.title}
                  className="group animate-fade-up rounded-3xl border border-ink/10 bg-paper/80 p-6 shadow-soft transition hover:-translate-y-1"
                  style={{ animationDelay: `${(index + 1) * 120}ms` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-muted">
                    <span className="rounded-full bg-ink/5 px-3 py-1 text-ink/70">
                      {post.tag}
                    </span>
                    <span>
                      {formatDate(post.dateValue)} - {post.readTime}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl text-ink transition group-hover:text-accent">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted">{post.excerpt}</p>
                  <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-muted">
                    <span>続きを読む</span>
                    <span className="h-9 w-9 rounded-full border border-ink/10 text-center leading-8 text-ink">
                      {'>'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <aside className="space-y-6">
            <div className="rounded-3xl border border-ink/10 bg-ink px-6 py-7 text-paper shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-paper/70">
                スタジオ便り
              </p>
              <h3 className="mt-4 font-display text-2xl">
                毎週木曜に、1本の丁寧なエッセイを届けます。
              </h3>
              <p className="mt-4 text-sm text-paper/70">
                14,000人の読者が、ゆっくり読む時間を選んでいます。
              </p>
              <div className="mt-6 flex gap-3">
                <input
                  aria-label="Email address"
                  className="w-full rounded-full border border-paper/20 bg-transparent px-4 py-2 text-xs uppercase tracking-[0.25em] text-paper placeholder:text-paper/50"
                  placeholder="メールアドレス"
                  type="email"
                />
                <button className="rounded-full bg-paper px-5 text-xs font-semibold uppercase tracking-[0.3em] text-ink">
                  登録
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-ink/10 bg-paper/80 p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-ink">
                  編集部のおすすめ
                </h3>
                <span className="text-xs uppercase tracking-[0.3em] text-muted">
                  03
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {highlights.map((item) => (
                  <div key={item.title} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                      {item.tag}
                    </p>
                    <p className="text-sm text-ink">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-ink/10 bg-gradient-to-br from-paper to-surface p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                オーディオ欄
              </p>
              <h3 className="mt-4 font-display text-2xl text-ink">
                スロー・ビルド
              </h3>
              <p className="mt-3 text-sm text-muted">
                18分で語る、少なく出して深く届ける話。
              </p>
              <button className="mt-5 rounded-full border border-ink/10 bg-paper/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ink">
                再生する
              </button>
            </div>
          </aside>
        </section>

        <section className="mt-16 rounded-[28px] border border-ink/10 bg-paper/80 px-6 py-10 shadow-soft md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
                フィールドキット
              </p>
              <h2 className="mt-3 font-display text-3xl text-ink">
                静かなプロダクトのための制作ツール。
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-paper shadow-soft">
                ガイドを入手
              </button>
              <button className="rounded-full border border-ink/15 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-ink">
                ライブラリを見る
              </button>
            </div>
          </div>
          <div className="mt-8 grid gap-4 text-sm text-muted md:grid-cols-3">
            <div className="rounded-2xl border border-ink/10 bg-paper/70 p-4">
              プロダクト物語のための12の書き出し。
            </div>
            <div className="rounded-2xl border border-ink/10 bg-paper/70 p-4">
              大胆なLPのためのペース配分チェック。
            </div>
            <div className="rounded-2xl border border-ink/10 bg-paper/70 p-4">
              毎号使うタイポグラフィ設計図。
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10 text-xs uppercase tracking-[0.35em] text-muted">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6">
          <span>(c) 2026 Sand & Ink Journal</span>
          <span>ゆっくり読む人のために</span>
        </div>
      </footer>
    </div>
  )
}

export default App
