import mongoose from 'mongoose';
import { Evaluation } from '../models/Evaluation.js';

// POST /api/evaluations
export async function createEvaluation(req, res, next) {
  try {
    const { seminarCode, score, comment, evaluatedBy } = req.body ?? {};
    const evaluation = await Evaluation.create({ seminarCode, score, comment, evaluatedBy });
    res.status(201).json({ evaluation });
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'This user has already evaluated this seminar' });
    }
    next(err);
  }
}

// GET /api/evaluations
export async function getAllEvaluations(req, res, next) {
  try {
    const evaluations = await Evaluation.find();
    res.status(200).json({ evaluations });
  } catch (err) { next(err); }
}

// GET /api/evaluations/:id
export async function getEvaluation(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid evaluation id' });
    }
    const evaluation = await Evaluation.findById(id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.status(200).json({ evaluation });
  } catch (err) { next(err); }
}

// GET /api/evaluations/summary?seminarCode=SM101
export async function getEvaluationSummary(req, res, next) {
  try {
    const { seminarCode } = req.query;
    if (typeof seminarCode !== 'string' || seminarCode.trim() === '') {
      return res.status(400).json({ message: 'seminarCode is required' });
    }

    const [result] = await Evaluation.aggregate([
      { $match: { seminarCode } },
      {
        $group: {
          _id: '$seminarCode',
          averageScore: { $avg: '$score' },
          evaluationCount: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      seminarCode,
      averageScore: result ? result.averageScore : 0,
      evaluationCount: result ? result.evaluationCount : 0
    });
  } catch (err) { next(err); }
}