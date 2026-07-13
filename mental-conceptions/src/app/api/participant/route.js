import Participant from "../../models/participant";
import connectMongoDB from "../../libs/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  const {
    prolificId,
    studyVersion,
    participantNumber,
    conditionSequence,
    description1,
    description2,
    gender,
    drawingMethod,
    skills,
    feedback,
    sketches,
  } = await request.json();
  console.log("Request Body:", {
    prolificId,
    studyVersion,
    participantNumber,
    conditionSequence,
    description1,
    description2,
    gender,
    drawingMethod,
    skills,
    feedback,
    sketches,
  });

  await connectMongoDB();
  console.log("Creating participant with:", {
    prolificId,
    studyVersion,
    participantNumber,
    conditionSequence,
    description1,
    description2,
    gender,
    drawingMethod,
    skills,
    feedback,
    sketches,
  });

  try {
    const participant = await Participant.create({
      prolificId,
      studyVersion,
      participantNumber,
      conditionSequence,
      description1,
      description2,
      gender,
      drawingMethod,
      skills,
      feedback,
      sketches,
    });
    console.log("Created participant:", participant);

    return NextResponse.json({ message: "Created" }, { status: 201 });
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json({ message: "Error creating participant" }, { status: 500 });
  }
}
