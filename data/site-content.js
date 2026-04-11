export const siteContent = {
  header: {
    name: "Puzhi Xia",
    subtitle: "Junior Student, Southeast University",
    summary: [
      "My research interests mainly focus on model editing, diffusion models, and sequential concept erasure.",
      "I am currently working on improving the stability and robustness of sequential editing methods for diffusion models."
    ],
    links: [
      { label: "GitHub", href: "https://github.com/XXXia-art" },
      { label: "Google Scholar", href: "https://scholar.google.com/" }
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
      {
        src: "https://img.shields.io/badge/Intern-Huawei-C7000B?logo=huawei&logoColor=white",
        alt: "Huawei Internship Badge"
      },
      {
        src: "https://img.shields.io/badge/Country-China-red",
        alt: "China Badge"
      }
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
        { date: "2026.04", text: "Building my academic homepage on GitHub Pages." },
        { date: "2026.03", text: "Working on sequential editing methods for diffusion models." },
        { date: "2026.02", text: "Exploring how to combine SPEED, AlphaEdit, and DeltaEdit ideas." }
      ]
    },
    {
      id: "projects",
      title: "Projects",
      type: "list",
      items: [
        {
          title: "Sequential Concept Editing for Stable Diffusion",
          description:
            "A research project on improving multi-step concept erasure while reducing interference with prior edits and preserving generation quality."
        },
        {
          title: "Diffusion Model Editing with Historical Subspace Constraints",
          description:
            "Investigating how to project current updates away from historical edit directions while maintaining effective editing performance."
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
            src: "https://img.shields.io/badge/Huawei-Intern-C7000B?logo=huawei&logoColor=white",
            alt: "Huawei badge"
          },
          organization: "Huawei",
          role: "Research Intern",
          period: "Jul. 2025 - Sep. 2025",
          description: "Worked on model editing and generative model related research projects."
        }
      ]
    },
    {
      id: "interests",
      title: "Interests",
      type: "media-grid",
      intro:
        "Outside research, I return to stories that combine patience, hope, and imagination. These two works have stayed with me for a long time.",
      items: [
        {
          title: "Favorite Film",
          name: "The Shawshank Redemption",
          image: "https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg",
          imageAlt: "The Shawshank Redemption theatrical poster",
          description:
            "I love its quiet confidence and the way it turns endurance, friendship, and hope into something deeply persuasive.",
          meta: "Dir. Frank Darabont, 1994",
          creditLabel: "Poster source",
          creditHref: "https://en.wikipedia.org/wiki/The_Shawshank_Redemption"
        },
        {
          title: "Favorite Writer",
          name: "Gabriel Garcia Marquez",
          image: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Gabriel_Garcia_Marquez.jpg",
          imageAlt: "Portrait of Gabriel Garcia Marquez",
          description:
            "I admire the warmth and inevitability in his prose, especially how the miraculous can feel completely natural inside ordinary life.",
          meta: "Author of One Hundred Years of Solitude",
          creditLabel: "Photo source",
          creditHref: "https://commons.wikimedia.org/wiki/File:Gabriel_Garcia_Marquez.jpg"
        }
      ]
    },
    {
      id: "interactive",
      title: "Interactive",
      type: "interactive",
      kicker: "Pretext Playground",
      heading: "Rotate the mark and let the article recompose around it.",
      note:
        "The large ChatGPT-style mark stays fixed like an editorial illustration. When you rotate it, Pretext recalculates the wrapped text so the paragraph structure changes with the silhouette.",
      controlLabel: "Rotate Mark",
      interactiveCopy: [
        "Situational awareness in research comes from more than one result looking good at the end of a run.",
        "It comes from noticing how edits accumulate, how constraints interact, and how a system behaves when the same idea is revisited under slightly different pressure.",
        "That is why I care about model editing as both an optimization problem and a design problem: each new intervention leaves a trace, and those traces change what is possible next.",
        "The composition here turns that intuition into a small editorial study.",
        "A large mark sits inside the article like a fixed object on a printed page.",
        "As the mark rotates, the available measure on every line shifts, and the paragraph reorganizes itself around the new silhouette.",
        "Nothing is dragged by hand and no line breaks are hard-coded.",
        "The text is measured again, laid out again, and allowed to find a new rhythm that still feels intentional."
      ].join(" ")
    }
  ],
  footer: {
    updated: "April 2026"
  }
};
