#!/usr/bin/env node

/**
 * Test des URLs d'uploads
 * Vérifie que les URLs ne contiennent pas de doublons /api/api
 */

const SERVER_ENV = 'prod';

// Configuration
const API_BASE_URL = SERVER_ENV === 'prod'
  ? 'https://cambizzle.seed-innov.com/api'
  : 'http://localhost:8080/api';

const SERVER_BASE_URL = SERVER_ENV === 'prod'
  ? 'https://cambizzle.seed-innov.com/api'
  : 'http://localhost:8080/api';

// Test cases
const testCases = [
  {
    name: 'Avatar upload',
    path: 'uploads/avatars/user123.jpg',
    expected: 'https://cambizzle.seed-innov.com/api/uploads/avatars/user123.jpg'
  },
  {
    name: 'Ad image upload',
    path: 'uploads/ads/ad456.png',
    expected: 'https://cambizzle.seed-innov.com/api/uploads/ads/ad456.png'
  },
  {
    name: 'Category icon',
    path: '/uploads/categories/icon.svg',
    expected: 'https://cambizzle.seed-innov.com/api/uploads/categories/icon.svg'
  },
  {
    name: 'Document upload (with /api prefix)',
    path: '/api/uploads/documents/doc.pdf',
    expected: 'https://cambizzle.seed-innov.com/api/uploads/documents/doc.pdf'
  }
];

// Helper function similar to getPhotoUrl
function getPhotoUrl(photoPath) {
  if (!photoPath) return null;
  
  // Si l'URL est déjà complète (commence par http), la retourner telle quelle
  if (photoPath.startsWith('http')) {
    let cleanUrl = photoPath;
    cleanUrl = cleanUrl.replace(/^http:\/\//, 'https://');
    cleanUrl = cleanUrl.replace('www.cambizzle.seed-innov.com', 'cambizzle.seed-innov.com');
    cleanUrl = cleanUrl.replace(/\/api\/home\/[^\/]+\/public_html\/cambizzle\/api\//, '/api/');
    
    if (cleanUrl.includes('cambizzle.seed-innov.com') && !cleanUrl.startsWith('https://cambizzle.seed-innov.com/')) {
      const pathPart = cleanUrl.split('cambizzle.seed-innov.com')[1] || '';
      cleanUrl = `https://cambizzle.seed-innov.com${pathPart}`;
    }
    
    return cleanUrl;
  }
  
  if (photoPath.startsWith('data:')) return photoPath;
  if (photoPath.startsWith('blob:')) return photoPath;
  
  let cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;

  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  return `${SERVER_BASE_URL}${cleanPath}`.replace(/\/+/g, '/').replace('https:/', 'https://').replace('http:/', 'http://');
}

console.log('\n=== TEST DES URLs D\'UPLOADS ===\n');
console.log(`Environment: ${SERVER_ENV}`);
console.log(`API_BASE_URL: ${API_BASE_URL}`);
console.log(`SERVER_BASE_URL: ${SERVER_BASE_URL}`);
console.log('\n');

let passed = 0;
let failed = 0;

testCases.forEach(testCase => {
  const result = getPhotoUrl(testCase.path);
  const success = result === testCase.expected;
  
  console.log(`[${success ? '✓' : '✗'}] ${testCase.name}`);
  console.log(`    Input:    ${testCase.path}`);
  console.log(`    Expected: ${testCase.expected}`);
  console.log(`    Got:      ${result}`);
  
  // Check for double slashes
  if (result.includes('//') && !result.startsWith('https://') && !result.startsWith('http://')) {
    console.log(`    ⚠️  WARNING: Double slashes detected!`);
    failed++;
  } else if (result.includes('/api/api')) {
    console.log(`    ❌ ERROR: /api/api double found!`);
    failed++;
  } else if (!success) {
    console.log(`    ⚠️  URL mismatch`);
    failed++;
  } else {
    passed++;
  }
  console.log('');
});

console.log(`\n=== RÉSULTATS ===`);
console.log(`✓ Passed: ${passed}/${testCases.length}`);
console.log(`✗ Failed: ${failed}/${testCases.length}`);

if (failed === 0) {
  console.log('\n✅ Tous les tests sont passés!');
  process.exit(0);
} else {
  console.log('\n❌ Certains tests ont échoué!');
  process.exit(1);
}
