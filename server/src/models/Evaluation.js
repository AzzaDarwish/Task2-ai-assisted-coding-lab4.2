import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
  {
    seminarCode: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// One evaluation per user per seminar.
// The partial filter applies the rule only when evaluatedBy is set, so that
// anonymous evaluations (no evaluatedBy) for the same seminar don't collide
// with each other on a null key.
evaluationSchema.index(
  { seminarCode: 1, evaluatedBy: 1 },
  { unique: true, partialFilterExpression: { evaluatedBy: { $type: 'objectId' } } }
);

export const Evaluation = mongoose.model('Evaluation', evaluationSchema);