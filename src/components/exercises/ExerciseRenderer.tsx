import type { Exercise } from '../../types';
import MultipleChoice from './MultipleChoice';
import Translation from './Translation';
import FillInBlank from './FillInBlank';
import WordOrdering from './WordOrdering';
import Listening from './Listening';
import Matching from './Matching';

interface Props {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
}

export default function ExerciseRenderer({ exercise, onAnswer }: Props) {
  // Key forces remount when exercise changes
  const key = exercise.id;

  switch (exercise.type) {
    case 'multiple_choice':
      return <MultipleChoice key={key} exercise={exercise} onAnswer={onAnswer} />;
    case 'translation':
      return <Translation key={key} exercise={exercise} onAnswer={onAnswer} />;
    case 'fill_in_blank':
      return <FillInBlank key={key} exercise={exercise} onAnswer={onAnswer} />;
    case 'word_ordering':
      return <WordOrdering key={key} exercise={exercise} onAnswer={onAnswer} />;
    case 'listening':
      return <Listening key={key} exercise={exercise} onAnswer={onAnswer} />;
    case 'matching':
      return <Matching key={key} exercise={exercise} onAnswer={onAnswer} />;
  }
}
