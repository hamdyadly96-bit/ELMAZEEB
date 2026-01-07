
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * تحليل المستندات واستخراج البيانات (هوية، إقامة)
 */
export const extractEmployeeDataFromDocument = async (base64Data: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "أنت محلل وثائق سعودي خبير. استخرج من هذه الصورة: الاسم الكامل، رقم الهوية أو الإقامة، تاريخ الانتهاء، والجنس. أرجع النتيجة بتنسيق JSON حصراً باللغة العربية." }
        ] 
      },
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return null;
  }
};

/**
 * الحصول على رؤى ذكية حول أداء الموارد البشرية
 */
export const getHRInsights = async (employees: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `حلل بيانات الموظفين التالية وقدم توصيات إدارية لتحسين الكفاءة: ${JSON.stringify(employees)}`,
      config: {
        systemInstruction: "أنت مستشار موارد بشرية خبير في السوق السعودي. لغتك رصينة وعملية."
      }
    });
    return response.text;
  } catch (error) {
    return "عذراً، حدث خطأ أثناء تحليل البيانات.";
  }
};

/**
 * إنشاء وصف وظيفي ذكي
 */
export const generateJobDescription = async (role: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `اكتب وصفاً وظيفياً متكاملاً لمنصب ${role} في شركة سعودية، يشمل المهام، المتطلبات، والمزايا.`,
    });
    return response.text;
  } catch (error) {
    return null;
  }
};

/**
 * اقتراح دورات تدريبية بناءً على الأهداف
 */
export const getTrainingRecommendations = async (employee: any, context: any, goals: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `اقترح 3 دورات تدريبية للموظف ${employee.name} (منصب: ${employee.role}) لتتماشى مع أهداف الشركة: ${goals.join(', ')}. أرجع النتيجة بتنسيق JSON قائمة من الكائنات تحتوي على: courseName, reason, priorityLevel, strategicAlignment.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    return [];
  }
};

/**
 * تحليل مطابقة السيرة الذاتية مع الوصف الوظيفي
 * Added missing analyzeResumeMatching function
 */
export const analyzeResumeMatching = async (resumeText: string, jobDescription: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `قارن السيرة الذاتية التالية: "${resumeText}" مع الوصف الوظيفي: "${jobDescription}". قيم المطابقة بنسبة مئوية وقدم ملاحظات مختصرة. أرجع النتيجة بتنسيق JSON: { "score": number, "feedback": string }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("AI Matching Error:", error);
    return null;
  }
};
