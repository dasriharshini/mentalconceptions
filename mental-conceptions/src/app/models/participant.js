import mongoose, { Schema } from 'mongoose';

const pointSchema = new Schema({
  x: Number,
  y: Number,
});

const canvasPathSchema = new Schema({
  paths: [pointSchema],
  strokeWidth: Number,
  strokeColor: String,
  drawMode: Boolean,
  startTimestamp: Number,
  endTimestamp: Number,
});

const sketchSchema = new Schema({
  promptId: String,
  promptOrder: Number,
  condition: String,
  scenario: String,
  description: String,
  intuitiveReason: String,
  imageUrl: String,
  paths: [canvasPathSchema],
});

const withinPairSideSchema = new Schema(
  {
    promptId: String,
    condition: String,
    scenario: String,
    description: String,
    intuitiveReason: String,
    imageUrl: String,
    paths: [canvasPathSchema],
  },
  { _id: false }
);

const pairResponseSchema = new Schema(
  {
    pairId: String,
    pairOrder: Number,
    leftPromptId: String,
    rightPromptId: String,
    leftCondition: String,
    rightCondition: String,
    left: withinPairSideSchema,
    right: withinPairSideSchema,
  },
  { _id: false }
);

const participantSchema = new Schema(
  {
    prolificId: String,
    studyVersion: String,
    participantNumber: Number,
    conditionSequence: [String],
    studyStatus: {
      type: String,
      default: "in_progress",
    },
    pairOrder: [String],
    layoutByPair: Schema.Types.Mixed,
    pairResponses: [pairResponseSchema],
    description1: String,
    description2: String,
    finalAdditionalReason: String,
    gender: String,
    drawingMethod: String,
    skills: String,
    feedback: String,
    sketches: [sketchSchema],
  },
  {
    timestamps: true,
  }
);

const Participant = mongoose.models.Participant || mongoose.model('Participant', participantSchema);

export default Participant;
