import mongoose, { Schema } from 'mongoose';

const pointSchema = new Schema({
  x: Number,
  y: Number,
});

const canvasPathSchema = new Schema({
  paths: [pointSchema],
  //paths2: [pointSchema],
  strokeWidth: Number,
  strokeColor: String,
  drawMode: Boolean,
  startTimestamp: Number,
  endTimestamp: Number,
});

const participantSchema = new Schema(
  {
    prolificId: String,
    description1: String,
    description2: String,
    gender: String,
    drawingMethod: String,
    skills: String,
    feedback: String,
    paths: [canvasPathSchema],
    //paths2:[canvasPathSchema]
  },
  {
    timestamps: true,
  }
);

const Participant = mongoose.models.Participant || mongoose.model('Participant', participantSchema);

export default Participant;
