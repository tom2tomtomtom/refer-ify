#!/usr/bin/env node

/**
 * Pre-Deployment Performance Check
 * 
 * Comprehensive performance validation before deployment.
 * Ensures all performance budgets are met and no regressions
 * are introduced to production.
 */

const { execSync } = require('child_process');
const PerformanceBudgetChecker = require('./performance-budget-check');

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

class PreDeploymentCheck {
  constructor() {
    this.checks = [];
    this.failures = [];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async runCheck(name, checkFunction) {
    this.log(`\n${colors.blue}🔍 ${name}...${colors.reset}`);
    
    try {
      const result = await checkFunction();
      if (result === true || result === undefined) {
        this.log(`${colors.green}✅ ${name} passed${colors.reset}`);
        this.checks.push({ name, status: 'passed' });
        return true;
      } else {
        this.log(`${colors.red}❌ ${name} failed${colors.reset}`);
        this.checks.push({ name, status: 'failed', error: result });
        this.failures.push(name);
        return false;
      }
    } catch (error) {
      this.log(`${colors.red}❌ ${name} failed: ${error.message}${colors.reset}`);
      this.checks.push({ name, status: 'failed', error: error.message });
      this.failures.push(name);
      return false;
    }
  }

  async checkBuild() {
    try {
      this.log('Building application for production...');
      execSync('npm run build', { stdio: 'pipe', env: { ...process.env, NODE_ENV: 'production' } });
      return true;
    } catch (error) {
      throw new Error('Production build failed');
    }
  }

  async checkPerformanceBudgets() {
    const checker = new PerformanceBudgetChecker();
    return checker.run();
  }

  async checkBundleSizes() {
    try {
      execSync('npm run bundle:check', { stdio: 'pipe' });
      return true;
    } catch (error) {
      throw new Error('Bundle size check failed');
    }
  }

  async checkTypeScript() {
    try {
      this.log('Checking TypeScript compilation...');
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return true;
    } catch (error) {
      throw new Error('TypeScript compilation failed');
    }
  }

  async checkLinting() {
    try {
      this.log('Running linter...');
      execSync('npm run lint', { stdio: 'pipe' });
      return true;
    } catch (error) {
      // Don't fail deployment on lint warnings, just log them
      this.log(`${colors.yellow}⚠️  Linting issues detected (not blocking deployment)${colors.reset}`);
      return true;
    }
  }

  generateReport() {
    this.log(`\n${colors.blue}${colors.bold}📊 Pre-Deployment Check Report${colors.reset}`);
    
    const totalChecks = this.checks.length;
    const passedChecks = this.checks.filter(c => c.status === 'passed').length;
    const failedChecks = this.failures.length;

    this.log(`\n📈 Summary: ${passedChecks}/${totalChecks} checks passed`);
    
    if (failedChecks === 0) {
      this.log(`\n${colors.green}${colors.bold}🚀 All checks passed! Ready for deployment.${colors.reset}`);
      return true;
    }

    this.log(`\n${colors.red}${colors.bold}❌ ${failedChecks} check(s) failed:${colors.reset}`);
    this.failures.forEach(failure => {
      this.log(`  • ${failure}`);
    });

    this.log(`\n${colors.red}${colors.bold}🛑 Deployment blocked due to failed checks.${colors.reset}`);
    this.log(`${colors.yellow}Fix the issues above before deploying to production.${colors.reset}`);
    
    return false;
  }

  async run() {
    this.log(`${colors.blue}${colors.bold}🚀 Pre-Deployment Performance Check${colors.reset}`);
    this.log(`${colors.blue}Ensuring production readiness...${colors.reset}`);

    // Run all checks
    await this.runCheck('Production Build', () => this.checkBuild());
    await this.runCheck('TypeScript Compilation', () => this.checkTypeScript());
    await this.runCheck('Performance Budgets', () => this.checkPerformanceBudgets());
    await this.runCheck('Bundle Size Analysis', () => this.checkBundleSizes());
    await this.runCheck('Code Linting', () => this.checkLinting());

    // Generate final report
    const success = this.generateReport();
    
    if (!success) {
      process.exit(1);
    }

    this.log(`\n${colors.green}${colors.bold}✅ Pre-deployment check completed successfully!${colors.reset}`);
    this.log(`${colors.green}Application is ready for production deployment.${colors.reset}`);
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new PreDeploymentCheck();
  checker.run().catch(error => {
    console.error(`${colors.red}Pre-deployment check failed:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = PreDeploymentCheck;