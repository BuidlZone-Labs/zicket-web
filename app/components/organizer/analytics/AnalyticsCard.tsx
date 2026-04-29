import React from "react";

interface AnalyticsCardProps {
    title: string;
    value: string | number;
    percentage: string;
}

function AnalyticsCard({ title, value, percentage }: AnalyticsCardProps) {
    return (
        <article
            aria-label={`${title}: ${value}, ${percentage}`}
            className="flex flex-row items-start p-5 gap-3 w-full sm:w-[280px] h-[89px] bg-[#F8F8F8] dark:bg-[#1E1E1E] border border-[#E3E3E3] dark:border-[#2C2C2C] rounded-lg flex-none order-0 flex-grow transition-all duration-200 hover:border-[#6917AF] dark:hover:border-[#8B5CF6] group"
        >
            {/* Icon placeholder (display: none as per design) */}
            <div className="hidden w-12 h-12 bg-[#6917AF] border border-[#E3E3E3] rounded-full flex-none order-0 flex-grow-0"></div>

            <div className="flex flex-col items-start p-0 gap-2 w-full h-[49px] flex-none order-1 flex-grow">
                <p className="w-full h-[17px] font-inter font-medium text-sm leading-[17px] text-[#1E1E1E] dark:text-[#E3E3E3] flex-none order-0 self-stretch flex-grow-0">
                    {title}
                </p>

                <div className="flex flex-row justify-between items-center p-0 gap-5 w-full h-6 flex-none order-1 self-stretch flex-grow-0">
                    <p className="min-w-[14px] h-6 font-inter font-bold text-xl leading-6 text-[#1E1E1E] dark:text-white flex-none order-0 flex-grow-0">
                        {value}
                    </p>

                    <div className="flex flex-row justify-center items-center px-2 py-1 gap-2.5 bg-[#E5E7EB] dark:bg-[#2C2C2C] rounded-full flex-none order-1 flex-grow-0 transition-colors group-hover:bg-[#F3F4F6] dark:group-hover:bg-[#3D3D3D]">
                        <p className="font-inter font-medium text-xs leading-[15px] text-[#1E1E1E] dark:text-[#E3E3E3] flex-none order-0 flex-grow-0">
                            {percentage}
                        </p>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default AnalyticsCard;
