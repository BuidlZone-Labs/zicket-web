'use client'

import Image from "next/image"
import { useTheme } from "next-themes"
import { ArrowUpRight } from "lucide-react"

const images: {
    src: string,
    alt: string,
}[] = [
    {
        src: "/images/Vector0.png",
        alt: "Web3 & Crypto Meetups",
    },
    {
        src: "/images/Vector1.png",
        alt: "Career & Innovation"
    },
    {
        src: "/images/Vector2.png",
        alt: "Art & Digital Culture"
    },
    {
        src: "/images/Vector3.png",
        alt: "Music & Nightlife"
    },
    {
        src: "/images/Vector4.png",
        alt: "Wellness & Retreats",
    },
    {
        src: "/images/Vector5.png",
        alt: "Talks & Panels",
    },
    {
        src: "/images/Vector6.png",
        alt: "Workshop & Builder Labs"
    },
    {
        src: "/images/Vector7.png",
        alt: "Social & Underground Vibes"
    },
]

export default function WhatZicketOffers () {
    const { theme } = useTheme();
    if (!theme) return

    return (
        <div className="w-full mx-auto px-4 md:px-30 flex flex-col md:flex-row justify-between py-6 md:py-20">

            <div className="max-w-full md:max-w-[30%] flex flex-col items-center md:items-start gap-4 my-5">
                <p className="text-[25px] md:text-[38px] text-[#2C0A4A] dark:text-[#D7B5F5] font-semibold">
                    Private, powerful and perfectly your vibe
                </p>
                <p className="text-[16px] text-[#1C1C1C] dark:text-gray-500">
                    Host, mint, and attend events without revealing your identity.
                    Zicket is the privacy-native event platform built on Aztec Network.
                </p>

                <button className="group border-2 border-[#2C0A4A] dark:border-[#D7B5F5] [color:var(--color-text-detail)] dark:[color:var(--color-text-main-dark)] bg-transparent rounded-4xl px-6 py-2 w-fit mt-5 flex items-center gap-1 cursor-pointer">
                    <span>Explore Events</span>
                    <ArrowUpRight
                        className="transform transition-transform duration-300 group-hover:rotate-45"
                        color={theme === 'dark' ? '#D7B5F5' : '#2C0A4A'}
                    />
                </button>
            </div>

            <div className="flex md:flex-wrap gap-4 max-w-full overflow-x-auto md:max-w-[50%]
                            pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {
                    images.map((image, index) => {
                        return (
                            <div key={index} className="group flex flex-col items-center gap-2">
                                <div className="w-[134px] h-[134px] border-[0.56px] border-[#1C1C1C] dark:border-[#797979] rounded-md flex items-center justify-center transition-all duration-300 dark:group-hover:drop-shadow-[0_0_2em_rgba(255,255,255,0.5)]">
                                    <Image
                                        alt={image.alt}
                                        src={image.src}
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <span className="text-[11.73px] font-semibold transition-colors duration-300 group-hover:[color:var(--color-text-detail)]">{image.alt}</span>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}
