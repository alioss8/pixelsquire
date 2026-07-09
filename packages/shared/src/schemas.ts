import { z } from 'zod'

export const GoalCadence = z.enum(['DAILY', 'WEEKLY', 'ONCE'])
export const MessageCategory = z.enum(['MORNING', 'GOAL_NUDGE', 'STREAK', 'EVENING', 'CELEBRATE'])

export const CreateGoalInput = z.object({
  title: z.string().min(1).max(120),
  cadence: GoalCadence,
})

export const NextMessageResponse = z.object({
  id: z.string(),
  text: z.string(),
  category: MessageCategory,
})

export type CreateGoalInput = z.infer<typeof CreateGoalInput>
export type NextMessageResponse = z.infer<typeof NextMessageResponse>