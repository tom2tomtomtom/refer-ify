/**
 * Manual Testing Script for User Role Verification
 * 
 * This script can be run in the browser console to quickly test
 * user login flows and page accessibility for all roles.
 * 
 * Usage:
 * 1. Open http://localhost:3000 in your browser
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to execute
 * 
 * The script will automatically test all user roles and report results.
 */

(function() {
    console.log('%c🚀 Starting Comprehensive User Role Testing', 'background: #0066cc; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    
    const TEST_USERS = [
        { email: 'client@test.com', password: 'testpass123', role: 'client', dashboard: '/client' },
        { email: 'founding@test.com', password: 'testpass123', role: 'founding', dashboard: '/founding' },
        { email: 'select@test.com', password: 'testpass123', role: 'select', dashboard: '/select-circle' },
        { email: 'candidate@test.com', password: 'testpass123', role: 'candidate', dashboard: '/candidate' }
    ];

    const PAGES_TO_TEST = {
        client: [
            '/client', '/client/jobs', '/client/jobs/new', '/client/candidates',
            '/client/analytics', '/client/ai-insights', '/client/billing',
            '/client/settings', '/client/profile', '/client/help'
        ],
        founding: [
            '/founding', '/founding/referrals', '/founding/network', '/founding/invite',
            '/founding/revenue', '/founding/advisory', '/founding/settings', 
            '/founding/profile', '/founding/help'
        ],
        select: [
            '/select-circle', '/select-circle/referrals', '/select-circle/network',
            '/select-circle/earnings', '/select-circle/job-opportunities',
            '/select-circle/settings', '/select-circle/profile', '/select-circle/help'
        ],
        candidate: [
            '/candidate', '/candidate/settings', '/candidate/profile', '/candidate/help'
        ]
    };

    let testResults = [];

    // Helper function to test if a page exists
    async function testPageExists(url) {
        try {
            const response = await fetch(url);
            return {
                url: url,
                status: response.status,
                exists: response.status === 200,
                redirected: response.redirected,
                finalUrl: response.url
            };
        } catch (error) {
            return {
                url: url,
                status: 0,
                exists: false,
                error: error.message
            };
        }
    }

    // Helper function to attempt login with demo role
    function loginWithDemoRole(role) {
        console.log(`%c🔐 Testing demo login for ${role}`, 'color: #0066cc; font-weight: bold;');
        
        // Navigate to login page
        window.location.href = '/login';
        
        // Note: This would require manual interaction or more complex automation
        // For now, we'll just test page accessibility
        return Promise.resolve(true);
    }

    // Main testing function
    async function runTests() {
        console.log('%c📋 Testing Page Accessibility (No Auth Required)', 'background: #28a745; color: white; padding: 4px 8px; border-radius: 4px;');
        
        // Test all pages without authentication first
        for (const role of Object.keys(PAGES_TO_TEST)) {
            console.log(`%c\n🎯 Testing ${role.toUpperCase()} pages:`, 'font-weight: bold; color: #6f42c1;');
            
            const roleResults = {
                role: role,
                pages: [],
                summary: { total: 0, existing: 0, missing: 0, errors: 0 }
            };

            for (const pageUrl of PAGES_TO_TEST[role]) {
                const result = await testPageExists(pageUrl);
                roleResults.pages.push(result);
                roleResults.summary.total++;
                
                if (result.exists) {
                    roleResults.summary.existing++;
                    console.log(`   ✅ ${pageUrl} - EXISTS (${result.status})`);
                } else if (result.status === 404) {
                    roleResults.summary.missing++;
                    console.log(`   ❌ ${pageUrl} - NOT FOUND (404)`);
                } else if (result.redirected && result.finalUrl.includes('/login')) {
                    roleResults.summary.existing++;
                    console.log(`   🔒 ${pageUrl} - PROTECTED (redirects to login)`);
                } else {
                    roleResults.summary.errors++;
                    console.log(`   ⚠️  ${pageUrl} - ERROR (${result.status}) ${result.error || ''}`);
                }
                
                // Small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            testResults.push(roleResults);
        }

        // Generate summary report
        console.log('%c\n📊 COMPREHENSIVE TESTING SUMMARY', 'background: #dc3545; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
        console.log('='.repeat(50));

        let totalPages = 0, totalExisting = 0, totalMissing = 0, totalErrors = 0;

        testResults.forEach(roleResult => {
            console.log(`\n📋 ${roleResult.role.toUpperCase()} ROLE:`);
            console.log(`   Total Pages: ${roleResult.summary.total}`);
            console.log(`   ✅ Existing: ${roleResult.summary.existing}`);
            console.log(`   ❌ Missing: ${roleResult.summary.missing}`);
            console.log(`   ⚠️  Errors: ${roleResult.summary.errors}`);
            
            totalPages += roleResult.summary.total;
            totalExisting += roleResult.summary.existing;
            totalMissing += roleResult.summary.missing;
            totalErrors += roleResult.summary.errors;
        });

        console.log('\n' + '='.repeat(50));
        console.log('🌟 OVERALL SUMMARY:');
        console.log(`   Total Pages Tested: ${totalPages}`);
        console.log(`   ✅ Working Pages: ${totalExisting}`);
        console.log(`   ❌ Missing Pages: ${totalMissing}`);
        console.log(`   ⚠️  Error Pages: ${totalErrors}`);
        console.log(`   Success Rate: ${Math.round((totalExisting / totalPages) * 100)}%`);
        
        // Critical issues
        const criticalIssues = [];
        testResults.forEach(roleResult => {
            // Check if main dashboard exists
            const mainDashboard = roleResult.pages.find(p => p.url === `/${roleResult.role === 'select' ? 'select-circle' : roleResult.role}`);
            if (!mainDashboard || !mainDashboard.exists) {
                criticalIssues.push(`${roleResult.role} main dashboard missing`);
            }
        });

        if (criticalIssues.length > 0) {
            console.log('\n%c🚨 CRITICAL ISSUES:', 'background: #dc3545; color: white; padding: 4px 8px;');
            criticalIssues.forEach(issue => console.log(`   - ${issue}`));
        }

        console.log('\n%c✅ Testing Complete!', 'background: #28a745; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
        console.log('📝 Detailed results are stored in the testResults variable');
        console.log('💡 Run "testResults" in console to see full details');

        // Make results available globally
        window.testResults = testResults;
    }

    // Additional helper functions for manual testing
    window.quickTest = async function(url) {
        console.log(`🔍 Quick testing: ${url}`);
        const result = await testPageExists(url);
        console.log(result);
        return result;
    };

    window.testLoginFlow = function() {
        console.log('%c🔐 Manual Login Flow Testing', 'background: #6f42c1; color: white; padding: 4px 8px;');
        console.log('Navigate to /login and test the following:');
        console.log('1. Email/password login with test users');
        console.log('2. Demo role buttons (development only)');
        console.log('3. LinkedIn OAuth flow');
        console.log('4. Error handling for invalid credentials');
        window.open('/login', '_blank');
    };

    window.testRoleAccess = async function(role) {
        const pages = PAGES_TO_TEST[role] || [];
        console.log(`🎯 Testing all ${role} pages:`);
        for (const page of pages) {
            const result = await quickTest(page);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    // Start the tests
    runTests().catch(error => {
        console.error('❌ Testing failed:', error);
    });

    // Instructions
    console.log('\n%c📝 Available Commands:', 'font-weight: bold; color: #fd7e14;');
    console.log('• testResults - View detailed test results');
    console.log('• quickTest(url) - Test a specific URL');
    console.log('• testLoginFlow() - Open login page for manual testing');
    console.log('• testRoleAccess(role) - Test all pages for a specific role');
    console.log('• Example: testRoleAccess("client")');

})();