import jwt from 'jsonwebtoken'

const secret = 'drf-secret-2025' // You can change this later

export function login(req, res) {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email required' })
  }

  const token = jwt.sign({ email }, secret, { expiresIn: '1d' })

  res.json({ token })
}
