import { LinkedInIcon, TwitterXIcon } from "@/public/svg/svg";
import { FC } from "react";
interface OrganizerCardProps {
  name: string;
  bio: string;
  contact: string;
}
export const OrganizerCard: FC<OrganizerCardProps> = ({
  name,
  bio,
  contact,
}) => {
  return (
    <div className="p-8 border border-[#E9E9E9] rounded-xl space-y-6 dark:border-[#232323]">
      <p>Organized By</p>
      <hr className="w-full h-0.5" />
      <p className="text-[#454545] font-medium">{name}</p>
      <p className="text-[#454545] font-medium">{bio} </p>
      <div className="space-x-4 flex items-center justify-center w-fit">
        <p className="dark:text-[#E1E1E1] ">Connect with Us: </p>
        <div className="flex gap-2 items-center justify-center">
          <a
            href={contact}
            role="link"
            className="size-6 rounded dark:bg-[#E1E1E11A] flex items-center justify-center cursor-pointer hover:scale-115 transition duration-300 ease-in-out bg-[#1E1E1E1A] text-[#0e0d0d] dark:text-white"
          >
            <TwitterXIcon />
          </a>
          <div
            role="link"
            className="size-6 rounded dark:bg-[#E1E1E11A] flex items-center justify-center cursor-pointer hover:scale-115 transition duration-300 ease-in-out bg-[#1E1E1E1A] text-[#1E1E1E] dark:text-white"
          >
            <LinkedInIcon />
          </div>
        </div>
      </div>
    </div>
  );
};
