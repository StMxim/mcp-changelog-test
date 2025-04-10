const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Конфигурация
const CONFIG = {
  outputFile: 'CHANGELOG.md',
  dateFormat: { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
};

/**
 * Получает логи Git с последнего тега или начала репозитория
 */
function getGitLogs() {
  try {
    // Получаем последний тег, если есть
    let sinceTag = '';
    try {
      const latestTag = execSync('git describe --tags --abbrev=0').toString().trim();
      sinceTag = `${latestTag}..HEAD`;
    } catch (e) {
      // Нет тегов, получаем все изменения
      sinceTag = '';
    }
    
    // Формат: хеш, автор, дата, сообщение, затронутые файлы
    const command = `git log ${sinceTag} --pretty=format:"%h|%an|%ad|%s" --date=iso --name-only`;
    return execSync(command).toString().trim();
  } catch (error) {
    console.error('Ошибка при получении Git логов:', error.message);
    return '';
  }
}

/**
 * Группирует изменения по категориям на основе затронутых файлов
 */
function categorizeChanges(gitLogs) {
  if (!gitLogs) return {};

  const entries = gitLogs.split('\n\n');
  const changes = {};
  
  entries.forEach(entry => {
    const lines = entry.split('\n');
    const [hash, author, date, message] = lines[0].split('|');
    const files = lines.slice(1).filter(Boolean);
    
    if (files.length === 0) return;
    
    // Группируем файлы по директориям
    files.forEach(file => {
      const dir = path.dirname(file);
      const category = dir === '.' ? 'Root' : dir;
      
      if (!changes[category]) {
        changes[category] = [];
      }
      
      changes[category].push({
        hash,
        author,
        date: new Date(date),
        message,
        file: path.basename(file)
      });
    });
  });
  
  return changes;
}

/**
 * Генерирует Markdown для changelog
 */
function generateChangelog(changes) {
  if (Object.keys(changes).length === 0) {
    return '# Changelog\n\nНет изменений для отображения.\n';
  }
  
  let markdown = '# Changelog\n\n';
  markdown += `*Сгенерировано: ${new Date().toLocaleString('ru-RU', CONFIG.dateFormat)}*\n\n`;
  
  // Для каждой категории (директории)
  Object.keys(changes).sort().forEach(category => {
    markdown += `## ${category}\n\n`;
    
    // Группируем изменения по коммитам для избежания дубликатов
    const commitMap = {};
    
    changes[category].forEach(change => {
      if (!commitMap[change.hash]) {
        commitMap[change.hash] = {
          ...change,
          files: [change.file]
        };
      } else {
        if (!commitMap[change.hash].files.includes(change.file)) {
          commitMap[change.hash].files.push(change.file);
        }
      }
    });
    
    // Сортируем по дате (сначала новые)
    const commits = Object.values(commitMap).sort((a, b) => b.date - a.date);
    
    commits.forEach(commit => {
      const date = commit.date.toLocaleString('ru-RU', CONFIG.dateFormat);
      markdown += `- **${commit.message}** (${date})\n`;
      markdown += `  - Файлы: ${commit.files.join(', ')}\n`;
      markdown += `  - Автор: ${commit.author}\n`;
      markdown += `  - Коммит: \`${commit.hash}\`\n\n`;
    });
  });
  
  return markdown;
}

/**
 * Записывает changelog в файл
 */
function writeChangelog(content) {
  try {
    fs.writeFileSync(CONFIG.outputFile, content);
    console.log(`Changelog сгенерирован: ${CONFIG.outputFile}`);
  } catch (error) {
    console.error('Ошибка при записи файла:', error.message);
  }
}

/**
 * Основная функция
 */
function main() {
  console.log('Генерация changelog...');
  
  const gitLogs = getGitLogs();
  const changes = categorizeChanges(gitLogs);
  const markdown = generateChangelog(changes);
  
  writeChangelog(markdown);
}

// Запуск скрипта
main(); 