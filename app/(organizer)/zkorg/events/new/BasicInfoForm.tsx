"use client"

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Clock } from "lucide-react"
import { basicInfoEventSchema, type BasicInfoEventFormValues } from "@/lib/validations/event-schema"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { InputWithIcon } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { StepIndicator } from "./StepIndicator"
import { RichTextEditor } from "./RichTextEditor"
import { FileUpload } from "./FileUpload"
import { cn } from "@/lib/utils"

const defaultValues: BasicInfoEventFormValues = {
  title: "",
  description: "",
  tags: [],
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  coverImage: null,
}

export interface BasicInfoFormProps {
  onSubmit: (data: BasicInfoEventFormValues) => void
  onValuesChange?: (values: BasicInfoEventFormValues) => void
  className?: string
}

export function BasicInfoForm({ onSubmit, onValuesChange, className }: BasicInfoFormProps) {
  const [tagInput, setTagInput] = useState("")

  const form = useForm<BasicInfoEventFormValues>({
    resolver: zodResolver(basicInfoEventSchema),
    defaultValues,
    mode: "onChange",
  })

  // eslint-disable-next-line
  const watchedTags = form.watch("tags")
  const tags = useMemo(() => watchedTags ?? [], [watchedTags])
  const watched = form.watch()
  const lastSent = useRef<string>("")

  useEffect(() => {
    const key = JSON.stringify({
      ...watched,
      coverImage: watched.coverImage?.name,
    })
    if (key === lastSent.current) return
    lastSent.current = key
    onValuesChange?.(watched as BasicInfoEventFormValues)
  }, [watched, onValuesChange])

  const addTag = useCallback(
    (label: string) => {
      const trimmed = label.trim().toUpperCase()
      if (!trimmed || tags.includes(trimmed)) return
      form.setValue("tags", [...tags, trimmed], { shouldValidate: true })
    },
    [form, tags]
  )

  const removeTag = useCallback(
    (index: number) => {
      const next = tags.filter((_, i) => i !== index)
      form.setValue("tags", next, { shouldValidate: true })
    },
    [form, tags]
  )

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault()
        addTag(tagInput)
        setTagInput("")
      }
    },
    [addTag, tagInput]
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", className)}>
        <StepIndicator
          currentStep={1}
          totalSteps={2}
          label="Basic Information"
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Blockchain & Culture Meetup Enugu"
                  className="rounded-lg h-10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="What's the event about?"
                  error={form.formState.errors.description?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E3E3E3] dark:border-[#2A2A2A] bg-transparent px-3 py-2 min-h-10">
                  {tags.map((tag, index) => (
                    <Tag
                      key={`${tag}-${index}`}
                      variant="default"
                      size="sm"
                      removable
                      onRemove={() => removeTag(index)}
                    >
                      {tag}
                    </Tag>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Add tags..." : ""}
                    aria-label="Add event tag"
                    className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-[#667085] dark:placeholder:text-[#808080]"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <InputWithIcon
                    type="date"
                    icon={<Calendar className="size-4" />}
                    className="rounded-lg h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <InputWithIcon
                    type="time"
                    icon={<Clock className="size-4" />}
                    className="rounded-lg h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <InputWithIcon
                    type="date"
                    icon={<Calendar className="size-4" />}
                    className="rounded-lg h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <InputWithIcon
                    type="time"
                    icon={<Clock className="size-4" />}
                    className="rounded-lg h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={form.formState.errors.coverImage?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="gradient"
          className="w-full rounded-lg py-3 text-sm font-semibold"
          disabled={!form.formState.isValid}
        >
          Next &gt;
        </Button>
      </form>
    </Form>
  )
}
