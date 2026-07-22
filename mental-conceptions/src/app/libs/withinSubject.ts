export type WithinSubjectStudyVersion = "within-subject-v1";
export type WithinSubjectCondition = "A" | "B";

export type WithinSubjectPairId =
  | "rating-ranking"
  | "fruit-person"
  | "stock-running";

export type WithinSubjectPromptId =
  | "rating"
  | "ranking"
  | "fruit"
  | "person"
  | "stock"
  | "running";

export type WithinSubjectSide = "left" | "right";

export type WithinSubjectPairLayout = {
  left: WithinSubjectPromptId;
  right: WithinSubjectPromptId;
};

export type WithinSubjectPrompt = {
  id: WithinSubjectPromptId;
  condition: WithinSubjectCondition;
  scenario: string;
};

export type WithinSubjectPairPrompt = {
  pairId: WithinSubjectPairId;
  left: WithinSubjectPrompt;
  right: WithinSubjectPrompt;
};

export type WithinSubjectSketchPath = {
  paths: { x: number; y: number }[];
  strokeWidth: number;
  strokeColor: string;
  drawMode: boolean;
  startTimestamp: number;
  endTimestamp: number;
};

export type WithinSubjectSideResponse = {
  promptId: WithinSubjectPromptId;
  condition: WithinSubjectCondition;
  scenario: string;
  description: string;
  intuitiveReason: string;
  paths: WithinSubjectSketchPath[];
  imageUrl: string | null;
};

export type WithinSubjectPairResponse = {
  pairId: WithinSubjectPairId;
  pairOrder: number;
  leftPromptId: WithinSubjectPromptId;
  rightPromptId: WithinSubjectPromptId;
  leftCondition: WithinSubjectCondition;
  rightCondition: WithinSubjectCondition;
  left: WithinSubjectSideResponse;
  right: WithinSubjectSideResponse;
};

export const WITHIN_ASSIGNMENT_KEY = "withinStudyAssignment";
export const WITHIN_PAIR_RESPONSES_KEY = "withinPairResponses";
export const WITHIN_CURRENT_STEP_KEY = "withinCurrentStep";
export const WITHIN_CURRENT_ROUTE_KEY = "withinCurrentRoute";
export const WITHIN_PARTICIPANT_NUMBER_KEY = "withinParticipantNumber";
export const WITHIN_STUDY_VERSION_KEY = "withinStudyVersion";
export const WITHIN_FINAL_REASON_KEY = "withinFinalAdditionalReason";

export type WithinSubjectAssignment = {
  studyVersion: WithinSubjectStudyVersion;
  participantNumber: number;
  pairOrder: WithinSubjectPairId[];
  layoutByPair: Record<WithinSubjectPairId, WithinSubjectPairLayout>;
};

type PairDefinition = {
  pairId: WithinSubjectPairId;
  promptA: WithinSubjectPrompt;
  promptB: WithinSubjectPrompt;
};

export const WITHIN_STUDY_VERSION: WithinSubjectStudyVersion =
  "within-subject-v1";

export const WITHIN_SUBJECT_PAIRS: PairDefinition[] = [
  {
    pairId: "rating-ranking",
    promptA: {
      id: "rating",
      condition: "A",
      scenario:
        "This dataset shows the ratings of three restaurants. Restaurant A has a rating of 4, Restaurant B has a rating of 5, and Restaurant C has a rating of 2. ",
    },
    promptB: {
      id: "ranking",
      condition: "B",
      scenario:
        "This dataset shows the rankings of three restaurants. Restaurant A has a ranking of 4, Restaurant B has a ranking of 5, and Restaurant C has a ranking of 2. ",
    },
  },
  {
    pairId: "fruit-person",
    promptA: {
      id: "fruit",
      condition: "A",
      scenario:
        "This dataset shows the results of a small local poll tallying the votes received for favorite fruits. Banana had 10 votes, strawberries had 15 votes, and blueberries had 12 votes. ",
    },
    promptB: {
      id: "person",
      condition: "B",
      scenario:
        "This dataset shows the results of a small local poll tallying the votes received for a leadership position. Blair had 10 votes, Stella had 15 votes, and Ben had 12 votes. ",
    },
  },
  {
    pairId: "stock-running",
    promptA: {
      id: "running",
      condition: "A",
      scenario:
        "This dataset shows a recreational runner's annual mileage over a five-year period. The distance run was 350 miles in 2020, 420 miles in 2021, 390 miles in 2022, 510 miles in 2023, and 600 miles in 2024. ",
    },
    promptB: {
      id: "stock",
      condition: "B",
      scenario:
        "This dataset shows the stock price of a company over a five-year period. The stock price was $350 in 2020, $420 in 2021, $390 in 2022, $510 in 2023, and $600 in 2024. ",
    },
  },
];

export const shuffleArray = <T,>(items: T[]): T[] => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = nextItems[index];
    nextItems[index] = nextItems[swapIndex];
    nextItems[swapIndex] = current;
  }

  return nextItems;
};

export const getPairDefinition = (
  pairId: WithinSubjectPairId
): PairDefinition => {
  const pair = WITHIN_SUBJECT_PAIRS.find((item) => item.pairId === pairId);

  if (!pair) {
    throw new Error(`Unknown within-subject pair: ${pairId}`);
  }

  return pair;
};

export const getPairPrompt = (
  pairId: WithinSubjectPairId,
  promptId: WithinSubjectPromptId
): WithinSubjectPrompt => {
  const pair = getPairDefinition(pairId);
  const prompt = [pair.promptA, pair.promptB].find((item) => item.id === promptId);

  if (!prompt) {
    throw new Error(`Unknown prompt id for pair ${pairId}: ${promptId}`);
  }

  return prompt;
};

export const getWithinSubjectPairPrompt = (
  pairId: WithinSubjectPairId,
  layout: WithinSubjectPairLayout
): WithinSubjectPairPrompt => ({
  pairId,
  left: getPairPrompt(pairId, layout.left),
  right: getPairPrompt(pairId, layout.right),
});

export const createWithinSubjectAssignment = (
  participantNumber: number
): WithinSubjectAssignment => {
  const pairOrder = shuffleArray(
    WITHIN_SUBJECT_PAIRS.map((pair) => pair.pairId)
  );

  const layoutByPair = pairOrder.reduce((accumulator, pairId) => {
    const pair = getPairDefinition(pairId);
    const isSwapped = Math.random() < 0.5;

    accumulator[pairId] = isSwapped
      ? { left: pair.promptB, right: pair.promptA }
      : { left: pair.promptA, right: pair.promptB };

    return accumulator;
  }, {} as Record<WithinSubjectPairId, WithinSubjectPairLayout>);

  return {
    studyVersion: WITHIN_STUDY_VERSION,
    participantNumber,
    pairOrder,
    layoutByPair,
  };
};
