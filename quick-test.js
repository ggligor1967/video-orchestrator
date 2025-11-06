// Quick endpoint test
import http from 'http';

const test = (path) => new Promise((resolve, reject) => {
  http.get(`http://127.0.0.1:4545${path}`, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try { resolve(JSON.parse(data)); } 
      catch (e) { reject(e); }
    });
  }).on('error', reject);
});

console.log('\n🧪 RAPID API TEST\n');

test('/auto-captions/languages')
  .then(r => {
    console.log('✅ Auto-Captions Languages:', r.languages?.length || 0);
    return test('/auto-captions/styles');
  })
  .then(r => {
    console.log('✅ Caption Styles:', r.styles?.length || 0);
    return test('/templates/marketplace');
  })
  .then(r => {
    console.log('✅ Templates Marketplace:', r.templates?.length || 0);
    r.templates?.forEach(t => console.log(`   - ${t.name} (${t.price === 0 ? 'FREE' : '$'+t.price})`));
    return test('/templates/marketplace/featured');
  })
  .then(r => {
    console.log('✅ Featured Templates:', r.templates?.length || 0);
    console.log('\n🎉 ALL TESTS PASSED!\n');
    process.exit(0);
  })
  .catch(e => {
    console.error('❌ TEST FAILED:', e.message);
    process.exit(1);
  });
