type RangeProps = {
  key: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}

export const Range = ({ key, min, max, step, value, onChange }: RangeProps) => {
  return (
    <div key={key}>
      <label htmlFor={key}>{key}</label>
      <input
        type="range"
        title={key}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
