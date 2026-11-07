#!/bin/bash
cd /home/z/my-project/public/uploads
z-ai image -p "Professional photography of an adorable freshly groomed white maltese dog wrapped in a soft pink towel, sparkling clean fur, happy expression, warm cream colored studio background with soft pink tones, premium pet grooming salon, high quality, detailed, soft natural lighting" -o hero.png -s 864x1152
z-ai image -p "Professional photography of a small white dog taking a bath with gentle shampoo foam, groomer hands washing carefully, bright modern pet grooming salon, cream and soft pink tones, high quality, detailed" -o service-banho.png -s 1024x1024
z-ai image -p "Professional photography of a relaxed happy shih tzu dog enjoying pet spa treatment with fluffy towel and gentle brush, calm premium pet spa, soft pink and cream tones, high quality" -o service-spa.png -s 1024x1024
z-ai image -p "Professional photography of an apricot curly poodle dog with long untrimmed scruffy overgrown fur before grooming, messy fur covering eyes, plain neutral studio background, high quality, detailed" -o antes.png -s 1024x1024
echo "BATCH_A_DONE"
