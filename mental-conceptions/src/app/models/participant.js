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

const participantSchema = new Schema(
  {
    prolificId: String,
    studyVersion: String,
    participantNumber: Number,
    conditionSequence: [String],
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
