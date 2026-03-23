import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// -----------------------------------------------------------------
// Data generation helpers
// -----------------------------------------------------------------
const brands = ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'MSI', 'Razer']
const processors = [
  'Intel i3', 'Intel i5', 'Intel i7', 'Intel i9',
  'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9',
]
const ramOptions = [4, 8, 16, 32, 64]
const storageOptions = [256, 512, 1024, 2048] // GB
const storageTypes = ['SSD', 'HDD', 'SSD+HDD']
const graphicsOptions = [
  'Integrated', 'NVIDIA GTX 1650', 'NVIDIA RTX 3050',
  'NVIDIA RTX 3060', 'NVIDIA RTX 3070', 'NVIDIA RTX 3080',
  'AMD Radeon',
]
const screenSizes = [13.3, 14.0, 15.6, 17.3]

// -----------------------------------------------------------------
// Generate product URLs (search results)
// -----------------------------------------------------------------
const generateProductUrl = (brand: string, model: string, store: 'amazon' | 'newegg' | 'bestbuy') => {
  const query = encodeURIComponent(`${brand} ${model} laptop`)
  switch (store) {
    case 'amazon':
      return `https://www.amazon.com/s?k=${query}`
    case 'newegg':
      return `https://www.newegg.com/p/pl?d=${query}`
    case 'bestbuy':
      return `https://www.bestbuy.com/site/searchpage.jsp?st=${query}`
    default:
      return ''
  }
}

// -----------------------------------------------------------------
// Generate placeholder image URL with the brand name
// -----------------------------------------------------------------
const generateImageUrl = (brand: string) => {
  const bgColor = '4f46e5' // indigo, matches the site's theme
  return `https://placehold.co/300x200/${bgColor}/white?text=${encodeURIComponent(brand)}`
}

// -----------------------------------------------------------------
// Generate one random laptop
// -----------------------------------------------------------------
function generateLaptop(index: number) {
  const brand = brands[Math.floor(Math.random() * brands.length)]
  const model = `${brand} Model${Math.floor(Math.random() * 900 + 100)}`
  const processor = processors[Math.floor(Math.random() * processors.length)]
  const ram = ramOptions[Math.floor(Math.random() * ramOptions.length)]
  const storage = storageOptions[Math.floor(Math.random() * storageOptions.length)]
  const storageType = storageTypes[Math.floor(Math.random() * storageTypes.length)]
  const graphics = graphicsOptions[Math.floor(Math.random() * graphicsOptions.length)]

  // Price roughly based on specs
  let basePrice = 300 + ram * 10 + storage * 0.2
  if (processor.includes('i7') || processor.includes('Ryzen 7')) basePrice += 50
  if (processor.includes('i9') || processor.includes('Ryzen 9')) basePrice += 100
  if (graphics.includes('RTX')) basePrice += 100
  if (graphics.includes('GTX')) basePrice += 50

  const price = Math.round(basePrice / 10) * 10 // round to nearest 10
  const weight = parseFloat((Math.random() * 2.3 + 1.2).toFixed(1))
  const screen = screenSizes[Math.floor(Math.random() * screenSizes.length)]

  return {
    brand,
    model,
    processor,
    ram_gb: ram,
    storage_gb: storage,
    storage_type: storageType,
    graphics,
    price_usd: price,
    weight_kg: weight,
    screen_inches: screen,
    affiliate_link: null,
    image_url: generateImageUrl(brand),
    amazon_url: generateProductUrl(brand, model, 'amazon'),
    newegg_url: generateProductUrl(brand, model, 'newegg'),
    bestbuy_url: generateProductUrl(brand, model, 'bestbuy'),
  }
}

// -----------------------------------------------------------------
// Main seed function
// -----------------------------------------------------------------
async function main() {
  console.log('Seeding 50 laptops...')
  const laptops = Array.from({ length: 50 }, (_, i) => generateLaptop(i))
  await prisma.laptop.createMany({ data: laptops })
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })