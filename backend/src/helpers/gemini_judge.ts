import {
  GoogleGenAI,
  Part,
} from "@google/genai";

interface IssueAnalysis {
  severity: string;
  priority: string;
  corporation: string
}


const systemPrompt = `
You are an assistant that helps triage issues reported on a government website.

You will be provided with:
- Images (optional)
- An "issue" (title or short summary)
- A "description" (detailed text about the problem)

Your task:
Analyze the issue and return a **JSON object** with the following exact fields:

{
  "severity": string, // how severe the issue is (e.g. Low, Medium, High, Critical)
  "priority": string, // how much priority the issue should be given (e.g. Low, Medium, High, Urgent)
  "corporation": string // one of: "Electrical", "Sanitation", "Civil", "Disaster", "Maintenance"
}

Guidelines:
- Be **strict** when assigning severity and priority, since we have limited manpower.
- Carefully infer the correct corporation based on the nature of the issue.
- Do **not** include any explanation or extra text — only return the JSON object exactly in the above format.
`;

interface IssueAnalysis {
  severity: string;
  priority: string;
  corporation: string
}

async function getIssueAnalysis(
  url: string,
  issue: string,
  description: string
): Promise<IssueAnalysis>{
 
   const api = process.env.GOOGLE_API_KEY

  const genAI = new GoogleGenAI({apiKey:api});

  const response = await fetch(url);
  const imageArrayBuffer = await response.arrayBuffer();
  const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');



  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64ImageData,
      },
    },
    { text: `Issue: ${issue}\nDescription: ${description}`}
  ],
  });


  console.log(result.data)


  try {
    const anyResult = result as any;
    let jsonText: string | undefined;

    if (anyResult?.response && typeof anyResult.response.text === "function") {
      jsonText = await anyResult.response.text();
    } else if (typeof anyResult?.text === "string") {
      jsonText = anyResult.text;
    } else if (Array.isArray(anyResult?.outputs)) {
      jsonText = anyResult.outputs
        .map((o: any) => {
          if (typeof o?.content === "string") return o.content;
          if (Array.isArray(o?.content)) {
            return o.content.map((c: any) => c?.text ?? "").join("");
          }
          return "";
        })
        .join("\n");
    }

    if (!jsonText) {
      throw new Error("couldn't generate response");
    }

    const parsed = JSON.parse(jsonText) as IssueAnalysis;
    return parsed;

  } catch (error) {
    console.error("internal server error:", error);
    throw new Error("error with gemini response.");
  }
}




export default getIssueAnalysis

// async function main() {
//   const exampleImageUrls = [
//     "https://example.com/images/pothole_1.jpg",
//     "https://example.com/images/pothole_2.jpg",
//   ];
//   const exampleIssue = "Massive pothole on Main Street";
//   const exampleDescription =
//     "There is a huge, deep pothole in the middle of the road at 123 Main St, right outside the post office. Cars are swerving to avoid it and it's very dangerous.";

//   try {
//     const analysis = await getIssueAnalysis(
//       exampleImageUrls,
//       exampleIssue,
//       exampleDescription
//     );

//     console.log("AI Analysis Complete:");
//     console.log(JSON.stringify(analysis, null, 2));

//   } catch (error) {
//     console.error(error);
//   }
// }



// async function urlToGoogleGenerativePart(url: string): Promise<Part> {
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
//   }

//   const mimeType = response.headers.get("content-type");
//   if (!mimeType || !mimeType.startsWith("image/")) {
//     throw new Error(`URL did not return a valid image: ${url}`);
//   }

//   const imageBuffer = await response.arrayBuffer();
//   const base64Data = Buffer.from(imageBuffer).toString("base64");

//   return {
//     inlineData: {
//       data: base64Data,
//       mimeType: mimeType,
//     },
//   };
// }