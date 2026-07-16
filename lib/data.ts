import type { Article } from "./validations/types";

export const articles: Article[] = [
  {
    id: "1",
    slug: "zicket-builders-hack-night-recap",
    category: "Tech",
    date: "30 June, 2024",
    title: "Zicket X Builders: A Hack Night Recap",
    excerpt:
      "The Zicket X Builders Hack Night brought together developers, designers, and product thinkers for an evening of hands-on collaboration, innovation, and community building. From lightning talks to real-world challenges, the event showcased the power of privacy-first event technology and set the stage for future gatherings.",
    author: {
      id: "1",
      name: "ZKC Node",
      title: "Engineering Team",
      avatar: "/images/avatar1.jpg",
    },
    image: "/images/News1.jpg",
    readTime: "4 min read",
    content: "",
    contentSections: [
      {
        heading:
          "A Night of Innovation: Bringing Builders Together for Hands-On Collaboration",
        paragraphs: [
          "The Zicket X Builders Hack Night was more than just a gathering—it was a celebration of innovation and community. Developers, designers, and product thinkers from across the ecosystem came together to share ideas, experiment with new tools, and push the boundaries of what's possible in event technology.",
          "From the moment attendees arrived, the energy was palpable. The event kicked off with lightning talks from Zicket's engineering team, who showcased the latest features and integrations. Participants were then invited to form teams and tackle real-world challenges using Zicket's SDK and privacy-preserving APIs.",
        ],
      },
      {
        heading: "Deep Dives and Demos: Exploring the Future of Event Tech",
        paragraphs: [
          "Throughout the evening, teams dove into hands-on workshops, exploring advanced use cases for zero-knowledge proofs, decentralized ticketing, and on-chain access control. Zicket mentors were on hand to answer questions and provide guidance, ensuring that every participant could make the most of the tools available.",
          "The highlight of the night was the demo session, where teams presented their projects to a panel of judges. From privacy-first RSVP systems to real-time analytics dashboards, the creativity on display was inspiring. Winners received exclusive Zicket swag and early access to upcoming beta features.",
        ],
      },
      {
        heading: "Looking Ahead: Building a Stronger Community",
        paragraphs: [
          "The success of the hack night reinforced the importance of community-driven development. Attendees left with new skills, fresh ideas, and a renewed sense of excitement for the future of event technology. Zicket plans to host more hack nights in the coming months, expanding to new cities and welcoming even more builders into the fold.",
          "If you're passionate about privacy, innovation, and the power of community, keep an eye out for the next Zicket X Builders event. Together, we're shaping the future of how people connect and collaborate.",
        ],
      },
    ],
    featured: false,
  },
  {
    id: "2",
    slug: "designing-for-private-discovery",
    category: "Behind the Scenes",
    date: "25 June, 2024",
    title: "Designing for Private Discovery",
    excerpt:
      "Designing for Private Discovery explores how Zicket reimagines event search and recommendations for privacy-first communities. By leveraging zero-knowledge proofs and contextual search, we empower users to find relevant events without compromising their personal data or identity.",
    author: {
      id: "2",
      name: "Studio Delta",
      title: "Design Team",
      avatar: "/images/avatar2.jpg",
    },
    image: "/images/News2.jpg",
    readTime: "6 min read",
    content: "",
    contentSections: [
      {
        heading: "The Challenge of Private Discovery in a Public World",
        paragraphs: [
          "In an era where information is everywhere, designing for privacy is more important than ever. Private events present unique challenges: how do you help the right people find each other without exposing sensitive details to the world? At Zicket, we set out to answer this question by rethinking the very nature of event discovery.",
          "Traditional search and recommendation systems rely on public data and open networks. For private events, this approach simply doesn't work. We needed a solution that could match users with relevant experiences while keeping their interests, credentials, and participation confidential.",
        ],
      },
      {
        heading:
          "Our Solution: Privacy-Preserving Recommendations and Contextual Search",
        paragraphs: [
          "Our team developed a privacy-preserving recommendation engine that leverages zero-knowledge proofs and encrypted credentials. Users can opt in to share just enough information to receive personalized suggestions—without ever revealing their full identity or event history.",
          "Contextual search allows users to discover events based on shared interests, mutual connections, or community memberships, all while maintaining strict privacy controls. The result is a discovery experience that feels personal and relevant, but never invasive.",
        ],
      },
      {
        heading:
          "Design Principles: Empowering Users with Control and Transparency",
        paragraphs: [
          "Every aspect of our design is guided by the principle of user empowerment. Attendees can control what information they share, who can see their activity, and how they are matched with events. Transparent privacy settings and clear consent flows ensure that users always know what's happening with their data.",
          "By putting privacy at the center of the discovery process, Zicket is helping to build a new standard for trust and safety in event communities.",
        ],
      },
    ],
    featured: false,
  },
  {
    id: "3",
    slug: "onedrop-format-explained",
    category: "Community",
    date: "20 June, 2024",
    title: "OneDrop Format Explained",
    excerpt:
      "OneDrop Format Explained delves into the creation of rapid, high-trust gatherings for web3 communities. Discover how OneDrop enables spontaneous, secure events and fosters deeper connections through trust-driven participation.",
    author: {
      id: "3",
      name: "Indie Venue Club",
      title: "Community Team",
      avatar: "/images/avatar3.jpg",
    },
    image: "/images/News-3.jpg",
    readTime: "3 min read",
    content: "",
    contentSections: [
      {
        heading: "OneDrop: Redefining Spontaneous Community Events",
        paragraphs: [
          "In the fast-paced world of web3 communities, the need for rapid, high-trust gatherings has never been greater. OneDrop was created to empower organizers to bring people together at a moment's notice, without sacrificing security or privacy. By leveraging pre-verified member lists and automated trust scoring, OneDrop enables communities to host events that are both spontaneous and exclusive.",
          "The inspiration for OneDrop came from observing how traditional event planning often stifles creativity and momentum. With OneDrop, we wanted to make it possible for trusted groups to gather, share ideas, and build connections in real time—no weeks of planning required.",
        ],
      },
      {
        heading: "How OneDrop Works: Trust, Speed, and Simplicity",
        paragraphs: [
          "OneDrop events are designed for communities that have already established trust relationships. Organizers can quickly select a group, set event parameters, and invite members—all within minutes. The system handles verification and access control, ensuring that only trusted participants can join.",
          "This approach not only streamlines the event creation process but also fosters a sense of belonging and exclusivity. Attendees know that everyone present has been vetted, creating an environment where collaboration and innovation can thrive.",
        ],
      },
      {
        heading: "Real-World Impact: From Idea to Event in Hours",
        paragraphs: [
          "Since launching OneDrop, communities have reported a dramatic increase in engagement and participation. Events that once took weeks to organize can now be set up in a matter of hours. Organizers have praised the platform for its ease of use and the quality of connections it enables.",
          "OneDrop's success demonstrates the power of trust-driven event formats. As more communities adopt this model, we're excited to see how it will continue to shape the future of gatherings in the web3 space.",
        ],
      },
    ],
    featured: false,
  },
  {
    id: "4",
    slug: "early-adopters-zicket-exclusive-events",
    category: "Announcements",
    date: "December 7, 2022",
    title:
      "How early adopters used Zicket to host 12 exclusive events in 3 cities.",
    excerpt:
      "This case study highlights how early adopters leveraged Zicket's privacy-first platform to organize a series of exclusive events across multiple cities. Learn how they overcame logistical challenges and built lasting community engagement through secure, seamless event management.",
    author: {
      id: "1",
      name: "ZKC Node",
      title: "Engineering Team",
      avatar: "/images/avatar1.jpg",
    },
    image: "/images/News1.jpg",
    readTime: "5 min read",
    content: "",
    contentSections: [
      {
        heading:
          "Case Study: Scaling Exclusive Events Across Multiple Cities with Zicket",
        paragraphs: [
          "When Zicket launched, a group of early adopters set out to test the platform's capabilities by organizing a series of exclusive events in three major cities. Their goal was to create high-quality, private experiences for select communities, while managing logistics and privacy at scale.",
          "The project began with careful planning and coordination. Organizers used Zicket's tools to manage invitations, verify credentials, and automate ticketing. The result was a seamless experience for both hosts and attendees, with every detail handled securely and efficiently.",
        ],
      },
      {
        heading:
          "Overcoming Challenges: Logistics, Privacy, and User Experience",
        paragraphs: [
          "Coordinating events across multiple locations presented unique challenges. The team had to ensure that every attendee received the right information at the right time, without exposing sensitive details. Zicket's encrypted messaging and real-time updates made it possible to keep everyone in sync, no matter where they were.",
          "Feedback from participants was overwhelmingly positive. Attendees appreciated the ease of check-in, the clarity of communication, and the sense of exclusivity that came from being part of a carefully curated group.",
        ],
      },
      {
        heading: "Results: High Satisfaction and Repeat Engagement",
        paragraphs: [
          "The campaign resulted in a 95% satisfaction rate among attendees and a 40% increase in repeat bookings. Organizers reported that Zicket's platform not only saved time and effort but also helped build lasting relationships within their communities.",
          "This case study highlights the power of privacy-first event management and the value of giving users control over their experiences.",
        ],
      },
    ],
    featured: true,
  },
  {
    id: "5",
    slug: "zk-access-control-what-we-learned",
    category: "Tech & Infrastructure",
    date: "December 1, 2022",
    title: "ZK and Access Control: What We've Learned",
    excerpt:
      "In the current digital landscape, privacy is no longer a luxury — it's an expectation. As more systems move on-chain, the transparency that blockchain offers begins to clash with users' desire for discretion. At Zicket, we've made it our mission to challenge this tension, especially within the event space. Ticketing, at its core, is about access — to spaces, ideas, people, and moments. Yet the way most platforms manage access today is both invasive and outdated. This is why we've been building on Aztec's privacy-first infrastructure, leveraging zero-knowledge proofs (ZKPs) to reshape the foundation of event verification. What follows is a detailed account of what we've learned so far and how ZK is changing the way we think about event participation, access rights, and anonymity.",
    author: {
      id: "2",
      name: "Studio Delta",
      title: "Design Team",
      avatar: "/images/avatar2.jpg",
    },
    image: "/images/News2.jpg",
    readTime: "8 min read",
    content: "",
    contentSections: [
      {
        heading: "Why Privacy Needs to Be Baked into Events",
        paragraphs: [
          "Traditional ticketing systems prioritize convenience over privacy. When users register for events, their personal and wallet information is often logged, indexed, and made publicly accessible. While this might seem harmless in the context of a concert or festival, it poses serious concerns for more sensitive events — like governance meetings, DAO community gatherings, private workshops, or culturally-specific spaces that thrive in intimacy. What we often forget is that access control is not just about letting the right people in; it's about keeping visibility controlled, preserving the intent behind an experience, and protecting both hosts and attendees.",
          "Zero-knowledge technology offers a unique opportunity to invert this model. Instead of revealing data to prove legitimacy, ZK allows users to prove ownership, identity, or membership without disclosing the underlying details. On Zicket, this means that someone can show they're allowed into an event without ever revealing their wallet address or token holdings. It redefines the baseline for trust — you don't need to see my credentials, only know that they're valid.",
        ],
      },
      {
        heading: "What ZK Unlocks for Access Control on Zicket",
        paragraphs: [
          "Zicket is designed from the ground up to be privacy-native. Thanks to Aztec's encrypted smart contracts, we've developed a system where tickets function as private credentials — invisible to third parties, verifiable to hosts. The core capability here is selective disclosure. For example, a user attending a private retreat can receive a ticket that only becomes visible to the host for verification purposes. From the user's perspective, they maintain complete control over what is shared and when.",
          "Beyond tickets, ZK enables role-based access without identity leakage. A DAO can host an event and allow only voting members in, with Zicket verifying the necessary token ownership privately. Community leaders can create invite-only events where entry is granted based on off-chain criteria encoded as private proofs of membership. These workflows would be impossible or deeply invasive without privacy technology. We've also enabled proof-of-location integrations (still in early testing) that allow event hosts to limit attendance by geography — without storing or tracking a user's physical address. These are the building blocks of private coordination at scale.",
        ],
      },
      {
        heading: "Building with Aztec: Challenges and Lessons",
        paragraphs: [
          "Implementing privacy at the protocol level isn't without challenges. ZK circuits are computationally heavy and require thoughtful UX design to avoid alienating non-technical users. From the start, we prioritized a hybrid experience — defaulting to ZK-native verification for users with compatible wallets, while providing fallback paths for others using traditional sign-ins and attestations. This way, everyone can participate, but privacy-enhancing options are always available.",
          "On the dev side, one of the biggest hurdles was balancing performance with encryption. Aztec's zkRollup system allows for private smart contracts, but that also means rethinking how we store ticket metadata, how long proofs are valid, and how event hosts retrieve verification signals. We had to build new UX patterns — such as encrypted RSVP links and time-limited ticket unlocks — to handle this new paradigm. Despite the complexity, the payoff has been immense. Every time a user checks into a Zicket event without revealing who they are to anyone but the system, we see the future more clearly.",
        ],
      },
      {
        heading: "Real-World Applications and Adoption",
        paragraphs: [
          "The most compelling validation of our approach has come from our early adopters. In one instance, a developer DAO used Zicket to host a closed strategy retreat. Members received tickets through encrypted channels, and only those able to generate a proof of DAO contribution gained entry. There were no spreadsheets, no wallet screenings — just seamless, private access. Another example came from a spiritual community that wanted to protect the sacredness of their gathering. With Zicket, they created an event where only holders of a unique digital badge could view the event's full details or request entry. These use cases highlight how versatile and meaningful private access can be.",
          "We've seen interest from hackathons, think tanks, artist communities, and founders launching stealth products. What unites them is a desire for control — not just over who attends, but how the experience is framed and preserved. Zicket makes that control native and effortless.",
        ],
      },
      {
        heading: "What's Next for Private Events",
        paragraphs: [
          "Privacy doesn't end with access. We're now exploring ways to make every aspect of event engagement private — from messaging to attendance stats, from payment flows to feedback collection. Our roadmap includes anonymous Q&A sessions, encrypted check-in confirmation, and a plug-and-play tool for private group chats. More ambitiously, we're working toward interoperable credentials — where your proof of attendance in one Zicket event can unlock access elsewhere, without revealing the site when you attended.",
          "Ultimately, we believe privacy should not be a bolt-on feature. It should be the default. With Zicket, we're proving that privacy and usability are not at odds — they are the foundation of a richer, safer event experience.",
        ],
      },
    ],
    featured: false,
  },
  {
    id: "6",
    slug: "designing-for-discretion",
    category: "Product",
    date: "15 May, 2024",
    title: "Designing for Discretion",
    excerpt:
      "Designing for Discretion reveals the insights and strategies behind Zicket's approach to privacy-first event platforms. See how user research, adaptive privacy controls, and community feedback shaped a product that meets the unique needs of privacy-conscious groups.",
    author: {
      id: "3",
      name: "Indie Venue Club",
      title: "Community Team",
      avatar: "/images/avatar3.jpg",
    },
    image: "/images/News-3.jpg",
    readTime: "5 min read",
    content: "",
    contentSections: [
      {
        heading:
          "Designing for Discretion: Meeting the Needs of Privacy-First Communities",
        paragraphs: [
          "Through extensive research with privacy-conscious communities, we've learned that discretion isn't just about hiding information—it's about creating spaces where authentic connection can flourish. Our goal was to design a platform that adapts to the unique needs of each group, providing flexible privacy controls and intuitive user experiences.",
          "We discovered that different communities have different expectations around privacy. For some, anonymity is paramount; for others, it's about controlling who can see what and when. Zicket's adaptive privacy settings allow organizers and attendees to tailor their experience to fit their comfort level.",
        ],
      },
      {
        heading: "Research Insights: Listening to the Community",
        paragraphs: [
          "Our user research revealed that privacy needs vary significantly across different contexts. What works for a corporate retreat doesn't work for a support group or activist gathering. We spent months interviewing users, testing prototypes, and refining our approach based on real-world feedback.",
          "The result is a platform that puts users in control, with clear options for anonymous participation, selective disclosure, and encrypted communication.",
        ],
      },
      {
        heading: "Community Feedback: Building Trust Through Transparency",
        paragraphs: [
          "The response from privacy-first communities has been overwhelmingly positive. Many users noted that Zicket finally understands their unique needs and challenges. By prioritizing discretion and user agency, we're helping to build trust and foster deeper connections within every community we serve.",
        ],
      },
    ],
    featured: false,
  },
  {
    id: "7",
    slug: "pop-ups-go-private",
    category: "Events",
    date: "10 May, 2024",
    title: "Pop-Ups Go Private",
    excerpt:
      "Pop-Ups Go Private uncovers how Zicket is reinventing spontaneous events for the web3 era. Explore the technical innovations and real-world success stories that make private pop-ups secure, exclusive, and effortless to organize.",
    author: {
      id: "1",
      name: "ZKC Node",
      title: "Engineering Team",
      avatar: "/images/avatar1.jpg",
    },
    image: "/images/News1.jpg",
    readTime: "4 min read",
    content: "",
    contentSections: [
      {
        heading:
          "Pop-Ups Go Private: Reinventing Spontaneous Events for the Web3 Era",
        paragraphs: [
          "Pop-up events have always been about spontaneity and exclusivity. With the rise of privacy-preserving technology, we saw an opportunity to make these gatherings even more secure and meaningful. Zicket's platform enables organizers to create private pop-ups that can scale without losing their intimate feel.",
          "The key to successful private pop-ups is balancing accessibility with control. Organizers can invite select participants, set custom privacy rules, and manage every aspect of the event from a single dashboard.",
        ],
      },
      {
        heading:
          "Technical Innovations: Location-Based Proofs and Time-Locked Invitations",
        paragraphs: [
          "Our technical team developed a system that uses location-based zero-knowledge proofs and time-locked invitations to ensure that only the right people can discover and attend each event. This approach protects sensitive details while enabling real-time discovery and participation.",
          "Organizers can choose to reveal event details only to verified attendees, keeping the experience exclusive and secure.",
        ],
      },
      {
        heading: "Success Stories: From Art Shows to Product Launches",
        paragraphs: [
          "Since launching our private pop-up feature, we've facilitated over 200 events ranging from underground art shows to exclusive product launches. Organizers and attendees alike have praised the platform for its flexibility, security, and ease of use.",
          "As the web3 ecosystem continues to evolve, we're excited to see how private pop-ups will shape the future of spontaneous gatherings.",
        ],
      },
    ],
    featured: false,
  },
];

export const categories = [
  "All",
  "Announcements",
  "Community",
  "Product",
  "Events",
  "Behind the Scenes",
  "Tech & Infrastructure",
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  if (category === "All") return articles;
  return articles.filter(
    (article) => article.category.toLowerCase() === category.toLowerCase()
  );
}

export function getRelatedArticles(currentSlug: string, limit = 3): Article[] {
  return articles
    .filter((article) => article.slug !== currentSlug)
    .slice(0, limit);
}
