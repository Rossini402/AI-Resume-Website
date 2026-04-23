// md-parser.js — 将简历 Markdown 解析为 RESUME_DATA 结构
// 纯 JS，无依赖，供网站版和 PDF 版共用
(function () {

  // 解析 YAML frontmatter
  function parseFrontmatter(md) {
    var match = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return { meta: {}, body: md };
    var meta = {};
    match[1].split('\n').forEach(function (line) {
      var idx = line.indexOf(':');
      if (idx === -1) return;
      meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
    return { meta: meta, body: md.slice(match[0].length).trim() };
  }

  // 按 ## 标题拆分章节
  function splitSections(body) {
    var sections = [];
    var parts = body.split(/^## /m);
    parts.forEach(function (part) {
      part = part.trim();
      if (!part) return;
      var nl = part.indexOf('\n');
      if (nl === -1) {
        sections.push({ title: part, content: '' });
      } else {
        sections.push({ title: part.slice(0, nl).trim(), content: part.slice(nl + 1).trim() });
      }
    });
    return sections;
  }

  // 提取 bullet 列表
  function parseBullets(text) {
    return text.split('\n')
      .map(function (l) { return l.trim(); })
      .filter(function (l) { return l.indexOf('- ') === 0; })
      .map(function (l) { return l.slice(2).trim(); });
  }

  // 解析 **key**：value 格式的 bullet
  function parseKVBullets(text) {
    return parseBullets(text).map(function (b) {
      var m = b.match(/^\*\*(.+?)\*\*[：:]\s*([\s\S]+)$/);
      return m ? { k: m[1], v: m[2] } : { k: '', v: b };
    });
  }

  // 解析技能列表
  function parseSkills(text) {
    return parseKVBullets(text).map(function (kv) {
      return {
        cat: kv.k,
        items: kv.v.split(/[、，]/).map(function (s) { return s.trim(); }).filter(Boolean),
      };
    });
  }

  // 解析技术栈字符串为数组
  function parseStack(str) {
    return str.split(/[、，·+|]/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  // 解析项目列表（AI-Native 项目 / 工作项目）
  function parseProjects(text) {
    var projects = [];
    var parts = text.split(/^### /m).filter(function (p) { return p.trim(); });

    parts.forEach(function (part) {
      var lines = part.split('\n');

      // 解析标题行：去掉中文序号前缀，按 | 分割
      var header = lines[0].trim().replace(/^[一二三四五六七八九十]+、\s*/, '');
      var hParts = header.split('|').map(function (s) { return s.trim(); });
      var name = hParts[0] || '';
      var role = hParts.slice(1).join(' · ');

      var content = lines.slice(1).join('\n');

      // 提取 **技术栈**
      var stackMatch = content.match(/\*\*技术栈\*\*[：:]\s*(.+)/);
      var stack = stackMatch ? parseStack(stackMatch[1]) : [];

      // 提取 **规模**
      var scaleMatch = content.match(/\*\*规模\*\*[：:]\s*(.+)/);
      var scale = scaleMatch ? scaleMatch[1].trim() : '';

      // 判断是否有 #### 子章节
      if (/^#### /m.test(content)) {
        var sections = [];
        content.split(/^#### /m).slice(1).forEach(function (sp) {
          var spLines = sp.split('\n');
          sections.push({ t: spLines[0].trim(), items: parseBullets(spLines.slice(1).join('\n')) });
        });
        projects.push({ name: name, role: role, stack: stack, scale: scale, sections: sections });
      } else {
        // 移除元数据行，解析剩余 bullet
        var clean = content
          .replace(/\*\*技术栈\*\*[：:].*(\n|$)/g, '')
          .replace(/\*\*规模\*\*[：:].*(\n|$)/g, '')
          .replace(/\*\*目标\*\*[：:].*(\n|$)/g, '');
        projects.push({ name: name, role: role, stack: stack, scale: scale, items: parseBullets(clean) });
      }
    });

    return projects;
  }

  // 解析教育背景
  function parseEducation(text) {
    var line = (text || '').trim().split('\n')[0] || '';
    var parts = line.split('|').map(function (s) { return s.trim(); });
    return { school: parts[0] || '', major: parts[1] || '', period: parts[2] || '' };
  }

  // 按关键词查找章节
  function findSection(sections, keyword, exclude) {
    return sections.find(function (s) {
      var match = s.title.indexOf(keyword) !== -1;
      if (match && exclude) match = s.title.indexOf(exclude) === -1;
      return match;
    });
  }

  // 主解析函数
  function parseResumeMd(md) {
    // 统一换行符
    md = md.replace(/\r\n/g, '\n');

    var parsed = parseFrontmatter(md);
    var meta = parsed.meta;
    var sections = splitSections(parsed.body);

    var summarySection = findSection(sections, '个人概述');
    var aiMethodSection = findSection(sections, 'AI Native', '项目') || findSection(sections, 'AI-Native', '项目');
    var skillsSection = findSection(sections, '专业技能') || findSection(sections, '技能');
    var aiProjSection = findSection(sections, 'AI-Native 项目') || findSection(sections, 'AI Native 项目') || findSection(sections, 'AI', null);
    var workSection = findSection(sections, '工作项目') || findSection(sections, '工作经历');
    var eduSection = findSection(sections, '教育');

    // 确保 aiProjSection 不与 aiMethodSection 相同
    if (aiProjSection === aiMethodSection) {
      aiProjSection = sections.find(function (s) {
        return s !== aiMethodSection && s.title.indexOf('项目') !== -1 && /AI/i.test(s.title);
      });
    }

    var data = {
      name: meta.name || '',
      title: meta.title || '',
      target: meta.target || '',
      contact: {
        email: meta.email || '',
        phone: meta.phone || meta.tel || '',
        github: meta.github || '',
      },
      summary: summarySection ? parseBullets(summarySection.content) : [],
      aiNative: aiMethodSection ? parseKVBullets(aiMethodSection.content) : [],
      skills: skillsSection ? parseSkills(skillsSection.content) : [],
      aiProjects: aiProjSection ? parseProjects(aiProjSection.content) : [],
      workProjects: workSection ? parseProjects(workSection.content) : [],
      education: eduSection ? parseEducation(eduSection.content) : { school: '', major: '', period: '' },
    };

    // 自动生成项目 ID
    data.aiProjects.forEach(function (p, i) { p.id = 'p' + (i + 1); });
    data.workProjects.forEach(function (p, i) { p.id = 'p' + (data.aiProjects.length + i + 1); });

    return data;
  }

  window.parseResumeMd = parseResumeMd;
})();
