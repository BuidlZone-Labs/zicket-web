type Props = {
  title: string
  content: string
}

const Card = ({ title, content }: Props) => {
  return (
    <div className="px-6 py-4 border border-[#E0E0E0] dark:border-[#2B2B2B] rounded-xl shadow-sm w-full max-w-105">
      <h2 className="text-lg font-bold text-[#1E1E1E] dark:text-[#E1E1E1] mb-3">{title}</h2>
      <p className="text-sm font-medium text-[#6C6C6C]">{content}</p>
    </div>
  )
}

export default Card
