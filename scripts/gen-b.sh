#!/bin/bash
cd /home/z/my-project/public/uploads
z-ai image -p "Professional photography of a pet groomer carefully trimming a fluffy toy poodle fur with round scissors in a premium pet salon, warm soft lighting, cream and rose gold tones, high quality, detailed" -o service-tosa.png -s 1024x1024
z-ai image -p "Professional photography of a perfectly groomed shih tzu dog with neat round haircut wearing a cute rose colored bandana, sitting on pastel pink background, pet grooming result, high quality, detailed" -o gallery-1.png -s 1024x1024
z-ai image -p "Professional photography of a clean fluffy golden retriever puppy after bath, shiny soft fur, sitting in bright modern pet salon with warm cream tones, joyful expression, high quality, detailed" -o gallery-2.png -s 1024x1024
z-ai image -p "Professional photography of an apricot curly poodle dog with a perfect teddy bear grooming cut, fluffy neat round face, freshly trimmed, sitting on pastel pink studio background, happy expression, high quality, detailed" -o depois.png -s 1024x1024
echo "BATCH_B_DONE"
