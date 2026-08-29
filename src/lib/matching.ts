import { prisma } from "./prisma";

// Simple text similarity function based on keyword overlap
function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  const words1 = new Set(text1.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 3));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let intersection = 0;
  for (const word of words1) {
    if (words2.has(word)) intersection++;
  }
  
  const union = words1.size + words2.size - intersection;
  return Math.min(100, Math.round((intersection / union) * 100 * 2)); // Multiplier to boost score
}

// Calculate score based on date proximity
function calculateDateScore(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 100;
  if (diffDays <= 3) return 80;
  if (diffDays <= 7) return 60;
  if (diffDays <= 14) return 40;
  if (diffDays <= 30) return 20;
  return 0;
}

export async function findMatchesForItem(itemId: string) {
  try {
    const sourceItem = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!sourceItem) return;

    // Only match ACTIVE items
    if (sourceItem.status !== "ACTIVE") return;

    // Find potential candidates within the same college
    const targetType = sourceItem.type === "LOST" ? "FOUND" : "LOST";
    
    const candidates = await prisma.item.findMany({
      where: {
        type: targetType,
        category: sourceItem.category,
        collegeId: sourceItem.collegeId, // Only match within same college
        status: "ACTIVE",
      }
    });

    for (const candidate of candidates) {
      // 1. Text Similarity (Title & Description combined)
      const sourceText = `${sourceItem.title} ${sourceItem.description}`;
      const candidateText = `${candidate.title} ${candidate.description}`;
      const textScore = calculateTextSimilarity(sourceText, candidateText);
      
      // 2. Date Proximity
      const dateScore = calculateDateScore(sourceItem.date, candidate.date);

      // 3. Hierarchical Location Similarity
      let locScore = 0;
      if (sourceItem.areaId && sourceItem.areaId === candidate.areaId) {
        locScore = 100;
      } else if (sourceItem.floorId && sourceItem.floorId === candidate.floorId) {
        locScore = 80;
      } else if (sourceItem.buildingId && sourceItem.buildingId === candidate.buildingId) {
        locScore = 60;
      } else if (sourceItem.campusId && sourceItem.campusId === candidate.campusId) {
        locScore = 40;
      } else {
        // Fallback to text matching for legacy items without hierarchical data
        const sourceLoc = sourceItem.locationName.toLowerCase();
        const candidateLoc = candidate.locationName.toLowerCase();
        if (sourceLoc && candidateLoc && (sourceLoc.includes(candidateLoc) || candidateLoc.includes(sourceLoc))) {
          locScore = 60; // Less confident than exact ID match
        }
      }

      // Weighted Average
      // Text: 40%, Date: 30%, Location: 30%
      const finalScore = Math.round((textScore * 0.4) + (dateScore * 0.3) + (locScore * 0.3));

      // Threshold to create a match
      if (finalScore >= 45) {
        const reasons = [];
        if (textScore > 50) reasons.push("Similar description");
        if (dateScore > 60) reasons.push("Similar date");
        if (locScore >= 80) reasons.push("Same specific location");
        else if (locScore >= 40) reasons.push("Same general area");
        reasons.push("Same category");

        const lostItemId = sourceItem.type === "LOST" ? sourceItem.id : candidate.id;
        const foundItemId = sourceItem.type === "FOUND" ? sourceItem.id : candidate.id;

        // Check if match already exists
        const existingMatch = await prisma.match.findFirst({
          where: { lostItemId, foundItemId }
        });

        if (!existingMatch) {
          await prisma.match.create({
            data: {
              lostItemId,
              foundItemId,
              score: finalScore,
              reasons: reasons.join(", "),
              status: "PENDING"
            }
          });

          // Optional: Create notification for the user who lost the item
          const lostItemOwner = sourceItem.type === "LOST" ? sourceItem.userId : candidate.userId;
          await prisma.notification.create({
            data: {
              userId: lostItemOwner,
              type: "MATCH",
              content: `Possible match found for your lost item with a ${finalScore}% match score.`,
              link: "/dashboard" // Will be updated to match details
            }
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in matching engine:", error);
  }
}
