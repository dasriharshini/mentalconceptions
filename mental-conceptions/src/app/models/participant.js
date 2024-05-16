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

const participantSchema = new Schema(
  {
    prolificId: String,
    description: String,
    gender: String,
    drawingMethod: String,
    skills: String,
    feedback: String,
    paths: [canvasPathSchema],  
  },
  {
    timestamps: true,
  }
);

const Participant = mongoose.models.Participant || mongoose.model('Participant', participantSchema);

export default Participant;
