import db from './db'

// 1. 商品分類與基礎模板
const BASE_CATALOG = [
  {
    catId: 'watches_gifts',
    catName: '鐘錶禮品',
    titles: ['Classic Chrono Watch', 'Minimalist Mesh Watch', 'Aviator Pilot Watch', 'Smart Fitness Watch', 'Vintage Quartz Watch'],
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&auto=format&fit=crop&q=80'
    ],
    basePrice: 150
  },
  {
    catId: 'computers_accessories',
    catName: '電腦 3C',
    titles: ['RGB Mechanical Keyboard', 'Precision Wireless Mouse', 'ANC Wireless Headphone', 'USB-C Aluminum Hub', 'Ultra-wide Gaming Mousepad'],
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
    ],
    basePrice: 120
  },
  {
    catId: 'health_beauty',
    catName: '美妝個護',
    titles: ['Botanical Skin Serum', 'Maracujá Cold-Pressed Oil', 'Mineral SPF50+ Sunscreen', 'Revitalizing Night Cream', 'Organic Body Scrub'],
    images: [
      'https://images.unsplash.com/photo-1608248597359-0a9ef223f6e8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
    ],
    basePrice: 65
  },
  {
    catId: 'bed_bath_table',
    catName: '居家寢具',
    titles: ['Pure Linen 4-Piece Bed Set', 'Egyptian Cotton Towel Set', 'Natural Soy Candle', 'Ergonomic Memory Pillow', 'Boho Cotton Throw Blanket'],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80'
    ],
    basePrice: 110
  },
  {
    catId: 'sports_leisure',
    catName: '運動休閒',
    titles: ['Pro Match Football', 'Eco Non-Slip Yoga Mat', 'Stainless Thermal Bottle', 'Speed Jump Rope', 'Adjustable Dumbbell Set'],
    images: [
      'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'
    ],
    basePrice: 85
  },
  {
    catId: 'housewares',
    catName: '生活廚用',
    titles: ['Cast Iron Skillet 26cm', 'Glass French Press 1L', 'Stainless Chef Knife 8-inch', 'Non-stick Baking Pan', 'Ceramic Dinner Set'],
    images: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80'
    ],
    basePrice: 95
  },
  {
    catId: 'auto',
    catName: '汽車配件',
    titles: ['4K UHD Dash Cam', 'Cordless Car Vacuum 9000Pa', 'Bluetooth FM Transmitter', 'Magnetic Phone Car Mount', 'Tire Pressure Gauge Pro'],
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80'
    ],
    basePrice: 130
  }
]

// 2. 執行灌庫作業
function runSeed() {
  console.log('🌱 正在向 SQLite (olist.db) 注入種子資料...')

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO products (
      product_id, category_id, category_name_en, title, description,
      price, image_url, weight_g, length_cm, height_cm, width_cm,
      rating_avg, review_count, reviews_json
    ) VALUES (
      @product_id, @category_id, @category_name_en, @title, @description,
      @price, @image_url, @weight_g, @length_cm, @height_cm, @width_cm,
      @rating_avg, @review_count, @reviews_json
    )
  `)

  let count = 0
  let idCounter = 100

  // 啟用交易批次加速寫入
  const seedTransaction = db.transaction(() => {
    BASE_CATALOG.forEach((cat) => {
      cat.titles.forEach((titleBase, idx) => {
        const variants = ['Standard Edition', 'Pro Max', 'Series Elite', 'Special Carbon']

        variants.forEach((v, vIdx) => {
          idCounter++
          count++
          const pId = `olist_${cat.catId.slice(0, 3)}_${idCounter}`
          const price = Number((cat.basePrice * (0.8 + Math.random() * 1.5) + vIdx * 25).toFixed(2))
          const rating = Number((4.1 + Math.random() * 0.89).toFixed(1))
          const reviewCount = Math.floor(20 + Math.random() * 350)
          const img = cat.images[(idx + vIdx) % cat.images.length]

          const reviews = [
            { review_id: `r_${pId}_1`, score: 5, comment: '出貨速度很快，實品質感非常棒！', date: '2026-03-12' },
            { review_id: `r_${pId}_2`, score: 4, comment: '性價比很高，物超所值。', date: '2026-02-28' }
          ]

          insertStmt.run({
            product_id: pId,
            category_id: cat.catId,
            category_name_en: cat.catName,
            title: `Olist ${titleBase} - ${v} #${idCounter}`,
            description: `巴西原廠直供 ${cat.catName} 系列特選商品（${v}）。嚴選材質與精工製造，符合拉丁美洲出口標準。`,
            price,
            image_url: img,
            weight_g: Math.floor(150 + Math.random() * 2000),
            length_cm: Math.floor(10 + Math.random() * 35),
            height_cm: Math.floor(5 + Math.random() * 20),
            width_cm: Math.floor(10 + Math.random() * 25),
            rating_avg: rating,
            review_count: reviewCount,
            reviews_json: JSON.stringify(reviews)
          })
        })
      })
    })
  })

  seedTransaction()

  console.log(`🎉 種子資料注入完成！共寫入 ${count} 筆商品至 olist.db 資料庫。`)
}

runSeed()