# Recipe photos

Drop recipe images here (jpg/png) and reference them by **filename** in `recipes.yaml`:

```yaml
- name: Shredded chicken, beans & rice
  photo: shredded-chicken-beans-rice.jpg
```

They're served from `/recipe-app/recipe-photos/<filename>` and cached offline by the PWA.
Keep them reasonably small (e.g. ≤ 1600px wide) since they ship with the app.
