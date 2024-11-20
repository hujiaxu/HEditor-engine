const fs = require('fs')
const path = require('path')

const glslDir = path.join(__dirname, 'src', 'Shaders') // GLSL 文件所在目录
const outputDir = path.join(__dirname, 'src', 'Shaders') // 输出的 TypeScript 文件目录

// 确保输出目录存在
fs.mkdirSync(outputDir, { recursive: true })

// 读取 GLSL 目录中的所有文件
fs.readdirSync(glslDir).forEach((file) => {
  if (path.extname(file) === '.glsl') {
    const shaderPath = path.join(glslDir, file)
    const shaderCode = fs.readFileSync(shaderPath, 'utf8')

    // 转义反引号和美元符号，以避免模板字符串中的语法错误
    const escapedShaderCode = shaderCode
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')

    const tsContent = `const shaderSource = \`${escapedShaderCode}\`;\nexport default shaderSource;\n`
    const outputFileName = `${path.basename(file, '.glsl')}.ts`
    const outputPath = path.join(outputDir, outputFileName)

    fs.writeFileSync(outputPath, tsContent)
    console.log(`已生成 ${outputFileName}`)
  }
})
