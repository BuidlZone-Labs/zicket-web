export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "Public" | "Private";
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
  ticketTypes: string[];
};

export interface Author {
  id: string;
  name: string;
  title: string;
  avatar: string;
}

export interface ContentSection {
  heading: string;
  paragraphs: string[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentSections?: ContentSection[];
  category: string;
  date: string;
  readTime: string;
  image: string;
  author: Author;
  featured?: boolean;
}
