// PDF renderer — plain JS, no React/Babel
(function () {
  const d = window.RESUME_DATA;
  const $ = (id) => document.getElementById(id);
  const h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") el.className = attrs[k];
      else if (k === "html") el.innerHTML = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    kids.flat().forEach((c) => {
      if (c == null || c === false) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  };

  // Header
  $("r-name").textContent = d.name;
  $("r-title").textContent = d.title;
  const c = $("r-contact");
  c.innerHTML = "";
  [["email", d.contact.email], ["tel", d.contact.phone], ["github", d.contact.github]].forEach(([k, v]) => {
    const row = h("div", {}, h("span", { class: "k" }, k), v);
    c.appendChild(row);
  });
  $("r-footer-github").textContent = d.contact.github + "  ·  " + d.contact.email;

  // Summary
  const sum = $("r-summary");
  d.summary.forEach((s) => sum.appendChild(h("li", {}, s)));

  // AI
  const ai = $("r-ai");
  d.aiNative.forEach((a) => {
    ai.appendChild(h("div", {}, h("div", { class: "k" }, a.k), h("div", { class: "v" }, a.v)));
  });

  // Skills
  const sk = $("r-skills");
  d.skills.forEach((s) => {
    var itemsText = Array.isArray(s.items) ? s.items.join(' · ') : s.items;
    sk.appendChild(h("div", { class: "r-skill-row" },
      h("div", { class: "r-skill-cat" }, s.cat),
      h("div", { class: "r-skill-items" }, itemsText),
    ));
  });

  // Projects renderer
  const renderProject = (p, isAi) => {
    const head = h("div", { class: "r-proj-head" },
      h("span", { class: "r-proj-name" }, p.name),
      isAi ? h("span", { class: "r-proj-ai-badge" }, "AI-NATIVE") : null,
      h("span", { class: "r-proj-role" }, p.role),
    );
    const scale = h("div", { class: "r-proj-scale" }, p.scale);
    const stackText = Array.isArray(p.stack) ? p.stack.join(' · ') : p.stack;
    const stack = h("div", { class: "r-proj-stack" },
      h("span", { class: "label" }, "技术栈:"), stackText);
    const body = [];
    if (p.sections || p.groups) {
      (p.sections || p.groups).forEach((g) => {
        body.push(h("div", { class: "r-proj-sub-t" }, g.t));
        const ul = h("ul", { class: "r-ul" });
        g.items.forEach((it) => ul.appendChild(h("li", {}, it)));
        body.push(ul);
      });
    } else {
      const ul = h("ul", { class: "r-ul" });
      (p.items || p.bullets || []).forEach((b) => ul.appendChild(h("li", {}, b)));
      body.push(ul);
    }
    return h("div", { class: "r-proj" }, head, scale, stack, ...body);
  };

  const aiList = $("r-ai-proj");
  d.aiProjects.forEach((p) => aiList.appendChild(renderProject(p, true)));
  const workList = $("r-work");
  d.workProjects.forEach((p) => workList.appendChild(renderProject(p, false)));

  // Edu
  const e = $("r-edu");
  e.appendChild(h("div", {},
    h("strong", {}, d.education.school),
    " · ",
    h("span", {}, d.education.major),
  ));
  e.appendChild(h("div", { class: "period" }, d.education.period));
})();
