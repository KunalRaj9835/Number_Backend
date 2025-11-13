import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabaseClient.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    // Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert({ username, password_hash: hash })
      .select('id, username, created_at')
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    // Optionally store token in DB (like your login route)
    await supabase.from('users').update({ token }).eq('id', user.id);

    // Send back token + user info
    res.json({
      token,
      userId: user.id,
      username: user.username,
      created_at: user.created_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  console.log('Supabase error:', error);
  if (!user) return res.status(401).json({ error: 'Invalid username' });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  await supabase.from('users').update({ token }).eq('id', user.id);
  res.json({ token, userId: user.id });
});

export default router;
