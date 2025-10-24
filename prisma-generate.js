require('dotenv').config()
require('child_process').execSync('npx prisma generate', { stdio: 'inherit' })
