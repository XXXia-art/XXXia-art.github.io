export const siteContent = {
  poemPanel: {
    title: "孤独的根号三",
    author: "大卫·范伯格",
    lines: [
      "我怕我永远是一个孤独的数字",
      "像那根号三",
      "完整的三很好啊",
      "为什么我的三得呆在那堕落的根号之下？",
      "我希望它是个九",
      "因为九可以迅速算出来",
      "并摆脱根号邪恶的诡计",
      "我知道 我不会再看见太阳了",
      "像那一点七三二",
      "这是我的现实",
      "一个悲伤的无理数",
      "何时，听呐，我看到的这是什么",
      "又一个根号三",
      "静静地 踏着华尔兹舞步而来",
      "现在 我们在一起",
      "构成了我们所喜欢的那数字",
      "并因那完整而欣喜不已",
      "我们冲破命中注定的束缚",
      "挥了挥魔杖",
      "摆脱了那根号",
      "于是 爱便复燃了"
    ]
  },
  header: {
    name: "Puzhi Xia 夏浦智",
    subtitle: "Junior Student, Southeast University",
    summary: [
      "My main interests lie in design, super AI, and market forecasting.",
      "I am currently working on improving the stability and robustness of sequential editing methods for diffusion models."
    ],
    badges: [
      {
        href: "mailto:pz.xia@qq.com",
        src: "https://img.shields.io/badge/QQ%20Mail-pz.xia%40qq.com-12B7F5",
        alt: "QQ Mail Badge"
      },
      {
        href: "https://github.com/XXXia-art",
        src: "https://img.shields.io/badge/GitHub-XXXia--art-181717?logo=github&logoColor=white",
        alt: "GitHub Badge"
      },
    ],
    photo: {
      src: "assets/myself.jpg",
      alt: "Puzhi Xia portrait"
    }
  },
  sections: [
    {
      id: "news",
      title: "News",
      type: "timeline",
      items: [
        { date: "<em>[2026.05]</em>", text: " I am currently developing <em><strong>a grand board game</strong></em>💰." },
        { date: "<em>[2026.04]</em>", text: " Building my <em><strong>personal website</strong></em> on GitHub Pages." },
        { date: "<em>[2026.03]</em>", text: " Working on <em><strong>sequential unlearning</strong></em> methods for diffusion models." },
      ]
    },
    {
      id: "projects",
      title: "Projects",
      type: "list",
      items: [
        {
          title: "Sequential Concept Unlearning for Stable Diffusion",
          description:
            "A research project on improving multi-step concept erasure while reducing interference with prior edits and preserving generation quality."
        },

        {
          title: "Positional Sensitivity of ICL in DLLMs",
          description:
            "A systematic analysis of positional bias in Diffusion LLMs. We reveal that query position is a first-order variable affecting ICL performance, identify a Recency Effect via Attention Rollout."
        }
      
      ]
    },
    {
      id: "experience",
      title: "Experience",
      type: "experience",
      items: [
        {
          badge: {
            src: "assets/huawei.svg",
            alt: "Huawei logo"
          },
          organization: "Huawei",
          role: "AI Software Development Engineer",
          period: "Jul. 2025 - Sep. 2025",
          description: "Worked on model editing and generative model related research projects."
        }
      ]
    },
    {
      id: "interests",
      title: "Interests",
      type: "list",
      intro: "Outside of research, I enjoy reading and watching films. Here are some of my favorites:",
      items: [
        {
          title: "Books",
          description: "《One Hundred Years of Solitude》《Rage of Angels》"
        },
        {
          title: "Movies",
          description: "《The Shawshank Redemption》《Green Book》"
        }
      ]
    }
  ],
  footer: {
    updated: "April 2026"
  }
};
