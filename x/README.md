# Procès verbaux de la ville de Troyes

Liste détaillée des procès verbaux. Le but est de pouvoir chercher les
différentes décisions prises sur une thèmatique donnée.

```sh
deno run --allow-write=public --allow-read=. index.ts
```

Les fichiers détaillant les procès verbaux sont dans le format de texte suivant:

1. Une ligne d'information: page, code du dossier et des étiquettes le tout
   séparé par des espaces. Les étiquettes doivent être présentes si le therme
   n'est ni présent dans le titre ni dans le texte.
2. Une ligne comportant le titre du dossier
3. Des lignes (non vide) de texte: le sous-titre et des titres de parties.
4. Une ligne vide de séparation
