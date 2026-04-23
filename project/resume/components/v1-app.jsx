// V1 — 现代工程师风：两栏布局，左侧 sticky 命令行导航 + 基础信息，右侧 README 式内容
// 等宽字体用于标签/代码 片段，Inter 用于正文。浅色底 + 深绿 accent。

const { useState, useEffect, useRef, useMemo } = React;

// =============== 打字机 Hero ===============
function TypewriterHero({ lines, density }) {
  const [line, setLine] = useState(0);
  const [col, setCol] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const cur = lines[line];
    if (col < cur.length) {
      const t = setTimeout(() => setCol(col + 1), 28 + Math.random() * 25);
      return () => clearTimeout(t);
    }
    if (line < lines.length - 1) {
      const t = setTimeout(() => { setLine(line + 1); setCol(0); }, 380);
      return () => clearTimeout(t);
    }
    setDone(true);
  }, [line, col, done, lines]);

  return (
    <div className="hero-term">
      <div className="hero-term-head">
        <span className="dot r"/><span className="dot y"/><span className="dot g"/>
        <span className="hero-term-title">~/resume — zsh</span>
      </div>
      <div className="hero-term-body">
        {lines.slice(0, line + 1).map((l, i) => (
          <div key={i} className="hero-line">
            <span className="prompt">$</span>
            <span className="cmd">{i < line ? l : l.slice(0, col)}</span>
            {i === line && !done && <span className="caret"/>}
            {i === line && done && <span className="caret"/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== Section 包装：滚动渐显 ===============
function Section({ id, num, title, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setVisible(true));
    }, { threshold: 0.08 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section id={id} ref={ref} className={`sec ${visible ? "in" : ""}`}>
      <header className="sec-head">
        <span className="sec-num">{num}</span>
        <h2 className="sec-title">{title}</h2>
        <span className="sec-rule"/>
      </header>
      <div className="sec-body">{children}</div>
    </section>
  );
}

// =============== 命令行式导航 ===============
function CommandNav({ sections, active }) {
  const [q, setQ] = useState("");
  const [hint, setHint] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const raw = q.trim().toLowerCase();
    if (!raw) return;
    // 匹配命令或章节 id
    const match = sections.find(
      (s) => s.id === raw || s.title.toLowerCase().includes(raw) || s.cmd === raw
    );
    if (match) {
      document.getElementById(match.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHint(`→ ${match.title}`);
      setQ("");
    } else if (raw === "help" || raw === "?") {
      setHint("可用命令：" + sections.map((s) => s.cmd).join(", "));
    } else if (raw === "clear") {
      setHint("");
      setQ("");
    } else if (raw === "pdf") {
      window.open("resume-pdf.html", "_blank");
      setQ("");
    } else {
      setHint(`command not found: ${raw}  (try 'help')`);
    }
  };

  return (
    <div className="cmdnav">
      <div className="cmdnav-label">
        <span className="prompt">$</span> nav <span className="dim">— press /</span>
      </div>
      <form onSubmit={submit} className="cmdnav-form">
        <span className="prompt">›</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="type a section, e.g. skills"
          spellCheck={false}
          autoComplete="off"
        />
      </form>
      {hint && <div className="cmdnav-hint">{hint}</div>}
      <ul className="cmdnav-list">
        {sections.map((s) => (
          <li key={s.id} className={active === s.id ? "on" : ""}>
            <a href={`#${s.id}`} onClick={(e) => {
              e.preventDefault();
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
            }}>
              <span className="cmdnav-dot">›</span>
              <span className="cmdnav-cmd">{s.cmd}</span>
              <span className="cmdnav-sep">—</span>
              <span className="cmdnav-name">{s.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// =============== 标签/芯片 ===============
function Chip({ children, variant }) {
  return <span className={`chip ${variant || ""}`}>{children}</span>;
}

// =============== 项目卡 ===============
function ProjectCard({ p, index, aiBadge }) {
  return (
    <article className="proj">
      <div className="proj-head">
        <div className="proj-index">0{index}</div>
        <div className="proj-meta">
          <div className="proj-name">
            {p.name}
            {aiBadge && <span className="ai-badge">AI-NATIVE</span>}
          </div>
          <div className="proj-role">{p.role}</div>
        </div>
      </div>
      <div className="proj-scale">{p.scale}</div>
      <div className="proj-stack">
        {p.stack.map((s) => <Chip key={s}>{s}</Chip>)}
      </div>
      {p.sections ? (
        <div className="proj-sections">
          {p.sections.map((sec) => (
            <div key={sec.t} className="proj-sub">
              <div className="proj-sub-t">
                <span className="proj-sub-mark">##</span> {sec.t}
              </div>
              <ul className="proj-bullets">
                {sec.items.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="proj-bullets">
          {p.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      )}
    </article>
  );
}

// =============== 主 App ===============
function ResumeV1() {
  const d = window.RESUME_DATA;

  // Tweaks
  const [tweaks, setTweak] = useTweaks({
    fontFamily: "mixed",
    density: "comfy",
    order: "default",
    accent: "green",
  });

  const sections = useMemo(() => {
    const base = [
      { id: "about",  cmd: "about",    title: "关于我" },
      { id: "ai",     cmd: "ai",       title: "AI Native 工作方式" },
      { id: "skills", cmd: "skills",   title: "专业技能" },
      { id: "ai-proj",cmd: "projects", title: "AI-Native 项目" },
      { id: "work",   cmd: "work",     title: "工作项目经历" },
      { id: "edu",    cmd: "edu",      title: "教育背景" },
    ];
    if (tweaks.order === "work-first") {
      return [base[0], base[1], base[2], base[4], base[3], base[5]];
    }
    if (tweaks.order === "ai-first") {
      return [base[0], base[1], base[3], base[2], base[4], base[5]];
    }
    return base;
  }, [tweaks.order]);

  const [active, setActive] = useState("about");
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);

  const heroLines = [
    "whoami",
    `> ${d.name} — ${d.title}`,
    "ls ./skills/ai-native/",
    "> claude-code/  memory/  skills/  agents/  gates/",
  ];

  const rootClass = [
    "v1",
    `font-${tweaks.fontFamily}`,
    `density-${tweaks.density}`,
    `accent-${tweaks.accent}`,
  ].join(" ");

  const renderSection = (s) => {
    switch (s.id) {
      case "about":
        return (
          <Section id="about" num="00" title="关于我" key="about">
            <TypewriterHero lines={heroLines} density={tweaks.density}/>
            <div className="about-summary">
              <div className="about-summary-label">// summary</div>
              <ul className="about-bullets">
                {d.summary.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </Section>
        );
      case "ai":
        return (
          <Section id="ai" num="01" title="AI Native 工作方式" key="ai">
            <div className="ai-grid">
              {d.aiNative.map((a, i) => (
                <div key={i} className="ai-card">
                  <div className="ai-card-k">
                    <span className="ai-card-idx">0{i + 1}</span>
                    {a.k}
                  </div>
                  <div className="ai-card-v">{a.v}</div>
                </div>
              ))}
            </div>
          </Section>
        );
      case "skills":
        return (
          <Section id="skills" num="02" title="专业技能" key="skills">
            <div className="skills-grid">
              {d.skills.map((s) => (
                <div key={s.cat} className="skill-row">
                  <div className="skill-cat">
                    <span className="skill-cat-mark">▸</span>
                    {s.cat}
                  </div>
                  <div className="skill-items">
                    {s.items.map((it) => <Chip key={it}>{it}</Chip>)}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        );
      case "ai-proj":
        return (
          <Section id="ai-proj" num="03" title="AI-Native 项目" key="ai-proj">
            <div className="proj-list">
              {d.aiProjects.map((p, i) => (
                <ProjectCard key={p.id} p={p} index={i + 1} aiBadge/>
              ))}
            </div>
          </Section>
        );
      case "work":
        return (
          <Section id="work" num="04" title="工作项目经历" key="work">
            <div className="proj-list">
              {d.workProjects.map((p, i) => (
                <ProjectCard key={p.id} p={p} index={i + 4}/>
              ))}
            </div>
          </Section>
        );
      case "edu":
        return (
          <Section id="edu" num="05" title="教育背景" key="edu">
            <div className="edu-row">
              <div className="edu-school">{d.education.school}</div>
              <div className="edu-major">{d.education.major}</div>
              <div className="edu-period">{d.education.period}</div>
            </div>
          </Section>
        );
      default: return null;
    }
  };

  return (
    <div className={rootClass}>
      <div className="layout">
        <aside className="side" data-screen-label="Sidebar">
          <div className="card-ident">
            <div className="ident-kicker">
              <span className="k-dot"/>
              <span>RESUME / v1</span>
              <span className="k-time" id="k-time"/>
            </div>
            <div className="ident-name">{d.name}</div>
            <div className="ident-title">{d.title}</div>
            <dl className="ident-contact">
              <div><dt>email</dt><dd>{d.contact.email}</dd></div>
              <div><dt>tel</dt><dd>{d.contact.phone}</dd></div>
              <div><dt>github</dt><dd>{d.contact.github}</dd></div>
            </dl>
            <div className="ident-actions">
              <a className="btn-primary" href="resume-pdf.html" target="_blank">
                <span>↓</span> PDF
              </a>
              <button className="btn-ghost" onClick={() => {
                navigator.clipboard?.writeText(d.contact.github);
              }}>copy github</button>
            </div>
          </div>
          <CommandNav sections={sections} active={active}/>
          <div className="side-footer">
            <div>© {new Date().getFullYear()} {d.name}</div>
            <div className="dim">built with HTML · hand-crafted</div>
          </div>
        </aside>

        <main className="main">
          {sections.map(renderSection)}
        </main>
      </div>

      <V1Tweaks tweaks={tweaks} setTweak={setTweak}/>
    </div>
  );
}

// =============== Tweaks Panel ===============
function V1Tweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="字体"/>
      <TweakRadio
        label="family"
        value={tweaks.fontFamily}
        onChange={(v) => setTweak("fontFamily", v)}
        options={[
          { value: "mixed", label: "混排" },
          { value: "sans",  label: "无衬线" },
          { value: "mono",  label: "等宽" },
          { value: "serif", label: "衬线" },
        ]}
      />
      <TweakSection label="信息密度"/>
      <TweakRadio
        label="density"
        value={tweaks.density}
        onChange={(v) => setTweak("density", v)}
        options={[
          { value: "comfy", label: "舒适" },
          { value: "compact", label: "紧凑" },
        ]}
      />
      <TweakSection label="章节顺序"/>
      <TweakRadio
        label="order"
        value={tweaks.order}
        onChange={(v) => setTweak("order", v)}
        options={[
          { value: "default",    label: "默认" },
          { value: "ai-first",   label: "AI 优先" },
          { value: "work-first", label: "工作优先" },
        ]}
      />
      <TweakSection label="强调色"/>
      <TweakRadio
        label="accent"
        value={tweaks.accent}
        onChange={(v) => setTweak("accent", v)}
        options={[
          { value: "green",   label: "森绿" },
          { value: "indigo",  label: "靛蓝" },
          { value: "amber",   label: "琥珀" },
          { value: "mono",    label: "纯黑" },
        ]}
      />
    </TweaksPanel>
  );
}

window.ResumeV1 = ResumeV1;
