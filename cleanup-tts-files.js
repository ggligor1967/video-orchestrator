import fs from 'fs/promises';
import path from 'path';

const TTS_DIR = path.join(process.cwd(), 'data', 'tts');

async function cleanupTTSFiles() {
  console.log('🧹 Starting TTS files cleanup...');
  
  try {
    const files = await fs.readdir(TTS_DIR);
    console.log(`📁 Found ${files.length} files in TTS directory`);
    
    let cleaned = 0;
    let errors = 0;
    
    for (const file of files) {
      const filePath = path.join(TTS_DIR, file);
      
      try {
        const stats = await fs.stat(filePath);
        
        // Remove files that are 0 bytes or older than 1 hour
        const isOld = Date.now() - stats.mtimeMs > 60 * 60 * 1000; // 1 hour
        const isEmpty = stats.size === 0;
        
        if (isEmpty || isOld) {
          await fs.unlink(filePath);
          cleaned++;
          
          if (cleaned % 50 === 0) {
            console.log(`🗑️  Cleaned ${cleaned} files...`);
          }
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
    
    console.log(`✅ Cleanup completed!`);
    console.log(`   - Files cleaned: ${cleaned}`);
    console.log(`   - Errors: ${errors}`);
    console.log(`   - Remaining files: ${files.length - cleaned}`);
    
  } catch (error) {
    console.error('❌ Failed to cleanup TTS files:', error.message);
  }
}

// Run cleanup
cleanupTTSFiles();