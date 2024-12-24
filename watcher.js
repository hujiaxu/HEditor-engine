const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar') ;

const SRC = '/src'

const BASE_DIRECTORY_TO_WATCH = __dirname + SRC; // 当前文件所在目录
const INDEX_FILE_NAME = 'index.ts';   // 要生成的索引文件名称
const IGNORE_FILES = [INDEX_FILE_NAME, 'index', path.basename(__filename)]; // 忽略index文件自身和本脚本文件

const EXPORT_ALL_DIRECTORY = ['type', 'utils']

const getFilesAndDirectories = (directoryPath = BASE_DIRECTORY_TO_WATCH) => {
  // 同步方式读取当前目录所有条目
  const entries = fs.readdirSync(directoryPath);
  const files = [];
  const directories = [];
  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry);
    const stats = fs.statSync(entryPath);
  
    if (stats.isFile()) {
      files.push(entry);
    } else if (stats.isDirectory()) {
      directories.push(entry);
    }
  }

  return {
    files,
    directories
  }
  
}

const recursionFiles = (directoryPath = BASE_DIRECTORY_TO_WATCH, filesPath = []) => {
  const { files, directories } = getFilesAndDirectories(directoryPath);
  // filesPath.push(...files);
  filesPath.push(...files.map(file => path.join(directoryPath, file)));
  for (const directory of directories) {
    recursionFiles(path.join(directoryPath, directory), filesPath);
  }
  return filesPath
}


function updateIndexFile() {


  const { directories } = getFilesAndDirectories();

  for (const directory of directories) {
    const DIRECTORY_TO_WATCH = BASE_DIRECTORY_TO_WATCH + '/' + directory;
    const filesPath = recursionFiles(DIRECTORY_TO_WATCH)

    let outputContent = ''

    let importContent = ''
    let exportObject = 'export' + '{\n'
    const relativePathWithoutExtensions = []
    for (const filePath of filesPath) {
      const relativePath = path.relative(DIRECTORY_TO_WATCH, filePath);
      const relativePathWithoutExtension = relativePath.replace(path.extname(relativePath), '');
      const fileName = path.basename(relativePathWithoutExtension);
      if (IGNORE_FILES.includes(fileName) || relativePathWithoutExtensions.includes(relativePathWithoutExtension)) {
        continue
      }
      
      relativePathWithoutExtensions.push(relativePathWithoutExtension)

      if (EXPORT_ALL_DIRECTORY.includes(directory)) {
        outputContent += `export * from './${relativePathWithoutExtension}';\n`

      } else {
        importContent += `
import ${fileName} from './${relativePathWithoutExtension}';
        `

        exportObject += fileName + ',\n'
      }
    }
    // 构造要写入的内容
  
    if (EXPORT_ALL_DIRECTORY.includes(directory)) {
      fs.writeFileSync(path.join(DIRECTORY_TO_WATCH, INDEX_FILE_NAME), outputContent, 'utf8');
    } else {
      fs.writeFileSync(path.join(DIRECTORY_TO_WATCH, 'index.ts'), importContent + '\n' + exportObject + '};', 'utf8');
    }
    // console.log(`Index file updated with ${files.length} file(s).`);
  }
}

// 初次运行时先更新一次
updateIndexFile();

// 使用 chokidar 监听目录变化（增加、删除文件）
const watcher = chokidar.watch(BASE_DIRECTORY_TO_WATCH, {
  persistent: true,
  ignoreInitial: true,  // 不对初始状态触发事件
});

// 文件新增或者删除事件时触发更新
watcher
  .on('add', (file) => {
    console.log(`File added: ${file}`);
    updateIndexFile();
  })
  .on('unlink', (file) => {
    console.log(`File removed: ${file}`);
    updateIndexFile();
  })
  .on('error', (error) => console.error(`Watcher error: ${error}`));
