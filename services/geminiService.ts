
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractEmployeeDataFromDocument = async (base64Data: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ inlineData: { data: base64Data, mimeType: mimeType } }],
      config: {
        systemInstruction: "أنت خبير في معالجة المستندات العربية. استخرج البيانات التالية بدقة: الاسم الكامل، رقم الهوية، تاريخ انتهاء الوثيقة، المسمى الوظيفي، ورقم IBAN بتنسيق JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            idNumber: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
            iban: { type: Type.STRING },
            role: { type: Type.STRING }
          },
          required: ["name", "idNumber", "role"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Extraction Error:", error);
    throw error;
  }
};

/**
 * توليد توصيات تدريبية ذكية للموظف
 */
export const getTrainingRecommendations = async (employee: any, attendanceStats: any) => {
  try {
    const prompt = `
      الموظف: ${employee.name}
      المسمى الوظيفي: ${employee.role}
      المهارات الحالية: ${JSON.stringify(employee.skills || [])}
      إحصائيات الالتزام: ${JSON.stringify(attendanceStats)}
      الهدف: اقترح 3 دورات تدريبية (اسم الدورة، السبب، المهارة المستهدفة) لتطوير مساره المهني أو معالجة فجوات الأداء.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "أنت مستشار تطوير مهني (Career Coach). قدم توصياتك باللغة العربية بتنسيق JSON فقط.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              courseName: { type: Type.STRING },
              reason: { type: Type.STRING },
              targetSkill: { type: Type.STRING }
            },
            required: ["courseName", "reason", "targetSkill"]
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("AI Recommendations Error:", error);
    return [];
  }
};

export const getHRInsights = async (employees: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بيانات الموظفين: ${JSON.stringify(employees)}`,
      config: {
        systemInstruction: "أنت محلل موارد بشرية. قدم تحليلاً ذكياً ومختصراً جداً (3 نقاط) حول الرواتب والهيكل التنظيمي بالعربية.",
      },
    });
    return response.text || "لا تتوفر تحليلات حالياً.";
  } catch (error) {
    return "حدث خطأ في الاتصال بالذكاء الاصطناعي.";
  }
};

/**
 * إنشاء وصف وظيفي بناءً على المسمى الوظيفي باستخدام الذكاء الاصطناعي
 */
export const generateJobDescription = async (role: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `اكتب وصفاً وظيفياً مفصلاً للمسمى الوظيفي: ${role}. يجب أن يشمل المهام والمسؤوليات والمهارات المطلوبة.`,
      config: {
        systemInstruction: "أنت خبير في الموارد البشرية. قدم وصفاً وظيفياً احترافياً باللغة العربية.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("JD Generation Error:", error);
    return null;
  }
};