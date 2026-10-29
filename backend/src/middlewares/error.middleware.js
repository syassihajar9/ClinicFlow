
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);

  // JSON mal formé envoyé par le client
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({
      success: false,
      message: 'Le JSON envoyé est invalide.',
    });
  }

  // Contrainte d'unicité ou conflit PostgreSQL
  if (err.code === '23505' || err.code === '23P01') {
    return res.status(409).json({
      success: false,
      message: 'Cette opération crée un conflit avec des données existantes.',
    });
  }

  // Clé étrangère inexistante
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Une référence liée est invalide ou inexistante.',
    });
  }

  // Données rejetées par PostgreSQL
  if (err.code === '23514' || err.code === '22P02') {
    return res.status(400).json({
      success: false,
      message: 'Les données fournies sont invalides.',
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Une erreur interne est survenue.',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
