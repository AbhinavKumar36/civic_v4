import { z } from 'zod';

const submitSchema = z.object({
  inputType: z.enum(['TEXT', 'VOICE', 'IMAGE', 'MULTIMODAL']),
  text: z.string().optional(),
  originalLanguage: z.string().optional(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()])
  }).optional()
});

const rawInputFromFormData = {
  inputType: "TEXT",
  text: "pothole near gita college",
  location: "{\"type\":\"Point\",\"coordinates\":[85.8437,20.2386]}"
};

try {
  // Simulate controller parsing
  if (rawInputFromFormData.location && typeof rawInputFromFormData.location === 'string') {
    rawInputFromFormData.location = JSON.parse(rawInputFromFormData.location);
  }
  const parsed = submitSchema.parse(rawInputFromFormData);
  console.log("Validation Success:", parsed);
} catch (e: any) {
  console.log("Validation Error:", e.errors || e.message);
}
