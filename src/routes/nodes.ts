import { Router } from 'express';
import { supabase } from '../db/supabaseClient.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

// Get all root trees
router.get('/', async (_, res) => {
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .is('parent_id', null);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Get nodes by result value (placed before :base route)
router.get('/result/:result', async (req, res) => {
  const resultValue = Number(req.params.result);
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('result', resultValue);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Get children of a node (by base_value)
router.get('/:base', async (req, res) => {
  const baseValue = Number(req.params.base);
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('base_value', baseValue);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create root node
router.post('/', authMiddleware, async (req, res) => {
  const { value, comment } = req.body;
  const user = (req as any).user;

  const { data, error } = await supabase
    .from('nodes')
    .insert({
      parent_id: null,
      base_value: value,
      result: value,
      comment: comment || 'Starting number',
      created_by: user.id
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Add operation
router.post('/operate', authMiddleware, async (req, res) => {
  const { parentId, operator, operand, comment } = req.body;
  const user = (req as any).user;

  const { data: parent, error: err1 } = await supabase
    .from('nodes')
    .select('result')
    .eq('id', parentId)
    .single();

  if (err1 || !parent) return res.status(404).json({ error: 'Parent not found' });

  const base = Number(parent.result);
  const numOperand = Number(operand);
  let result = base;

  switch (operator) {
    case '+': result = base + numOperand; break;
    case '-': result = base - numOperand; break;
    case '*': result = base * numOperand; break;
    case '/':
      if (numOperand === 0) return res.status(400).json({ error: 'Division by zero' });
      result = base / numOperand;
      break;
    default:
      return res.status(400).json({ error: 'Invalid operator' });
  }

  const { data, error } = await supabase
    .from('nodes')
    .insert({
      parent_id: parentId,
      base_value: base,
      operator,
      operand: numOperand,
      result,
      comment,
      created_by: user.id
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
