// V2 — IDE / 代码编辑器风：tab 栏 + 行号 + monospace 主导
// 更强烈的技术感，像在 VSCode 里读一份简历文件

const { useState: useStateV2, useEffect: useEffectV2, useRef: useRefV2, useMemo: useMemoV2 } = React;

function IdeTabs({ active, onChange }) {
  const tabs = [
    { id: "about",   name: "about.md",       icon: "MD" },
    { id: "ai",      name: "ai-native.md",   icon: "MD" },
    { id: "skills",  name: "skills.json",    icon: "JS" },
    { id: "ai-proj", name: "projects.ai.md", icon: "MD" },
    { id: "work",    name: "work.md",        icon: "MD" },
    { id: "edu",     name: "edu.md",         icon: "MD" },
  ];
  return (
    <div className="ide-tabs">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`ide-tab ${active === t.id ? "on" : ""}`}
          onClick={() => onChange(t.id)}
        >
          <span className={`ide-ficon ic-${t.icon.toLowerCase()}`}>{t.icon}</span>
          <span>{t.name}</span>
          {active === t.id && <span className="ide-tab-dot"/>}
        </button>
      ))}
    </div>
  );
}

function IdeLine({ n, children, kind }) {
  return (
    <div className={`ide-line ${kind || ""}`}>
      <span className="ide-ln">{n}</span>
      <span className="ide-lc">{children}</span>
    </div>
  );
}

