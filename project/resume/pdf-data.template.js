// PDF data — standalone (no JSX / no Babel)
// 复制此文件为 pdf-data.js，填入你的真实简历数据
window.RESUME_DATA = {
  name: "张三",
  title: "AI Native 前端工程师",
  target: "应聘目标：XXX 公司 · XXX 岗位",
  contact: {
    email: "example@email.com",
    phone: "138-0000-0000",
    github: "github.com/your-github",
  },
  summary: [
    "核心优势第一条：概括你最突出的能力和成果。",
    "核心优势第二条：量化你的关键产出。",
    "核心优势第三条：技术栈和经验年限。",
  ],
  aiNative: [
    { k: "能力标签1", v: "描述你在 AI Native 方向的具体实践和成果。" },
    { k: "能力标签2", v: "描述你的 AI 工具链使用经验。" },
    { k: "能力标签3", v: "描述你的 AI 辅助开发产出。" },
  ],
  skills: [
    { cat: "前端",     items: "Vue 3 · TypeScript · React · Vite · 微信小程序" },
    { cat: "后端",     items: "Node.js · Java · Spring Boot · MySQL" },
    { cat: "AI/Agent", items: "Claude Code · LLM Function Calling · Prompt Engineering" },
    { cat: "其他",     items: "Docker · Linux · Nginx · Git" },
  ],
  aiProjects: [
    {
      name: "AI 项目名称", role: "你的角色", ai: true,
      stack: "技术栈列表",
      scale: "项目规模描述",
      groups: [
        { t: "模块名称", items: [
          "具体成果描述第一条。",
          "具体成果描述第二条。",
        ] },
      ],
    },
    {
      name: "另一个 AI 项目", role: "你的角色 · 时间", ai: true,
      stack: "技术栈列表",
      scale: "项目规模描述",
      bullets: [
        "项目成果第一条。",
        "项目成果第二条。",
      ],
    },
  ],
  workProjects: [
    {
      name: "工作项目名称", role: "你的角色",
      stack: "技术栈列表",
      scale: "项目规模描述",
      bullets: [
        "工作成果第一条。",
        "工作成果第二条。",
      ],
    },
  ],
  education: { school: "XX 大学", major: "XX 专业", period: "20XX - 20XX" },
};
