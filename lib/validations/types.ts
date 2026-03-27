import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { ReactNode } from 'react';

export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'Public' | 'Private';
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

export interface IRecentActivities {
  key: number;
  icon: string | StaticImport;
  title: string;
  titleTag?: string;
  description: string;
  timeStamp: string;
}

export interface EmailActivity {
  key: number;
  icon: string | StaticImport;
  title: string;
}

/** Attendance type for the breakdown table */
export type AttendanceType =
  | 'wallet-required'
  | 'verified-access'
  | 'anonymous';

/** Single row for the attendance breakdown table */
export interface AttendanceBreakdownRow {
  type: AttendanceType;
  count: number;
  percentage: number; // 0–100, component will append "%"
}

/** Full attendance breakdown data (array of rows) */
export type AttendanceBreakdownData = AttendanceBreakdownRow[];
