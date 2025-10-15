import { Group, Pill } from "@mantine/core"
import { ITaskTags } from "../../types/interfaces"
import { useMemo } from "react"
import { useTaskTags } from "../../hooks/use-task-tags"
import { useQuery } from "@tanstack/react-query"

interface TaskTagsDisplayProps {
  tagNames: string[]
  maxVisible?: number
}

export const TaskTagsDisplay = ({
  tagNames,
  maxVisible = 2
}: TaskTagsDisplayProps) => {
  if (!tagNames || tagNames.length === 0) return null

  const { searchTaskTags } = useTaskTags()

  const { data: allTags } = useQuery({
    queryKey: ["active-task-tags"],
    queryFn: async () => {
      const resp = await searchTaskTags({ deleted: false, limit: 100, page: 1 })
      return resp.data
    },
    select: (res) => res.data,
    staleTime: Infinity
  })

  const matchedTags = useMemo(() => {
    if (!allTags) return []

    return tagNames
      .map((name) => (allTags || []).find((tag) => tag.name === name))
      .filter((tag): tag is ITaskTags => tag !== undefined)
  }, [tagNames, allTags])

  const visibleTags = matchedTags.slice(0, maxVisible)
  const hiddenCount = matchedTags.length - maxVisible

  return (
    <Group gap="xs">
      {visibleTags.map((tag) => (
        <Pill
          size="xs"
          key={tag.name}
          style={{
            backgroundColor: tag.color,
            color: "#fff"
          }}
        >
          {tag.name}
        </Pill>
      ))}
      {hiddenCount > 0 && (
        <Pill
          style={{
            backgroundColor: "#868e96",
            color: "#fff"
          }}
        >
          +{hiddenCount}
        </Pill>
      )}
    </Group>
  )
}
