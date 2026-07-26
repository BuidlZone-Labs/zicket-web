import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, articles as allArticles } from "@/lib/data";

import { RelatedArticles } from "@/app/components/RelatedArticles";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = allArticles.filter((card) => card.slug !== slug);

  return (
    <div className="min-h-screen bg-white w-full max-w-[1200px] mx-auto dark:bg-transparent flex flex-col">
      <header className="px-10 py-20 gap-10 w-full flex flex-col items-center justify-center">
        <nav className="flex w-full items-center justify-center gap-2 text-sm font-inter font-medium leading-[145%] max-w-full overflow-hidden">
          <Link
            href="/news"
            className="hover:text-purple-600 transition-colors whitespace-nowrap text-text-detail dark:text-text-detail-dark"
          >
            News
          </Link>
          <span className="whitespace-nowrap text-gray-500 dark:text-[#D7B5F5]">
            /
          </span>
          <Link
            href={`/news?category=${encodeURIComponent(article.category)}`}
            className="hover:text-purple-600  transition-colors whitespace-nowrap text-text-detail dark:text-text-detail-dark"
          >
            {article.category}
          </Link>
          <span className="whitespace-nowrap text-gray-500 dark:text-[#D7B5F5]">
            /
          </span>
          <span className="text-gray-500 dark:text-[#D7B5F5] truncate min-w-0">
            {article.title}
          </span>
        </nav>
        <div className="flex flex-col items-center justify-center gap-4 md:max-w-lg break-words">
          <h3 className="text-base font-semibold text-primary leading-normal font-inter uppercase dark:text-[#D7B5F5]">
            {article.category}
          </h3>

          <h1 className="text-[40px] font-bold font-satoshi md:font-inter text-black dark:text-[#D7B5F5] text-center leading-normal">
            {article.title}
          </h1>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-black dark:text-[#D7B5F5] font-satoshi md:font-inter text-base font-light leading-normal">
            {article.date}
          </p>

          <div className="relative flex items-center justify-center gap-3 w-full">
            <div className="h-6 w-6 rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src={article.author.avatar || "/placeholder.svg"}
                alt={article.author.name}
                width={24}
                height={24}
                className="object-cover w-full h-full"
              />
            </div>

            <span className="text-dark-gray dark:text-[#D7B5F5] font-inter text-sm font-medium leading-normal">
              {article.author.name}
            </span>
          </div>
        </div>
      </header>
      <div className="relative w-full px-[1.25rem]  my-15 md:my-10  flex flex-col items-center justify-center gap-15">
        <div className="relative rounded-2xl h-[340px] w-full md:h-[500px] overflow-hidden">
          <Image
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <p className="text-black dark:text-[#5C6170] font-satoshi md:font-inter text-base text-left font-normal leading-normal">
          {article.excerpt}
        </p>
      </div>
      <article className="px-[1.25rem]">
        <div className="space-y-15  w-full">
          {article.contentSections?.map((section, index) => (
            <div key={index}>
              <h2 className="text-lg md:text-2xl mb-5 font-bold font-satoshi md:font-inter text-black dark:text-[#D7B5F5] leading-normal">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph, pIndex) => (
                <p
                  key={pIndex}
                  className="text-[#5C6170] font-satoshi md:font-inter leading-normal text-base font-normal"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </article>

      <RelatedArticles articles={relatedArticles} />
    </div>
  );
}

export async function generateStaticParams() {
  const { articles } = await import("@/lib/data");

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}
