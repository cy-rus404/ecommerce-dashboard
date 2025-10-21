const fs = require('fs');
const path = require('path');

const adminPages = [
  'src/app/admin/analytics/page.tsx',
  'src/app/admin/bulk-upload/page.tsx', 
  'src/app/admin/customer-management/page.tsx',
  'src/app/admin/delivery-zones/page.tsx',
  'src/app/admin/manage-admins/page.tsx',
  'src/app/admin/manage-users/page.tsx',
  'src/app/admin/orders/page.tsx',
  'src/app/admin/view-products/page.tsx'
];

const authCheckPattern = /useEffect\(\(\) => \{[\s\S]*?const checkAuth = async \(\) => \{[\s\S]*?\};[\s\S]*?checkAuth\(\);[\s\S]*?\}, \[router\]\);/;

const newAuthCheck = `useEffect(() => {
    const initAuth = async () => {
      const authResult = await UniversalAuth.checkAuth(router);
      if (authResult) {
        setUser(authResult.user);
        setLoading(false);
      }
    };
    initAuth();
  }, [router]);`;

const importPattern = /import.*from.*supabase.*\n/;
const newImport = `import { UniversalAuth } from '../../../lib/universalAuth';\n`;

adminPages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Add import
    if (!content.includes('UniversalAuth')) {
      content = content.replace(importPattern, match => match + newImport);
    }
    
    // Replace auth check
    if (authCheckPattern.test(content)) {
      content = content.replace(authCheckPattern, newAuthCheck);
    }
    
    fs.writeFileSync(pagePath, content);
    console.log(`Updated: ${pagePath}`);
  }
});

console.log('Auth update complete!');