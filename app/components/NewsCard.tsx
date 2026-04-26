import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/validations/types";

interface NewsCardProps {
  article: Article;
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Link href={`/news/${article.slug}`}>
      <div className="dark:border dark:border-[#282828] w-fit pb-4 dark:rounded-md">
        <div className="relative w-full min-w-75 md:max-w-95 h-39.5 md:h-50">
          <Image
            fill
            src={article.image}
            alt={article.title}
            className="object-cover rounded-md"
          />
        </div>

        <div className="px-4 py-6 flex flex-col gap-2.5">
          <p className="text-[#5C6170] font-inter text-xs font-normal leading-normal">
            {article.category} • {article.date}
          </p>

          <p className="text-black font-inter text-base font-semibold leading-normal dark:text-[#D7B5F5] line-clamp-1">
            {article.title}
          </p>

          <p className="text-[#5C6170] font-inter text-xs font-normal leading-normal line-clamp-2">
            {article.excerpt}
          </p>
        </div>

        <div className="px-4 flex items-center justify-normal gap-3">
          <div className="relative w-6 h-6">
            <Image
              src={article.author.avatar}
              fill
              alt="Avatar"
              className="rounded-full"
            />
          </div>
          <span className="text-[#1E1E1E] font-inter text-sm font-medium leading-normal dark:text-[#D7B5F5]">
            {article.author.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
