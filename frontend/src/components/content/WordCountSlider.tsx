import styled from 'styled-components';
import { WORD_COUNT_MAX, WORD_COUNT_MIN, WORD_COUNT_STEP, formatWordCount } from '../../utils/promptLength';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const ValueRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ValueText = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
`;

const Hint = styled.span`
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-tertiary);
`;

const Range = styled.input`
  width: 100%;
  height: 10px;
  border-radius: 5px;
  appearance: none;
  background: var(--color-border-primary);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-brand-500);
    border: 2px solid var(--color-background-primary);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
    cursor: grab;
    margin-top: -6px;
  }

  &::-webkit-slider-runnable-track {
    height: 10px;
    border-radius: 5px;
    background: transparent;
  }

  &::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-brand-500);
    border: 2px solid var(--color-background-primary);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
    cursor: grab;
  }

  &::-moz-range-track {
    height: 10px;
    border-radius: 5px;
    background: var(--color-border-primary);
  }
`;

type WordCountSliderProps = {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export default function WordCountSlider({ id, value, onChange, disabled }: WordCountSliderProps) {
  return (
    <Wrap>
      <ValueRow>
        <ValueText id={id ? `${id}-value` : undefined}>{formatWordCount(value)}</ValueText>
        <Hint>
          {WORD_COUNT_MIN.toLocaleString()}–{WORD_COUNT_MAX.toLocaleString()} words
        </Hint>
      </ValueRow>
      <Range
        id={id}
        type="range"
        min={WORD_COUNT_MIN}
        max={WORD_COUNT_MAX}
        step={WORD_COUNT_STEP}
        value={value}
        disabled={disabled}
        aria-valuemin={WORD_COUNT_MIN}
        aria-valuemax={WORD_COUNT_MAX}
        aria-valuenow={value}
        aria-valuetext={formatWordCount(value)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Wrap>
  );
}
