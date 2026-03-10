import jwt from 'jsonwebtoken';

// Llave secreta para firmar los JWT (debe coincidir con la de auth.js)
const JWT_SECRET = 'nexofix_super_secret_key_2026';

/**
 * Middleware para verificar el token JWT en las cabeceras de la petición.
 */
export function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
            req.user = decoded;
            next();
        });
    } else {
        res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }
}
