export const healthCheck = (_req, res) => {
  return res.status(200).json({ status: 'ok' });
};

export const upload_controller = (req, res) => {
        if (!req.file) {
        return res.status(400).json({
        message: 'No file uploaded. Use form-data with key "file".',
        });
    }
  
    res.status(200).json({
    message: 'File uploaded successfully',
    file: req.file,
  })
};