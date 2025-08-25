export type PrivacyLevel = "Anonymous" | "Verified Access" | "Wallet Required";

export type EventType =
  | "Music"
  | "Tech & Web3"
  | "Art & Culture"
  | "Business"
  | "Health & Wellness"
  | "Education"
  | "Community";

export type TicketType = {
  name: string;
  price: number | string;
};

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: EventType;
  image: string;
  description: string;
  tags: string[];
  perks: string[];
  organizer: {
    name: string;
    bio: string;
    contact: string;
  };
  slotsLeft: number;
  quantitySelected: number;
  isPaid: boolean;
  price: number;
  ticketTypes: TicketType[];
  privacyLevel: PrivacyLevel[];
}

export const dummyEvents: Event[] = [
  {
    id: "solana-summer-hackathon",
    title: "Solana Summer Hackathon",
    date: "Jun. 04 2025",
    time: "4:00 pm (UTC +01:00)",
    location: "Accra, Ghana",
    type: "Music",
    image: "/images/explore/1.png",
    description:
      "Join Africa's brightest minds in blockchain and web3 at the Solana Summer Hackathon.",
    tags: ["Solana", "CryptoBuilders", "HackathonNG", "AccraTech"],
    perks: [
      "48 Hours of hacking",
      "Workshops",
      "$10K+ prizes",
      "Free swag",
      "VC Networking",
    ],
    organizer: {
      name: "Superteam Accra",
      bio: "Empowering builders in Africa.",
      contact: "https://superteam.fun/accra",
    },
    slotsLeft: 12,
    quantitySelected: 0,
    isPaid: true,
    price: 1500,
    ticketTypes: [
      { name: "VIP", price: 3500 },
      { name: "Regular", price: 2000 },
      { name: "Student", price: 1500 },
    ],
    privacyLevel: ["Anonymous"],
  },
  {
    id: "naija-tech-summit",
    title: "Naija Tech Summit",
    date: "Aug. 17 2025",
    time: "10:00 am (UTC +01:00)",
    location: "Lagos, Nigeria",
    type: "Tech & Web3",
    image: "/images/explore/2.png",
    description:
      "Nigeria's biggest technology meetup featuring top innovators and startups.",
    tags: ["NaijaTech", "Developers", "Innovation"],
    perks: ["Startup pitch", "Investor panels", "Free merch", "Demo booths"],
    organizer: {
      name: "NaijaTech Collective",
      bio: "Building Nigeria's tech future.",
      contact: "https://naijatech.co",
    },
    slotsLeft: 34,
    quantitySelected: 0,
    isPaid: false,
    price: 0,
    ticketTypes: [{ name: "Free", price: 0 }],
    privacyLevel: ["Verified Access"],
  },
  {
    id: "web3-bootcamp-nairobi",
    title: "Web3 Bootcamp Nairobi",
    date: "Sep. 12 2025",
    time: "1:00 pm (UTC +03:00)",
    location: "Nairobi, Kenya",
    type: "Art & Culture",
    image: "/images/explore/3.png",
    description: "Learn Web3 dev from scratch with hands-on mentorship.",
    tags: ["Web3", "Bootcamp", "KenyaTech"],
    perks: ["Solidity workshops", "Mentorship", "Demo day", "Job onboarding"],
    organizer: {
      name: "BuildForAfrica",
      bio: "Helping African devs build globally.",
      contact: "https://buildforafrica.org",
    },
    slotsLeft: 20,
    quantitySelected: 0,
    isPaid: true,
    price: 1200,
    ticketTypes: [
      { name: "Student", price: 1200 },
      { name: "Regular", price: 2500 },
    ],
    privacyLevel: ["Wallet Required"],
  },
  {
    id: "femcode-fest-2025",
    title: "FemCode Fest 2025",
    date: "Oct. 05 2025",
    time: "11:00 am (UTC +01:00)",
    location: "Abuja, Nigeria",
    type: "Business",
    image: "/images/explore/4.png",
    description:
      "Empowering women in tech through talks, panels, and hands-on sessions.",
    tags: ["WomenInTech", "Nigeria", "Empowerment"],
    perks: ["Panel discussions", "Workshops", "Networking brunch"],
    organizer: {
      name: "FemCode Africa",
      bio: "Uplifting women in tech.",
      contact: "https://femcode.africa",
    },
    slotsLeft: 50,
    quantitySelected: 0,
    isPaid: false,
    price: 0,
    ticketTypes: [{ name: "Free", price: 0 }],
    privacyLevel: ["Verified Access"],
  },
  {
    id: "lagos-design-week",
    title: "Lagos Design Week",
    date: "Nov. 20 2025",
    time: "9:00 am (UTC +01:00)",
    location: "Lagos, Nigeria",
    type: "Health & Wellness",
    image: "/images/explore/5.png",
    description: "A showcase of Nigeria's top UI/UX design talent and trends.",
    tags: ["UIUX", "Design", "LagosEvents"],
    perks: ["Design challenges", "Exhibitions", "Mentorship"],
    organizer: {
      name: "Design Nigeria",
      bio: "Promoting local design excellence.",
      contact: "https://designnigeria.ng",
    },
    slotsLeft: 75,
    quantitySelected: 0,
    isPaid: true,
    price: 1800,
    ticketTypes: [
      { name: "General", price: 1800 },
      { name: "VIP", price: 3200 },
    ],
    privacyLevel: ["Wallet Required"],
  },
  {
    id: "crypto-build-ghana",
    title: "Crypto Build Ghana",
    date: "Jul. 22 2025",
    time: "2:00 pm (UTC +00:00)",
    location: "Kumasi, Ghana",
    type: "Education",
    image: "/images/explore/6.png",
    description:
      "Build crypto apps that scale with guidance from industry experts.",
    tags: ["Crypto", "Solidity", "AfricaBuild"],
    perks: ["On-chain project demo", "Crypto prizes"],
    organizer: {
      name: "DeFi Africa",
      bio: "Connecting blockchain talent in Africa.",
      contact: "https://defiafrica.xyz",
    },
    slotsLeft: 18,
    quantitySelected: 0,
    isPaid: true,
    price: 2200,
    ticketTypes: [
      { name: "Student", price: 2200 },
      { name: "VIP", price: 4000 },
    ],
    privacyLevel: ["Verified Access"],
  },
  {
    id: "founders-lab-africa",
    title: "Founders Lab Africa",
    date: "Sep. 01 2025",
    time: "5:00 pm (UTC +01:00)",
    location: "Remote",
    type: "Community",
    image: "/images/explore/7.png",
    description:
      "Exclusive lab to turn your startup idea into a pitchable MVP.",
    tags: ["Startups", "PitchLab", "RemoteAfrica"],
    perks: ["Mentorship", "Funding access", "MVP training"],
    organizer: {
      name: "StartSmart Africa",
      bio: "From idea to startup.",
      contact: "https://startsmart.africa",
    },
    slotsLeft: 10,
    quantitySelected: 0,
    isPaid: true,
    price: 2800,
    ticketTypes: [
      { name: "VIP", price: 3800 },
      { name: "Co-Founder", price: 2800 },
      { name: "Observer", price: 1600 },
    ],
    privacyLevel: ["Verified Access"],
  },
  {
    id: "product-weekend-abidjan",
    title: "Product Weekend Abidjan",
    date: "Dec. 15 2025",
    time: "12:00 pm (UTC +00:00)",
    location: "Abidjan, Ivory Coast",
    type: "Business",
    image: "/images/explore/8.png",
    description: "Product management event for African tech startups.",
    tags: ["ProductMgmt", "Tech", "Abidjan"],
    perks: ["Keynotes", "Case studies", "PM toolkit"],
    organizer: {
      name: "Africa Product Guild",
      bio: "Building PMs across Africa.",
      contact: "https://africapm.org",
    },
    slotsLeft: 40,
    quantitySelected: 0,
    isPaid: true,
    price: 1400,
    ticketTypes: [
      { name: "General", price: 1400 },
      { name: "Team", price: 3600 },
    ],
    privacyLevel: ["Verified Access"],
  },
  {
    id: "frontend-fusion-fest",
    title: "Frontend Fusion Fest",
    date: "Jun. 30 2025",
    time: "3:00 pm (UTC +02:00)",
    location: "Cape Town, South Africa",
    type: "Health & Wellness",
    image: "/images/explore/9.png",
    description: "Conference for frontend developers & UI engineers.",
    tags: ["Frontend", "React", "CSS", "JavaScript"],
    perks: ["Live coding", "Design Systems", "Swag kits"],
    organizer: {
      name: "CodeCraft SA",
      bio: "Frontend community in South Africa.",
      contact: "https://codecraftsa.dev",
    },
    slotsLeft: 28,
    quantitySelected: 0,
    isPaid: true,
    price: 1000,
    ticketTypes: [
      { name: "Early Bird", price: 1000 },
      { name: "Standard", price: 2400 },
      { name: "VIP", price: 3700 },
    ],
    privacyLevel: ["Wallet Required"],
  },
  {
    id: "makerthon-benue",
    title: "Makerthon Benue",
    date: "Jul. 09 2025",
    time: "8:00 am (UTC +01:00)",
    location: "Makurdi, Nigeria",
    type: "Education",
    image: "/images/explore/10.png",
    description: "Hardware meets software in this weekend maker sprint.",
    tags: ["Makers", "IoT", "Nigeria"],
    perks: ["Team prizes", "Prototyping support"],
    organizer: {
      name: "NaijaMakers Hub",
      bio: "For Nigerian hardware hackers.",
      contact: "https://naijamakers.org",
    },
    slotsLeft: 16,
    quantitySelected: 0,
    isPaid: true,
    price: 1700,
    ticketTypes: [
      { name: "Builder", price: 2100 },
      { name: "Observer", price: 1700 },
    ],
    privacyLevel: ["Anonymous"],
  },
  {
    id: "devconnect-tanzania",
    title: "DevConnect Tanzania",
    date: "Oct. 10 2025",
    time: "2:30 pm (UTC +03:00)",
    location: "Dodoma, Tanzania",
    type: "Community",
    image: "/images/explore/11.png",
    description: "Where Tanzanian devs meet, share, and build open source.",
    tags: ["Developers", "OpenSource", "Tanzania"],
    perks: ["Lightning talks", "Code Jam", "Open Source sprint"],
    organizer: {
      name: "OSS Tanzania",
      bio: "Enabling open-source locally.",
      contact: "https://osstz.dev",
    },
    slotsLeft: 60,
    quantitySelected: 0,
    isPaid: false,
    price: 0,
    ticketTypes: [{ name: "Free", price: 0 }],
    privacyLevel: ["Wallet Required"],
  },
  {
    id: "africa-ai-hub",
    title: "Africa AI Hub",
    date: "Aug. 01 2025",
    time: "1:00 pm (UTC +01:00)",
    location: "Kigali, Rwanda",
    type: "Community",
    image: "/images/explore/12.png",
    description: "Meet the builders transforming Africa with AI.",
    tags: ["AI", "ML", "Rwanda"],
    perks: ["Demo Showcase", "Keynotes", "Investors"],
    organizer: {
      name: "SmartAfrica",
      bio: "Bringing smart tech to the continent.",
      contact: "https://smartafrica.org",
    },
    slotsLeft: 25,
    quantitySelected: 0,
    isPaid: true,
    price: 2600,
    ticketTypes: [
      { name: "General", price: 3100 },
      { name: "Startup", price: 2600 },
      { name: "Researcher", price: 2900 },
    ],
    privacyLevel: ["Anonymous"],
  },
  {
    id: "open-source-fest-ng",
    title: "Open Source Fest NG",
    date: "Nov. 04 2025",
    time: "11:00 am (UTC +01:00)",
    location: "Ibadan, Nigeria",
    type: "Community",
    image: "/images/explore/13.png",
    description: "Nigeria's largest open source contribution festival.",
    tags: ["OpenSource", "Fest", "Nigeria"],
    perks: ["Hack night", "Merch", "Swag"],
    organizer: {
      name: "Open Source NG",
      bio: "Fostering OSS contributions.",
      contact: "https://opensource.ng",
    },
    slotsLeft: 70,
    quantitySelected: 0,
    isPaid: false,
    price: 0,
    ticketTypes: [{ name: "Free", price: 0 }],
    privacyLevel: ["Wallet Required"],
  },
  {
    id: "devrel-days-ghana",
    title: "DevRel Days Ghana",
    date: "Sep. 25 2025",
    time: "10:00 am (UTC +00:00)",
    location: "Tamale, Ghana",
    type: "Community",
    image: "/images/explore/14.png",
    description: "Training & community building for dev advocates.",
    tags: ["DevRel", "Ghana", "Community"],
    perks: ["Speaking practice", "Docs clinic", "Swag"],
    organizer: {
      name: "DevCommunity GH",
      bio: "Connecting dev communities.",
      contact: "https://devcomgh.com",
    },
    slotsLeft: 22,
    quantitySelected: 0,
    isPaid: true,
    price: 1300,
    ticketTypes: [
      { name: "Speaker", price: 1300 },
      { name: "Community Lead", price: 1900 },
      { name: "Guest", price: 2300 },
    ],
    privacyLevel: ["Verified Access"],
  },
];
