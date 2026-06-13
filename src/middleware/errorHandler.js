/**
 * Centralized error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  // Handle known error types
  if (err.message?.includes('SQLITE')) {
    return res.status(500).json({
      error: 'Database error',
      message: 'An error occurred while accessing the database'
    });
  }

  if (err.message?.includes('Gemini API')) {
    return res.status(502).json({
      error: 'AI Service error',
      message: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
