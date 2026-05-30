'use client'

import { Minus, Plus } from "lucide-react"
import { useState } from "react"
import { UpAndRightArrow } from "./SvgComponents"
import { useTheme } from "next-themes"

const FAQAccordion = ({
    question, answer, showAnswer, onShowAnswer
}: {
    question: string,
    answer: string,
    showAnswer: boolean,
    onShowAnswer: () => void
}) => {
    return (
    <div className="border-2 border-black dark:border-[#797979] rounded-md bg-white dark:bg-[#0D0D0D] w-[90%] sm:w-[560px] md:w-[742px] lg:w-[1000px] mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
            <p className="font-bold text-[14px] md:text-[16px] lg:text-[20px]">{question}</p>

            <button
                type="button"
                className="w-6 h-6 md:w-8 md:h-8 bg-black text-gray-300 rounded-full text-[10px] md:text-[16px] lg:text-[20px] grid place-items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6917AF] focus-visible:ring-offset-2"
                onClick={onShowAnswer}
                aria-expanded={showAnswer}
            >
                {showAnswer ? (<Minus />) : (<Plus />)}
            </button>
        </div>

        {showAnswer && (
            <div className="mt-6 text-[16px] dark:text-[#6C6C6C]">
                {answer}
            </div>
        )}
    </div>
  )
}

export default function FAQ () {
    const answer = "Zicket is a privacy-first event platform built on Aztec. It lets you discover and attend events anonymously, while keeping your personal data secure. You only share what you choose."
    const [showAnswer, setShowAnswer] = useState<number[]>([]);

    const handleShowAnswer = (number: number) => {
        if (showAnswer.includes(number)) {
            setShowAnswer((prev) =>
                prev.filter((item) => item !== number)
            );
        } else {
            setShowAnswer((prev) => [...prev, number]);
        }
    }

    const { theme } = useTheme();
    if (!theme) return

    return (
        <div className="px-2 md:px-30 py-6 md:py-16 bg-[#FEF7F1] dark:bg-[#141414] flex flex-col items-center">
            <div className="w-[60%] md:w-[40%] mx-auto my-4 md:my-10 flex flex-col gap-[12px]">
                <p className="text-center text-[35px] md:text-[60px] text-[#2C0A4A] dark:text-[#D7B5F5] font-bold">FAQs</p>
                <p className="text-center text-[#6C6C6C] text-[16px]">
                    Everything you need to know about using Zicket—how it works,
                    what makes it private, and how you can join or host your next event.
                </p>
            </div>

            <div className="flex flex-col gap-4 pt-6">
                <FAQAccordion
                    question="What makes Zicket so unique ?"
                    answer={answer}
                    showAnswer={showAnswer.includes(0)}
                    onShowAnswer={() => handleShowAnswer(0)}
                />

                <FAQAccordion
                    question="Do I need an account to get tickets?"
                    answer={answer}
                    showAnswer={showAnswer.includes(1)}
                    onShowAnswer={() => handleShowAnswer(1)}
                />

                <FAQAccordion
                    question="Is my identity hidden when I attend events?"
                    answer={answer}
                    showAnswer={showAnswer.includes(2)}
                    onShowAnswer={() => handleShowAnswer(2)}
                />

                <FAQAccordion
                    question="What kind of events are on Zicket?"
                    answer={answer}
                    showAnswer={showAnswer.includes(3)}
                    onShowAnswer={() => handleShowAnswer(3)}
                />


            </div>

            <button className="border-2 border-[#2C0A4A] dark:border-[#D7B5F5] text-[#1C1C1C] dark:text-[#D7B5F5] bg-transparent rounded-4xl px-6 py-2 w-fit mt-10 self-center flex gap-1">
                <span>View Docs</span>
                <UpAndRightArrow colour={theme ==='dark'? '#D7B5F5':"black"} />
            </button>
        </div>
    )
}
