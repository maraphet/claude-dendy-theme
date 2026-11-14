# Sof of Saturn

Тёмно-синяя тема для Claude Code с пиксельной сценой за чатом: Сатурн с кольцами в ночном индиго, мерцающие звёзды, Титан и подпись «SOF OF SATURN» пиксельным шрифтом. Интерфейс — глубокий индиго с небесно-синим акцентом.

Мод называется `dendy-8bit` — имя осталось от первой версии.

Тема рисуется в десктопном и мобильном приложении Claude (вкладка Code). В терминале и редакторах оформление не меняется.

## Установка

В строке ввода терминальной сессии Claude Code:

```
/plugin install dendy-8bit --marketplace maraphet/claude-dendy-theme
```

Затем `y`, чтобы добавить маркетплейс, и выберите область установки (user — чтобы тема работала во всех сессиях).

Из командной строки:

```
claude plugin install dendy-8bit --marketplace maraphet/claude-dendy-theme
```

В десктопном приложении, где `/plugin` не работает: нажмите + рядом с полем ввода, затем Plugins → Add marketplace → `maraphet/claude-dendy-theme` → Add plugin.

## Настройка

Все цвета и сцена — в `hooks/register.tsx`:

- `makeColors({ ... })` — палитра интерфейса и подсветки кода;
- `STRIPES`, `ring(...)`, `moons` — планета, кольца и спутники;
- `CAPTION` — текст подписи под планетой (в шрифте `FONT` есть буквы S, O, F, A, T, U, R, N);
- `glass` в `LOOK` — плотность вуали под панелями (`opacity` от 0 до 1).

Файлы `hooks/make-colors.js` и `hooks/make-colors.d.ts` — помощник из набора для создания модов Claude Code, менять их не нужно.
