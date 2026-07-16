"use client";

import React from "react";
import Image from "next/image";
import { Eye, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EventManagementHeaderProps {
	logoSrc: string;
	eventTitle: string;
	onEditEvent?: () => void;
	onPreviewEventPage?: () => void;
}

export function EventManagementHeader({
	logoSrc,
	eventTitle,
	onEditEvent,
	onPreviewEventPage,
}: EventManagementHeaderProps) {
	return (
		<header className='rounded-2xl bg-white dark:bg-[#141414]'>
			<div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
				<div className='flex items-center gap-3 sm:gap-4 min-w-0'>
					<div className='relative overflow-hidden size-24 w-32 rounded-sm shrink-0'>
						<Image
							src={logoSrc}
							alt={`${eventTitle} logo`}
							fill
							className='object-cover'
						/>
					</div>

					<div className='min-w-0'>
						<p className='text-md font-medium text-[#667085] dark:text-[#A0A0A0]'>
							Manage Event:
						</p>
						<h1 className='mt-1 text-lg sm:text-2xl font-semibold text-[#101828] dark:text-white truncate'>
							{eventTitle}
						</h1>
					</div>
				</div>

				<div className='flex flex-col sm:flex-row gap-3 lg:justify-end'>
					<Button
						variant='default'
						className='h-11 px-6! rounded-4xl gap-2 bg-[#6917AF] text-white hover:bg-[#5A12A0]'
						onClick={onEditEvent}>
						<SquarePen className='size-4' />
						Edit Event
					</Button>
					<Button
						variant='outline'
						className='h-11 px-6! rounded-4xl gap-2 border-[#6917AF] text-[#6917AF] hover:bg-[#F3E8FF] hover:text-[#5A12A0] dark:border-[#D7B5F5] dark:text-[#D7B5F5] dark:hover:bg-[#6917AF]/20'
						onClick={onPreviewEventPage}>
						<Eye className='size-4' />
						Preview Event Page
					</Button>
				</div>
			</div>
		</header>
	);
}
