type RangeProps = {
  title: string
  min: number
  max: number
  step: number
  value: number
  onChange: (_: number) => void
}

export const Range = ({ title, min, max, step, value, onChange }: RangeProps) => {
  return (
    <div key={title}>
      <label htmlFor={title}>{title}</label>
      <input
        type="range"
        title={title}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
