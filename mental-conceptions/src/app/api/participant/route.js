import Participant from "../../models/participant";
import connectMongoDB from "../../libs/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { prolificId, description1, description2, gender, drawingMethod, skills, feedback, paths } = await request.json();
  console.log("Request Body:", { prolificId, description1, description2, gender, drawingMethod, skills, feedback, paths });

  await connectMongoDB();
  console.log("Creating participant with:", { prolificId, description1, description2, gender, drawingMethod, skills, feedback, paths });

  try {
    const participant = await Participant.create({ prolificId, description1, description2, gender, drawingMethod, skills, feedback,paths });
    console.log("Created participant:", participant);

    return NextResponse.json({ message: "Created" }, { status: 201 });
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json({ message: "Error creating participant" }, { status: 500 });
  }
}
