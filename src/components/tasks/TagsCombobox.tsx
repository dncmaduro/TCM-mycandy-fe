import {
  Combobox,
  Pill,
  PillsInput,
  useCombobox,
  CheckIcon,
  Group
} from "@mantine/core"
import { ITaskTags } from "../../types/interfaces"

interface TagsComboboxProps {
  value: string[]
  onChange: (value: string[]) => void
  tags: ITaskTags[]
  label?: string
  placeholder?: string
  error?: string
}

export const TagsCombobox = ({
  value,
  onChange,
  tags,
  label,
  placeholder,
  error
}: TagsComboboxProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active")
  })

  const handleValueSelect = (tagName: string) => {
    const newValue = value.includes(tagName)
      ? value.filter((v) => v !== tagName)
      : [...value, tagName]
    onChange(newValue)
  }

  const handleValueRemove = (tagName: string) => {
    onChange(value.filter((v) => v !== tagName))
  }

  const selectedTags = tags.filter((tag) => value.includes(tag.name))

  const values = selectedTags.map((tag) => (
    <Pill
      key={tag.name}
      withRemoveButton
      onRemove={() => handleValueRemove(tag.name)}
      style={{
        backgroundColor: tag.color,
        color: "#fff"
      }}
    >
      {tag.name}
    </Pill>
  ))

  const options = tags.map((tag) => {
    const selected = value.includes(tag.name)
    return (
      <Combobox.Option value={tag.name} key={tag.name} active={selected}>
        <Group gap="sm" justify="space-between">
          <Pill
            style={{
              backgroundColor: tag.color,
              color: "#fff"
            }}
          >
            {tag.name}
          </Pill>
          {selected && <CheckIcon size={16} />}
        </Group>
      </Combobox.Option>
    )
  })

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
    >
      <Combobox.DropdownTarget>
        <PillsInput
          label={label}
          onClick={() => combobox.openDropdown()}
          error={error}
        >
          <Pill.Group>
            {values}
            <Combobox.EventsTarget>
              <PillsInput.Field
                placeholder={placeholder}
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && value.length > 0) {
                    event.preventDefault()
                    handleValueRemove(value[value.length - 1])
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>Không có thẻ nào</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
