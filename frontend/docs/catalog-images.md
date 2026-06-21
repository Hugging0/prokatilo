# Catalog images

Фото товаров для каталога хранятся в `frontend/public/uploads/catalog/items`.

## Как добавить фото

1. Положить исходные изображения в `frontend/public/uploads/catalog/source`.
2. Запустить:

```bash
cd frontend
npm run catalog:images
```

3. В операторской панели вставить URL из вывода команды, например:

```text
/uploads/catalog/items/playstation-5.webp
```

Исходники из `source` не коммитятся. Готовые `.webp` из `items` коммитятся и попадают на VPS при deploy.

## Формат

Скрипт делает квадрат `960x960`, `object-cover`-кадрирование по центру и WebP quality `86`. Такой формат подходит для маленьких карточек каталога и экрана товара.
