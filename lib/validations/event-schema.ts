import { z } from "zod"

const MAX_FILE_SIZE_MB = 120
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"]

export const basicInfoEventSchema = z
  .object({
    title: z.string().min(1, "Event title is required"),
    description: z
      .string()
      .min(1, "Description is required")
      .refine((val) => val.replace(/<[^>]*>/g, "").trim().length > 0, {
        message: "Description cannot be empty",
      }),
    tags: z.array(z.string()),
    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endDate: z.string().min(1, "End date is required"),
    endTime: z.string().min(1, "End time is required"),
    coverImage: z
      .instanceof(File)
      .optional()
      .nullable()
      .refine(
        (file) => !file || file.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
        `File size must be less than ${MAX_FILE_SIZE_MB} MB`
      )
      .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only PNG and JPEG images are allowed"
      ),
  })
  .refine(
    (data) => {
      const start = new Date(`${data.startDate}T${data.startTime}`)
      const end = new Date(`${data.endDate}T${data.endTime}`)
      return end >= start
    },
    { message: "End date & time must be after start date & time", path: ["endDate"] }
  )

export type BasicInfoEventFormValues = z.infer<typeof basicInfoEventSchema>
