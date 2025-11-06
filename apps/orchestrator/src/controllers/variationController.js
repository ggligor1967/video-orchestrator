export const createVariationController = ({ variationService, logger }) => ({
  async generateVariations(req, res) {
    try {
      const { baseProject, count, types } = req.body;

      if (!baseProject || !baseProject.script) {
        return res.status(400).json({
          success: false,
          error: { message: 'baseProject with script is required' }
        });
      }

      const variations = await variationService.generateVariations(baseProject, { count, types });

      res.json({
        success: true,
        data: { variations, total: variations.length }
      });
    } catch (error) {
      logger.error('Failed to generate variations', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
});
