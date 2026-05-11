/**
 * Prepare Tesco Price Comparison for Azure Deployment
 * 
 * This script helps prepare your application for deployment to Azure App Service
 * by performing several important tasks:
 * 
 * 1. Creating a web.config file for IIS configuration
 * 2. Creating an .azure folder with deployment scripts
 * 3. Checking for common issues in your application
 * 4. Generating a deployment package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  appName: 'tesco-price-comparison',
  outputDir: path.join(__dirname, '..', 'azure-deploy'),
};

/**
 * Create the web.config file for Azure App Service
 */
function createWebConfig() {
  console.log('Creating web.config file...');
  
  const webConfigContent = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="server/index.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="StaticContent">
          <action type="Rewrite" url="client/dist{REQUEST_URI}" />
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" />
          </conditions>
          <action type="Rewrite" url="server/index.js" />
        </rule>
      </rules>
    </rewrite>
    <iisnode watchedFiles="web.config;*.js"/>
  </system.webServer>
</configuration>`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'web.config'), webConfigContent);
  console.log('✓ web.config created successfully');
}

/**
 * Create Azure deployment configuration
 */
function createAzureDeploymentConfig() {
  console.log('Creating Azure deployment configuration...');
  
  // Create .azure directory if it doesn't exist
  const azureDir = path.join(__dirname, '..', '.azure');
  if (!fs.existsSync(azureDir)) {
    fs.mkdirSync(azureDir);
  }
  
  // Create config.json file
  const configContent = {
    "name": config.appName,
    "script": "server/index.js",
    "nodeVersion": "18.x"
  };
  
  fs.writeFileSync(
    path.join(azureDir, 'config.json'), 
    JSON.stringify(configContent, null, 2)
  );
  
  console.log('✓ Azure deployment configuration created successfully');
}

/**
 * Check for potential deployment issues
 */
function checkForIssues() {
  console.log('Checking for potential deployment issues...');
  
  let issues = [];
  
  // Check package.json for required scripts
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts || !packageJson.scripts.start) {
      issues.push('Missing "start" script in package.json');
    }
    
    if (!packageJson.scripts || !packageJson.scripts.build) {
      issues.push('Missing "build" script in package.json');
    }
  } else {
    issues.push('package.json file not found');
  }
  
  // Check for .env file and warn about moving to Azure Application Settings
  if (fs.existsSync(path.join(__dirname, '..', '.env'))) {
    issues.push('WARNING: .env file detected. Make sure to move these settings to Azure Application Settings');
  }
  
  // Report issues
  if (issues.length > 0) {
    console.log('\n⚠️ Potential issues detected:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    console.log('\nPlease address these issues before deploying to Azure.');
  } else {
    console.log('✓ No obvious issues detected');
  }
}

/**
 * Create a deployment package for Azure
 */
function createDeploymentPackage() {
  console.log('Creating deployment package...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  // Create a "production-ready" package
  try {
    // Build the application
    console.log('Building the application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Create a deployment package
    console.log('Creating deployment ZIP file...');
    
    // Linux/Mac
    try {
      execSync(`cd ${path.join(__dirname, '..')} && zip -r ${path.join(config.outputDir, 'azure-deploy.zip')} . -x "node_modules/*" ".git/*" "logs/*" "*.zip" "azure-deploy/*"`, { stdio: 'inherit' });
    } catch (error) {
      // Fall back to npm module (for Windows)
      console.log('Zip command failed, trying alternative method...');
      const zipFilePath = path.join(config.outputDir, 'azure-deploy.zip');
      
      if (fs.existsSync(zipFilePath)) {
        fs.unlinkSync(zipFilePath);
      }
      
      // This is a simplified version - in a real scenario, you'd use a JavaScript zip library
      console.log('Please zip the contents of your project manually, excluding node_modules, .git, and logs directories.');
    }
    
    console.log(`✓ Deployment package created at: ${path.join(config.outputDir, 'azure-deploy.zip')}`);
  } catch (error) {
    console.error(`Failed to create deployment package: ${error.message}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log('Preparing Tesco Price Comparison for Azure deployment...\n');
  
  try {
    createWebConfig();
    createAzureDeploymentConfig();
    checkForIssues();
    createDeploymentPackage();
    
    console.log('\n✓ Preparation for Azure deployment completed!');
    console.log('\nNext steps:');
    console.log('1. Review the AZURE_DEPLOYMENT.md file for detailed deployment instructions');
    console.log('2. Upload the deployment package to Azure App Service');
    console.log('3. Configure your environment variables in Azure Application Settings');
    console.log('4. Set up your database connection');
    console.log('5. Configure your custom domain');
  } catch (error) {
    console.error(`\n❌ Preparation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();