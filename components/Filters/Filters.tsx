"use client"


export interface CategoryOption {
  id: string
  label: string
}

export interface ItemTypeOption {
  id: string
  label: string
}

export interface SkillOption {
  id: string
  label: string
}

export interface CategoryFilterProps {
  categories: CategoryOption[]
  value?: string
  name?: string
  placeholder?: string
  onChange?: (value: string) => void
}

export function CategoryFilter({ categories, value, name = "category", placeholder = "All categories", onChange }: CategoryFilterProps) {
  return (
    <label className="flex flex-col text-sm text-secondary">
      <span className="mb-1 font-medium">Category</span>
      <select
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="rounded-md border px-3 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Category filter"
      >
        <option value="">{placeholder}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export interface ItemTypeFilterProps {
  types: ItemTypeOption[]
  value?: string
  name?: string
  placeholder?: string
  onChange?: (value: string) => void
}

export function ItemTypeFilter({ types, value, name = "itemType", placeholder = "All types", onChange }: ItemTypeFilterProps) {
  return (
    <label className="flex flex-col text-sm text-secondary">
      <span className="mb-1 font-medium">Type</span>
      <select
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="rounded-md border px-3 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Item type filter"
      >
        <option value="">{placeholder}</option>
        {types.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export interface RarityFilterProps {
  value?: string
  options?: string[]
  name?: string
  onChange?: (value: string) => void
}

export function RarityFilter({ value, options = ["common", "uncommon", "rare", "epic", "legendary"], name = "rarity", onChange }: RarityFilterProps) {
  return (
    <fieldset className="flex flex-col text-sm text-secondary">
      <legend className="mb-2 font-medium">Rarity</legend>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <label key={opt} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border bg-white text-xs">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange?.(opt)}
              className="h-4 w-4"
              aria-checked={value === opt}
            />
            <span className="capitalize">{opt}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export interface SkillsFilterProps {
  skills: SkillOption[]
  selected?: string[]
  name?: string
  onChange?: (selected: string[]) => void
}

export function SkillsFilter({ skills, selected = [], name = "skills", onChange }: SkillsFilterProps) {
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    onChange?.(next)
  }

  return (
    <fieldset className="flex flex-col text-sm text-secondary">
      <legend className="mb-2 font-medium">Skills</legend>
      <div className="flex flex-col gap-2">
        {skills.map((s) => (
          <label key={s.id} className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name={name}
              value={s.id}
              checked={selected.includes(s.id)}
              onChange={() => toggle(s.id)}
              className="h-4 w-4"
            />
            <span className="text-sm">{s.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default {
  CategoryFilter,
  ItemTypeFilter,
  RarityFilter,
  SkillsFilter,
}