// A tiny markdown-ish renderer producing line-numbered lines
function MdLines({ startLine, blocks }) {
  const out = [];
  let n = startLine || 1;
  const push = (kind, content) => { out.push(<IdeLine key={n} n={n} kind={kind}>{content}</IdeLine>); n++; };
  blocks.forEach((b) => {
    if (b.type === "h1") push("h1", <><span className="tok-hash"># </span><span className="tok-h1">{b.text}</span></>);
    else if (b.type === "h2") push("h2", <><span className="tok-hash">## </span><span className="tok-h2">{b.text}</span></>);
    else if (b.type === "h3") push("h3", <><span className="tok-hash">### </span><span className="tok-h3">{b.text}</span></>);
    else if (b.type === "meta") push("meta", <><span className="tok-key">{b.k}</span><span className="tok-punct">: </span><span className="tok-str">{b.v}</span></>);
    else if (b.type === "bullet") push("li", <><span className="tok-bullet">- </span>{b.text}</>);
    else if (b.type === "p") push("p", b.text);
    else if (b.type === "blank") push("blank", "");
    else if (b.type === "code") push("code", <><span className="tok-punct">`</span><span className="tok-code">{b.text}</span><span className="tok-punct">`</span></>);
    else if (b.type === "tag") push("tag", b.items.map((it, i) => (
      <span key={i} className="tok-tag">[{it}]</span>
    )));
  });
  return <>{out}</>;
}

function ResumeV2() {
  const d = window.RESUME_DATA;
  const [active, setActive] = useStateV2("about");

  const [tweaks, setTweak] = useTweaks({
    fontFamily: "mono",
    density: "comfy",
    accent: "green",
    theme: "light",
  });

  // Build blocks per tab
  const blocks = useMemoV2(() => {
    const out = [];
    if (active === "about") {
      out.push({ type: "h1", text: d.name });
      out.push({ type: "blank" });
      out.push({ type: "meta", k: "title",   v: d.title });
      out.push({ type: "meta", k: "email",   v: d.contact.email });
      out.push({ type: "meta", k: "tel",     v: d.contact.phone });
      out.push({ type: "meta", k: "github",  v: d.contact.github });
      out.push({ type: "blank" });
      out.push({ type: "h2", text: "Summary" });
      out.push({ type: "blank" });
      d.summary.forEach((s) => out.push({ type: "bullet", text: s }));
    }
    if (active === "ai") {
      out.push({ type: "h1", text: "AI Native 工作方式" });
      out.push({ type: "blank" });
      out.push({ type: "p", text: "日常以 Claude Code Agent 模式作为主力开发工具，覆盖 10+ 个项目，建立了完整的人-AI 协作工程体系：" });
      out.push({ type: "blank" });
      d.aiNative.forEach((a) => {
        out.push({ type: "h3", text: a.k });
        out.push({ type: "bullet", text: a.v });
        out.push({ type: "blank" });
      });
    }
    if (active === "skills") {
      out.push({ type: "h1", text: "Skills" });
      out.push({ type: "blank" });
      d.skills.forEach((s) => {
        out.push({ type: "h3", text: s.cat });
        out.push({ type: "tag", items: s.items });
        out.push({ type: "blank" });
      });
    }
    if (active === "ai-proj") {
      out.push({ type: "h1", text: "AI-Native 项目" });
      out.push({ type: "blank" });
      d.aiProjects.forEach((p) => {
        out.push({ type: "h2", text: p.name });
        out.push({ type: "meta", k: "role",  v: p.role });
        out.push({ type: "meta", k: "scale", v: p.scale });
        out.push({ type: "tag", items: p.stack });
        out.push({ type: "blank" });
        p.sections.forEach((sec) => {
          out.push({ type: "h3", text: sec.t });
          sec.items.forEach((it) => out.push({ type: "bullet", text: it }));
          out.push({ type: "blank" });
        });
      });
    }
    if (active === "work") {
      out.push({ type: "h1", text: "工作项目经历" });
      out.push({ type: "blank" });
      d.workProjects.forEach((p) => {
        out.push({ type: "h2", text: p.name });
        out.push({ type: "meta", k: "role",  v: p.role });
        out.push({ type: "meta", k: "scale", v: p.scale });
        out.push({ type: "tag", items: p.stack });
        out.push({ type: "blank" });
        p.items.forEach((it) => out.push({ type: "bullet", text: it }));
        out.push({ type: "blank" });
      });
    }
    if (active === "edu") {
      out.push({ type: "h1", text: "Education" });
      out.push({ type: "blank" });
      out.push({ type: "meta", k: "school", v: d.education.school });
      out.push({ type: "meta", k: "major",  v: d.education.major });
      out.push({ type: "meta", k: "period", v: d.education.period });
    }
    return out;
  }, [active]);

  const rootClass = [
    "v2",
    `v2-theme-${tweaks.theme}`,
    `v2-density-${tweaks.density}`,
    `v2-accent-${tweaks.accent}`,
  ].join(" ");

  return (
    <div className={rootClass}>
      <div className="ide-chrome">
        {/* Title bar */}
        <div className="ide-title">
          <div className="ide-title-dots">
            <span className="d r"/><span className="d y"/><span className="d g"/>
          </div>
          <div className="ide-title-path">resume / {d.name} — {d.title}</div>
          <div className="ide-title-actions">
            <a href="resume-pdf.html" target="_blank" className="ide-btn">PDF</a>
          </div>
        </div>

        <div className="ide-body">
          {/* Activity bar */}
          <div className="ide-activity">
            <div className="ide-act on" title="Explorer">📁</div>
            <div className="ide-act" title="Search">🔍</div>
            <div className="ide-act" title="Git">⎇</div>
          </div>

          {/* Sidebar explorer */}
          <aside className="ide-side">
            <div className="ide-side-head">EXPLORER</div>
            <div className="ide-folder">
              <div className="ide-folder-name">▾ RESUME</div>
              <div className="ide-files">
                {[
                  ["about", "about.md", "MD"],
                  ["ai", "ai-native.md", "MD"],
                  ["skills", "skills.json", "JS"],
                  ["ai-proj", "projects.ai.md", "MD"],
                  ["work", "work.md", "MD"],
                  ["edu", "edu.md", "MD"],
                ].map(([id, name, ic]) => (
                  <div key={id} className={`ide-file ${active === id ? "on" : ""}`} onClick={() => setActive(id)}>
                    <span className={`ide-ficon ic-${ic.toLowerCase()}`}>{ic}</span>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ide-side-head" style={{marginTop: 18}}>METADATA</div>
            <div className="ide-meta-list">
              <div><span>name</span><b>{d.name}</b></div>
              <div><span>title</span><b>{d.title}</b></div>
              <div><span>github</span><b>{d.contact.github}</b></div>
            </div>
          </aside>

          {/* Editor */}
          <main className="ide-editor">
            <IdeTabs active={active} onChange={setActive}/>
            <div className="ide-breadcrumb">
              <span>resume</span> <span className="sep">›</span>
              <span className="current">{
                ({about: "about.md", ai: "ai-native.md", skills: "skills.json",
                  "ai-proj": "projects.ai.md", work: "work.md", edu: "edu.md"})[active]
              }</span>
            </div>
            <div className="ide-code">
              <MdLines startLine={1} blocks={blocks}/>
            </div>
          </main>
        </div>

        {/* Status bar */}
        <div className="ide-status">
          <span className="st-branch">⎇ main</span>
          <span className="st-ok">● 0 problems</span>
          <span className="st-spacer"/>
          <span>UTF-8</span>
          <span>LF</span>
          <span>Markdown</span>
          <span className="st-accent">AI-Native</span>
        </div>
      </div>

      <V2Tweaks tweaks={tweaks} setTweak={setTweak}/>
    </div>
  );
}

function V2Tweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="主题"/>
      <TweakRadio label="theme" value={tweaks.theme} onChange={(v) => setTweak("theme", v)}
        options={[
          { value: "light", label: "浅色" },
          { value: "dark",  label: "深色" },
        ]}/>
      <TweakSection label="强调色"/>
      <TweakRadio label="accent" value={tweaks.accent} onChange={(v) => setTweak("accent", v)}
        options={[
          { value: "green",  label: "森绿" },
          { value: "indigo", label: "靛蓝" },
          { value: "amber",  label: "琥珀" },
        ]}/>
      <TweakSection label="密度"/>
      <TweakRadio label="density" value={tweaks.density} onChange={(v) => setTweak("density", v)}
        options={[
          { value: "comfy",   label: "舒适" },
          { value: "compact", label: "紧凑" },
        ]}/>
    </TweaksPanel>
  );
}

window.ResumeV2 = ResumeV2;
