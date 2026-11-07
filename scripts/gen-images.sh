#!/bin/bash
cd /home/z/my-project/public/uploads

z-ai image -p "Professional photography of an adorable freshly groomed white maltese dog wrapped in a soft pink towel, sparkling clean fur, happy expression, warm cream colored studio background with soft pink tones, premium pet grooming salon, high quality, detailed, soft natural lighting" -o hero.png -s 864x1152
z-ai image -p "Professional photography of a small white dog taking a bath with gentle shampoo foam, groomer hands washing carefully, bright modern pet grooming salon, cream and soft pink tones, high quality, detailed" -o service-banho.png -s 1024x1024
z-ai image -p "Professional photography of a pet groomer carefully trimming a fluffy toy poodle fur with round scissors in a premium pet salon, warm soft lighting, cream and rose gold tones, high quality, detailed" -o service-tosa.png -s 1024x1024
z-ai image -p "Professional photography of a relaxed happy shih tzu dog enjoying pet spa treatment with fluffy towel and gentle brush, cucumber aesthetic, calm premium pet spa, soft pink and cream tones, high quality" -o service-spa.png -s 1024x1024
z-ai image -p "Professional photography of a perfectly groomed shih tzu dog with neat round haircut wearing a cute rose colored bandana, sitting on pastel pink background, pet grooming result, high quality, detailed" -o gallery-1.png -s 1024x1024
z-ai image -p "Professional photography of a clean fluffy golden retriever puppy after bath, shiny soft fur, sitting in bright modern pet salon with warm cream tones, joyful expression, high quality, detailed" -o gallery-2.png -s 1024x1024
z-ai image -p "Professional photography of an apricot curly poodle dog with long untrimmed scruffy overgrown fur before grooming, messy fur covering eyes, plain neutral studio background, high quality, detailed" -o antes.png -s 1024x1024
z-ai image -p "Professional photography of an apricot curly poodle dog with a perfect teddy bear grooming cut, fluffy neat round face, freshly trimmed, sitting on pastel pink studio background, happy expression, high quality, detailed" -o depois.png -s 1024x1024
echo "ALL_IMAGES_DONE"
