import prisma from "../utils/prisma.js";
import { extractTextFromPDF, parseResumeWithAI } from "../services/resumeParser.service.js";
import { cleanText } from "../utils/textCleaner.js";

export const uploadResume = async (req, res) => {
  try {
    

    // 1. Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    // 2. Save resume metadata in DB
    const resume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        fileUrl: req.file.path
      }
    });

    return res.status(201).json({
      message: "Resume uploaded successfully",
      resumeId: resume.id
    });
  } catch (error) {
    console.error("Resume upload error DETAIL:", error);
    return res.status(500).json({ message: "Resume upload failed: " + error.message });
  }
};

//parse resume
export const parseResume = async (req, res) => {
  try {
    const resumeId = req.params.id;

    // 1. Fetch resume from DB
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId }
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (!resume.fileUrl) {
      return res.status(400).json({ message: "Resume file URL is missing" });
    }

    // 2. Extract raw text from PDF
    console.log("Extracting text from PDF:", resume.fileUrl);
    const rawText = await extractTextFromPDF(resume.fileUrl);
    
    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ 
        message: "Failed to extract text from PDF. The PDF might be empty, corrupted, or image-based." 
      });
    }

    console.log("Extracted text length:", rawText.length);

    // 3. Clean extracted text
    const cleanedText = cleanText(rawText);
    
    if (!cleanedText || cleanedText.trim().length === 0) {
      return res.status(400).json({ 
        message: "Text cleaning resulted in empty content. The PDF might not contain readable text." 
      });
    }

    console.log("Cleaned text length:", cleanedText.length);

    // 4. Parse resume using Gemini AI
    console.log("Calling AI for Parsing...");
    const parsedData = await parseResumeWithAI(cleanedText);
    console.log("AI Parsing Success");

    // 5. Save parsed JSON into DB
    await prisma.resume.update({
      where: { id: resumeId },
      data: { parsedData }
    });

    return res.status(200).json({
      message: "Resume parsed successfully",
      parsedData
    });
  } catch (error) {
    console.error("Resume parsing error DETAIL:", error);
    return res.status(500).json({
      message: "Resume parsing failed: " + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
