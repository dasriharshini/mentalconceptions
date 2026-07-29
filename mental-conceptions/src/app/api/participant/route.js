import Participant from "../../models/participant";
import connectMongoDB from "../../libs/mongodb";
import { NextResponse } from "next/server";
import { WITHIN_STUDY_VERSION } from "../../libs/withinSubject";

export async function POST(request) {
  const {
    prolificId,
    studyVersion,
    participantNumber,
    studyStatus,
    pairOrder,
    layoutByPair,
    pairResponses,
    conditionSequence,
    description1,
    description2,
    finalAdditionalReason,
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
    studyStatus,
    pairOrder,
    layoutByPair,
    pairResponses,
    conditionSequence,
    description1,
    description2,
    finalAdditionalReason,
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
    studyStatus,
    pairOrder,
    layoutByPair,
    pairResponses,
    conditionSequence,
    description1,
    description2,
    finalAdditionalReason,
    gender,
    drawingMethod,
    skills,
    feedback,
    sketches,
  });

  try {
    const participant =
      studyVersion === WITHIN_STUDY_VERSION || pairResponses
        ? await Participant.create({
            prolificId,
            studyVersion,
            participantNumber,
            studyStatus: studyStatus ?? "completed",
            pairOrder,
            layoutByPair,
            pairResponses,
            finalAdditionalReason,
            gender,
            drawingMethod,
            skills,
            feedback,
          })
        : await Participant.create({
            prolificId,
            studyVersion,
            participantNumber,
            conditionSequence,
            description1,
            description2,
            finalAdditionalReason,
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
