const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up ProductivePro for local development...');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created uploads directory');
}

// Check if Python is available
function checkPython() {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', ['--version']);
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✓ Python3 is available');
        resolve(true);
      } else {
        console.log('⚠ Python3 not found, trying python...');
        const pythonProcess2 = spawn('python', ['--version']);
        pythonProcess2.on('close', (code2) => {
          if (code2 === 0) {
            console.log('✓ Python is available');
            resolve(true);
          } else {
            console.log('✗ Python not found. Please install Python to use PDF features.');
            resolve(false);
          }
        });
        pythonProcess2.on('error', () => resolve(false));
      }
    });
    pythonProcess.on('error', () => {
      console.log('⚠ Python3 not found, trying python...');
      const pythonProcess2 = spawn('python', ['--version']);
      pythonProcess2.on('close', (code2) => {
        resolve(code2 === 0);
      });
      pythonProcess2.on('error', () => resolve(false));
    });
  });
}

// Install Python dependencies
function installPythonDeps() {
  return new Promise((resolve) => {
    console.log('Installing Python dependencies...');
    const pipProcess = spawn('pip', ['install', 'pdfplumber', 'pypdf2', 'trafilatura']);
    
    pipProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    pipProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✓ Python dependencies installed');
        resolve(true);
      } else {
        console.log('⚠ Failed to install with pip, trying pip3...');
        const pip3Process = spawn('pip3', ['install', 'pdfplumber', 'pypdf2', 'trafilatura']);
        pip3Process.on('close', (code2) => {
          if (code2 === 0) {
            console.log('✓ Python dependencies installed with pip3');
            resolve(true);
          } else {
            console.log('✗ Failed to install Python dependencies. PDF features may not work.');
            resolve(false);
          }
        });
        pip3Process.on('error', () => {
          console.log('✗ pip3 not found. PDF features may not work.');
          resolve(false);
        });
      }
    });
    
    pipProcess.on('error', () => {
      console.log('⚠ pip not found, trying pip3...');
      const pip3Process = spawn('pip3', ['install', 'pdfplumber', 'pypdf2', 'trafilatura']);
      pip3Process.on('close', (code2) => {
        resolve(code2 === 0);
      });
      pip3Process.on('error', () => resolve(false));
    });
  });
}

async function setup() {
  const pythonAvailable = await checkPython();
  
  if (pythonAvailable) {
    await installPythonDeps();
  }
  
  console.log('\n🚀 Setup complete! You can now run:');
  console.log('   npm start');
  console.log('\nThe app will be available at: http://localhost:5000');
}

setup();