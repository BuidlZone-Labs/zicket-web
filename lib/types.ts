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
