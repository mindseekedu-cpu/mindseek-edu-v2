// api/auth/logout.js
// Endpoint logout (hanya untuk keperluan session management di client)
// Supabase Auth logout dilakukan di sisi client, jadi endpoint ini cukup return success

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Logout sebenarnya dikelola client dengan menghapus session token.
    // Endpoint ini hanya sebagai konfirmasi.
    return res.status(200).json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
