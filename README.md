# MCP Changelog Generator

Скрипт для автоматического создания changelog на основе истории Git-коммитов.

## Возможности

- Анализирует Git-коммиты и находит измененные файлы
- Группирует изменения по директориям
- Генерирует CHANGELOG.md в формате Markdown
- Отображает автора, дату, сообщение коммита и затронутые файлы
- **НОВОЕ:** Поддержка веток и детальный просмотр изменений

## Установка

```bash
npm install
```

## Использование

Для генерации changelog выполните:

```bash
npm run changelog
```

Файл CHANGELOG.md будет создан в корневой директории проекта.

## Интеграция с Git Hooks

Для автоматической генерации changelog при каждом коммите добавьте в `.git/hooks/post-commit`:

```bash
#!/bin/sh
npm run changelog
git add CHANGELOG.md
git commit --amend --no-edit
```

Не забудьте сделать файл исполняемым:

```bash
chmod +x .git/hooks/post-commit
```

## Конфигурация

Настройки находятся в начале файла `changelog.js`:

- `outputFile`: имя выходного файла
- `dateFormat`: формат даты для отображения

## Требования

- Node.js >=12.0.0
- Git

## Работа с ветками

Для включения изменений из разных веток в changelog, выполните:

```bash
git checkout main
git merge feature --no-ff
npm run changelog
``` 