import { os } from "@orpc/server";
import * as rfps from "./routers/rfps";
import * as questions from "./routers/questions";

export const router = os.router({
  rfps: {
    // RFP CRUD
    create: rfps.createRFP,
    detail: rfps.getRFP,
    list: rfps.listRFPs,
    update: rfps.updateRFP,
    delete: rfps.deleteRFP,
    
    // Questions
    questions: {
      list: questions.listQuestions,
      get: questions.getQuestion,
      generateAnswer: questions.generateQuestionAnswer,
      generateAll: questions.generateAllAnswers,
      regenerate: questions.regenerateQuestionAnswer,
      update: questions.updateQuestionAnswer,
      approve: questions.approveAnswer,
    },
  },
});

// Export router type for client usage
export type AppRouter = typeof router;
