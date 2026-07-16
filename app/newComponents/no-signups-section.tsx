import Image from "next/image";

export function NoSignupsSection() {
  return (
    <section className="py-8 lg:py-20">
      <div className="mx-auto px-4 text-center">
        <h2 className="text-[40px] md:text-[80px] text-[#2C0A4A] dark:text-[#D7B5F5] mb-4">
          No Signups{" "}
          <span className="text-[#2C0A4A] dark:text-[#D7B5F5]">
            <Image
              src="/image 15.svg"
              alt="No sign ups required"
              width="80"
              height="80"
              className="inline-block"
            />
          </span>{" "}
          required
          <br />
          to explore events
        </h2>
      </div>
    </section>
  );
}
