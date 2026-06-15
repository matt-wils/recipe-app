# Recipe photos

Drop recipe images here (jpg/png) and reference them by **filename** in `recipes.yaml`:

```yaml
- name: Shredded chicken, beans & rice
  photo: shredded-chicken-beans-rice.jpg
```

They're served from `/recipe-app/recipe-photos/<filename>` and cached offline by the PWA.
Keep them reasonably small (e.g. ≤ 1600px wide) since they ship with the app.

## Placeholders

`placeholders/` holds generic per-category artwork (chicken, beef, fish, veg, …)
shown for any recipe that doesn't have its own `photo:` yet — see the comment in
`src/data/library.ts`. Adding a real `photo:` for a recipe overrides its
placeholder automatically. Once every recipe has a real photo, the folder and
that helper can go.
